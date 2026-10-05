const assert = require("node:assert/strict");
const test = require("node:test");
const { moveBpfStage, requiredStageFields, getBpfDefinition, createBpfApi } = require("./source-loader.cjs")()("lib/bpf-stage-move");
const id = n => `00000000-0000-0000-0000-${String(n).padStart(12, "0")}`;
const process = id(90), instance = id(91), record = id(92);
const plain = value => JSON.parse(JSON.stringify(value));
function fixture({ stage = 1, required = [], values = {}, custom = false } = {}) {
  const names = ["Qualify", "Develop", "Propose"];
  const stages = names.map((stagename, i) => ({ processstageid: id(i + 1), stagename, primaryentitytypecode: "opportunity", _processid_value: process,
    clientdata: JSON.stringify(i + 1 === stage ? required.map(([name, type]) => ({ Type: "Field", DisplayName: name, Field: { AttributeName: name, IsRequired: true } })) : []) }));
  const row = { businessprocessflowinstanceid: instance, _activestageid_value: id(stage), _processid_value: process, statecode: 0, statuscode: 1,
    [custom ? "_org_deal_value" : "_opportunityid_value"]: record,
    traversedpath: stages.slice(0, stage).map(s => s.processstageid).join(","), "@odata.etag": 'W/"1"' };
  const updates = [], reads = [], queries = [];
  const api = {
    get: async path => {
      reads.push(path);
      if (path.startsWith("RetrieveActivePath")) return { value: stages };
      if (path.includes("/Attributes?")) return { value: required.map(([LogicalName, AttributeType]) => ({ LogicalName, AttributeType })) };
      return { IsBPFEntity: true, PrimaryIdAttribute: "businessprocessflowinstanceid", EntitySetName: custom ? "org_bpfcollection" : "opportunitysalesprocesses",
        ManyToOneRelationships: [{ ReferencedEntity: "opportunity", ReferencingAttribute: custom ? "org_deal" : "opportunityid" },
          { ReferencedEntity: "processstage", ReferencingAttribute: "activestageid", ReferencingEntityNavigationPropertyName: custom ? "org_active_stage" : "activestageid" }] };
    },
    retrieveMultipleRecords: async (entity, query) => { queries.push({ entity, query }); return { entities: [{ ...row }] }; },
    retrieveRecord: async (entity, guid, query) => {
      reads.push({ entity, guid, query });
      if (entity === "processstage") return { ...stages.find(s => s.processstageid === guid) };
      if (entity === "opportunity") return { ...values };
      return { ...row };
    },
    patch: async (entitySet, guid, update, etag) => {
      assert.equal(guid, instance); assert.equal(etag, row["@odata.etag"]);
      const binding = update[custom ? "org_active_stage@odata.bind" : "activestageid@odata.bind"];
      const next = binding.match(/\(([^)]+)\)/)[1];
      assert.equal(Math.abs(stages.findIndex(s => s.processstageid === next) - stages.findIndex(s => s.processstageid === row._activestageid_value)), 1);
      updates.push(plain({ entitySet, update, etag }));
      row._activestageid_value = next; row.traversedpath = update.traversedpath;
      row["@odata.etag"] = `W/"${updates.length + 1}"`;
    }
  };
  const request = { processName: custom ? "org_sales_bpf" : "opportunitysalesprocess", processId: process, entityName: "opportunity", recordId: record,
    sourceName: names[stage - 1], destinationName: "Develop" };
  return { api, request, row, stages, updates, reads, queries };
}

test("BPF drop updates the actual instance and path, never Opportunity's legacy stage fields", async () => {
  const h = fixture(); await moveBpfStage(h.api, h.request);
  assert.equal(h.row._activestageid_value, id(2));
  assert.deepEqual(h.updates, [{ entitySet: "opportunitysalesprocesses", update: { "activestageid@odata.bind": `/processstages(${id(2)})`, traversedpath: `${id(1)},${id(2)}` }, etag: 'W/"1"' }]);
  assert.match(h.queries[0].query, /_opportunityid_value eq/); assert.match(h.queries[0].query, /_processid_value eq/);
  assert.match(h.queries[0].query, /\$orderby=modifiedon desc&\$top=1/);
});

test("multi-column jumps follow adjacent phases in order with fresh instance versions", async () => {
  const h = fixture(); h.request.destinationName = "Propose"; await moveBpfStage(h.api, h.request);
  assert.equal(h.updates.length, 2); assert.equal(h.updates[1].etag, 'W/"2"');
  assert.equal(h.row.traversedpath, [id(1), id(2), id(3)].join(","));
});

test("backward jumps also move one stage at a time and rebuild the traversed path", async () => {
  const h = fixture({ stage: 3 }); h.request.destinationName = "Qualify"; await moveBpfStage(h.api, h.request);
  assert.equal(h.updates.length, 2); assert.equal(h.row._activestageid_value, id(1)); assert.equal(h.row.traversedpath, id(1));
});

test("custom BPF entity sets, lookup names and stage navigation come from metadata", async () => {
  const h = fixture({ custom: true }); await moveBpfStage(h.api, h.request);
  assert.match(h.queries[0].query, /_org_deal_value eq/);
  assert.equal(h.updates[0].entitySet, "org_bpfcollection");
  assert.equal(h.updates[0].update["org_active_stage@odata.bind"], `/processstages(${id(2)})`);
});

test("missing required fields and No on a required boolean block the transition before writing", async () => {
  for (const values of [{ budgetconfirmed: false }, { budgetconfirmed: null }]) {
    const h = fixture({ required: [["budgetconfirmed", "Boolean"]], values });
    await assert.rejects(moveBpfStage(h.api, h.request), e => e.code === "required" && e.detail.includes("budgetconfirmed"));
    assert.equal(h.updates.length, 0);
  }
});

test("zero is valid for numeric gates and lookup requirements read the server lookup value", async () => {
  const h = fixture({ required: [["budget", "Money"], ["parentaccountid", "Lookup"]], values: { budget: 0, _parentaccountid_value: id(50) } });
  await moveBpfStage(h.api, h.request); assert.equal(h.updates.length, 1);
  assert.ok(h.reads.some(r => r.entity === "opportunity" && r.query.includes("_parentaccountid_value")));
});

test("known required steps in an intermediate stage are checked before any multi-stage save", async () => {
  const h = fixture({ required: [["budget", "Money"]], values: { budget: 0 } });
  h.stages[1].clientdata = JSON.stringify([{ Type: "Field", Field: { AttributeName: "budget", IsRequired: true } }]);
  h.api.retrieveRecord = async (entity, guid) => entity === "processstage" ? h.stages.find(s => s.processstageid === guid) : { budget: null };
  h.stages[0].clientdata = "[]"; h.request.destinationName = "Propose";
  await assert.rejects(moveBpfStage(h.api, h.request), e => e.code === "required"); assert.equal(h.updates.length, 0);
});

test("unknown or malformed step metadata cannot bypass process gates", () => {
  for (const data of [null, "", "{}", "[", '[{"Type":"ActionStep"}]', '[{"Type":"Field","Field":{"IsRequired":"false"}}]']) {
    assert.throws(() => requiredStageFields(data), e => e.code === "unsupported");
  }
  assert.deepEqual(plain(requiredStageFields("[]")), []);
});

test("closed/aborted instances, missing instances and stale source columns never write", async () => {
  for (const code of ["inactive", "missingInstance", "conflict"]) {
    const h = fixture();
    if (code === "inactive") h.row.statuscode = 2;
    if (code === "missingInstance") h.api.retrieveMultipleRecords = async () => ({ entities: [] });
    if (code === "conflict") h.request.sourceName = "Develop";
    await assert.rejects(moveBpfStage(h.api, h.request), e => e.code === code); assert.equal(h.updates.length, 0);
  }
});

test("the active path determines the target stage ID when a different branch has the same name", async () => {
  const h = fixture(); h.stages[1].processstageid = id(20); await moveBpfStage(h.api, h.request);
  assert.equal(h.row._activestageid_value, id(20));
});

test("unavailable/ambiguous branches and cross-table stages do not trigger writes", async () => {
  for (const kind of ["missing", "duplicate", "table"]) {
    const h = fixture();
    if (kind === "missing") h.request.destinationName = "Another branch";
    if (kind === "duplicate") h.stages[2].stagename = "Develop";
    if (kind === "table") h.stages[1].primaryentitytypecode = "quote";
    await assert.rejects(moveBpfStage(h.api, h.request), e => ["route", "unsupported"].includes(e.code)); assert.equal(h.updates.length, 0);
  }
});

test("custom validation gets actual resolved IDs and may reject BPF moves", async () => {
  const h = fixture(); let target;
  h.request.validate = async value => { target = value; return { allow: false, message: "Blocked by project rule" }; };
  await assert.rejects(moveBpfStage(h.api, h.request), e => e.code === "validation" && e.detail === "Blocked by project rule");
  assert.deepEqual(plain(target), { instanceId: instance, sourceStageId: id(1), destinationStageId: id(2) }); assert.equal(h.updates.length, 0);
});

test("a stage changed by another user during validation is not overwritten", async () => {
  const h = fixture(); h.request.validate = async () => { h.row._activestageid_value = id(3); return { allow: true }; };
  await assert.rejects(moveBpfStage(h.api, h.request), e => e.code === "conflict"); assert.equal(h.updates.length, 0);
});

test("a server failure after an earlier transition reports how many stages really saved", async () => {
  const h = fixture(); h.request.destinationName = "Propose"; const patch = h.api.patch;
  h.api.patch = async (...args) => { if (h.updates.length) throw new Error("Plugin rejected the next stage"); return patch(...args); };
  await assert.rejects(moveBpfStage(h.api, h.request), e => e.code === "server" && e.savedSteps === 1 && e.detail.includes("Plugin"));
  assert.equal(h.row._activestageid_value, id(2)); assert.equal(h.updates.length, 1);
});

test("a branch change between saves stops the remaining move and retains the actual saved stage", async () => {
  const h = fixture(); h.request.destinationName = "Propose"; const get = h.api.get;
  h.api.get = async path => path.startsWith("RetrieveActivePath") && h.updates.length ? { value: h.stages.slice(0, 2) } : get(path);
  await assert.rejects(moveBpfStage(h.api, h.request), e => e.code === "route" && e.savedSteps === 1); assert.equal(h.updates.length, 1);
});

test("ambiguous parent relationships and non-BPF definitions are rejected", async () => {
  const h = fixture();
  for (const metadata of [{ IsBPFEntity: false }, { IsBPFEntity: true, ManyToOneRelationships: [{ ReferencedEntity: "opportunity" }, { ReferencedEntity: "opportunity" }] }]) {
    h.api.get = async () => metadata;
    await assert.rejects(getBpfDefinition(h.api, h.request.processName, "opportunity"), e => e.code === "unsupported");
  }
});

test("the HTTP adapter uses same-origin authentication, exact ETags and rejects permission/concurrency failures", async () => {
  let request;
  const api = createBpfApi({}, async (url, options) => { request = { url, options }; return { ok: true, status: 204 }; });
  await api.patch("opportunitysalesprocesses", instance, { traversedpath: id(1) }, 'W/"17"');
  assert.equal(request.url, `/api/data/v9.2/opportunitysalesprocesses(${instance})`);
  assert.equal(request.options.credentials, "same-origin"); assert.equal(request.options.headers["If-Match"], 'W/"17"');
  for (const status of [403, 412]) {
    const denied = createBpfApi({}, async () => ({ ok: false, status, json: async () => ({ error: { message: "Permission denied" } }) }));
    await assert.rejects(denied.patch("opportunitysalesprocesses", instance, {}, 'W/"17"'), e => e.code === (status === 412 ? "conflict" : "server"));
  }
  await assert.rejects(api.patch("opportunitysalesprocesses", instance, {}, ""), e => e.code === "unsupported");
});
