const assert = require("node:assert/strict");
const test = require("node:test");
const { JSDOM } = require("jsdom");
const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "https://example.test" });
global.window = dom.window; global.document = dom.window.document; global.navigator = dom.window.navigator;
// React 16's browser scheduler must not retain Node MessageChannel ports after tests.
global.MessageChannel = dom.window.MessageChannel;
global.requestAnimationFrame = callback => setTimeout(callback, 0);
global.cancelAnimationFrame = clearTimeout;
const React = require("react");
const ReactDOM = require("react-dom");
const { act, Simulate } = require("react-dom/test-utils");
const sourceLoader = require("./source-loader.cjs");
test.after(() => dom.window.close());
async function settle() {
  // The hosted React 16.8 runtime has synchronous act; flush asynchronous reads separately.
  await new Promise(resolve => setImmediate(resolve));
  act(() => {});
}

async function fixture({ kind = "number", original = 25, definitionPromise, savePromise, rejectSave = false } = {}) {
  const BoardContext = React.createContext(null);
  const state = { writes: [], requests: 0, refreshes: 0, rejectSave, original };
  const root = document.createElement("div"); document.body.append(root);
  const outside = document.createElement("button"); outside.textContent = "Outside"; document.body.append(outside);
  const load = sourceLoader({ react: React, "../../context/board-context": { BoardContext } }, {
    fetch: async (_url, options) => {
      state.requests++;
      if (savePromise) await savePromise;
      if (state.rejectSave) return { ok: false, status: 403, json: async () => ({ error: { message: "Geen schrijfrechten" } }) };
      state.writes.push(JSON.parse(options.body));
      return { ok: true, status: 204 };
    },
  }, true);
  const Editor = load("components/card/InlineFieldEditor").default;
  function Shell() {
    const [key, setKey] = React.useState(null);
    const lock = React.useRef(null);
    const beginInlineEdit = React.useCallback(next => { if (lock.current) return false; lock.current = next; setKey(next); return true; }, []);
    const finishInlineEdit = React.useCallback(next => { if (lock.current === next) { lock.current = null; setKey(null); } }, []);
    const board = { locale: "nl", inlineEditKey: key, beginInlineEdit, finishInlineEdit,
      getInlineDefinition: async () => {
        if (definitionPromise) await definitionPromise;
        return { name: "test_field", kind, required: false };
      }, context: { parameters: { dataset: { refresh: () => state.refreshes++ } }, webAPI: {
        retrieveRecord: async () => ({ test_field: state.original, statecode: 0, isrevenuesystemcalculated: false, "@odata.etag": 'W/"1"' }),
      } },
    };
    return React.createElement(BoardContext.Provider, { value: board }, React.createElement(Editor, {
      recordId: "00000000-0000-0000-0000-000000000001", field: "test_field", label: "Value",
    }, React.createElement("span", null, "Current value")));
  }
  act(() => { ReactDOM.render(React.createElement(Shell), root); });
  await settle();
  const action = async callback => { act(() => { callback(); }); await settle(); };
  const input = () => root.querySelector("input,textarea");
  const button = text => [...root.querySelectorAll("button")].find(element => element.textContent === text);
  const start = () => action(() => Simulate.click(root.querySelector(".inline-edit-value")));
  const change = value => action(() => Simulate.change(input(), { target: { value } }));
  const enter = (extra = {}) => action(() => Simulate.keyDown(input(), { key: "Enter", ...extra }));
  const blur = () => action(() => outside.focus());
  const close = () => { act(() => { ReactDOM.unmountComponentAtNode(root); }); root.remove(); outside.remove(); };
  return { root, state, input, button, start, change, enter, blur, action, close };
}

test("clicking a card value opens an editor without Save; leaving it saves a decimal comma exactly once", async () => {
  const f = await fixture();
  try {
    await f.start(); assert.ok(f.input()); assert.equal(f.button("Opslaan"), undefined);
    await f.change("40,50"); await f.blur();
    assert.deepEqual(f.state.writes, [{ test_field: 40.5 }]); assert.equal(f.state.refreshes, 1); assert.equal(f.input(), null);
  } finally { f.close(); }
});

test("Enter plus focus loss during a pending save does not duplicate the write or allow cancellation", async () => {
  let release; const pending = new Promise(resolve => { release = resolve; });
  const f = await fixture({ savePromise: pending });
  try {
    await f.start(); await f.change("30"); await f.enter(); await f.blur(); await f.enter();
    assert.equal(f.state.requests, 1); assert.equal(f.button("Annuleren").disabled, true);
    await f.action(release); assert.deepEqual(f.state.writes, [{ test_field: 30 }]); assert.equal(f.state.refreshes, 1);
  } finally { f.close(); }
});

test("unchanged and numerically equivalent drafts close without writes or refreshes", async () => {
  const f = await fixture();
  try {
    await f.start(); await f.blur(); await f.start(); await f.change("25,00"); await f.enter();
    assert.equal(f.input(), null); assert.equal(f.state.requests, 0); assert.equal(f.state.refreshes, 0);
  } finally { f.close(); }
});

test("Escape and focus moving to Cancel retain the server value without autosaving", async () => {
  const f = await fixture();
  try {
    await f.start(); await f.change("30"); await f.action(() => Simulate.keyDown(f.input(), { key: "Escape" }));
    await f.start(); await f.change("40"); await f.action(() => f.button("Annuleren").focus());
    assert.equal(f.state.requests, 0); await f.action(() => Simulate.click(f.button("Annuleren")));
    assert.equal(f.input(), null); assert.equal(f.state.requests, 0);
  } finally { f.close(); }
});

test("validation failure retains its draft, then a corrected value autosaves", async () => {
  const f = await fixture();
  try {
    await f.start(); await f.change("invalid"); await f.blur();
    assert.equal(f.input().value, "invalid"); assert.ok(f.root.querySelector('[role="alert"]')); assert.equal(f.state.requests, 0);
    await f.change("50"); await f.enter(); assert.deepEqual(f.state.writes, [{ test_field: 50 }]);
  } finally { f.close(); }
});

test("a server rejection keeps the draft and supports retry without discarding it", async () => {
  const f = await fixture({ rejectSave: true });
  try {
    await f.start(); await f.change("55"); await f.blur();
    assert.equal(f.input().value, "55"); assert.equal(f.root.querySelector('[role="alert"]').textContent, "Geen schrijfrechten");
    assert.equal(f.state.writes.length, 0); f.state.rejectSave = false;
    await f.action(() => Simulate.click(f.button("Opnieuw opslaan")));
    assert.deepEqual(f.state.writes, [{ test_field: 55 }]); assert.equal(f.state.requests, 2);
  } finally { f.close(); }
});

test("multiline Enter does not save; Ctrl+Enter and focus loss do", async () => {
  const f = await fixture({ kind: "multiline", original: "Old text" });
  try {
    await f.start(); await f.change("New\ntext"); await f.enter(); assert.equal(f.state.requests, 0);
    await f.enter({ ctrlKey: true }); assert.deepEqual(f.state.writes, [{ test_field: "New\ntext" }]);
    await f.start(); await f.change("Another\ntext"); await f.blur(); assert.equal(f.state.writes[1].test_field, "Another\ntext");
  } finally { f.close(); }
});

test("composition does not submit incomplete text when Enter is used by an input method", async () => {
  const f = await fixture({ kind: "text", original: "Old" });
  try {
    await f.start(); await f.action(() => Simulate.compositionStart(f.input())); await f.change("Draft"); await f.enter();
    assert.equal(f.state.requests, 0); await f.action(() => Simulate.compositionEnd(f.input())); await f.enter();
    assert.equal(f.state.writes[0].test_field, "Draft");
  } finally { f.close(); }
});

test("cancel while metadata is loading ignores its late result and releases the editor lock", async () => {
  let release; const pending = new Promise(resolve => { release = resolve; });
  const f = await fixture({ definitionPromise: pending });
  try {
    await f.start(); await f.action(() => Simulate.click(f.button("Annuleren"))); await f.action(release);
    assert.equal(f.input(), null); assert.equal(f.state.requests, 0);
    await f.start(); assert.ok(f.input());
  } finally { f.close(); }
});

test("DateOnly edits send a calendar date without a timezone or timestamp", async () => {
  const f = await fixture({ kind: "date", original: "2026-10-03T00:00:00Z" });
  try {
    await f.start(); await f.change("2028-02-29"); await f.blur();
    assert.deepEqual(f.state.writes, [{ test_field: "2028-02-29" }]);
  } finally { f.close(); }
});
