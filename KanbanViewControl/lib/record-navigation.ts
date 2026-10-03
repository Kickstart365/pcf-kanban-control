export const RECORD_PANE_ID = "kickstart365-kanban-record";
export interface RecordPage { entityName: string; entityId?: string; pageType: "entityrecord" }
interface RecordPane {
  title: string;
  width: number;
  navigate: (page: RecordPage) => Promise<unknown>;
  select: () => void;
}
export interface SidePanes {
  state: number;
  getPane: (id: string) => RecordPane | undefined;
  createPane: (options: { paneId: string; title: string; canClose: boolean; width: number }) => Promise<RecordPane>;
}

export function sidePaneWidth(raw: unknown): number {
  const width = Number(raw);
  return Number.isFinite(width) && width >= 300 && width <= 1200 ? Math.round(width) : 600;
}

/** Uses the model-driven app API only when the host exposes it. No parent-frame or DOM probing. */
export function getSidePanes(): SidePanes | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as unknown as { Xrm?: { App?: { sidePanes?: SidePanes } } }).Xrm?.App?.sidePanes;
}

export async function navigateRecord(options: {
  page: RecordPage;
  mode: string | null | undefined;
  width: unknown;
  panes?: SidePanes;
  title: string;
  dialog: () => Promise<unknown>;
}): Promise<"sidePane" | "dialog" | "fallback"> {
  const { page, mode, panes, title, dialog } = options;
  if (mode === "dialog" || !page.entityId) { await dialog(); return "dialog"; }
  if (panes?.createPane && panes?.getPane) {
    let created = false;
    let pane: RecordPane | undefined;
    try {
      pane = panes.getPane(RECORD_PANE_ID);
      if (!pane) {
        pane = await panes.createPane({ paneId: RECORD_PANE_ID, title, canClose: true, width: sidePaneWidth(options.width) });
        created = true;
      }
      pane.width = sidePaneWidth(options.width);
      pane.title = title;
      await pane.navigate(page);
      pane.select();
      panes.state = 1;
      return "sidePane";
    } catch (reason) {
      // Existing-form navigation failures/cancellations must not open a second form or discard a draft.
      if (pane && !created) throw reason;
      // The host may reject side panes (for example in a native player). The record must still open.
      if (created && pane) {
        try { (pane as RecordPane & { close?: () => void }).close?.(); } catch { /* Still try the existing dialog route. */ }
      }
    }
  }
  await dialog();
  return "fallback";
}
