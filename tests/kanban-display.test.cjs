const assert = require("node:assert/strict");
const test = require("node:test");
const load = require("./source-loader.cjs")();
const { getDueStatus, getColumnTotals } = load("lib/opportunity-display");
const { getStrings } = load("lib/strings");

test("close date badges compare calendar days with an inclusive warning boundary", () => {
  const now = new Date(2026, 9, 2, 23, 59);
  assert.equal(getDueStatus(new Date(2026, 9, 1), 7, now), "overdue");
  assert.equal(getDueStatus(new Date(2026, 9, 2, 1), 7, now), "today");
  assert.equal(getDueStatus(new Date(2026, 9, 9), 7, now), "soon");
  assert.equal(getDueStatus(new Date(2026, 9, 10), 7, now), "later");
  assert.equal(getDueStatus(null, 7, now), null);
  assert.equal(getDueStatus("invalid date", 7, now), null);
});

test("money totals never merge different transaction currency IDs", () => {
  const card = (value, id, name) => ({ amountRaw: value, transactioncurrencyid: { value: { id: { guid: id }, name } } });
  const totals = getColumnTotals([card(10, "eur", "Euro"), card(20, "eur", "Euro"), card(5, "usd", "US Dollar")], "amount", true);
  assert.deepEqual(Array.from(totals, total => [total.amount, total.currency]), [[30, "Euro"], [5, "US Dollar"]]);
  assert.equal(getColumnTotals([card(10, "one", "Dollar"), card(20, "two", "Dollar")], "amount", true).length, 2);
});

test("base/numeric totals add finite raw numbers only and preserve zero", () => {
  const values = [{ revenueRaw: 0 }, { revenueRaw: 10.25 }, { revenueRaw: NaN }, { revenueRaw: Infinity }, { revenueRaw: "1.000,00" }];
  assert.equal(getColumnTotals(values, "revenue", false)[0].amount, 10.25);
  assert.equal(getColumnTotals([{ revenueRaw: 0 }], "revenue", false)[0].amount, 0);
  assert.equal(getColumnTotals([], "revenue", false).length, 0);
});

test("Dutch app language resolves the complete UI strings", () => {
  assert.equal(getStrings("nl-NL").expandedCardsLabel, "Uitgebreid");
  assert.equal(getStrings("nl").recordCountLabel(1), "1 record");
  assert.equal(getStrings("unsupported").expandedCardsLabel, "Expanded");
});
