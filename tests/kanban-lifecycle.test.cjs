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
        if (name === "./lib/board-config") return require("./source-loader.cjs")()("lib/board-config");
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

test("host dataset updates invalidate cards even when record IDs stay unchanged", () => {
    const control = new KanbanViewControl();
    const ctx = context();
    ctx.updatedProperties = [];
    assert.equal(control.updateView(ctx).props.datasetRevision, 1);
    ctx.updatedProperties = ["layout"];
    assert.equal(control.updateView(ctx).props.datasetRevision, 1);
    ctx.updatedProperties = ["dataset"];
    assert.equal(control.updateView(ctx).props.datasetRevision, 2);
});

test("the real PCF entry point applies JSON to every descendant without mutating frozen host inputs", () => {
    const dataset = Object.freeze({ loading: false });
    const service = {};
    const ctx = Object.freeze({ ...context(), webAPI: service, parameters: Object.freeze({ dataset,
        ...context().parameters, config: Object.freeze({ raw: '{"card":{"open":{"mode":"dialog","width":800}},"notifications":{"position":"bottom-left"}}' }) }) });
    const props = new KanbanViewControl().updateView(ctx).props;
    assert.equal(props.context.parameters.sidePaneWidth.raw, 800);
    assert.equal(props.context.parameters.recordOpenMode.raw, "dialog");
    assert.equal(props.context.parameters.dataset, dataset); assert.equal(props.context.webAPI, service);
    assert.equal(ctx.parameters.sidePaneWidth, undefined); assert.equal(props.notificationPosition, "bottom-left");
    assert.equal(JSON.parse(props.configurationExport.json).card.open.width, 800);
});

test("clearing or correcting JSON replaces previous effective values and errors immediately", () => {
    const control = new KanbanViewControl();
    const ctx = context(); ctx.parameters.config = { raw: '{"card":{"open":{"width":"bad"}}}' };
    assert.equal(control.updateView(ctx).props.configurationIssues.length, 1);
    ctx.parameters.config.raw = '{"card":{"open":{"width":750}}}';
    assert.equal(control.updateView(ctx).props.configurationIssues.length, 0);
    assert.equal(control.updateView(ctx).props.context.parameters.sidePaneWidth.raw, 750);
    ctx.parameters.config.raw = "";
    assert.equal(control.updateView(ctx).props.context.parameters.sidePaneWidth, undefined);
});
