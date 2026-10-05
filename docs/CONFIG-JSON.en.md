# Config (JSON): one configuration for your Kanban

**Language: English | [Nederlands](CONFIG-JSON.md)**

From **control 1.10.0 / solution 1.10.0.0**, all 46 existing settings can be
supplied through one additional property: **Config (JSON)** (`config`). Individual
settings remain supported. The JSON does not replace the Dataverse view:
include the required columns in the view itself.

## Getting started

1. Import the new solution using the same managed/unmanaged package type
   as your current installation.
2. Open **Kickstart365 Kanban** under **Components** in the view editor.
3. Paste one JSON object into **Config (JSON)** and save the component configuration.
4. Keep the typed individual settings populated: valid True/False choices,
   integers for **Side pane width** (`600`) and **Close date warning days** (`7`),
   and valid choices for the three enum settings. From 1.11.1.0, new component
   configurations receive these defaults automatically. Power Apps validates
   them before running the control, even if JSON supplies a different runtime
   value. See [repairing Save & Publish](VIEW-PUBLISH.en.md) for existing views.
5. Save and publish the view. Reload the app and check the configuration.

The property uses the PCF `Multiple` type, so the combined configuration is
not tied to the 4,000-character `SingleLine.TextArea` type. Limits imposed by
the particular Power Apps editor still apply.

## Opportunity example

The copyable [opportunity.config.json](../examples/opportunity.config.json) enables
compact cards, side panes, an explicit list of editable fields, date badges,
column colors and revenue totals. Adjust BPF stage names/IDs to your environment.
Use the logical names of fields actually included in your view. Include
`transactioncurrencyid` for money totals. `ownerid` and `customerid` are displayed
only in this example; lookup fields cannot be edited inline.

```json
{
  "schemaVersion": 1,
  "board": {
    "totals": { "field": "estimatedvalue" },
    "columnColors": [
      { "id": "Qualify", "color": "#0078D4" },
      { "id": "Develop", "color": "#009C91" }
    ]
  },
  "card": {
    "open": { "mode": "sidePane", "width": 600 },
    "editing": { "mode": "enabled", "fields": ["estimatedvalue", "estimatedclosedate"] },
    "compact": { "enabled": true, "fields": ["customerid", "estimatedvalue", "estimatedclosedate", "ownerid"] },
    "closeDate": { "show": true, "field": "estimatedclosedate", "warningDays": 7 },
    "fields": {
      "estimatedvalue": { "displayName": "Estimated revenue", "hideLabel": true },
      "ownerid": { "persona": true },
      "description": { "width": 100, "ellipsis": true }
    }
  },
  "filters": { "quickFilters": ["estimatedvalue", { "field": "ownerid", "inPopup": true }] },
  "notifications": { "position": "top-right" }
}
```

## Migrating an existing configuration

Open the board in the app and choose **Export configuration → Copy JSON**.
Paste it into **Config (JSON)** in the view editor. No console commands are
needed. The export contains this board's effective maker configuration,
including valid JSON overrides. It excludes records, the dataset/view definition,
search text, personal filter selections and a temporary card-density selection.

After saving/publishing, check that the board behaves identically. Individual
settings can stay as fallback values. If you clear them later, keep the two
numeric settings filled as described above. An export can also be used as a
starting point for another board.

The export groups normal field presentation under `card.fields`. Empty lists
remain collection values to explicitly clear a list. Highlights stay in an
ordered `card.highlights` array to preserve precedence. Invalid or unexportable
individual values are reported; the copy button is disabled and the JSON preview
is incomplete. Correct those settings before migrating. If browser policy blocks
clipboard access, select the JSON and press Ctrl+C (Cmd+C on Mac).

## Precedence and errors

- A supplied valid JSON value wins over the individual property. Missing values
  use the individual property, followed by the runtime default.
- `false`, `0`, `""` and `[]` are explicit values. `null` is invalid, except
  `card.fields.<field>.highlight: null`, which clears that field's highlights.
- `card.fields` merges by field and by setting. `ownerid.hidden: false` removes
  only `ownerid` from the hidden fields and retains other hidden fields.
  An empty `card.fields: {}` changes nothing.
- Collections such as `card.hiddenFields` or `filters.quickFilters` replace
  the whole list. `[]` clears that list. Field presentation precedence is:
  `card.fields` → collection in the same JSON → individual property → default.
- Numbers must be JSON numbers and booleans must be `true`/`false`, not strings.
  Column colors use six-digit hex colors. Widths and counts are range checked.
- An unreadable document or unsupported `schemaVersion` uses individual settings.
  An invalid section/value falls back independently; an invalid array falls
  back as a whole. Other valid sections keep working.
- The **Configuration errors** banner identifies the exact path, such as
  `config.card.open.width`. Unknown keys/typos are reported and ignored.
  Corrected errors disappear on the next configuration update.

## Field presentation

| Key under `card.fields.<logicalName>` | Value | Behavior |
| --- | --- | --- |
| `hidden`, `hideLabel`, `html`, `ellipsis` | Boolean | Add/remove this field in the corresponding setting. |
| `displayName` | String | Custom label; empty values fall back to the existing field label. |
| `width` | Number `1`–`100` | Width in percent. |
| `persona` | `true`, `false` or `"iconOnly"` | Lookup with name/avatar, regular lookup or icon only. Also sets that field's icon mode. |
| `personaIconOnly` | Boolean | Separate icon setting used for lossless export of existing configurations. |
| `highlight` | `{color,type}` or `null` | Replace/clear this field's highlights. `type` is optional and defaults to `left`. |

HTML, highlights, editing, currency and BPF stages retain their meaning from
the [complete guide](CONFIGURATION.en.md). Configuration does not grant additional
write permissions or add missing columns to the view.

## Schema and all settings

Add this to your JSON file for autocomplete and validation in an editor
supporting JSON Schema:

```json
{
  "$schema": "https://raw.githubusercontent.com/Kickstart365/pcf-kanban-control/main/docs/kanban-config.schema.json",
  "schemaVersion": 1
}
```

[kanban-config.schema.json](kanban-config.schema.json) is validated against
the runtime definitions. Omitting `schemaVersion` means version 1; exports
include it. The schema is not fetched from the internet at runtime. The mapping
below covers all 46 individual settings; field collections are optional
alternatives to `card.fields`.

| Property | JSON path |
| --- | --- |
| `defaultView` | `view.default` |
| `hideViewBy` | `view.hide` |
| `filteredBusinessProcessFlows` | `view.bpf.exclude` |
| `businessProcessFlowStepOrder` | `view.bpf.stageOrder` |
| `hideEmptyColumns` | `board.hideEmptyColumns` |
| `expandBoardToFullWidth` | `board.fullWidth` |
| `minColumnWidth` | `board.minColumnWidth` |
| `maxColumnWidth` | `board.maxColumnWidth` |
| `initialCardsVisible` | `board.initialCardsVisible` |
| `columnWidths` | `board.columnWidths` |
| `columnColors` | `board.columnColors` |
| `allowCreateNew` | `board.allowCreateNew` |
| `allowCardMove` | `board.allowCardMove` |
| `columnTotalField` | `board.totals.field` |
| `columnSecondaryTotalField` | `board.totals.secondaryField` |
| `cardMoveValidationFunction` | `board.cardMoveValidation.function` |
| `cardMoveValidationScript` | `board.cardMoveValidation.script` |
| `hideColumnFieldOnCard` | `card.hideColumnField` |
| `showOpenInNewTabButton` | `card.showOpenInNewTab` |
| `showEmailAndPhoneAsLinks` | `card.showEmailAndPhoneAsLinks` |
| `recordOpenMode` | `card.open.mode` |
| `sidePaneWidth` | `card.open.width` |
| `allowInlineEdit` | `card.editing.mode` |
| `inlineEditFields` | `card.editing.fields` |
| `compactCards` | `card.compact.enabled` |
| `compactCardFields` | `card.compact.fields` |
| `showCloseDateBadges` | `card.closeDate.show` |
| `closeDateField` | `card.closeDate.field` |
| `closeDateWarningDays` | `card.closeDate.warningDays` |
| `allowedHtmlTagsOnCard` | `card.html.allowedTags` |
| `allowedHtmlAttributesOnCard` | `card.html.allowedAttributes` |
| `hiddenFieldsOnCard` | `card.hiddenFields` |
| `htmlFieldsOnCard` | `card.htmlFields` |
| `hideLabelForFieldsOnCard` | `card.hideLabels` |
| `ellipsisFieldsOnCard` | `card.ellipsisFields` |
| `lookupFieldsAsPersonaOnCard` | `card.personaFields` |
| `lookupFieldsPersonaIconOnlyOnCard` | `card.personaIconOnlyFields` |
| `fieldDisplayNamesOnCard` | `card.displayNames` |
| `fieldWidthsOnCard` | `card.fieldWidths` |
| `booleanFieldHighlights` | `card.highlights` |
| `sortFields` | `filters.sort.fields` |
| `defaultSort` | `filters.sort.default` |
| `filterPresets` | `filters.presets` |
| `notificationPosition` | `notifications.position` |
| `quickFilterFields` | `filters.quickFilters` |
| `quickFilterFieldsInPopup` | `filters.quickFilters[].inPopup` |

The design is inspired by
[vonmaehlen's consolidated configuration](https://github.com/vonmaehlen/pcf-kanban-control/tree/feat/form-id-by-field#config-all-settings-in-one-json).
This implementation uses Kickstart365's settings and existing runtime.
