import { CardItem } from "../interfaces";
import { cardDisplayText } from "./card-data";
import { toComparableDate } from "./utils";

export type DueStatus = "overdue" | "today" | "soon" | "later";

/** Compare calendar days in the user's local timezone, including DST boundaries. */
export function getDueStatus(value: unknown, warningDays = 7, now = new Date()): DueStatus | null {
  const due = toComparableDate(value);
  if (!due) return null;
  const day = (date: Date) => Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const remaining = (day(due) - day(now)) / 86400000;
  return remaining < 0 ? "overdue" : remaining === 0 ? "today" : remaining <= warningDays ? "soon" : "later";
}

export interface ColumnTotal {
  amount: number;
  currency: string;
  currencyId: string;
}

/** Currency groups are explicit: transactioncurrencyid must be present for Money. */
export function getColumnTotals(cards: CardItem[], field: string, money: boolean): ColumnTotal[] {
  const totals = new Map<string, ColumnTotal>();
  for (const card of cards) {
    const raw = (card as unknown as Record<string, unknown>)[`${field}Raw`];
    if (typeof raw !== "number" || !Number.isFinite(raw)) continue;
    const currency = money ? cardDisplayText(card.transactioncurrencyid) : "";
    const reference = (card.transactioncurrencyid as unknown as { value?: { id?: string | { guid?: string } } })?.value;
    const id = typeof reference?.id === "string" ? reference.id : reference?.id?.guid;
    const currencyId = money ? id ?? currency : "";
    const current = totals.get(currencyId);
    totals.set(currencyId, { currency, currencyId, amount: (current?.amount ?? 0) + raw });
  }
  return Array.from(totals.values());
}
