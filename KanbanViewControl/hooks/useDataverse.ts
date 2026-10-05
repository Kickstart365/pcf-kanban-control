import { useMemo, useRef } from 'react';
import { IInputs } from '../generated/ManifestTypes';
import { isNullOrEmpty, orderStages, chunkArray } from '../lib/utils';
import { ViewEntity } from '../interfaces';
import { XrmService } from './service';
import { BpfDefinition, BpfMoveRequest, createBpfApi, getBpfDefinition, moveBpfStage as saveBpfStage } from '../lib/bpf-stage-move';

export type ConfigErrorReporter = (property: string, message: string) => void;
export type ClearConfigError = (property: string) => void;

/**
 * Bound each BPF In() query to avoid exceeding Dataverse URL length limits.
 */
const BPF_STAGE_QUERY_CHUNK_SIZE = 100;

export const useDataverse = (context: ComponentFramework.Context<IInputs>, onConfigError?: ConfigErrorReporter, clearConfigError?: ClearConfigError) => {
    const { parameters, webAPI } = context;
    const { dataset } = parameters;
    const entityName = parameters.dataset.getTargetEntityType();

    // Cache choice metadata per entity/language/column set. Record stages stay fresh.
    const optionSetsCacheRef = useRef<{ key: string; value: any } | null>(null);
    const bpfApi = useMemo(() => createBpfApi(webAPI), [webAPI]);
    const bpfDefinitions = useRef(new Map<string, Promise<BpfDefinition>>());
    const definitionFor = (process: string, entity: string) => {
        const key = `${process}|${entity}`;
        let definition = bpfDefinitions.current.get(key);
        if (!definition) {
            definition = getBpfDefinition(bpfApi, process, entity).catch(reason => { bpfDefinitions.current.delete(key); throw reason; });
            bpfDefinitions.current.set(key, definition);
        }
        return definition;
    };

    const xrmService = useMemo(() => {
        const service = XrmService.getInstance();
        service.setContext(context);
        return service;
    }, [context]);

    const updateRecord = async (record: any) => {
        return await webAPI.updateRecord(
            record.entityName,
            record.id,
            record.update
        )
    }

    const getBusinessProcessFlows = async (logicalName: string, records: string[]) => {
        try {
            const stages = await webAPI.retrieveMultipleRecords(
                "processstage",
                `?$select=stagename,processstageid,stagecategory,_processid_value&$filter=primaryentitytypecode eq '${logicalName}'&$expand=processid($select=name,uniquename,statecode,uidata)`
            )

            const filter = context.parameters.filteredBusinessProcessFlows?.raw ?? "";
            let filterOutBusinessProcess: string[] | undefined;
            if (!isNullOrEmpty(filter)) {
                try {
                    filterOutBusinessProcess = JSON.parse(filter);
                    clearConfigError?.("filteredBusinessProcessFlows");
                } catch (e) {
                    const msg = e instanceof Error ? e.message : String(e);
                    onConfigError?.("filteredBusinessProcessFlows", msg);
                }
            }

            const stepOrderConfigRaw = context.parameters.businessProcessFlowStepOrder?.raw ?? "";
            let stepOrderConfig: { id: string; order: number }[] | undefined;

            if (!isNullOrEmpty(stepOrderConfigRaw)) {
                try {
                    stepOrderConfig = JSON.parse(stepOrderConfigRaw);
                    clearConfigError?.("businessProcessFlowStepOrder");
                } catch (e) {
                    const msg = e instanceof Error ? e.message : String(e);
                    onConfigError?.("businessProcessFlowStepOrder", msg);
                }
            }

            const stagesReduced = stages.entities
                .filter((stage: any) => (!filterOutBusinessProcess || !filterOutBusinessProcess.includes(stage.processid.name)) && stage.processid.statecode == 1)
                .reduce((acc: any, stage: any) => {
                    let process = acc.find((p: any) => p.key === stage.processid.workflowid);
                    const processUiData = stage.processid.uidata ? JSON.parse(stage.processid.uidata) as BusinnessProcessFlowUIData : undefined;

                    let entities: BusinessProcessFlowEntity[] = [];

                    if (processUiData && processUiData.BusinessProcessFlowEntities && processUiData.BusinessProcessFlowEntities["$values"].length > 0) {
                        entities = processUiData.BusinessProcessFlowEntities["$values"]
                            .filter((entity: BusinessProcessFlowEntity) => !entity.Relationships);
                    }

                    const orderedEntities = orderStages(entities);

                    const defaultOrder = orderedEntities.findIndex(e => e.Stage.StageDisplayName === stage.stagename);
                    const customOrder = stepOrderConfig?.find(config => config.id === stage.stagename)?.order;

                    const column = {
                        id: stage.stagename,
                        key: stage.processstageid,
                        label: stage.stagename,
                        title: stage.stagename,
                        order: customOrder ?? (defaultOrder < 0 ? orderedEntities.length : defaultOrder)
                    };

                    if (!process) {
                        process = {
                            key: stage.processid.workflowid,
                            text: stage.processid.name,
                            uniqueName: stage.processid.uniquename || undefined,
                            type: 'BPF',
                            columns: [column]
                        };
                        acc.push(process);
                    } else {
                        process.columns.push(column);
                    }

                    return acc;
                }, []);

            stagesReduced.forEach((process: any) => {
                const uniqueColumns = new Map();
                process.columns = process.columns.filter((column: any) => {
                    if (!uniqueColumns.has(column.id)) {
                        uniqueColumns.set(column.id, true);
                        return true;
                    }
                    return false;
                });
            });

            await Promise.all(stagesReduced.map(async (process: any) => {
                if (process != undefined) {
                    process.columns = process.columns.sort((a: any, b: any) => a.order - b.order)
                    process.records = await getRecordCurrentStage(logicalName, process.uniqueName, records, String(process.key))
                }
            }))

            return stagesReduced;
        } catch (e) {
            onConfigError?.("businessProcessFlows", e instanceof Error ? e.message : String(e));
            return [];
        }
    }

    const getRecordCurrentStage = async (entityName: string, logicalName: string | undefined, records: string[], processId?: string): Promise<ComponentFramework.WebApi.Entity[]> => {
        if (!logicalName || records.length === 0)
            return [];

        const definition = await definitionFor(logicalName, entityName);
        const property = definition.recordLookup;
        const process = `_${property}_value`;
        if (processId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(processId)) throw new Error("Invalid business process identity");

        const chunks = chunkArray(records, BPF_STAGE_QUERY_CHUNK_SIZE);
        const results: ComponentFramework.WebApi.Entity[] = [];
        // Limit simultaneous requests on large views as well as query length.
        for (const batch of chunkArray(chunks, 4)) {
            const perChunk = await Promise.all(batch.map(async (chunk) => {
                const filter = `(Microsoft.Dynamics.CRM.In(PropertyName='${property}',PropertyValues=[${chunk.map(id => `'${id}'`).join(',')}]))${processId ? ` and _processid_value eq ${processId}` : ""}`
                const stages = await webAPI.retrieveMultipleRecords(
                    logicalName,
                    `?$select=_activestageid_value,_processid_value,${process}&$filter=${filter}&$expand=${definition.stageNavigation}($select=stagename)&$orderby=modifiedon desc`
                );
                const seen = new Set<string>();
                return stages.entities.filter((item: any) => {
                    const id = item[process];
                    if (!id || seen.has(id)) return false;
                    seen.add(id); return true;
                }).map((item: any) => ({
                    id: item[process],
                    stageName: item[definition.stageNavigation]?.stagename ?? "unallocated"
                }));
            }));
            results.push(...perChunk.flat());
        }
        return results;
    }

    const retrieveStatusMetadata = async (logicalName: string): Promise<any> => {
        const entity = logicalName ?? entityName
        const options = await xrmService.fetch(`api/data/v9.2/EntityDefinitions(LogicalName='${entity}')/Attributes(LogicalName='statuscode')/Microsoft.Dynamics.CRM.StatusAttributeMetadata?$select=LogicalName&$expand=OptionSet($select=Options,MetadataId)`);
        return (options as any).OptionSet?.Options;
    }

    const getOptionSets = async (activeView: ViewEntity | undefined) => {
        try {
            const datasetColumns = dataset.columns.filter(col => col.dataType == "OptionSet");
            const entityLogicalName = activeView?.entity ?? entityName

            if (isNullOrEmpty(datasetColumns) || datasetColumns.length <= 0) {
                return [];
            }

            const cacheKey = `${entityLogicalName}|${context.userSettings.languageId}|${datasetColumns.map((c) => c.name).sort().join(',')}`;
            if (optionSetsCacheRef.current && optionSetsCacheRef.current.key === cacheKey) {
                return optionSetsCacheRef.current.value;
            }

            const filter = datasetColumns.map((column) => `attributename eq '${column.name}'`).join(' or ');

            const columnOptions = await webAPI.retrieveMultipleRecords(
                "stringmap",
                `?$filter=(objecttypecode eq '${entityLogicalName}' and (${filter}))`
            );

            const userLang = context.userSettings.languageId;

            const columns = datasetColumns.map((column) => {
                const columnEntries = columnOptions.entities.filter(
                    (option: any) => option.attributename == column.name
                );

                // One column per stored value; prefer the user's translated label.
                const optionByValue = new Map<string, any>();
                for (const opt of columnEntries) {
                    const value = String(opt.attributevalue);
                    const current = optionByValue.get(value);
                    if (current == null) {
                        optionByValue.set(value, opt);
                    } else if (opt.langid == userLang && current.langid != userLang) {
                        optionByValue.set(value, opt);
                    }
                }

                const options = Array.from(optionByValue.values()).map((option: any) => ({
                    key: option.attributevalue,
                    id: option.attributevalue,
                    label: option.value,
                    title: option.value,
                    order: option.displayorder
                }));

                return {
                    key: column.name,
                    text: column.displayName,
                    uniqueName: column.name,
                    dataType: column.dataType,
                    columns: [
                        ...options
                    ]
                }
            })

            const statusCodeColumn = columns.find((item) => item.key == 'statuscode');

            if (statusCodeColumn) {
                const statusCodeOptions = await retrieveStatusMetadata(activeView?.entity as string);
                const filteredStatusCodeOptions = statusCodeOptions.filter((option: any) => option.State == 0);

                statusCodeColumn.columns = statusCodeColumn.columns.filter((columnOption: any) =>
                    filteredStatusCodeOptions.some((filteredOption: any) => filteredOption.Value === columnOption.key)
                );
            }

            const sortedColumns = columns.map(item => ({
                ...item,
                columns: item.columns.sort((a: any, b: any) => a.order - b.order)
            }));

            optionSetsCacheRef.current = { key: cacheKey, value: sortedColumns };
            return sortedColumns;
        } catch (e) {
            onConfigError?.("optionSets", e instanceof Error ? e.message : String(e));
            return [];
        }
    }

    return {
        updateRecord,
        moveBpfStage: (request: BpfMoveRequest) => saveBpfStage(bpfApi, request),
        getBusinessProcessFlows,
        getOptionSets,
        getRecordCurrentStage
    }
}
