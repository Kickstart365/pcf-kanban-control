const assert = require("node:assert/strict");
const test = require("node:test");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const { resolveConfiguration, exportConfiguration, propertyPaths, configurationSchema } = require("./source-loader.cjs")()("lib/board-config");
const plain = value => JSON.parse(JSON.stringify(value));
const params = values => Object.fromEntries(Object.entries(values).map(([key, raw]) => [key, { raw }]));
const resolve = (config, legacy = {}) => resolveConfiguration({ ...params(legacy), config: { raw: typeof config === "string" ? config : JSON.stringify(config) } });
const array = (p, key) => JSON.parse(p[key].raw);

test("empty configuration preserves the original inputs, including bound dataset identity", () => {
  const p = Object.freeze({ dataset: Object.freeze({ loading: true }), ...params({ compactCards: false, config: "  " }) });
  assert.equal(resolveConfiguration(p).parameters, p);
});

test("false, zero, blank strings and empty lists override legacy values without mutation", () => {
  const original = Object.freeze({ dataset: {}, ...params({ compactCards: true, closeDateWarningDays: 7, defaultView: "old", columnColors: '[{"id":"Qualify","color":"#0078D4"}]',
    config: JSON.stringify({ card: { compact: { enabled: false }, closeDate: { warningDays: 0 } }, view: { default: "" }, board: { columnColors: [] } }) }) });
  const { parameters: p, issues } = resolveConfiguration(original);
  assert.equal(issues.length, 0); assert.equal(p.compactCards.raw, false); assert.equal(p.closeDateWarningDays.raw, 0);
  assert.equal(p.defaultView.raw, ""); assert.equal(p.columnColors.raw, "[]"); assert.equal(p.dataset, original.dataset);
  assert.equal(original.compactCards.raw, true);
});

test("per-field overrides retain unrelated legacy flags, labels and widths", () => {
  const { parameters: p, issues } = resolve({ card: { fields: { ownerid: { hidden: false, width: 75, displayName: "Owner" }, name: { hidden: true } } } },
    { hiddenFieldsOnCard: '["ownerid","description"]', fieldWidthsOnCard: '[{"logicalName":"description","width":100}]',
      fieldDisplayNamesOnCard: '[{"logicalName":"description","displayName":"Notes"}]' });
  assert.equal(issues.length, 0); assert.deepEqual(array(p, "hiddenFieldsOnCard"), ["description", "name"]);
  assert.deepEqual(array(p, "fieldWidthsOnCard"), [{ logicalName: "description", width: 100 }, { logicalName: "ownerid", width: 75 }]);
  assert.deepEqual(array(p, "fieldDisplayNamesOnCard"), [{ logicalName: "description", displayName: "Notes" }, { logicalName: "ownerid", displayName: "Owner" }]);
});

test("persona mode can replace or remove an existing icon-only field", () => {
  const legacy = { lookupFieldsAsPersonaOnCard: '["ownerid","customerid"]', lookupFieldsPersonaIconOnlyOnCard: '["ownerid","customerid"]' };
  const p = resolve({ card: { fields: { ownerid: { persona: true } } } }, legacy).parameters;
  assert.deepEqual(array(p, "lookupFieldsPersonaIconOnlyOnCard"), ["customerid"]);
  const q = resolve({ card: { fields: { ownerid: { persona: false } } } }, legacy).parameters;
  assert.deepEqual(array(q, "lookupFieldsAsPersonaOnCard"), ["customerid"]);
});

test("malformed documents and unsupported versions retain all individual values", () => {
  for (const value of ["{", "null", "[]", '{"schemaVersion":2,"board":{"allowCardMove":false}}']) {
    const { parameters: p, issues } = resolve(value, { allowCardMove: true });
    assert.equal(p.allowCardMove.raw, true); assert.equal(issues.length, 1);
  }
});

test("invalid leaf types, unknown keys and sections are reported while valid settings apply", () => {
  const { parameters: p, issues } = resolve({ board: { allowCardMove: false, fullWidth: "false", minColumnWidth: "280", typo: true },
    card: { open: [], compact: { enabled: true } }, toString: "unknown" }, { expandBoardToFullWidth: true, sidePaneWidth: 700 });
  assert.equal(p.allowCardMove.raw, false); assert.equal(p.expandBoardToFullWidth.raw, true); assert.equal(p.compactCards.raw, true);
  assert.equal(p.sidePaneWidth.raw, 700);
  assert.deepEqual(plain(issues.map(x => x.property)), ["config.board.fullWidth", "config.board.minColumnWidth", "config.board.typo", "config.card.open", "config.toString"]);
});

test("invalid color/width arrays fall back as a whole and min/max contradictions cannot corrupt layout", () => {
  const { parameters: p, issues } = resolve({ board: { columnColors: [{ id: "Close", color: "red" }], minColumnWidth: 600, maxColumnWidth: 300 } },
    { columnColors: "[]", minColumnWidth: "250", maxColumnWidth: "900" });
  assert.equal(p.columnColors.raw, "[]"); assert.equal(p.minColumnWidth.raw, "250"); assert.equal(p.maxColumnWidth.raw, "900"); assert.equal(issues.length, 2);
});

test("quick filters have one ordered list; an empty list also clears popup filters", () => {
  const p = resolve({ filters: { quickFilters: ["name", { field: "ownerid", inPopup: true }] } }).parameters;
  assert.deepEqual(array(p, "quickFilterFields"), ["name", "ownerid"]); assert.deepEqual(array(p, "quickFilterFieldsInPopup"), ["ownerid"]);
  const q = resolve({ filters: { quickFilters: [] } }, { quickFilterFieldsInPopup: '["ownerid"]' }).parameters;
  assert.equal(q.quickFilterFieldsInPopup.raw, "[]");
});

test("all 46 original inputs have a documented JSON path and the schema copy matches runtime", () => {
  const manifest = readFileSync(path.join(__dirname, "../KanbanViewControl/ControlManifest.Input.xml"), "utf8");
  const expected = [...manifest.matchAll(/<property\s+name="([^"]+)"/g)].map(x => x[1]).filter(x => x !== "config").sort();
  const actual = [...propertyPaths.map(x => x.property), "quickFilterFields", "quickFilterFieldsInPopup"].sort();
  assert.equal(expected.length, 46); assert.deepEqual(plain(actual), expected);
  assert.deepEqual(JSON.parse(readFileSync(path.join(__dirname, "../docs/kanban-config.schema.json"), "utf8")), plain(configurationSchema));
  assert.match(manifest, /name="config"[^>]*of-type="Multiple"/);
});

test("exports migrate field settings, preserve highlight priority and exclude record/session data", () => {
  const original = params({ recordOpenMode: "dialog", sidePaneWidth: 800, compactCards: false, closeDateWarningDays: 0,
    hiddenFieldsOnCard: '["description"]', fieldDisplayNamesOnCard: '[{"logicalName":"ownerid","displayName":"Eigenaar"}]',
    booleanFieldHighlights: '[{"logicalName":"a","color":"red","type":"right"},{"logicalName":"b","color":"blue","type":"right"}]',
    quickFilterFields: "ownerid,estimatedvalue", quickFilterFieldsInPopup: "ownerid", defaultSort: '{"field":"estimatedvalue","direction":"desc"}' });
  original.dataset = { records: { secret: { revenue: 500000 } }, loading: false };
  original.searchKeyword = { raw: "customer secret" };
  const exported = exportConfiguration(original); assert.equal(exported.issues.length, 0);
  const document = JSON.parse(exported.json);
  assert.equal(document.card.fields.description.hidden, true); assert.equal(document.card.fields.ownerid.displayName, "Eigenaar");
  assert.equal(exported.json.includes("secret"), false);
  const migrated = resolveConfiguration({ config: { raw: exported.json } }); assert.equal(migrated.issues.length, 0);
  for (const key of Object.keys(original).filter(key => key !== "dataset" && key !== "searchKeyword")) assert.equal(migrated.parameters[key].raw, original[key].raw.startsWith?.("[") || key.includes("quickFilter") ? JSON.stringify(key.includes("quickFilter") ? original[key].raw.split(",") : JSON.parse(original[key].raw)) : original[key].raw, key);
});

test("export is blocked rather than silently omitting invalid settings or unsupported values", () => {
  const exported = exportConfiguration(params({ hiddenFieldsOnCard: "[", quickFilterFields: "[", quickFilterFieldsInPopup: "ownerid", recordOpenMode: "unsupported" }));
  assert.deepEqual(plain(exported.issues.map(x => x.property)), ["recordOpenMode", "hiddenFieldsOnCard", "quickFilterFields", "quickFilterFieldsInPopup"]);
});

test("configuration is instance scoped and resistant to inherited/dangerous keys", () => {
  const first = resolve('{"board":{"allowCardMove":false},"card":{"fields":{"__proto__":{"hidden":true}}},"__proto__":{"polluted":true}}');
  assert.equal(first.parameters.allowCardMove.raw, false); assert.equal({}.polluted, undefined); assert.equal(first.issues.length, 2);
  const second = resolve({ board: { allowCardMove: true } }); assert.equal(second.parameters.allowCardMove.raw, true);
  assert.equal(first.parameters.allowCardMove.raw, false);
});
