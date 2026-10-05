/** Supported BPF instance navigation: active path, adjacent stages and traversedpath. */
type Row = Record<string, any>;
export type BpfErrorCode = "required" | "missingInstance" | "inactive" | "conflict" | "route" | "unsupported" | "validation" | "server";
export class BpfMoveError extends Error {
  constructor(public readonly code: BpfErrorCode, public readonly detail = "", public savedSteps = 0) {
    super(detail || code); this.name = "BpfMoveError";
  }
}
export interface BpfDefinition {
  logicalName: string; entitySet: string; primaryId: string; recordLookup: string; stageNavigation: string;
}
export interface BpfApi {
  get: (path: string) => Promise<Row>;
  retrieveRecord: (entity: string, id: string, options: string) => Promise<Row>;
  retrieveMultipleRecords: (entity: string, options: string) => Promise<{ entities: Row[] }>;
  patch: (entitySet: string, id: string, values: Row, etag: string) => Promise<void>;
}
export interface BpfMoveRequest {
  processName: string; processId: string; entityName: string; recordId: string;
  sourceName: string; destinationName: string;
  validate?: (target: { instanceId: string; sourceStageId: string; destinationStageId: string }) => Promise<{ allow: boolean; message?: string }>;
}
const logical = (name: string) => {
  if (typeof name !== "string" || !/^[a-zA-Z][a-zA-Z0-9_]*$/.test(name)) throw new BpfMoveError("unsupported", String(name));
  return name;
};
const guid = (value: unknown): string => {
  const id = String(value ?? "").replace(/[{}]/g, "").toLowerCase();
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(id)) throw new BpfMoveError("unsupported", "Invalid process identity");
  return id;
};

/** Discover built-in/custom BPF names and lookups instead of guessing entity-set plurals. */
export async function getBpfDefinition(api: BpfApi, processName: string, entityName: string): Promise<BpfDefinition> {
  logical(processName); logical(entityName);
  const metadata = await api.get(`EntityDefinitions(LogicalName='${processName}')?$select=EntitySetName,PrimaryIdAttribute,IsBPFEntity&$expand=ManyToOneRelationships($select=ReferencingAttribute,ReferencedEntity,ReferencingEntityNavigationPropertyName)`);
  if (metadata.IsBPFEntity !== true || !Array.isArray(metadata.ManyToOneRelationships)) throw new BpfMoveError("unsupported", processName);
  const parents = metadata.ManyToOneRelationships.filter((r: Row) => r.ReferencedEntity === entityName);
  const stages = metadata.ManyToOneRelationships.filter((r: Row) => r.ReferencedEntity === "processstage" && r.ReferencingAttribute === "activestageid");
  if (parents.length !== 1 || stages.length !== 1) throw new BpfMoveError("unsupported", "Ambiguous process relationships");
  return { logicalName: processName, entitySet: logical(metadata.EntitySetName), primaryId: logical(metadata.PrimaryIdAttribute),
    recordLookup: logical(parents[0].ReferencingAttribute), stageNavigation: logical(stages[0].ReferencingEntityNavigationPropertyName) };
}

function active(row: Row, processId: string) {
  if (guid(row._processid_value) !== processId) throw new BpfMoveError("conflict");
  if (row.statecode !== 0 || row.statuscode !== 1) throw new BpfMoveError("inactive");
  if (typeof row["@odata.etag"] !== "string" || !/^W\/"\d+"$/.test(row["@odata.etag"])) throw new BpfMoveError("unsupported", "Missing process version");
}

async function pathFor(api: BpfApi, instanceId: string): Promise<Row[]> {
  const response = await api.get(`RetrieveActivePath(ProcessInstanceId=${instanceId})`);
  if (!Array.isArray(response.value) || !response.value.length) throw new BpfMoveError("route");
  const ids = response.value.map((stage: Row) => guid(stage.processstageid));
  if (new Set(ids).size !== ids.length) throw new BpfMoveError("route");
  return response.value.map((stage: Row, i: number) => ({ ...stage, processstageid: ids[i] }));
}

/** Read actual stage fields. An unknown metadata shape must never silently skip a gate. */
export function requiredStageFields(clientdata: unknown): { name: string; label: string }[] {
  let steps: unknown;
  try { steps = typeof clientdata === "string" ? JSON.parse(clientdata) : clientdata; }
  catch { throw new BpfMoveError("unsupported", "Unreadable stage steps"); }
  if (!Array.isArray(steps)) throw new BpfMoveError("unsupported", "Unavailable stage steps");
  const required: { name: string; label: string }[] = [];
  for (const step of steps) {
    if (!step || step.Type !== "Field" || !step.Field || typeof step.Field.IsRequired !== "boolean") {
      throw new BpfMoveError("unsupported", "This stage needs the native process form");
    }
    if (step.Field.IsRequired) required.push({ name: logical(step.Field.AttributeName), label: String(step.DisplayName || step.Field.AttributeName) });
  }
  return required;
}

async function checkStage(api: BpfApi, stageId: string, request: BpfMoveRequest): Promise<void> {
  const stage = await api.retrieveRecord("processstage", stageId, "?$select=stagename,primaryentitytypecode,clientdata,_processid_value");
  if (guid(stage._processid_value) !== guid(request.processId) || stage.primaryentitytypecode !== request.entityName) {
    throw new BpfMoveError("unsupported", "Cross-table stage transition");
  }
  const fields = requiredStageFields(stage.clientdata);
  if (!fields.length) return;
  const filter = fields.map(f => `LogicalName eq '${f.name}'`).join(" or ");
  const attributes = await api.get(`EntityDefinitions(LogicalName='${logical(request.entityName)}')/Attributes?$select=LogicalName,AttributeType&$filter=${filter}`);
  if (!Array.isArray(attributes.value)) throw new BpfMoveError("unsupported", "Unavailable field metadata");
  const columns = fields.map(f => {
    const attribute = attributes.value.find((a: Row) => a.LogicalName === f.name);
    if (!attribute || typeof attribute.AttributeType !== "string") throw new BpfMoveError("unsupported", f.name);
    return { ...f, type: attribute.AttributeType, property: ["Lookup", "Customer", "Owner"].includes(attribute.AttributeType) ? `_${f.name}_value` : f.name };
  });
  const row = await api.retrieveRecord(request.entityName, guid(request.recordId), `?$select=${[...new Set(columns.map(f => f.property))].join(",")}`);
  const missing = columns.filter(f => {
    if (!Object.prototype.hasOwnProperty.call(row, f.property)) throw new BpfMoveError("unsupported", f.name);
    const value = row[f.property];
    return value == null || (f.type === "Boolean" && value !== true) || (typeof value === "string" && !value.trim()) || (Array.isArray(value) && !value.length);
  });
  if (missing.length) throw new BpfMoveError("required", `${stage.stagename}: ${missing.map(f => f.label).join(", ")}`);
}

/** Fresh server reads before each adjacent transition; failures retain any already saved stage. */
export async function moveBpfStage(api: BpfApi, request: BpfMoveRequest): Promise<void> {
  const processId = guid(request.processId), recordId = guid(request.recordId);
  logical(request.entityName); logical(request.processName);
  if (!request.destinationName || request.destinationName === "unallocated") throw new BpfMoveError("route");
  const definition = await getBpfDefinition(api, request.processName, request.entityName);
  const recordProperty = `_${definition.recordLookup}_value`;
  const columns = `${definition.primaryId},_activestageid_value,_processid_value,${recordProperty},statecode,statuscode,traversedpath`;
  const result = await api.retrieveMultipleRecords(definition.logicalName,
    `?$select=${columns}&$filter=_${definition.recordLookup}_value eq ${recordId} and _processid_value eq ${processId}&$orderby=modifiedon desc&$top=1`);
  const first = result.entities[0];
  if (!first) throw new BpfMoveError("missingInstance");
  active(first, processId);
  if (guid(first[recordProperty]) !== recordId) throw new BpfMoveError("conflict");
  const instanceId = guid(first[definition.primaryId]);
  let expectedStage = guid(first._activestageid_value);
  const initialPath = await pathFor(api, instanceId);
  const from = initialPath.findIndex(stage => stage.processstageid === expectedStage);
  const destinations = initialPath.filter(stage => stage.stagename === request.destinationName);
  if (from < 0 || initialPath[from].stagename !== request.sourceName) throw new BpfMoveError("conflict");
  if (destinations.length !== 1) throw new BpfMoveError("route");
  const destinationId = destinations[0].processstageid;
  const to = initialPath.findIndex(stage => stage.processstageid === destinationId);
  if (from === to) return;
  const validation = await request.validate?.({ instanceId, sourceStageId: expectedStage, destinationStageId: destinationId });
  if (validation && !validation.allow) throw new BpfMoveError("validation", validation.message);
  // Check every planned stage before saving, so known missing steps do not cause partial moves.
  const direction = to > from ? 1 : -1;
  for (let i = from; i !== to; i += direction) await checkStage(api, initialPath[i].processstageid, request);
  // The destination must belong to this table as well, including single-step drops.
  const destination = await api.retrieveRecord("processstage", destinationId, "?$select=primaryentitytypecode,_processid_value");
  if (destination.primaryentitytypecode !== request.entityName || guid(destination._processid_value) !== processId) throw new BpfMoveError("unsupported", "Cross-table stage transition");
  let saved = 0;
  try {
    for (let count = 0; count < 30; count++) {
      const row = await api.retrieveRecord(definition.logicalName, instanceId, `?$select=${columns}`);
      active(row, processId);
      if (guid(row[recordProperty]) !== recordId || guid(row[definition.primaryId]) !== instanceId) throw new BpfMoveError("conflict");
      if (guid(row._activestageid_value) !== expectedStage) throw new BpfMoveError("conflict");
      const path = await pathFor(api, instanceId);
      const current = path.findIndex(stage => stage.processstageid === expectedStage);
      const target = path.findIndex(stage => stage.processstageid === destinationId);
      if (current < 0 || target < 0 || Math.sign(target - current) !== direction) throw new BpfMoveError("route");
      const nextIndex = current + direction, next = path[nextIndex];
      const nextStage = await api.retrieveRecord("processstage", next.processstageid, "?$select=primaryentitytypecode,_processid_value");
      if (nextStage.primaryentitytypecode !== request.entityName || guid(nextStage._processid_value) !== processId) throw new BpfMoveError("unsupported", "Cross-table stage transition");
      await checkStage(api, expectedStage, request);
      await api.patch(definition.entitySet, instanceId, {
        [`${definition.stageNavigation}@odata.bind`]: `/processstages(${next.processstageid})`,
        traversedpath: path.slice(0, nextIndex + 1).map(stage => stage.processstageid).join(",")
      }, row["@odata.etag"]);
      saved++;
      expectedStage = next.processstageid;
      if (expectedStage === destinationId) {
        const verified = await api.retrieveRecord(definition.logicalName, instanceId, "?$select=_activestageid_value");
        if (guid(verified._activestageid_value) !== destinationId) throw new BpfMoveError("conflict");
        return;
      }
    }
    throw new BpfMoveError("route");
  } catch (reason) {
    const error = reason instanceof BpfMoveError ? reason : new BpfMoveError("server", reason instanceof Error ? reason.message : String(reason));
    error.savedSteps = saved;
    throw error;
  }
}

/** Same-origin authenticated requests; If-Match protects another user's process changes. */
export function createBpfApi(webApi: Pick<BpfApi, "retrieveRecord" | "retrieveMultipleRecords">, request?: typeof fetch): BpfApi {
  const send = async (path: string, init?: RequestInit) => {
    const response = await (request ?? fetch)(`/api/data/v9.2/${path}`, { credentials: "same-origin", ...init,
      headers: { Accept: "application/json", "OData-Version": "4.0", "OData-MaxVersion": "4.0", ...init?.headers } });
    if (response.status === 412) throw new BpfMoveError("conflict");
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new BpfMoveError("server", error.error?.message || response.statusText);
    }
    return response;
  };
  return {
    retrieveRecord: (entity, id, options) => webApi.retrieveRecord(entity, id, options),
    retrieveMultipleRecords: (entity, options) => webApi.retrieveMultipleRecords(entity, options),
    get: async path => (await send(path)).json(),
    patch: async (entitySet, id, values, etag) => {
      if (!/^W\/"\d+"$/.test(etag)) throw new BpfMoveError("unsupported", "Missing process version");
      await send(`${logical(entitySet)}(${guid(id)})`, { method: "PATCH", headers: { "Content-Type": "application/json", "If-Match": etag }, body: JSON.stringify(values) });
    }
  };
}
