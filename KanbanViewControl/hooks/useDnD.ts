import { CardInfo, ColumnItem, CardItem } from "../interfaces";
import { useDataverse } from "./useDataverse";
import { DropResult } from "@hello-pangea/dnd";
import { BoardContext } from "../context/board-context";
import { useContext } from "react";
import toast from "react-hot-toast";
import { moveCard } from "../lib/card-drag";
import { getStrings } from "../lib/strings";

export type ColumnId = ColumnItem[][number]["id"];

export interface CardMoveValidationArgs {
  recordId: string;
  entityName: string;
  logicalName: string;
  fieldName: string;
  newValue: unknown;
  sourceColumnId: ColumnId | null;
  sourceColumnTitle: string | null;
  destinationColumnId: ColumnId | null;
  destinationColumnTitle: string | null;
  card: CardItem | undefined;
}

export const useDnD = (columns: ColumnItem[]) => {
  const {
    context,
    locale,
    activeView,
    setColumns,
    openFormWithLoading,
    cardMoveValidationFunctionName,
    movePendingRef,
    setIsMovePending,
  } = useContext(BoardContext);
  const strings = getStrings(locale);
  const { updateRecord } = useDataverse(context);

  const resolveValidationFunction = (): { fn: (args: CardMoveValidationArgs) => unknown; owner: unknown } | undefined => {
    if (!cardMoveValidationFunctionName) return undefined;
    const path = cardMoveValidationFunctionName.split(".").map((p) => p.trim()).filter(Boolean);
    if (path.length === 0) return undefined;
    let current: any = (window as any);
    for (const part of path) {
      if (current == null) return undefined;
      current = current[part];
    }
    if (typeof current !== "function") return undefined;
    const fn = current as (args: CardMoveValidationArgs) => unknown;
    if (path.length === 1) {
      return { fn, owner: undefined };
    }
    let owner: any = (window as any);
    for (let i = 0; i < path.length - 1; i++) {
      if (owner == null) return { fn, owner: undefined };
      owner = owner[path[i]];
    }
    return { fn, owner };
  };

  const runCardMoveValidator = async (
    args: CardMoveValidationArgs
  ): Promise<{ allow: boolean; message?: string }> => {
    const resolved = resolveValidationFunction();
    if (!resolved) {
      if (cardMoveValidationFunctionName) {
        return {
          allow: false,
          message: strings.toastValidationFunctionNotFound,
        };
      }
      return { allow: true };
    }

    const { fn, owner } = resolved;
    try {
      const result = owner != null ? fn.call(owner, args) : fn(args);
      const awaited = result && typeof (result as Promise<unknown>).then === "function"
        ? await (result as Promise<unknown>)
        : result;

      if (awaited == null) {
        return { allow: true };
      }

      if (typeof awaited === "boolean") {
        return { allow: awaited };
      }

      if (typeof awaited === "object" && "allow" in (awaited as any)) {
        const allow = Boolean((awaited as any).allow);
        const message =
          typeof (awaited as any).message === "string" ? (awaited as any).message : undefined;
        return { allow, message };
      }

      return { allow: Boolean(awaited) };
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      return {
        allow: false,
        message,
      };
    }
  };

  const onDragEnd = async (result: DropResult, record: any): Promise<{ shouldRefresh: boolean }> => {
    const unchanged = { shouldRefresh: false };
    if (!result.destination || movePendingRef.current) return unchanged;
    const itemId = result.draggableId;
    const sourceColumn = columns.find(c => c.id == result.source.droppableId);
    const destinationColumn = columns.find(c => c.id == result.destination?.droppableId);
    const sourceCard = sourceColumn?.cards?.find(i => i.id === itemId);
    if (!sourceColumn || !destinationColumn || !sourceCard) return unchanged;
    if (sourceColumn.id === destinationColumn.id) {
      const reordered = moveCard(columns, sourceCard, result);
      if (reordered) setColumns(reordered);
      return unchanged;
    }

    movePendingRef.current = true;
    setIsMovePending(true);
    let movedCards: ColumnItem[] | undefined;
    const rollback = () => {
      // A filter or host refresh may have replaced this snapshot while saving.
      setColumns(current => current === movedCards ? columns : current);
    };
    try {
      if (activeView?.type === "BPF") {
        // Native form owns BPF validation and transitions; no direct stage update.
        await openFormWithLoading(record.entityName, record.id);
        return { shouldRefresh: true };
      }

      const updateFieldName = Object.keys(record.update ?? {})[0];
      if (!updateFieldName) return unchanged;
      const newValue = updateFieldName ? record.update[updateFieldName] : undefined;
      const updatedCard = { ...sourceCard, column: destinationColumn.id };
      const field = sourceCard[updateFieldName];
      if (field && typeof field === "object" && "value" in field) {
        updatedCard[updateFieldName] = { ...field as CardInfo, value: destinationColumn.title ?? "" };
      }
      updatedCard[`${updateFieldName}Raw`] = newValue;
      movedCards = moveCard(columns, updatedCard, result);
      if (!movedCards) return unchanged;
      // Complete the visual drop before waiting for a validator or Dataverse.
      setColumns(movedCards);
      const validation = await runCardMoveValidator({
        recordId: record.id,
        entityName: record.entityName,
        logicalName: record.logicalName,
        fieldName: updateFieldName,
        newValue,
        sourceColumnId: (sourceColumn?.id ?? null) as ColumnId | null,
        sourceColumnTitle: sourceColumn?.title ?? null,
        destinationColumnId: (destinationColumn?.id ?? null) as ColumnId | null,
        destinationColumnTitle: destinationColumn?.title ?? null,
        card: sourceCard,
      });

      if (!validation.allow) {
        rollback();
        if (validation.message) {
          toast.error(validation.message);
        }
        return unchanged;
      }
      await toast.promise(updateRecord(record), {
        loading: strings.toastSaving,
        success: strings.toastSuccessMoved(record.columnName ?? strings.toastUnallocated),
        error: (e) => e.message,
      });
      return { shouldRefresh: true };
    } catch (e) {
      rollback();
      if (activeView?.type === "BPF") toast.error(e instanceof Error ? e.message : String(e));
      return unchanged;
    } finally {
      movePendingRef.current = false;
      setIsMovePending(false);
    }
  };

  return { 
    onDragEnd,
  }
}
