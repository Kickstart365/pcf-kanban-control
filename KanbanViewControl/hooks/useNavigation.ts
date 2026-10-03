import { IInputs } from "../generated/ManifestTypes";
import { isNullOrEmpty } from "../lib/utils";
import { useEffect, useRef, useState } from "react";
import { getSidePanes, navigateRecord, RECORD_PANE_ID } from "../lib/record-navigation";
import { getLocaleFromLanguageId, getStrings } from "../lib/strings";
import toast from "react-hot-toast";

const popupOtions = {
    height: {value: 85, unit:"%"},
    width: {value: 90, unit:"%"}, 
    target: 2,  
    position: 1
}

function getClientUrl(): string {
    const w = typeof window !== "undefined" ? window : undefined;
    const xrm = (w as { Xrm?: { Utility?: { getGlobalContext?: () => { getClientUrl?: () => string } } } })?.Xrm;
    const url = xrm?.Utility?.getGlobalContext?.()?.getClientUrl?.();
    if (url) return url.replace(/\/$/, "");
    if (w?.location?.origin) return w.location.origin;
    return "";
}

export const useNavigation = (context: ComponentFramework.Context<IInputs>, isBusy?: () => boolean) => {
    const { dataset } = context.parameters;
    const contextRef = useRef(context);
    const busyRef = useRef(isBusy);
    contextRef.current = context;
    busyRef.current = isBusy;
    const [watchedRecord, setWatchedRecord] = useState<{ entity: string; id: string } | null>(null);

    useEffect(() => {
        if (!watchedRecord || typeof window === "undefined") return;
        let disposed = false;
        let checking = false;
        let modifiedOn: unknown;
        const check = async () => {
            const current = contextRef.current;
            if (disposed || checking || busyRef.current?.() || current.parameters.dataset.loading || document.hidden) return;
            if (!getSidePanes()?.getPane(RECORD_PANE_ID)) {
                current.parameters.dataset.refresh();
                setWatchedRecord(null);
                return;
            }
            checking = true;
            try {
                const row = await current.webAPI.retrieveRecord(watchedRecord.entity, watchedRecord.id, "?$select=modifiedon");
                if (disposed) return;
                if (modifiedOn !== undefined && row.modifiedon !== modifiedOn) current.parameters.dataset.refresh();
                modifiedOn = row.modifiedon;
            } catch {
                // A temporary read failure does not close the native form. Manual refresh remains available.
            } finally { checking = false; }
        };
        void check();
        const timer = window.setInterval(() => { void check(); }, 10000);
        return () => { disposed = true; window.clearInterval(timer); };
    }, [watchedRecord]);

    const openForm = async (entityName: string, id?: string): Promise<void> => {
        const pageInput = {
            entityName: entityName,
            entityId: id,
            pageType: "entityrecord" as const
        }
        const params = context.parameters as unknown as Record<string, { raw?: unknown }>;
        const strings = getStrings(getLocaleFromLanguageId(context.userSettings.languageId));
        const outcome = await navigateRecord({ page: pageInput, mode: params.recordOpenMode?.raw as string | null,
            width: params.sidePaneWidth?.raw, panes: getSidePanes(), title: strings.recordDetailsLabel,
            dialog: async () => {
                //@ts-expect-error - Existing model-driven host extension, not in the PCF SDK typings.
                await context.navigation.navigateTo(pageInput, popupOtions);
            }
        });
        if (outcome === "sidePane" && id) setWatchedRecord({ entity: entityName, id });
        else {
            setWatchedRecord(null);
            dataset.refresh();
            if (outcome === "fallback") toast(strings.sidePaneFallbackLabel);
        }
    }

    /** Opens the entity record in a new browser tab (_blank). */
    const openEntityInNewTab = (entityName: string, id: string): void => {
        const baseUrl = getClientUrl();
        if (!baseUrl || !id) return;
        const url = `${baseUrl}/main.aspx?pagetype=entityrecord&etn=${encodeURIComponent(entityName)}&id=${encodeURIComponent(id)}`;
        if (typeof window !== "undefined" && window.open) {
            window.open(url, "_blank", "noopener,noreferrer");
        } else {
            context.navigation.openUrl(url);
        }
    }

    const createNewRecord = async (field?: string, column?: string): Promise<void> => {
        const pageInput = {
            entityName: dataset.getTargetEntityType(),
            pageType: "entityrecord",
            data : {}
        }

        if(!isNullOrEmpty(field) && !isNullOrEmpty(column)) {
            pageInput.data = { [field as string]: column }
        }

        //@ts-expect-error - Method does not exist in PCF SDK however it should be use to maintain control state alive
        await context.navigation.navigateTo(pageInput, popupOtions);
    }

    return {
        openForm,
        openEntityInNewTab,
        createNewRecord
    }
}
