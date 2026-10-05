const React = require("react");
const ReactDOM = require("react-dom");
const { DragDropContext } = require("@hello-pangea/dnd");
const { BoardContext } = require("../out/preview/source/context/board-context");
const Column = require("../out/preview/source/components/column/Column").default;
const { ConfigurationExport } = require("../out/preview/source/components/board/ConfigurationExport");
const { exportConfiguration } = require("../out/preview/source/lib/board-config");
const { useNavigation } = require("../out/preview/source/hooks/useNavigation");
const { useDnD } = require("../out/preview/source/hooks/useDnD");
const { Toaster } = require("react-hot-toast");
const { inlineDefinition } = require("../out/preview/source/lib/inline-edit");
const { useState, useRef } = React;
const id = "00000000-0000-0000-0000-000000000001";
const info = (label, value) => ({ label, value });
window.testState = { patches: [], refreshes: 0, opens: 0, dialogs: 0, creates: 0, held: false,
  row: { name: "Modern workplace", estimatedvalue: 32000, closeprobability: 60, estimatedclosedate: "2026-10-03T00:00:00Z",
    description: "Voorstel bespreken", statecode: 0, isrevenuesystemcalculated: false, "@odata.etag": 'W/"1"', modifiedon: "one" } };
const state = window.testState;
const bpfProcess = "00000000-0000-0000-0000-000000000090";
const bpfInstance = "00000000-0000-0000-0000-000000000091";
const bpfStageIds = ["00000000-0000-0000-0000-000000000092", "00000000-0000-0000-0000-000000000093"];
state.bpfPatches = []; state.bpfStage = bpfStageIds[0];
const bpfRow = () => ({ businessprocessflowinstanceid: bpfInstance, _processid_value: bpfProcess, _activestageid_value: state.bpfStage,
  _opportunityid_value: id, statecode: 0, statuscode: 1, "@odata.etag": `W/"${state.bpfPatches.length + 1}"` });
const bpfStages = () => bpfStageIds.map((processstageid, i) => ({ processstageid, stagename: i ? "Develop" : "Qualify", primaryentitytypecode: "opportunity", _processid_value: bpfProcess,
  clientdata: JSON.stringify(!i && state.bpfRequired ? [{ Type: "Field", DisplayName: "Kwalificatie compleet", Field: { AttributeName: "qualifyingcomplete", IsRequired: true } }] : []) }));
let pane;
window.Xrm = { App: { sidePanes: { state: 0, getPane: () => pane, createPane: async options => {
  state.creates++;
  pane = { ...options, navigate: async page => { state.opens++; document.getElementById("test-pane").textContent = `Record: ${page.entityId}`; },
    select: () => { document.getElementById("test-pane").hidden = false; }, close: () => { pane = undefined; document.getElementById("test-pane").hidden = true; } };
  return pane;
} } } };
window.fetch = async (url, options) => {
  if (url.includes("EntityDefinitions(LogicalName='opportunitysalesprocess')")) return { ok: true, status: 200, json: async () => ({ IsBPFEntity: true, EntitySetName: "opportunitysalesprocesses", PrimaryIdAttribute: "businessprocessflowinstanceid",
    ManyToOneRelationships: [{ ReferencedEntity: "opportunity", ReferencingAttribute: "opportunityid" }, { ReferencedEntity: "processstage", ReferencingAttribute: "activestageid", ReferencingEntityNavigationPropertyName: "activestageid" }] }) };
  if (url.includes("RetrieveActivePath")) return { ok: true, status: 200, json: async () => ({ value: bpfStages() }) };
  if (url.includes("/Attributes?")) return { ok: true, status: 200, json: async () => ({ value: [{ LogicalName: "qualifyingcomplete", AttributeType: "Boolean" }] }) };
  if (url.includes("/opportunitysalesprocesses(")) {
    if (state.bpfDeny) return { ok: false, status: 403, json: async () => ({ error: { message: "Geen BPF-schrijfrechten" } }) };
    if (options.headers["If-Match"] !== bpfRow()["@odata.etag"]) return { ok: false, status: 412 };
    const update = JSON.parse(options.body); state.bpfPatches.push(update);
    state.bpfStage = update["activestageid@odata.bind"].match(/\(([^)]+)\)/)[1];
    return { ok: true, status: 204 };
  }
  if (!options || options.method !== "PATCH") throw new Error("Unexpected request");
  if (state.held) await new Promise(resolve => { window.releaseSave = resolve; });
  if (state.deny) return { ok: false, status: 403, json: async () => ({ error: { message: "Geen schrijfrechten" } }) };
  if (options.headers["If-Match"] !== state.row["@odata.etag"]) return { ok: false, status: 412 };
  const update = JSON.parse(options.body); state.patches.push(update); Object.assign(state.row, update);
  state.row["@odata.etag"] = `W/"${state.patches.length + 1}"`; state.row.modifiedon = String(state.patches.length);
  return { ok: true, status: 204 };
};
function DragBoard({ columns, draggingRef }) {
  const { onDragEnd } = useDnD(columns);
  const { context } = React.useContext(BoardContext);
  return React.createElement(DragDropContext, { onDragStart: () => { draggingRef.current = true; state.dragging = true; },
    onDragUpdate: result => { state.dragTarget = result.destination?.droppableId; },
    onDragEnd: async result => {
      state.dragging = false;
      try { const outcome = await onDragEnd(result, { entityName: "opportunity", id: result.draggableId, update: {} }); if (outcome.shouldRefresh) context.parameters.dataset.refresh(); }
      finally { draggingRef.current = false; state.dragDone = (state.dragDone || 0) + 1; }
    } }, React.createElement("div", { className: "columns-wrapper" }, ...columns.map(column => React.createElement(Column, { key: column.id, column, widthPx: 340, color: column.id === "Qualify" ? "#0078D4" : "#009C91" }))));
}
function Preview() {
  const [revision, setRevision] = useState(0);
  const [inlineEditKey, setInlineEditKey] = useState(null);
  const editing = useRef(null); const draggingRef = useRef(false);
  const movePendingRef = useRef(false); const [isMovePending, setIsMovePending] = useState(false);
  const beginInlineEdit = React.useCallback(key => { if (editing.current) return false; editing.current = key; setInlineEditKey(key); return true; }, []);
  const finishInlineEdit = React.useCallback(key => { if (editing.current === key) { editing.current = null; setInlineEditKey(null); } }, []);
  const columns = [{ name: "name", displayName: "Opportunity", dataType: "SingleLine.Text" },
    { name: "estimatedvalue", displayName: "Geschatte omzet", dataType: "Currency" },
    { name: "closeprobability", displayName: "Kans (%)", dataType: "Whole.None" },
    { name: "estimatedclosedate", displayName: "Sluitdatum", dataType: "DateAndTime.DateOnly" },
    { name: "description", displayName: "Toelichting", dataType: "Multiple" },
    { name: "transactioncurrencyid", displayName: "Valuta", dataType: "Lookup.Simple" }];
  const context = { parameters: { dataset: { columns, loading: false, getTargetEntityType: () => "opportunity", refresh: () => { state.refreshes++; setRevision(v => v + 1); } },
      allowCreateNew: { raw: false }, hiddenFieldsOnCard: { raw: '["transactioncurrencyid"]' } },
    webAPI: { retrieveRecord: async (entity, guid) => entity === "processstage" ? bpfStages().find(s => s.processstageid === guid) : entity === "opportunitysalesprocess" ? bpfRow() : ({ ...state.row, qualifyingcomplete: false }),
      retrieveMultipleRecords: async entity => { if (entity !== "opportunitysalesprocess") throw new Error("Unexpected process table"); return { entities: [bpfRow()] }; },
      updateRecord: async () => { throw new Error("Unconditional update is forbidden"); } },
    userSettings: { languageId: 1043 }, navigation: { navigateTo: async () => { state.dialogs++; } },
    formatting: { formatDecimal: value => value.toLocaleString("nl-NL", { minimumFractionDigits: 2 }) } };
  const { openForm } = useNavigation(context, () => !!editing.current);
  const item = { id, column: "Qualify", title: info("Opportunity", state.row.name),
    estimatedvalue: info("Geschatte omzet", `€ ${state.row.estimatedvalue.toLocaleString("nl-NL")}`), estimatedvalueRaw: state.row.estimatedvalue,
    closeprobability: info("Kans (%)", String(state.row.closeprobability)), closeprobabilityRaw: state.row.closeprobability,
    estimatedclosedate: info("Sluitdatum", state.row.estimatedclosedate?.slice(0, 10) || ""), estimatedclosedateRaw: state.row.estimatedclosedate,
    description: info("Toelichting", state.row.description), descriptionRaw: state.row.description,
    transactioncurrencyid: info("Valuta", { id: { guid: "eur" }, etn: "transactioncurrency", name: "Euro" }), statecodeRaw: state.row.statecode };
  const [boardColumns, setColumns] = useState([{ id: "Qualify", title: "Qualify", cards: [item] }, { id: "Develop", title: "Develop", cards: [] }]);
  React.useEffect(() => { setColumns(current => current.map(column => ({ ...column, cards: column.cards.map(card => ({ ...item, column: column.id })) }))); }, [revision]);
  const board = { context, configurationExport: exportConfiguration(context.parameters), locale: "nl", activeView: { type: "BPF", key: bpfProcess, uniqueName: "opportunitysalesprocess" }, compactMode: false,
    compactCardFields: ["estimatedvalue", "closeprobability", "estimatedclosedate"],
    inlineEditableFields: ["estimatedvalue", "closeprobability", "estimatedclosedate", "description", "name"], inlineEditKey,
    beginInlineEdit, finishInlineEdit, draggingRef, isMovePending, movePendingRef, setIsMovePending, setColumns,
    reportConfigError: () => {}, clearConfigError: () => {}, openFormWithLoading: openForm, showOpenInNewTabButton: false,
    getInlineDefinition: async field => inlineDefinition(field, columns.find(column => column.name === field).dataType,
      { LogicalName: field, SourceType: 0, IsValidForUpdate: true, RequiredLevel: { Value: "None" }, MaxLength: 500,
        MinValue: field === "closeprobability" ? 0 : -1e12, MaxValue: field === "closeprobability" ? 100 : 1e12, DateTimeBehavior: { Value: "DateOnly" } }) };
  return React.createElement(BoardContext.Provider, { value: board },
    React.createElement(Toaster),
    React.createElement(ConfigurationExport),
    React.createElement(DragBoard, { columns: boardColumns, draggingRef }));
}
ReactDOM.render(React.createElement(Preview), document.getElementById("root"));
