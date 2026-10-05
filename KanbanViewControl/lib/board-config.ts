/** One configuration document, resolved before any board component reads PCF inputs. */
type Schema = { type?: string; properties?: Record<string, Schema>; additionalProperties?: boolean | Schema;
  items?: Schema; required?: string[]; enum?: unknown[]; const?: unknown; minimum?: number; maximum?: number;
  pattern?: string; anyOf?: Schema[]; "x-property"?: string; description?: string; [key: string]: unknown };
type Parameters = Record<string, unknown>;
export interface ConfigurationIssue { property: string; message: string }
const object = (properties: Record<string, Schema>): Schema => ({ type: "object", properties, additionalProperties: false });
const text: Schema = { type: "string" };
const flag: Schema = { type: "boolean" };
const field: Schema = { type: "string", pattern: "^(?!(?:constructor|prototype)$)[a-zA-Z][a-zA-Z0-9_]*$" };
const list = (items: Schema): Schema => ({ type: "array", items });
const names = list(field);
const integer = (minimum: number, maximum = 1000000): Schema => ({ type: "integer", minimum, maximum });
const option = (...values: string[]): Schema => ({ type: "string", enum: values });
const input = (property: string, schema: Schema): Schema => ({ ...schema, "x-property": property });
const entry = (properties: Record<string, Schema>, required: string[]): Schema => ({ ...object(properties), required });
const color: Schema = { type: "string", pattern: "^#[0-9a-fA-F]{6}$" };
const identifier: Schema = { type: "string", pattern: "\\S" };
const highlight = object({ color: text, type: option("left", "right", "cornerTopRight", "cornerBottomRight", "cornerTopLeft", "cornerBottomLeft") });
highlight.required = ["color"];
const fieldSettings = object({ hidden: flag, hideLabel: flag, html: flag, ellipsis: flag, persona: { anyOf: [flag, { const: "iconOnly" }] },
  personaIconOnly: flag, displayName: text, width: { type: "number", minimum: 1, maximum: 100 },
  highlight: { anyOf: [highlight, { const: null }] } });

/** Standard JSON Schema, also used by the runtime so editor and runtime validation agree. */
export const configurationSchema: Schema = {
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://raw.githubusercontent.com/Kickstart365/pcf-kanban-control/main/docs/kanban-config.schema.json",
  title: "Kickstart365 Kanban configuration v1",
  ...object({
    "$schema": text, schemaVersion: { const: 1 },
    view: object({ default: input("defaultView", text), hide: input("hideViewBy", flag),
      bpf: object({ exclude: input("filteredBusinessProcessFlows", list(text)),
        stageOrder: input("businessProcessFlowStepOrder", list(entry({ id: text, order: { type: "number" } }, ["id", "order"]))) }) }),
    board: object({ hideEmptyColumns: input("hideEmptyColumns", flag), fullWidth: input("expandBoardToFullWidth", flag),
      minColumnWidth: input("minColumnWidth", integer(200, 1200)), maxColumnWidth: input("maxColumnWidth", integer(200, 2000)),
      initialCardsVisible: input("initialCardsVisible", integer(1, 500)),
      columnWidths: input("columnWidths", list(entry({ id: { anyOf: [identifier, { type: "number" }] }, width: integer(200, 1200) }, ["id", "width"]))),
      columnColors: input("columnColors", list(entry({ id: identifier, color }, ["id", "color"]))),
      allowCreateNew: input("allowCreateNew", flag), allowCardMove: input("allowCardMove", flag),
      totals: object({ field: input("columnTotalField", text), secondaryField: input("columnSecondaryTotalField", text) }),
      cardMoveValidation: object({ function: input("cardMoveValidationFunction", text), script: input("cardMoveValidationScript", text) }) }),
    card: object({ hideColumnField: input("hideColumnFieldOnCard", flag), showOpenInNewTab: input("showOpenInNewTabButton", flag),
      showEmailAndPhoneAsLinks: input("showEmailAndPhoneAsLinks", flag),
      open: object({ mode: input("recordOpenMode", option("sidePane", "dialog")), width: input("sidePaneWidth", integer(300, 1200)) }),
      editing: object({ mode: input("allowInlineEdit", option("enabled", "disabled")), fields: input("inlineEditFields", names) }),
      compact: object({ enabled: input("compactCards", flag), fields: input("compactCardFields", names) }),
      closeDate: object({ show: input("showCloseDateBadges", flag), field: input("closeDateField", text), warningDays: input("closeDateWarningDays", integer(0, 2147483647)) }),
      html: object({ allowedTags: input("allowedHtmlTagsOnCard", text), allowedAttributes: input("allowedHtmlAttributesOnCard", text) }),
      fields: { type: "object", additionalProperties: fieldSettings },
      // Lossless collection forms are useful when migrating empty lists or ordered highlights.
      hiddenFields: input("hiddenFieldsOnCard", names), htmlFields: input("htmlFieldsOnCard", names),
      hideLabels: input("hideLabelForFieldsOnCard", names), ellipsisFields: input("ellipsisFieldsOnCard", names),
      personaFields: input("lookupFieldsAsPersonaOnCard", names), personaIconOnlyFields: input("lookupFieldsPersonaIconOnlyOnCard", names),
      displayNames: input("fieldDisplayNamesOnCard", list(entry({ logicalName: field, displayName: text }, ["logicalName", "displayName"]))),
      fieldWidths: input("fieldWidthsOnCard", list(entry({ logicalName: field, width: { type: "number", minimum: 1, maximum: 100 } }, ["logicalName", "width"]))),
      highlights: input("booleanFieldHighlights", list(entry({ logicalName: field, ...highlight.properties }, ["logicalName", "color"]))) }),
    filters: object({ quickFilters: { type: "array", items: { anyOf: [field, entry({ field, inPopup: flag }, ["field"])] } },
      sort: object({ fields: input("sortFields", names), default: input("defaultSort", object({ field: text, direction: option("asc", "desc") })) }),
      presets: input("filterPresets", list(entry({ id: text, label: text, default: flag,
        filters: { type: "object", additionalProperties: { anyOf: [text, list(text), object({ start: text, end: text })] } } }, ["id", "label", "filters"]))) }),
    notifications: object({ position: input("notificationPosition", option("top-center", "top-left", "top-right", "bottom-center", "bottom-left", "bottom-right")) })
  })
};

const dangerous = (key: string) => key === "__proto__" || key === "constructor" || key === "prototype";
const isObject = (value: unknown): value is Record<string, unknown> => !!value && typeof value === "object" && !Array.isArray(value);
const own = (value: Record<string, unknown>, key: string) => Object.prototype.hasOwnProperty.call(value, key);

/** Invalid leaves fall back independently; malformed array entries invalidate that array. */
function validate(value: unknown, schema: Schema, path: string, issues: ConfigurationIssue[]): unknown {
  const reject = (message: string) => { issues.push({ property: path, message }); return undefined; };
  if (own(schema, "const")) return value === schema.const ? value : reject(`Expected ${JSON.stringify(schema.const)}.`);
  if (schema.anyOf) {
    for (const choice of schema.anyOf) {
      const attempt: ConfigurationIssue[] = [];
      const result = validate(value, choice, path, attempt);
      if (!attempt.length) return result;
    }
    return reject("Invalid value. Check the configuration schema for the accepted type and values.");
  }
  if (schema.type === "object") {
    if (!isObject(value)) return reject("Expected a JSON object.");
    if (schema.required?.some(key => !own(value, key))) return reject(`Required: ${schema.required.join(", ")}.`);
    const result: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(value)) {
      if (dangerous(key)) { reject(`Unsupported key: ${key}.`); continue; }
      const childSchema = schema.properties && own(schema.properties, key) ? schema.properties[key]
        : isObject(schema.additionalProperties) ? schema.additionalProperties : undefined;
      if (!childSchema) { issues.push({ property: `${path}.${key}`, message: "Unknown setting. Check its spelling in the configuration schema." }); continue; }
      if (path === "config.card.fields" && !/^[a-zA-Z][a-zA-Z0-9_]*$/.test(key)) {
        issues.push({ property: `${path}.${key}`, message: "Use the field's logical name." }); continue;
      }
      const valid = validate(child, childSchema as Schema, `${path}.${key}`, issues);
      if (valid !== undefined) result[key] = valid;
    }
    return result;
  }
  if (schema.type === "array") {
    if (!Array.isArray(value)) return reject("Expected a JSON array.");
    const count = issues.length;
    const result = value.map((child, i) => validate(child, schema.items ?? {}, `${path}[${i}]`, issues));
    return issues.length === count ? result : undefined;
  }
  if (schema.type === "integer" || schema.type === "number") {
    if (typeof value !== "number" || !Number.isFinite(value) || (schema.type === "integer" && !Number.isSafeInteger(value))) return reject(`Expected a ${schema.type}.`);
    if ((schema.minimum !== undefined && value < schema.minimum) || (schema.maximum !== undefined && value > schema.maximum)) return reject(`Expected ${schema.minimum} to ${schema.maximum}.`);
  } else if (schema.type && typeof value !== schema.type) return reject(`Expected ${schema.type}.`);
  if (schema.enum && !schema.enum.includes(value)) return reject(`Expected one of: ${schema.enum.join(", ")}.`);
  if (schema.pattern && (typeof value !== "string" || !new RegExp(schema.pattern).test(value))) return reject("Value does not match the required format.");
  return value;
}

export const propertyPaths: { property: string; path: string; schema: Schema }[] = [];
function collect(schema: Schema, path = "") {
  if (schema["x-property"]) propertyPaths.push({ property: schema["x-property"]!, path, schema });
  for (const [key, child] of Object.entries(schema.properties ?? {})) collect(child, path ? `${path}.${key}` : key);
}
collect(configurationSchema);
export const fieldFlags: Record<string, string> = { hidden: "hiddenFieldsOnCard", hideLabel: "hideLabelForFieldsOnCard", html: "htmlFieldsOnCard",
  ellipsis: "ellipsisFieldsOnCard", persona: "lookupFieldsAsPersonaOnCard", personaIconOnly: "lookupFieldsPersonaIconOnlyOnCard" };

function getPath(document: Record<string, unknown>, path: string): unknown {
  let value: unknown = document;
  for (const key of path.split(".")) {
    if (!isObject(value) || !own(value, key)) return undefined;
    value = value[key];
  }
  return value;
}
function setPath(document: Record<string, unknown>, path: string, value: unknown) {
  const keys = path.split(".");
  let target = document;
  for (const key of keys.slice(0, -1)) { if (!isObject(target[key])) target[key] = {}; target = target[key] as Record<string, unknown>; }
  target[keys[keys.length - 1]] = value;
}
function raw(parameters: Parameters, name: string): unknown { const p = parameters[name]; return isObject(p) ? p.raw : undefined; }
function jsonArray(value: unknown): unknown[] {
  if (typeof value !== "string" || !value.trim()) return [];
  if (!value.trim().startsWith("[")) return value.split(",").map(v => v.trim()).filter(Boolean);
  try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed : []; } catch { return []; }
}
function override(parameters: Parameters, name: string, value: unknown) {
  const parameter = Object.create(isObject(parameters[name]) ? parameters[name] : Object.prototype);
  Object.defineProperty(parameter, "raw", { value, enumerable: true });
  parameters[name] = parameter;
}

export function resolveConfiguration<T extends object>(original: T): { parameters: T; issues: ConfigurationIssue[] } {
  const source = original as Parameters;
  const value = raw(source, "config");
  if (value == null || (typeof value === "string" && !value.trim())) return { parameters: original, issues: [] };
  const issues: ConfigurationIssue[] = [];
  let document: unknown;
  try { document = JSON.parse(String(value)); }
  catch { return { parameters: original, issues: [{ property: "config", message: "Invalid JSON. The individual settings remain in use." }] }; }
  if (!isObject(document) || (own(document, "schemaVersion") && document.schemaVersion !== 1)) {
    return { parameters: original, issues: [{ property: "config", message: "Expected a JSON object with schemaVersion 1. The individual settings remain in use." }] };
  }
  const valid = validate(document, configurationSchema, "config", issues) as Record<string, unknown>;
  const parameters: Parameters = { ...source };
  for (const { property, path, schema } of propertyPaths) {
    const v = getPath(valid, path);
    if (v !== undefined) override(parameters, property, schema.type === "array" || schema.type === "object" ? JSON.stringify(v)
      : ["minColumnWidth", "maxColumnWidth", "initialCardsVisible"].includes(property) ? String(v) : v);
  }
  const quickFilters = getPath(valid, "filters.quickFilters");
  if (Array.isArray(quickFilters)) {
    override(parameters, "quickFilterFields", JSON.stringify(quickFilters.map(v => typeof v === "string" ? v : v.field)));
    override(parameters, "quickFilterFieldsInPopup", JSON.stringify(quickFilters.filter(v => isObject(v) && v.inPopup === true).map(v => v.field)));
  }
  const settings = getPath(valid, "card.fields");
  if (isObject(settings)) for (const [name, v] of Object.entries(settings)) {
    if (!isObject(v)) continue;
    for (const [key, property] of Object.entries(fieldFlags)) {
      if (!own(v, key)) continue;
      const fields = new Set(jsonArray(raw(parameters, property)).map(String));
      if (v[key] === true || v[key] === "iconOnly") fields.add(name); else fields.delete(name);
      override(parameters, property, JSON.stringify([...fields]));
      if (key === "persona") {
        const icons = new Set(jsonArray(raw(parameters, "lookupFieldsPersonaIconOnlyOnCard")).map(String));
        if (v[key] === "iconOnly") icons.add(name); else icons.delete(name);
        override(parameters, "lookupFieldsPersonaIconOnlyOnCard", JSON.stringify([...icons]));
      }
    }
    for (const [key, property] of [["displayName", "fieldDisplayNamesOnCard"], ["width", "fieldWidthsOnCard"], ["highlight", "booleanFieldHighlights"]]) {
      if (!own(v, key)) continue;
      const entries = jsonArray(raw(parameters, property)).filter(e => isObject(e) && e.logicalName !== name);
      if (v[key] !== null) entries.push(key === "highlight" ? { logicalName: name, ...v[key] as object } : { logicalName: name, [key]: v[key] });
      override(parameters, property, JSON.stringify(entries));
    }
  }
  const min = raw(parameters, "minColumnWidth"), max = raw(parameters, "maxColumnWidth");
  if (Number(min) > Number(max) && Number(min) >= 200 && Number(max) >= 200
    && (getPath(valid, "board.minColumnWidth") !== undefined || getPath(valid, "board.maxColumnWidth") !== undefined)) {
    issues.push({ property: "config.board", message: "minColumnWidth must not exceed maxColumnWidth. Both individual width settings remain in use." });
    for (const key of ["minColumnWidth", "maxColumnWidth"]) {
      if (own(source, key)) parameters[key] = source[key]; else delete parameters[key];
    }
  }
  return { parameters: parameters as T, issues };
}

/** Export configuration only: no record values, view filters/search, credentials or global window state. */
export function exportConfiguration(parameters: object): { json: string; issues: ConfigurationIssue[] } {
  const source = parameters as Parameters;
  const document: Record<string, unknown> = { "$schema": configurationSchema.$id, schemaVersion: 1 };
  const issues: ConfigurationIssue[] = [];
  for (const { property, path, schema } of propertyPaths) {
    let value = raw(source, property);
    if (value == null || value === "") continue;
    if (schema.type === "integer" || schema.type === "number") value = typeof value === "string" ? Number(value) : value;
    if (schema.type === "array" || schema.type === "object") {
      try {
        value = typeof value === "string" && schema.type === "array" && !value.trim().startsWith("[") && schema.items?.type === "string"
          ? value.split(",").map(v => v.trim()).filter(Boolean) : JSON.parse(String(value));
      } catch { issues.push({ property, message: "Cannot export this setting: invalid JSON. Correct it before migrating." }); continue; }
    }
    const safe = validate(value, schema, property, issues);
    if (safe !== undefined) setPath(document, path, safe);
  }
  const exportList = (name: string): unknown[] => {
    const v = raw(source, name);
    if (typeof v === "string" && v.trim().startsWith("[")) {
      try { const parsed = JSON.parse(v); if (Array.isArray(parsed)) return parsed; }
      catch { /* Report instead of silently exporting an empty filter list. */ }
      issues.push({ property: name, message: "Cannot export this setting: invalid JSON array." });
      return [];
    }
    return jsonArray(v);
  };
  const quick = exportList("quickFilterFields");
  const popup = new Set(exportList("quickFilterFieldsInPopup").map(String));
  if (popup.size && [...popup].some(v => !quick.includes(v))) issues.push({ property: "quickFilterFieldsInPopup", message: "Popup fields must also be quick filter fields before migrating." });
  if (raw(source, "quickFilterFields") != null && raw(source, "quickFilterFields") !== "") {
    const safe = validate(quick, names, "quickFilterFields", issues);
    if (safe !== undefined) setPath(document, "filters.quickFilters", quick.map(v => popup.has(String(v)) ? { field: v, inPopup: true } : v));
  }
  // Field settings stay together. Empty collection forms explicitly clear a whole list.
  const card = getPath(document, "card");
  if (isObject(card)) {
    const fields: Record<string, Record<string, unknown>> = {};
    const target = (name: string) => fields[name] ?? (fields[name] = {});
    for (const [key, property] of Object.entries(fieldFlags)) {
      const descriptor = propertyPaths.find(d => d.property === property)!;
      const collectionKey = descriptor.path.split(".").pop()!;
      const values = card[collectionKey];
      if (Array.isArray(values) && values.length) {
        for (const name of values) target(String(name))[key] = true;
        delete card[collectionKey];
      }
    }
    for (const [collectionKey, key] of [["displayNames", "displayName"], ["fieldWidths", "width"]]) {
      const values = card[collectionKey];
      if (Array.isArray(values) && values.length) {
        for (const v of values) target(v.logicalName)[key] = v[key];
        delete card[collectionKey];
      }
    }
    if (Object.keys(fields).length) card.fields = fields;
  }
  return { json: JSON.stringify(document, null, 2), issues };
}
