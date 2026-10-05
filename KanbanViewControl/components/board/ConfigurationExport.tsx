import * as React from "react";
import { useContext, useState } from "react";
import { Dialog, DialogFooter, DefaultButton, TextField } from "@fluentui/react";
import { BoardContext } from "../../context/board-context";
import { getStrings } from "../../lib/strings";

/** Export this board instance without requiring browser console commands. */
export const ConfigurationExport = () => {
  const { configurationExport, locale, inlineEditKey } = useContext(BoardContext);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const strings = getStrings(locale);
  if (!configurationExport) return null;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(configurationExport.json);
      setCopied(true); setCopyFailed(false);
    } catch { setCopyFailed(true); }
  };
  return <>
    <button type="button" className="board-refresh-button" disabled={!!inlineEditKey}
      onClick={() => { setOpen(true); setCopied(false); setCopyFailed(false); }}>{strings.configurationExportLabel}</button>
    <Dialog hidden={!open} onDismiss={() => setOpen(false)} minWidth={320} maxWidth={720}
      dialogContentProps={{ title: strings.configurationExportLabel, subText: strings.configurationExportHelp }}>
      {configurationExport.issues.length > 0 && <div role="alert">
        <p>{strings.configurationExportBlocked}</p>
        <ul>{configurationExport.issues.map((issue, i) => <li key={i}>{issue.property}: {issue.message}</li>)}</ul>
      </div>}
      <TextField label="Config (JSON)" multiline rows={16} readOnly value={configurationExport.json}
        onFocus={event => event.target.select()}
        onMouseUp={event => {
          if (event.target instanceof HTMLTextAreaElement) {
            event.preventDefault();
            event.target.select();
          }
        }} />
      <div role="status">{copied ? strings.configurationCopied : copyFailed ? strings.configurationCopyFallback : ""}</div>
      <DialogFooter>
        <DefaultButton text={strings.configurationCopyLabel} onClick={() => { void copy(); }} disabled={configurationExport.issues.length > 0} />
        <DefaultButton text={strings.configurationCloseLabel} onClick={() => setOpen(false)} />
      </DialogFooter>
    </Dialog>
  </>;
};
