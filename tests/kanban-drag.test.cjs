const assert = require("node:assert/strict");
const test = require("node:test");
const sourceLoader = require("./source-loader.cjs");

function setup({ save = async () => undefined, validator, bpf = false, open = async () => {} } = {}) {
  const card = { id: "one", column: "1", statuscode: { label: "Status", value: "New" } };
  const original = [{ id: "1", title: "New", cards: [card] }, { id: "2", title: "Qualified", cards: [] }];
  let current = original;
  let saves = 0;
  let opens = 0;
  const board = {
    context: {}, locale: "en", activeView: { type: bpf ? "BPF" : undefined },
    setColumns: value => { current = typeof value === "function" ? value(current) : value; },
    openFormWithLoading: async () => { opens++; await open(); },
    movePendingRef: { current: false }, setIsMovePending: () => {},
    cardMoveValidationFunctionName: validator ? "validate" : undefined,
  };
  const errors = [];
  const load = sourceLoader({
    react: { useContext: () => board },
    "../context/board-context": {},
    "./useDataverse": { useDataverse: () => ({ updateRecord: async record => { saves++; return save(record); } }) },
    "react-hot-toast": { default: { error: value => errors.push(value), promise: promise => promise } },
  }, { window: { validate: validator } });
  const { onDragEnd } = load("hooks/useDnD").useDnD(original);
  const drop = { draggableId: "one", source: { droppableId: "1", index: 0 }, destination: { droppableId: "2", index: 0 } };
  const record = { id: "one", entityName: "opportunity", update: { statuscode: 2 } };
  return { onDragEnd, drop, record, board, original, card, errors, current: () => current, saves: () => saves, opens: () => opens };
}

test("drop is optimistic before async validation; validator sees original immutable card", async () => {
  let release;
  let input;
  const h = setup({ validator: args => { input = args; return new Promise(resolve => { release = resolve; }); } });
  const pending = h.onDragEnd(h.drop, h.record);
  assert.equal(h.current()[1].cards[0].statuscode.value, "Qualified");
  assert.equal(input.card, h.card);
  assert.equal(h.card.statuscode.value, "New");
  assert.equal(h.saves(), 0);
  release(true);
  assert.equal((await pending).shouldRefresh, true);
  assert.equal(h.saves(), 1);
});

test("rejected validation restores snapshot and never saves", async () => {
  const h = setup({ validator: () => ({ allow: false, message: "Rejected" }) });
  assert.equal((await h.onDragEnd(h.drop, h.record)).shouldRefresh, false);
  assert.equal(h.current(), h.original);
  assert.equal(h.saves(), 0);
  assert.deepEqual(h.errors, ["Rejected"]);
});

test("rejected Dataverse update rolls back and releases pending lock", async () => {
  const h = setup({ save: async () => { throw new Error("Permission denied"); } });
  assert.equal((await h.onDragEnd(h.drop, h.record)).shouldRefresh, false);
  assert.equal(h.current(), h.original);
  assert.equal(h.card.statuscode.value, "New");
  assert.equal(h.board.movePendingRef.current, false);
});

test("a second drag is ignored while validation is pending", async () => {
  let release;
  const h = setup({ validator: () => new Promise(resolve => { release = resolve; }) });
  const first = h.onDragEnd(h.drop, h.record);
  assert.equal((await h.onDragEnd(h.drop, h.record)).shouldRefresh, false);
  release(true);
  await first;
  assert.equal(h.saves(), 1);
});

test("cancel and same-column reorder do not save or refresh", async () => {
  const h = setup();
  assert.equal((await h.onDragEnd({ ...h.drop, destination: null }, h.record)).shouldRefresh, false);
  assert.equal((await h.onDragEnd({ ...h.drop, destination: { droppableId: "1", index: 0 } }, h.record)).shouldRefresh, false);
  assert.equal(h.saves(), 0);
});

test("BPF drop uses native form, requests one host refresh, and never updates a choice", async () => {
  const h = setup({ bpf: true });
  assert.equal((await h.onDragEnd(h.drop, h.record)).shouldRefresh, true);
  assert.equal(h.opens(), 1);
  assert.equal(h.saves(), 0);
  assert.equal(h.current(), h.original);
});

test("Board sends numeric choice IDs to Dataverse, rather than droppable strings", async () => {
  let saved;
  let refreshed = 0;
  const board = {
    context: { parameters: { dataset: { refresh: () => refreshed++ } } },
    columns: [], selectedEntity: "opportunity", locale: "en", draggingRef: { current: false },
    activeView: { uniqueName: "statuscode", columns: [{ id: 2, title: "Qualified" }] },
  };
  const dragContext = function DragDropContext() {};
  const load = sourceLoader({
    react: { useContext: () => board, useMemo: fn => fn(), useEffect: () => {}, createElement: (type, props, ...children) => ({ type, props: { ...props, children } }) },
    "..": { CommandBar: "command", Column: "column", QuickFilters: "filters" },
    "../../context/board-context": {},
    "../../hooks/useDnD": { useDnD: () => ({ onDragEnd: async (result, record) => { saved = record; return { shouldRefresh: true }; } }) },
    "@hello-pangea/dnd": { DragDropContext: dragContext },
  }, { setTimeout: fn => fn() });
  const tree = load("components/board/Board").default();
  const find = node => node && (node.type === dragContext ? node : node.props?.children?.flatMap(child => Array.isArray(child) ? child : [child]).map(find).find(Boolean));
  await find(tree).props.onDragEnd({ draggableId: "one", destination: { droppableId: "2" } });
  assert.equal(saved.update.statuscode, 2);
  assert.equal(refreshed, 1);
});
