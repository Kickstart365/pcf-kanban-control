const { readFileSync, existsSync } = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

// Run actual TypeScript logic without mounting Fluent UI or a Dataverse host.
module.exports = function sourceLoader(stubs = {}, globals = {}, allowExternal = false) {
  const cache = new Map();
  function load(file) {
    file = path.resolve(__dirname, "../KanbanViewControl", file);
    if (!existsSync(file)) file += existsSync(file + ".ts") ? ".ts" : ".tsx";
    if (cache.has(file)) return cache.get(file).exports;
    const module = { exports: {} };
    cache.set(file, module);
    const code = ts.transpileModule(readFileSync(file, "utf8"), {
      fileName: file,
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2019, jsx: ts.JsxEmit.React },
    }).outputText;
    vm.runInNewContext(code, {
      ...globals, module, exports: module.exports, console, Date, Map, Set, Promise, Error,
      require(name) {
        if (Object.hasOwn(stubs, name)) return stubs[name];
        if (name.startsWith(".")) return load(path.resolve(path.dirname(file), name));
        if (allowExternal) return require(name);
        throw new Error(`Unexpected dependency: ${name}`);
      },
    }, { filename: file });
    return module.exports;
  }
  return load;
};
