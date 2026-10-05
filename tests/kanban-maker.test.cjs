const assert = require("node:assert/strict");
const test = require("node:test");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const { sidePaneWidth } = require("./source-loader.cjs")()("lib/record-navigation");

test("optional integer inputs have parseable maker defaults before Dataverse saves a view", () => {
  const manifest = readFileSync(path.join(__dirname, "../KanbanViewControl/ControlManifest.Input.xml"), "utf8");
  const integers = [...manifest.matchAll(/<property\s+([^>]+)>?/g)]
    .map((match) => Object.fromEntries([...match[1].matchAll(/([\w-]+)="([^"]*)"/g)].map((attribute) => [attribute[1], attribute[2]])))
    .filter((property) => property["of-type"] === "Whole.None" && property.required === "false");
  assert.ok(integers.length > 0);
  for (const property of integers) {
    assert.equal(property.usage, "input");
    assert.match(property["default-value"] ?? "", /^\d+$/, `${property.name} needs a non-empty integer default in maker`);
    assert.ok(Number.isSafeInteger(Number(property["default-value"])));
  }
  const width = integers.find((property) => property.name === "sidePaneWidth")["default-value"];
  assert.equal(sidePaneWidth(width), sidePaneWidth(null), "maker and runtime use the same default width");
  assert.equal(Number(integers.find((property) => property.name === "closeDateWarningDays")["default-value"]), 7);
});


const manifest = readFileSync(path.join(__dirname, "../KanbanViewControl/ControlManifest.Input.xml"), "utf8");
const inputs = [...manifest.matchAll(/<property\s+([^>]+)>?/g)]
  .map(match => Object.fromEntries([...match[1].matchAll(/([\w-]+)="([^"]*)"/g)].map(attribute => [attribute[1], attribute[2]])));

test("every TwoOptions input has an explicit maker default, preserving the existing board defaults", () => {
  const expected = { compactCards: false, showCloseDateBadges: false, hideViewBy: false, allowCardMove: true,
    showOpenInNewTabButton: false, hideEmptyColumns: false, hideColumnFieldOnCard: false,
    showEmailAndPhoneAsLinks: false, expandBoardToFullWidth: false, allowCreateNew: true };
  const booleans = inputs.filter(p => p["of-type"] === "TwoOptions");
  assert.deepEqual(booleans.map(p => p.name).sort(), Object.keys(expected).sort());
  for (const p of booleans) {
    assert.equal(p.usage, "input"); assert.equal(p.required, "false");
    assert.match(p["default-value"] ?? "", /^(true|false)$/, `${p.name} needs a boolean before the view can be saved`);
    assert.equal(p["default-value"], String(expected[p.name]));
  }
});

test("all enum inputs have a default that is one of their declared values", () => {
  const enums = [...manifest.matchAll(/<property\s+([^>]*of-type="Enum"[^>]*)>([\s\S]*?)<\/property>/g)];
  assert.equal(enums.length, inputs.filter(p => p["of-type"] === "Enum").length);
  for (const m of enums) {
    const name = m[1].match(/name="([^"]+)"/)[1];
    const value = m[1].match(/default-value="([^"]+)"/)?.[1];
    const choices = [...m[2].matchAll(/<value\s+[^>]*>([^<]+)<\/value>/g)].map(v => v[1]);
    assert.ok(choices.includes(value), `${name} needs a declared enum default`);
  }
});

test("maker boolean defaults round-trip through Config JSON with explicit overrides", () => {
  const { exportConfiguration, resolveConfiguration } = require("./source-loader.cjs")()("lib/board-config");
  const parameters = Object.fromEntries(inputs.filter(p => p["of-type"] === "TwoOptions")
    .map(p => [p.name, { raw: p["default-value"] === "true" }]));
  const exported = exportConfiguration(parameters);
  assert.equal(exported.issues.length, 0);
  const json = JSON.parse(exported.json);
  assert.equal(json.card.compact.enabled, false); assert.equal(json.board.allowCardMove, true);
  parameters.config = { raw: JSON.stringify({ schemaVersion: 1, card: { compact: { enabled: true } }, board: { allowCardMove: false } }) };
  const resolved = resolveConfiguration(parameters);
  assert.equal(resolved.issues.length, 0);
  assert.equal(resolved.parameters.compactCards.raw, true); assert.equal(resolved.parameters.allowCardMove.raw, false);
  assert.equal(parameters.compactCards.raw, false); assert.equal(parameters.allowCardMove.raw, true);
});
