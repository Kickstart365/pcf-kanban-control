const assert = require("node:assert/strict");
const test = require("node:test");
const sourceLoader = require("./source-loader.cjs");

function hook(retrieveMultipleRecords, columns = []) {
  const context = {
    userSettings: { languageId: 1043 },
    parameters: { dataset: { columns, getTargetEntityType: () => "opportunity" } },
    webAPI: { retrieveMultipleRecords },
  };
  const load = sourceLoader({
    react: { useMemo: fn => fn(), useRef: value => ({ current: value }) },
    "./service": { XrmService: { getInstance: () => ({ setContext: () => {} }) } },
  });
  return load("hooks/useDataverse").useDataverse(context);
}

test("empty Opportunity dataset still returns BPF columns with no per-record stage query", async () => {
  const calls = [];
  const h = hook(async name => {
    calls.push(name);
    return { entities: [{ stagename: "Qualify", processstageid: "s", processid: { workflowid: "p", name: "Sales", uniquename: "bpf_sales", statecode: 1 } }] };
  });
  const views = await h.getBusinessProcessFlows("opportunity", []);
  assert.equal(views[0].columns[0].title, "Qualify");
  assert.equal(views[0].records.length, 0);
  assert.deepEqual(calls, ["processstage"]);
});

test("choice metadata is cached and language fallback keeps one column per numeric value", async () => {
  let calls = 0;
  const h = hook(async () => {
    calls++;
    return { entities: [
      { attributename: "salesstage", attributevalue: 1, value: "Qualify", langid: 1033, displayorder: 1 },
      { attributename: "salesstage", attributevalue: 1, value: "Kwalificeren", langid: 1043, displayorder: 1 },
      { attributename: "salesstage", attributevalue: 2, value: "Develop", langid: 1033, displayorder: 2 },
    ] };
  }, [{ name: "salesstage", displayName: "Stage", dataType: "OptionSet" }]);
  const first = await h.getOptionSets();
  assert.equal(first[0].columns.length, 2);
  assert.equal(first[0].columns[0].title, "Kwalificeren");
  assert.equal(first[0].columns[1].id, 2);
  assert.equal(await h.getOptionSets(), first);
  assert.equal(calls, 1);
});

test("large BPF stage requests are chunked and each record remains represented", async () => {
  const sizes = [];
  const h = hook(async (name, query) => {
    assert.equal(name, "bpf_sales");
    const ids = query.match(/PropertyValues=\[([^\]]+)\]/)[1].split(",").map(value => value.replace(/'/g, ""));
    sizes.push(ids.length);
    return { entities: ids.map(id => ({ _bpf_opportunityid_value: id, activestageid: { stagename: "Qualify" } })) };
  });
  const rows = await h.getRecordCurrentStage("opportunity", "bpf_sales", Array.from({ length: 251 }, (_, i) => `id${i}`));
  assert.deepEqual(sizes, [100, 100, 51]);
  assert.equal(rows.length, 251);
  assert.equal(rows[250].id, "id250");
});
