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
