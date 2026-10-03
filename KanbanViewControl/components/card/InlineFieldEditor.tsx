import * as React from "react";
import { useContext, useEffect, useRef, useState } from "react";
import { BoardContext } from "../../context/board-context";
import { createInlineApi, InlineDefinition, InlineEditError, inlineInputValue, readInlineRecord, saveInlineRecord } from "../../lib/inline-edit";
import { getStrings } from "../../lib/strings";

interface Props { recordId: string; field: string; label: string; children: React.ReactNode }

const InlineFieldEditor = ({ recordId, field, label, children }: Props) => {
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
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  useEffect(() => () => { mountedRef.current = false; finishInlineEdit(key); }, [finishInlineEdit, key]);
  useEffect(() => { if (editing && !busy) inputRef.current?.focus(); }, [editing, busy]);

  const errorText = (reason: unknown): string => {
    if (reason instanceof InlineEditError) return strings.inlineErrors[reason.code];
    return typeof reason === "object" && reason != null && "message" in reason
      ? String((reason as { message: unknown }).message) : strings.inlineSaveErrorLabel;
  };

  const start = async () => {
    if (!beginInlineEdit(key)) return;
    definitionRef.current = undefined;
    setEditing(true); setBusy(true); setError("");
    try {
      const definition = await getInlineDefinition(field);
      const row = await readInlineRecord(context.webAPI, recordId, field);
      if (!mountedRef.current) return;
      definitionRef.current = definition;
      originalRef.current = row[field];
      setValue(inlineInputValue(definition, row[field]));
    } catch (reason) { if (mountedRef.current) setError(errorText(reason)); }
    finally { if (mountedRef.current) setBusy(false); }
  };

  const cancel = () => {
    if (savingRef.current) return;
    setEditing(false); setError(""); definitionRef.current = undefined;
    finishInlineEdit(key);
  };

  const save = async () => {
    if (savingRef.current || !definitionRef.current) return;
    savingRef.current = true; setBusy(true); setError("");
    try {
      await saveInlineRecord(createInlineApi(context.webAPI), recordId, definitionRef.current, originalRef.current, value);
      // No local optimistic patch: cards, filters and currency totals are rebuilt from accepted server data.
      finishInlineEdit(key);
      if (mountedRef.current) setEditing(false);
      context.parameters.dataset.refresh();
    } catch (reason) { if (mountedRef.current) setError(errorText(reason)); }
    finally { savingRef.current = false; if (mountedRef.current) setBusy(false); }
  };

  const kind = definitionRef.current?.kind;
  return (
    <div className="card-inline-control" onClick={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()}
      onKeyDown={e => { e.stopPropagation(); if (editing && e.key === "Escape" && !busy) cancel(); }}>
      {editing ? <div className="inline-editor" aria-busy={busy}>
        {definitionRef.current && (kind === "multiline"
          ? <textarea ref={element => { inputRef.current = element; }} aria-label={label} value={value} disabled={busy}
              maxLength={definitionRef.current.maxLength} onChange={e => setValue(e.target.value)} />
          : <input ref={element => { inputRef.current = element; }} aria-label={label} type={kind === "date" ? "date" : "text"}
              inputMode={kind === "number" || kind === "integer" ? "decimal" : undefined}
              value={value} disabled={busy} maxLength={definitionRef.current.maxLength}
              onChange={e => setValue(e.target.value)} onKeyDown={e => {
                if (e.key === "Enter" && !busy) { e.preventDefault(); void save(); }
              }} />)}
        {busy && <span className="inline-editor-status" role="status">{strings.toastSaving}</span>}
        {error && <span className="inline-editor-error" role="alert">{error}</span>}
        <div className="inline-editor-actions">
          <button type="button" disabled={busy || !definitionRef.current} onClick={() => { void save(); }}>{strings.saveLabel}</button>
          <button type="button" disabled={busy} onClick={cancel}>{strings.cancelLabel}</button>
        </div>
      </div> : <div className="inline-display">
        {children}
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
