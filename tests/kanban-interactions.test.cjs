const assert = require("node:assert/strict");
const test = require("node:test");
const load = require("./source-loader.cjs")();
const { parseColumnColors, getColumnColorStyle } = load("lib/column-colors");
const { navigateRecord, sidePaneWidth, RECORD_PANE_ID } = load("lib/record-navigation");
const { parseInlineFields, inlineKind, inlineDefinition, parseInlineValue, inlineInputValue, readInlineRecord, saveInlineRecord, createInlineApi } = load("lib/inline-edit");
const money = { name: "estimatedvalue", kind: "number", required: false, min: -1e12, max: 1e12 };
const probability = { name: "closeprobability", kind: "integer", required: false, min: 0, max: 100 };
const date = { name: "estimatedclosedate", kind: "date", required: false };
const row = (field, value, extra = {}) => ({ [field]: value, statecode: 0, isrevenuesystemcalculated: false, "@odata.etag": 'W/"123"', ...extra });

test("column colors keep explicit stage identities and reject arbitrary CSS", () => {
  const colors = parseColumnColors('[{"id":"Qualify","color":"#0078D4"},{"id":"Develop","color":"#71D8CD"}]');
  assert.equal(colors[1].id, "Develop");
  assert.equal(getColumnColorStyle(colors[0].color)["--column-tint"], "rgba(0, 120, 212, 0.07)");
  assert.throws(() => parseColumnColors('[{"id":"Qualify","color":"red; background: url(x)"}]'));
  assert.throws(() => parseColumnColors('{}'));
  assert.equal(Object.keys(getColumnColorStyle("invalid")).length, 0);
});

test("inline fields are an explicit allowlist; related aliases and invalid JSON are rejected", () => {
  assert.deepEqual(Array.from(parseInlineFields(null)), ["estimatedvalue", "closeprobability", "estimatedclosedate"]);
  assert.deepEqual(Array.from(parseInlineFields('custom_comment, custom_number, custom_comment')), ["custom_comment", "custom_number"]);
  assert.equal(parseInlineFields("").length, 0);
  for (const raw of ['["account.name"]', '["name;drop"]', '[false]', '{']) assert.throws(() => parseInlineFields(raw));
  assert.equal(inlineKind("Lookup.Owner"), undefined);
  assert.equal(inlineKind("OptionSet"), undefined);
  assert.equal(inlineKind("DateAndTime.DateAndTime"), undefined);
});

test("actual metadata blocks calculated, secured, base-money and UserLocal date fields", () => {
  const metadata = { LogicalName: "custom_text", IsValidForUpdate: true, SourceType: 0, RequiredLevel: { Value: "ApplicationRequired" }, MaxLength: 30 };
  const definition = inlineDefinition("custom_text", "SingleLine.Text", metadata);
  assert.equal(definition.required, true);
  assert.equal(definition.maxLength, 30);
  for (const override of [{ SourceType: 1 }, { SourceType: 2 }, { SourceType: 3 }, { IsValidForUpdate: false }, { IsSecured: true }]) {
    assert.throws(() => inlineDefinition("custom_text", "SingleLine.Text", { ...metadata, ...override }), error => error.code === "unsupported");
  }
  assert.throws(() => inlineDefinition("amount_base", "Currency", { ...metadata, LogicalName: "amount_base" }));
  assert.throws(() => inlineDefinition("custom_date", "DateAndTime.DateOnly", { ...metadata, LogicalName: "custom_date", DateTimeBehavior: { Value: "UserLocal" } }));
});

test("numeric editors preserve zero, accept a decimal comma and enforce metadata ranges", () => {
  assert.equal(parseInlineValue(money, "12500,50"), 12500.5);
  assert.equal(parseInlineValue(money, "-10.50"), -10.5);
  assert.equal(parseInlineValue(money, "0"), 0);
  assert.equal(parseInlineValue(money, ""), null);
  for (const value of ["1.234,50", "NaN", "Infinity", "1e3", "1 000"]) assert.throws(() => parseInlineValue(money, value));
  for (const value of ["-1", "101", "12.5"]) assert.throws(() => parseInlineValue(probability, value), error => error.code === "invalidProbability");
  assert.equal(parseInlineValue(probability, "100"), 100);
  assert.throws(() => parseInlineValue(money, "1000000000001"), error => error.code === "range");
});

test("generic text edits preserve whitespace and enforce required fields and maximum length", () => {
  const text = { name: "custom_comment", kind: "multiline", required: true, maxLength: 30 };
  assert.equal(parseInlineValue(text, "  Eerste regel\nTweede regel  "), "  Eerste regel\nTweede regel  ");
  assert.throws(() => parseInlineValue(text, " "), error => error.code === "required");
  assert.throws(() => parseInlineValue(text, "x".repeat(31)), error => error.code === "tooLong");
});

test("DateOnly round trips use the ISO calendar date, including leap days", () => {
  assert.equal(inlineInputValue(date, "2026-10-03T00:00:00Z"), "2026-10-03");
  assert.equal(inlineInputValue(date, new Date("2026-10-03T00:00:00Z")), "2026-10-03");
  assert.equal(parseInlineValue(date, "2028-02-29"), "2028-02-29T00:00:00Z");
  assert.throws(() => parseInlineValue(date, "2026-02-29"), error => error.code === "invalidDate");
  assert.throws(() => parseInlineValue(date, "03-10-2026"));
});

test("saving a configured custom field writes only that field and passes the current ETag", async () => {
  let update;
  const definition = { name: "custom_comment", kind: "text", required: false };
  const api = { retrieveRecord: async (entity, id, query) => {
    assert.equal(entity, "opportunity");
    assert.ok(query.includes("$select=custom_comment,statecode,isrevenuesystemcalculated"));
    return row("custom_comment", "old");
  }, updateRecord: async (...args) => { update = args; } };
  await saveInlineRecord(api, "id", definition, "old", "new");
  assert.equal(update[2].custom_comment, "new");
  assert.equal(Object.keys(update[2]).length, 1);
  assert.equal(update[3], 'W/"123"');
});

test("closed, product-calculated, missing and changed values never trigger a save", async () => {
  for (const [data, code] of [[row("estimatedvalue", 10, { statecode: 1 }), "closed"],
    [row("estimatedvalue", 10, { isrevenuesystemcalculated: true }), "calculated"], [row("estimatedvalue", 11), "conflict"],
    [{ statecode: 0, isrevenuesystemcalculated: false }, "unsupported"]]) {
    let saves = 0;
    const api = { retrieveRecord: async () => data, updateRecord: async () => saves++ };
    await assert.rejects(saveInlineRecord(api, "id", money, 10, "20"), error => error.code === code);
    assert.equal(saves, 0);
  }
});

test("conditional PATCH uses the authenticated same-origin API and rejects concurrency and permission errors", async () => {
  const id = "00000000-0000-0000-0000-000000000001";
  let called;
  const api = createInlineApi({ retrieveRecord: async () => row("estimatedvalue", 10) }, async (url, options) => {
    called = { url, options }; return { ok: true, status: 204 };
  });
  await saveInlineRecord(api, id, money, 10, "20,5");
  assert.equal(called.url, `/api/data/v9.2/opportunities(${id})`);
  assert.equal(called.options.headers["If-Match"], 'W/"123"');
  assert.equal(called.options.credentials, "same-origin");
  assert.equal(JSON.parse(called.options.body).estimatedvalue, 20.5);
  const denied = createInlineApi(api, async () => ({ status: 403, ok: false, json: async () => ({ error: { message: "Denied" } }) }));
  await assert.rejects(saveInlineRecord(denied, id, money, 10, "20"), /Denied/);
  const conflict = createInlineApi(api, async () => ({ status: 412, ok: false }));
  await assert.rejects(saveInlineRecord(conflict, id, money, 10, "20"), error => error.code === "conflict");
});

test("side pane navigation reuses one pane and leaves the board available after navigation", async () => {
  let creates = 0; let selected = 0; const navigated = [];
  let pane;
  const panes = { state: 0, getPane: id => { assert.equal(id, RECORD_PANE_ID); return pane; },
    createPane: async options => { creates++; assert.equal(options.canClose, true);
      return pane = { title: options.title, width: options.width, navigate: async page => { navigated.push(page.entityId); }, select: () => selected++ }; } };
  const base = { mode: "sidePane", width: 650, title: "Details", panes, dialog: async () => { throw new Error("Unexpected dialog"); } };
  assert.equal(await navigateRecord({ ...base, page: { pageType: "entityrecord", entityName: "opportunity", entityId: "one" } }), "sidePane");
  assert.equal(await navigateRecord({ ...base, page: { pageType: "entityrecord", entityName: "opportunity", entityId: "two" } }), "sidePane");
  assert.equal(creates, 1); assert.equal(selected, 2); assert.equal(panes.state, 1);
  assert.deepEqual(navigated, ["one", "two"]);
});

test("dialog preference and missing/native-host side panes retain the existing opening route", async () => {
  let dialogs = 0;
  const base = { page: { pageType: "entityrecord", entityName: "opportunity", entityId: "one" }, title: "Details", width: null, dialog: async () => dialogs++ };
  assert.equal(await navigateRecord({ ...base, mode: "dialog" }), "dialog");
  assert.equal(await navigateRecord({ ...base, mode: "sidePane" }), "fallback");
  assert.equal(await navigateRecord({ ...base, mode: "sidePane", panes: { getPane: () => undefined, createPane: async () => { throw new Error("Native player"); } } }), "fallback");
  assert.equal(dialogs, 3);
  assert.equal(sidePaneWidth(null), 600); assert.equal(sidePaneWidth(299), 600); assert.equal(sidePaneWidth(1201), 600); assert.equal(sidePaneWidth(750), 750);
});

test("a failed/cancelled navigation in an existing pane does not open another form", async () => {
  let dialogs = 0;
  const pane = { navigate: async () => { throw new Error("Cancelled"); } };
  await assert.rejects(navigateRecord({ page: { pageType: "entityrecord", entityName: "opportunity", entityId: "two" }, mode: "sidePane",
    panes: { getPane: () => pane, createPane: async () => pane }, title: "Details", dialog: async () => dialogs++ }), /Cancelled/);
  assert.equal(dialogs, 0);
});
