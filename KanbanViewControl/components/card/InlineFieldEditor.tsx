import * as React from "react";
import { useContext, useEffect, useRef, useState } from "react";
import { BoardContext } from "../../context/board-context";
import { createInlineApi, InlineDefinition, InlineEditError, inlineInputValue, parseInlineValue, readInlineRecord, saveInlineRecord } from "../../lib/inline-edit";
import { getStrings } from "../../lib/strings";

interface Props { recordId: string; field: string; label: string; children: React.ReactNode; valueClickable?: boolean }

const InlineFieldEditor = ({ recordId, field, label, children, valueClickable = true }: Props) => {
  const { context, locale, inlineEditKey, beginInlineEdit, finishInlineEdit, getInlineDefinition } = useContext(BoardContext);
  const strings = getStrings(locale);
  const key = `${recordId}:${field}`;
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [value, setValue] = useState("");
  const originalRef = useRef<unknown>();
  const definitionRef = useRef<InlineDefinition>();
  const mountedRef = useRef(true);
  const savingRef = useRef(false);
  const editingRef = useRef(false);
  const sessionRef = useRef(0);
  const valueRef = useRef("");
  const composingRef = useRef(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; editingRef.current = false; sessionRef.current++; finishInlineEdit(key); };
  }, [finishInlineEdit, key]);
  useEffect(() => { if (editing && !busy) inputRef.current?.focus(); }, [editing, busy]);

  const errorText = (reason: unknown): string => {
    if (reason instanceof InlineEditError) return strings.inlineErrors[reason.code];
    return typeof reason === "object" && reason != null && "message" in reason
      ? String((reason as { message: unknown }).message) : strings.inlineSaveErrorLabel;
  };

  const start = async () => {
    if (!beginInlineEdit(key)) return;
    const session = ++sessionRef.current;
    editingRef.current = true;
    composingRef.current = false;
    valueRef.current = "";
    definitionRef.current = undefined;
    setValue(""); setEditing(true); setBusy(true); setError("");
    try {
      const definition = await getInlineDefinition(field);
      const row = await readInlineRecord(context.webAPI, recordId, field);
      if (!mountedRef.current || session !== sessionRef.current || !editingRef.current) return;
      definitionRef.current = definition;
      originalRef.current = row[field];
      valueRef.current = inlineInputValue(definition, row[field]);
      setValue(valueRef.current);
    } catch (reason) { if (mountedRef.current && session === sessionRef.current) setError(errorText(reason)); }
    finally { if (mountedRef.current && session === sessionRef.current) setBusy(false); }
  };

  const close = () => {
    editingRef.current = false; sessionRef.current++;
    setEditing(false); setBusy(false); setError(""); definitionRef.current = undefined;
    finishInlineEdit(key);
  };
  const cancel = () => { if (!savingRef.current) close(); };

  const save = async () => {
    if (!editingRef.current || savingRef.current || composingRef.current || !definitionRef.current) return;
    const definition = definitionRef.current;
    const draft = valueRef.current;
    if (draft === inlineInputValue(definition, originalRef.current)) { close(); return; }
    // Validate before disabling the input; a failed save always retains its draft.
    try {
      const parsed = parseInlineValue(definition, draft);
      const original = definition.kind === "date" && originalRef.current != null
        ? inlineInputValue(definition, originalRef.current) : originalRef.current ?? null;
      if (parsed === original) { close(); return; }
    } catch (reason) { setError(errorText(reason)); inputRef.current?.focus(); return; }
    savingRef.current = true; setBusy(true); setError("");
    try {
      await saveInlineRecord(createInlineApi(context.webAPI), recordId, definition, originalRef.current, draft);
      // No local optimistic patch: cards, filters and currency totals are rebuilt from accepted server data.
      if (mountedRef.current) close();
      context.parameters.dataset.refresh();
    } catch (reason) { if (mountedRef.current) setError(errorText(reason)); }
    finally { savingRef.current = false; if (mountedRef.current) setBusy(false); }
  };

  const change = (next: string) => { valueRef.current = next; setValue(next); };
  const keyDown = (event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !busy && !composingRef.current && !event.nativeEvent.isComposing &&
        (definitionRef.current?.kind !== "multiline" || event.ctrlKey || event.metaKey)) {
      event.preventDefault(); void save();
    }
  };

  const kind = definitionRef.current?.kind;
  return (
    <div className="card-inline-control" onClick={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()}
      onBlur={e => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) void save();
      }}
      onKeyDown={e => {
        e.stopPropagation();
        if (editing && e.key === "Escape" && !savingRef.current && !composingRef.current && !e.nativeEvent.isComposing) {
          e.preventDefault(); cancel();
        }
      }}>
      {editing ? <div className="inline-editor" aria-busy={busy}>
        {definitionRef.current && (kind === "multiline"
          ? <textarea ref={element => { inputRef.current = element; }} aria-label={label} value={value} disabled={busy}
              maxLength={definitionRef.current.maxLength} onChange={e => change(e.target.value)} onKeyDown={keyDown}
              aria-invalid={!!error} onCompositionStart={() => { composingRef.current = true; }}
              onCompositionEnd={() => { composingRef.current = false; }} />
          : <input ref={element => { inputRef.current = element; }} aria-label={label} type={kind === "date" ? "date" : "text"}
              inputMode={kind === "number" || kind === "integer" ? "decimal" : undefined}
              value={value} disabled={busy} maxLength={definitionRef.current.maxLength}
              onChange={e => change(e.target.value)} onKeyDown={keyDown} aria-invalid={!!error}
              onCompositionStart={() => { composingRef.current = true; }}
              onCompositionEnd={() => { composingRef.current = false; }} />)}
        {busy && <span className="inline-editor-status" role="status">{strings.toastSaving}</span>}
        {error && <span className="inline-editor-error" role="alert">{error}</span>}
        {!busy && definitionRef.current && <span className="inline-editor-hint">
          {kind === "multiline" ? strings.inlineMultilineSaveHint : strings.inlineAutoSaveHint}
        </span>}
        <div className="inline-editor-actions">
          {error && definitionRef.current && <button type="button" className="inline-retry-button" disabled={busy}
            onClick={() => { void save(); }}>{strings.inlineRetrySaveLabel}</button>}
          <button type="button" disabled={savingRef.current} onClick={cancel}>{strings.cancelLabel}</button>
        </div>
      </div> : <div className="inline-display">
        {valueClickable ? <button type="button" className="inline-edit-value" disabled={!!inlineEditKey}
          aria-label={`${strings.editLabel} ${label}`} onClick={() => { void start(); }}>{children}</button> : children}
        <button type="button" className="inline-edit-button" disabled={!!inlineEditKey}
          aria-label={`${strings.editLabel}: ${label}`} title={`${strings.editLabel}: ${label}`}
          onClick={() => { void start(); }}>
          <svg viewBox="0 0 20 20" width="14" height="14" aria-hidden="true"><path d="m13 3 4 4-9 9-5 1 1-5zM11 5l4 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>
        </button>
      </div>}
    </div>
  );
};

export default InlineFieldEditor;
