const assert = require("node:assert/strict");
const test = require("node:test");
const load = require("./source-loader.cjs")();
const { buildCards, cardDisplayText, matchesCardSearch } = load("lib/card-data");
const { orderStages } = load("lib/utils");

test("lookup titles and multiple lookup values render names, not objects", () => {
  assert.equal(cardDisplayText({ value: { id: "1", etn: "account", name: "Contoso" } }), "Contoso");
  assert.equal(cardDisplayText({ value: [{ name: "Ada" }, { name: "Ben" }] }), "Ada, Ben");
  assert.equal(cardDisplayText(null), "");
  assert.equal(cardDisplayText({ value: 0 }), "0");
});

test("choice grouping uses raw values and rebuilding picks up same-ID amount changes", () => {
  let amount = 10;
  const dataset = {
    columns: [{ name: "customer", displayName: "Customer" }, { name: "statuscode", displayName: "Status" }, { name: "estimatedvalue", displayName: "Value" }],
    records: { one: {
      getValue: name => ({ customer: { id: "c", etn: "account", name: "Contoso" }, statuscode: 1, estimatedvalue: amount })[name],
      getFormattedValue: name => name === "statuscode" ? "Dutch label" : String(amount),
    } },
  };
  const view = { key: "statuscode", columns: [{ id: 1, title: "Fallback language label" }] };
  const first = buildCards(dataset, view)[0];
  assert.equal(first.column, 1);
  assert.equal(cardDisplayText(first.title), "Contoso");
  amount = 25000;
  assert.equal(buildCards(dataset, view)[0].estimatedvalueRaw, 25000);
  assert.equal(first.estimatedvalueRaw, 10);
});

test("search excludes raw dates, IDs and column identifiers", () => {
  const card = { id: "hidden-guid", column: "secret", title: { value: "Contoso" }, estimatedclosedate: { value: "02-10-2026" }, estimatedclosedateRaw: new Date("2026-10-02") };
  assert.equal(matchesCardSearch(card, "Contoso"), true);
  assert.equal(matchesCardSearch(card, "GMT"), false);
  assert.equal(matchesCardSearch(card, "hidden-guid"), false);
});

test("BPF ordering handles empty data, branches and cycles without dropping stages", () => {
  const stage = (id, next) => ({ Stage: { StageId: id, NextStageId: next } });
  assert.equal(orderStages([]).length, 0);
  assert.deepEqual(Array.from(orderStages([stage("b", null), stage("a", "b"), stage("c", "d"), stage("d", null)]), x => x.Stage.StageId), ["a", "b", "c", "d"]);
  assert.deepEqual(Array.from(orderStages([stage("a", "b"), stage("b", "a")]), x => x.Stage.StageId), ["a", "b"]);
});
