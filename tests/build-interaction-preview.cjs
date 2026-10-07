const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const webpack = require("webpack");
const root = path.resolve(__dirname, "..");
const output = path.join(root, "out/preview");
function compile(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const source = path.join(directory, entry.name);
    if (entry.isDirectory()) { if (entry.name !== "generated") compile(source); continue; }
    if (!/\.tsx?$/.test(entry.name) || /\.d\.ts$/.test(entry.name)) continue;
    const relative = path.relative(path.join(root, "KanbanViewControl"), source);
    const destination = path.join(output, "source", relative.replace(/\.tsx?$/, ".js"));
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(destination, ts.transpileModule(fs.readFileSync(source, "utf8"), {
      fileName: source, compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2019, jsx: ts.JsxEmit.React, esModuleInterop: true }
    }).outputText);
  }
}
compile(path.join(root, "KanbanViewControl"));
webpack({ mode: "production", entry: path.join(__dirname, "ui-preview-entry.cjs"),
  output: { path: output, filename: "interactions.js" }, devtool: false, performance: { hints: false } }, (error, stats) => {
  if (error || stats.hasErrors()) { console.error(error || stats.toString({ all: false, errors: true })); process.exitCode = 1; return; }
  const css = ["index.css", "inline-edit.css"].map(file => fs.readFileSync(path.join(root, "KanbanViewControl/styles", file), "utf8")).join("\n");
  fs.writeFileSync(path.join(output, "interactions.html"), `<!doctype html><html lang="nl"><meta charset="utf-8"><title>Kanban interaction test</title><style>body{font-family:Segoe UI,Arial,sans-serif;margin:20px;color:#25364a}#root{max-width:1100px}aside{border:1px solid #cad6e2;padding:20px;width:300px;margin-top:20px}${css}</style><body><h1>Opportunity Kanban · interactieproef</h1><p>Demo met echte React-componenten en gesimuleerde Dataverse-antwoorden.</p><div id="root"></div><aside id="test-pane" hidden></aside><script src="interactions.js"></script></body></html>`);
  console.log("Built actual React card/column interaction preview with simulated host APIs.");
});
