const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const { readFileSync, writeFileSync, mkdirSync } = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const load = require("./source-loader.cjs")({}, {}, true);
const { BoardContext } = load("context/board-context");
const Card = load("components/card/Card").default;
const ColumnHeader = load("components/column/ColumnHeader").default;
const { getColumnColorStyle } = load("lib/column-colors");

// Real card/header components, static demo data. No Dataverse or drag host.
const columns = [
  { name: "name", displayName: "Opportunity", dataType: "SingleLine.Text" },
  { name: "parentaccountid", displayName: "Klant", dataType: "Lookup.Simple" },
  { name: "estimatedvalue", displayName: "Geschatte omzet", dataType: "Currency" },
  { name: "closeprobability", displayName: "Kans (%)", dataType: "Whole.None" },
  { name: "estimatedclosedate", displayName: "Verwachte sluiting", dataType: "DateAndTime.DateOnly" },
  { name: "ownerid", displayName: "Eigenaar", dataType: "Lookup.Owner" },
  { name: "transactioncurrencyid", displayName: "Valuta", dataType: "Lookup.Simple" },
  { name: "statecode", displayName: "Status", dataType: "OptionSet" },
  { name: "description", displayName: "Toelichting", dataType: "Multiple" },
];
const context = {
  parameters: {
    dataset: { columns, getTargetEntityType: () => "opportunity", refresh: () => {} },
    allowCreateNew: { raw: false }, showCloseDateBadges: { raw: true },
    hiddenFieldsOnCard: { raw: '["transactioncurrencyid","statecode"]' },
    fieldWidthsOnCard: { raw: '[{"logicalName":"parentaccountid","width":100},{"logicalName":"estimatedvalue","width":50},{"logicalName":"estimatedclosedate","width":50}]' },
    hideLabelForFieldsOnCard: { raw: '["parentaccountid","ownerid"]' },
  },
  formatting: { formatDecimal: value => value.toLocaleString("nl-NL", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) },
};
const info = (label, value) => ({ label, value });
const card = (id, title, account, amount, days) => {
  const due = new Date(); due.setDate(due.getDate() + days);
  return {
    id, title: info("Opportunity", title), column: "Kwalificeren",
    parentaccountid: info("Klant", { id: { guid: "account" }, etn: "account", name: account }),
    estimatedvalue: info("Geschatte omzet", `€ ${amount.toLocaleString("nl-NL")}`), estimatedvalueRaw: amount,
    closeprobability: info("Kans (%)", "60"), closeprobabilityRaw: 60,
    estimatedclosedate: info("Verwachte sluiting", due.toLocaleDateString("nl-NL")), estimatedclosedateRaw: due,
    ownerid: info("Eigenaar", { id: { guid: "owner" }, etn: "systemuser", name: "Alex de Vries" }),
    transactioncurrencyid: info("Valuta", { id: { guid: "eur" }, etn: "transactioncurrency", name: "Euro" }),
    statecodeRaw: 0, statecode: info("Status", "Open"), description: info("Toelichting", "Volgende stap: voorstel bespreken met de klant."),
  };
};
const stageColumns = [
  { id: "Kwalificeren", title: "Kwalificeren", cards: [card("one", "Modern workplace", "Contoso Nederland", 32000, 0), card("two", "Azure migratie", "Fabrikam", 18500, -2)] },
  { id: "Ontwikkelen", title: "Ontwikkelen", cards: [card("three", "Dynamics 365 Sales", "Northwind", 48000, 5)] },
  { id: "Voorstel", title: "Voorstel", cards: [card("four", "Managed services", "Adventure Works", 24000, 14)] },
  { id: "Afronden", title: "Afronden", cards: [] },
];
const output = path.resolve(__dirname, "../out/preview"); mkdirSync(output, { recursive: true });
for (const compactMode of [true, false]) {
  const board = { context, locale: "nl", activeView: { type: "BPF" }, compactMode,
    compactCardFields: ["parentaccountid", "estimatedvalue", "closeprobability", "estimatedclosedate", "ownerid"],
    inlineEditableFields: ["estimatedvalue", "closeprobability", "estimatedclosedate"], inlineEditKey: null,
    reportConfigError: () => {}, clearConfigError: () => {}, openFormWithLoading: () => {}, showOpenInNewTabButton: false };
  const markup = renderToStaticMarkup(React.createElement(BoardContext.Provider, { value: board },
    React.createElement("div", { className: "kanban-container" },
      React.createElement("div", { className: "columns-wrapper" }, stageColumns.map(column =>
        React.createElement("div", { key: column.id, className: "column-container column-container--colored", style: { width: 320, minWidth: 320,
          ...getColumnColorStyle(["#0078D4", "#009C91", "#8764B8", "#107C41"][stageColumns.indexOf(column)]) } },
          React.createElement(ColumnHeader, { column }),
          React.createElement("div", { className: "cards-wrapper" }, column.cards.map(item => React.createElement(Card, { key: item.id, item, draggable: false })))))))));
  assert.ok(markup.includes("50.500,00 Euro"));
  assert.ok(markup.includes("0,00"));
  assert.ok(markup.includes("Datum verstreken"));
  assert.equal(markup.includes("Volgende stap:"), !compactMode);
  const css = ["index.css", "inline-edit.css"].map(file => readFileSync(path.resolve(__dirname, "../KanbanViewControl/styles", file), "utf8")).join("\n");
  writeFileSync(path.join(output, `${compactMode ? "compact" : "expanded"}.html`), `<!doctype html><html lang="nl"><meta charset="utf-8"><title>Opportunity Kanban preview</title><style>body{font-family:Segoe UI,Arial,sans-serif;margin:0;color:#25364a}h1{font-size:20px;margin:24px 16px 4px}p.preview-label{margin:0 16px 18px;color:#687789;font-size:13px}.kanban-container{max-height:none}.column-container{max-height:none}${css}</style><body><h1>Opportunity pipeline · ${compactMode ? "Compact" : "Uitgebreid"}</h1><p class="preview-label">Demo met de echte kaart- en kopcomponenten; Dataverse en slepen zijn niet aangesloten.</p>${markup}</body></html>`);
}
console.log("Rendered compact and expanded components; totals, zero and hidden details verified.");
