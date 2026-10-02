import { CardItem, ViewItem } from "../interfaces";
import { getColumnValue } from "./utils";

/** Display lookups by name, including a lookup in the first (title) column. */
export function cardDisplayText(value: unknown): string {
  if (value == null) return "";
  if (Array.isArray(value)) return value.map(cardDisplayText).filter(Boolean).join(", ");
  if (typeof value === "object") {
    if ("value" in value) return cardDisplayText((value as { value: unknown }).value);
    if ("name" in value) return String((value as { name?: string }).name ?? "");
    return "";
  }
  return String(value);
}

export function matchesCardSearch(card: CardItem, keyword: string): boolean {
  const query = keyword.trim().toLocaleLowerCase();
  if (!query) return true;
  return Object.entries(card)
    .filter(([key]) => key !== "id" && key !== "column" && !key.endsWith("Raw"))
    .map(([, value]) => cardDisplayText(value))
    .join(" ").toLocaleLowerCase().includes(query);
}

/** Transform a dataset once per host data revision, rather than once per filter. */
export function buildCards(dataset: ComponentFramework.PropertyTypes.DataSet, view: ViewItem): CardItem[] {
  const stageById = new Map<string, string>();
  for (const record of view.records ?? []) {
    if (!stageById.has(record.id)) stageById.set(record.id, record.stageName);
  }
  return Object.entries(dataset.records).map(([id, record]) => {
    const card: Record<string, unknown> = { id, column: "unallocated" };
    dataset.columns.forEach((column, index) => {
      const raw = record.getValue(column.name);
      if (column.name === view.key && view.type !== "BPF") {
        // Choice labels may be translated; grouping must use the stored value.
        card.column = view.columns?.find(col => String(col.id) === String(raw))?.id ?? "unallocated";
      }
      if (!column.displayName?.trim()) return;
      const value = getColumnValue(record, column);
      card[column.name] = value;
      if (index === 0) card.title = value;
      card[`${column.name}Raw`] = raw;
    });
    if (view.type === "BPF") card.column = stageById.get(id) ?? "unallocated";
    return card as unknown as CardItem;
  });
}
