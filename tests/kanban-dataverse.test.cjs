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
  }, { fetch: async path => ({ ok: true, status: 200, json: async () => ({ IsBPFEntity: true, EntitySetName: "processes", PrimaryIdAttribute: "businessprocessflowinstanceid",
    ManyToOneRelationships: [{ ReferencedEntity: "opportunity", ReferencingAttribute: path.includes("opportunitysalesprocess") ? "opportunityid" : "bpf_opportunityid" },
      { ReferencedEntity: "processstage", ReferencingAttribute: "activestageid", ReferencingEntityNavigationPropertyName: "activestageid" }] }) }) });
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

test("built-in Opportunity Sales Process uses the correct lookup query and record ID", async () => {
  const h = hook(async (name, query) => {
    assert.equal(name, "opportunitysalesprocess");
    assert.ok(query.includes("$select=_activestageid_value,_processid_value,_opportunityid_value"));
    assert.ok(query.includes("PropertyName='opportunityid'"));
    return { entities: [{ _opportunityid_value: "one", activestageid: { stagename: "Develop" } }] };
  });
  const records = await h.getRecordCurrentStage("opportunity", "opportunitysalesprocess", ["one"]);
  assert.equal(records[0].id, "one");
  assert.equal(records[0].stageName, "Develop");
});


test("BPF grouping and dragging select the same latest modified instance of the selected process", async () => {
  const processId = "00000000-0000-0000-0000-000000000090";
  const h = hook(async (name, query) => {
    assert.match(query, /_processid_value eq 00000000-0000-0000-0000-000000000090/);
    assert.match(query, /\$orderby=modifiedon desc/);
    return { entities: [
      { _opportunityid_value: "one", activestageid: { stagename: "Develop" } },
      { _opportunityid_value: "one", activestageid: { stagename: "Qualify" } },
      { _opportunityid_value: "two", activestageid: { stagename: "Propose" } },
    ] };
  });
  const rows = await h.getRecordCurrentStage("opportunity", "opportunitysalesprocess", ["one", "two"], processId);
  assert.equal(rows.length, 2); assert.equal(rows[0].stageName, "Develop");
});
