export const INLINE_FIELDS = ["estimatedvalue", "closeprobability", "estimatedclosedate"] as const;
export type InlineKind = "text" | "multiline" | "integer" | "number" | "date";
export type InlineValue = number | string | null;
export interface InlineDefinition {
  name: string;
  kind: InlineKind;
  required: boolean;
  maxLength?: number;
  min?: number;
  max?: number;
}

export class InlineEditError extends Error {
  constructor(public readonly code: "invalidNumber" | "invalidProbability" | "invalidDate" | "closed" | "calculated" | "conflict" | "unsupported" | "required" | "tooLong" | "range") {
    super(code);
    this.name = "InlineEditError";
  }
}

export function parseInlineFields(raw: string | null | undefined): string[] {
  if (raw == null) return [...INLINE_FIELDS];
  if (!raw.trim()) return [];
  const fields: unknown = raw.trim().startsWith("[") ? JSON.parse(raw) : raw.split(",");
  if (!Array.isArray(fields) || fields.some(field => typeof field !== "string" || !/^[a-z][a-z0-9_]*$/.test(field.trim()))) {
    throw new Error("Use logical field names in a JSON array or comma-separated list.");
  }
  return Array.from(new Set(fields.map(field => field.trim())));
}

export function inlineKind(dataType: string | undefined): InlineKind | undefined {
  if (dataType?.startsWith("SingleLine.") && dataType !== "SingleLine.URL") return "text";
  if (dataType === "Multiple") return "multiline";
  if (dataType?.startsWith("Whole.")) return "integer";
  if (["Currency", "Decimal", "FP"].includes(dataType ?? "")) return "number";
  if (dataType === "DateAndTime.DateOnly") return "date";
  return undefined;
}

/** DateOnly values retain the calendar date and never pass through local timezone conversion. */
export function inlineInputValue(definition: InlineDefinition, value: unknown): string {
  if (value == null) return "";
  if (definition.kind !== "date") return String(value);
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

export function parseInlineValue(definition: InlineDefinition, text: string): InlineValue {
  const isText = definition.kind === "text" || definition.kind === "multiline";
  const value = isText ? text : text.trim();
  if (!value.trim()) {
    if (definition.required) throw new InlineEditError("required");
    return null;
  }
  if (isText) {
    if (definition.maxLength != null && value.length > definition.maxLength) throw new InlineEditError("tooLong");
    return value;
  }
  if (definition.kind === "date") {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new InlineEditError("invalidDate");
    const date = new Date(`${value}T00:00:00Z`);
    if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) throw new InlineEditError("invalidDate");
    return value;
  }
  // A single decimal comma is accepted. Grouping separators and exponent notation are deliberately rejected.
  if (!/^-?\d+(?:[.,]\d+)?$/.test(value)) throw new InlineEditError("invalidNumber");
  const number = Number(value.replace(",", "."));
  if (!Number.isFinite(number)) throw new InlineEditError("invalidNumber");
  if (definition.name === "closeprobability" && (!Number.isInteger(number) || number < 0 || number > 100)) throw new InlineEditError("invalidProbability");
  if (definition.kind === "integer" && !Number.isInteger(number)) throw new InlineEditError("invalidNumber");
  if ((definition.min != null && number < definition.min) || (definition.max != null && number > definition.max)) throw new InlineEditError("range");
  return number;
}

type Row = Record<string, unknown>;
export type InlineWebApi = {
  retrieveRecord: (entity: string, id: string, options: string) => Promise<Row>;
  updateRecord: (entity: string, id: string, update: Record<string, InlineValue>, etag?: string) => Promise<unknown>;
};

function assertEditable(row: Row, field: string): void {
  if (row.statecode !== 0) throw new InlineEditError("closed");
  if (field === "estimatedvalue" && row.isrevenuesystemcalculated !== false) throw new InlineEditError("calculated");
}

/** Read server values on edit and again before saving; never write a card's stale formatted value. */
export async function readInlineRecord(api: InlineWebApi, id: string, field: string): Promise<Row> {
  if (!/^[a-z][a-z0-9_]*$/.test(field)) throw new InlineEditError("unsupported");
  const row = await api.retrieveRecord("opportunity", id, `?$select=${field},statecode,isrevenuesystemcalculated`);
  assertEditable(row, field);
  if (!Object.prototype.hasOwnProperty.call(row, field)) throw new InlineEditError("unsupported");
  return row;
}

export async function saveInlineRecord(api: InlineWebApi, id: string, definition: InlineDefinition, original: unknown, text: string): Promise<InlineValue> {
  const value = parseInlineValue(definition, text);
  const current = await readInlineRecord(api, id, definition.name);
  if (inlineInputValue(definition, current[definition.name]) !== inlineInputValue(definition, original)) throw new InlineEditError("conflict");
  await api.updateRecord("opportunity", id, { [definition.name]: value }, current["@odata.etag"] as string | undefined);
  return value;
}

/** Validate the actual Dataverse attribute, including calculated fields and DateOnly behavior. */
export function inlineDefinition(name: string, dataType: string, metadata: Record<string, any>): InlineDefinition {
  const kind = inlineKind(dataType);
  if (!kind || metadata.IsValidForUpdate !== true || metadata.SourceType !== 0 || metadata.LogicalName !== name || metadata.IsSecured === true) throw new InlineEditError("unsupported");
  if (kind === "date" && metadata.DateTimeBehavior?.Value !== "DateOnly") throw new InlineEditError("unsupported");
  if (name === "statecode" || name === "statuscode" || name.endsWith("_base")) throw new InlineEditError("unsupported");
  return { name, kind, required: ["ApplicationRequired", "SystemRequired"].includes(metadata.RequiredLevel?.Value),
    maxLength: metadata.MaxLength, min: metadata.MinValue, max: metadata.MaxValue };
}

/** Conditional PATCH prevents overwriting an update made between our last read and save. */
export function createInlineApi(webApi: Pick<InlineWebApi, "retrieveRecord">, request: typeof fetch = fetch): InlineWebApi {
  return {
    retrieveRecord: (entity, id, options) => webApi.retrieveRecord(entity, id, options),
    updateRecord: async (entity, id, update, etag) => {
      const guid = id.replace(/[{}]/g, "");
      if (entity !== "opportunity" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(guid) || !etag) throw new InlineEditError("unsupported");
      const response = await request(`/api/data/v9.2/opportunities(${guid})`, { method: "PATCH", credentials: "same-origin",
        headers: { Accept: "application/json", "Content-Type": "application/json", "OData-Version": "4.0", "OData-MaxVersion": "4.0", "If-Match": etag },
        body: JSON.stringify(update) });
      if (response.status === 412) throw new InlineEditError("conflict");
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error?.message || response.statusText);
      }
    },
  };
}

export function attributeMetadataType(dataType: string): string | undefined {
  switch (inlineKind(dataType)) {
    case "text": return "String";
    case "multiline": return "Memo";
    case "integer": return "Integer";
    case "date": return "DateTime";
    case "number": return dataType === "Currency" ? "Money" : dataType === "FP" ? "Double" : "Decimal";
    default: return undefined;
  }
}
