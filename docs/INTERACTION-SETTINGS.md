# Kickstart365 Kanban 1.9 interaction settings

For the complete reference covering **all 46 configuration options**,
defaults, solution downloads and Opportunity examples, see
[English](CONFIGURATION.en.md) or [Nederlands](CONFIGURATION.md).
This page focuses on the 1.9 interaction details and runtime pilot checks.

## Record side pane

`recordOpenMode` defaults to `sidePane`; choose `dialog` to retain the centered
form. `sidePaneWidth` is optional (default 600, valid range 300–1200 pixels).
Click a card title or lookup to open the native main form. One closable pane is
reused; the native form handles navigation and unsaved changes. New records
continue to open in a dialog.

Side panes require the web model-driven host to expose `Xrm.App.sidePanes`.
This is an app Client API, not a documented PCF context API. The control checks
availability and falls back to the existing dialog route with a notification;
there is no parent-frame or DOM probing. Validate it in the target Sales app.
Native mobile players do not support app side panes.

While a record pane is open, a lightweight `modifiedon` read every 10 seconds
refreshes the dataset when a saved change is observed. Reads pause while the
browser tab is hidden, during inline editing/dragging, or while the dataset is
loading. Closing the pane also refreshes the board (on the next check). The
timer is removed when the control unmounts. Use **Refresh** after a BPF-only
change or a delayed cloudflow update; these may not change the watched record
at the time of the check. No form `OnSave` handler is injected.

## Column colors

Set `columnColors` to a JSON array. Use an exact BPF stage name, processstage
GUID, or choice value. A stage GUID takes precedence over its name.

```json
[
  { "id": "Qualify", "color": "#0078D4" },
  { "id": "Develop", "color": "#009C91" },
  { "id": "Propose", "color": "#8764B8" },
  { "id": "Close", "color": "#107C41" }
]
```

Colors use a header accent and a light background; titles and counts remain
visible and cards keep their original background. Only six-digit hex colors
are accepted. Empty configuration leaves columns untinted.

## Editable card fields

`allowInlineEdit` defaults to `enabled`; select `disabled` to turn it off. Editing is
currently available for **Opportunity** records. `inlineEditFields` is an
explicit list, independent of the fields displayed on a card. The default is
`estimatedvalue,closeprobability,estimatedclosedate`.

For example, include your own fields:

```json
["estimatedvalue", "closeprobability", "estimatedclosedate", "description", "k365_nextstep"]
```

Replace `k365_nextstep` with an existing field. Add every chosen field to the
view and to `compactCardFields` if it should be visible in compact mode. Simply
displaying a field does not enable editing. The title field can also be listed.
Hidden fields remain hidden.

Supported: plain text, multiline text, whole/decimal/floating-point numbers,
money and dates with **DateOnly behavior**. Lookup, choice, Boolean, URL, UserLocal
date/time, calculated, formula, rollup, secured and base-currency fields use the
record form in this version. Attribute metadata is checked before editing;
required fields, maximum text lengths and numeric ranges are validated.

Use the pencil, then **Save** or **Cancel**; Enter saves a single-line input,
Escape cancels. Dragging uses the separate handle and is disabled during an
edit. Board filters and density controls are also disabled while editing so
a draft cannot disappear through a board filter change.

Saving rereads the current server value and uses a conditional PATCH with the
current ETag. A conflict or server rejection keeps the draft and shows the
error. Success refreshes cards, filters and currency-separated totals from
server data; Cancel makes no write. Only open Opportunities are editable.
Revenue calculated from products is handled through the form.

Dataverse permissions, plugins and server validation apply. Main-form
JavaScript and form-only business rules do not run for an inline Web API
update. Keep inline editing disabled for fields whose validation depends on
those form handlers. Values maintained by a cloudflow, such as
`sparked_estimatedweightedrevenue`, should remain outside `inlineEditFields`.
Weighted revenue is never calculated locally; use **Refresh** after its flow
has run.

## Pilot checks after importing 1.9.1.0

1. Open an Opportunity from its title; verify the form opens next to the board.
2. Switch records with an unsaved form value; verify the native save prompt.
3. Save a revenue/date/probability edit; verify the card, sorting/filtering and
   column total refresh. Cancel a draft and verify no value changes.
4. Test with a read-only user, a closed Opportunity and product-calculated
   revenue. Verify these cannot be updated from the card.
5. Add a writable custom text/number/DateOnly field to the view, display list
   and editable list; verify it edits. Verify computed fields stay read-only.
6. Change the same field elsewhere during an edit; verify a conflict is shown.
7. Configure stage colors and test drag-handle/keyboard navigation.

References:
- https://learn.microsoft.com/en-us/power-apps/developer/model-driven-apps/clientapi/create-app-side-panes
- https://learn.microsoft.com/en-us/power-apps/developer/data-platform/webapi/query-metadata-web-api
- https://learn.microsoft.com/en-us/power-apps/developer/data-platform/webapi/perform-conditional-operations-using-web-api
