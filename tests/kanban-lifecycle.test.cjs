const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");

// Exercise the real PCF entry point. The host owns rendering; this test does
// not mount App or pretend to exercise its Dataverse/drag-and-drop behavior.
const fileName = path.join(__dirname, "../KanbanViewControl/index.ts");
const compiled = ts.transpileModule(readFileSync(fileName, "utf8"), {
    fileName,
    compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2019
    }
});
const app = function App() { return null; };
const entry = { exports: {} };
vm.runInNewContext(compiled.outputText, {
    exports: entry.exports,
    module: entry,
    require(name) {
        if (name === "react") {
            return { createElement: (type, props) => ({ type, props }) };
        }
        if (name === "./App") return { default: app };
        throw new Error(`Unexpected entry-point dependency: ${name}`);
    }
}, { filename: fileName });
const { KanbanViewControl } = entry.exports;

function context() {
    const resizeCalls = [];
    return {
        mode: { trackContainerResize: (enabled) => resizeCalls.push(enabled) },
        parameters: { notificationPosition: { raw: "top-right" } },
        resizeCalls
    };
}

test("destroy is safe before initialization", () => {
    assert.doesNotThrow(() => new KanbanViewControl().destroy());
});

test("destroy is safe after initialization", () => {
    const control = new KanbanViewControl();
    const ctx = context();
    control.init(ctx, () => {}, {});
    assert.deepEqual(ctx.resizeCalls, [true]);
    assert.doesNotThrow(() => control.destroy());
});

test("host can remove the control after updateView, including repeated cleanup", () => {
    const control = new KanbanViewControl();
    const ctx = context();
    control.init(ctx, () => {}, {});
    const element = control.updateView(ctx);
    assert.equal(element.type, app);
    assert.equal(element.props.context, ctx);
    assert.equal(element.props.notificationPosition, "top-right");
    assert.doesNotThrow(() => control.destroy());
    assert.doesNotThrow(() => control.destroy());
});
