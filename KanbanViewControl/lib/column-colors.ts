export interface ColumnColor { id: string; color: string }

/** Restrict colors to hex; configuration never becomes arbitrary CSS. */
export function parseColumnColors(raw: string | null | undefined): ColumnColor[] {
  if (!raw?.trim()) return [];
  const entries: unknown = JSON.parse(raw);
  if (!Array.isArray(entries)) throw new Error("Use a JSON array of { id, color }.");
  return entries.map(entry => {
    const item = entry as Partial<ColumnColor> | null;
    if (!item || typeof item.id !== "string" || !item.id.trim() || typeof item.color !== "string" || !/^#[0-9a-f]{6}$/i.test(item.color)) {
      throw new Error("Each column needs an id and a six-digit hex color, for example #0078D4.");
    }
    return { id: item.id.trim(), color: item.color };
  });
}

export function getColumnColorStyle(color: string | undefined): Record<string, string> {
  if (!color || !/^#[0-9a-f]{6}$/i.test(color)) return {};
  const rgb = [1, 3, 5].map(start => parseInt(color.slice(start, start + 2), 16));
  return { "--column-accent": color, "--column-tint": `rgba(${rgb.join(", ")}, 0.07)` };
}
