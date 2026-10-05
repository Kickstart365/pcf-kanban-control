# Kickstart365 Kanban: complete configuration guide

**Language: English | [Nederlands](CONFIGURATION.md)**

For **control 1.10.0 / solution 1.10.0.0**. This guide covers all **47 input
settings** in `ControlManifest.Input.xml`, checked against the implementation.
`dataset` is the connected Dataverse view and is separate from those 47 options.
All input settings are optional.

## Download the solutions

These are the verified **1.10.0.0** packages from
[the successful PR integration build at `3417806`](https://github.com/Kickstart365/pcf-kanban-control/actions/runs/37289034913).
Each link downloads an importable solution ZIP directly.

| Package | Download | Use |
| --- | --- | --- |
| Managed | [Kickstart365Kanban_1_10_0_0_managed.zip](https://raw.githubusercontent.com/Kickstart365/pcf-kanban-control/main/downloads/1.10.0.0/Kickstart365Kanban_1_10_0_0_managed.zip) | Installing or updating an existing managed installation. |
| Unmanaged | [Kickstart365Kanban_1_10_0_0_unmanaged.zip](https://raw.githubusercontent.com/Kickstart365/pcf-kanban-control/main/downloads/1.10.0.0/Kickstart365Kanban_1_10_0_0_unmanaged.zip) | Development/customization or updating an existing unmanaged installation. |

Import the downloaded ZIP using **Solutions → Import** in Power Apps. For an
existing installation, keep its managed/unmanaged package type. These direct
downloads do not need to be extracted. [Checksums and build source](../downloads/1.10.0.0/README.md)
are included with the downloads.

## Contents

- [Download the solutions](#download-the-solutions)
- [Set up in Power Apps](#set-up-in-power-apps)
- [Field names, JSON and defaults](#field-names-json-and-defaults)
- [Config (JSON)](#config-json)
- [All configuration options](#all-configuration-options)
- [Opportunity: recommended setup](#opportunity-recommended-setup)
- [Grouping and BPF stages](#grouping-and-bpf-stages)
- [Column colors](#column-colors)
- [Column widths](#column-widths)
- [Column totals and currencies](#column-totals-and-currencies)
- [Compact cards and date badges](#compact-cards-and-date-badges)
- [Opening records](#opening-records)
- [Editing fields on cards](#editing-fields-on-cards)
- [Card formatting](#card-formatting)
- [HTML display](#html-display)
- [Filters and presets](#filters-and-presets)
- [Sorting](#sorting)
- [Move validation](#move-validation)
- [Notifications](#notifications)
- [Troubleshooting](#troubleshooting)

## Set up in Power Apps

1. Import the solution into the intended environment. For an existing
   installation, use the same package type: managed for managed, unmanaged for
   unmanaged. See [installation and upgrades](DEV-INSTALLATION.en.md).
2. Create/open an **Opportunity** view. Put `name` first: it supplies the card
   title. Add every field you want to display, filter, sort, edit or total.
   Entering a field name in the control settings does not add it to the view.
3. Add **Kickstart365 Kanban** to the view's dataset/control configuration.
   The configuration screen may differ between Power Apps designers. Use the
   English maker labels in the tables below.
4. Enter text/JSON options as static configuration values. Use the Yes/No
   selection for TwoOptions and the provided list for Enum settings.
   Keep **Side pane width** and **Close date warning days** filled in: use
   `600` and `7` respectively, or other valid integers. From control 1.9.1,
   the manifest also supplies these defaults in the maker.
5. Save the configuration and view, and publish the changes. Ensure the view
   is available in the model-driven app; publish the app too if you changed
   its configuration.
6. Open the app and select the view. If needed, select **Show as → Kickstart365
   Kanban**. Renaming a view to "Kanban view" does not activate the component.
   Microsoft Kanban is a separate control.
7. Reload the app and reopen the configuration to check that your settings
   were saved.

The solution package contains only the component. It does not include an
Opportunity view, Business Process Flow, custom fields or model-driven app.

## Field names, JSON and defaults

Use **logical field names**, such as `estimatedvalue`, rather than the display
label "Estimated Revenue". The name must exactly match the dataset column.
For linked tables, this may be a complete alias such as `a_account.ownerid`.
The configurable inline editor supports only direct Opportunity field names,
without aliases.

Use `name` for the Opportunity title field. `title` is an internal card value
and should not appear in `sortFields`, `compactCardFields` or other field lists.
A field hidden in card details can still be used for filters or totals.
The title from the first view column remains visible.

The tables use these formats:

| Format | Input |
| --- | --- |
| Yes/No | TwoOptions in the maker; `true` / `false` in technical examples. |
| Choice | Enum in the maker; the table gives the underlying value. |
| Field list | A JSON array such as `["ownerid","estimatedvalue"]`, or `ownerid,estimatedvalue`. Order is used where relevant. |
| JSON array / JSON object | Valid JSON with double quotes, without comments or trailing commas. |
| Number / pixels | A number; for text settings that specify width/count, enter digits only, such as `320`. |

A default applies when a setting is **not supplied**. An empty JSON array `[]`
is an explicit empty list: use it, for example, to select no compact detail
fields or no inline editable fields. The maker may pass empty text as "not
supplied"; prefer the relevant enable/disable option or `[]` when turning a
feature off.

## Config (JSON)

From 1.10.0, combine all existing settings in one **Config (JSON)** value.
Individual settings remain supported. Use **Export configuration** on the board
to migrate the current configuration. See
[JSON configuration, precedence, migration and schema](CONFIG-JSON.en.md).

## All configuration options

| Property | Maker label | Type/default | Explanation |
| --- | --- | --- | --- |
| `config` | Config (JSON) | Multiple (JSON object); empty | Combines the other 46 options. Supplied valid values win per setting/field; omitted values use individual settings. See the [JSON guide](CONFIG-JSON.en.md). |

### Grouping and record actions — 10 options

| Property | Power Apps label | Format / default | Behavior |
| --- | --- | --- | --- |
| `defaultView` | Default View By | Text; first available grouping | Exact display name of the BPF or Choice field in **View By**. This is not the Dataverse view name. |
| `filteredBusinessProcessFlows` | Filter out Business Process Flows | JSON array of BPF names; `[]` | Excludes the named processes. Only active BPFs are offered. |
| `businessProcessFlowStepOrder` | Business Process Flow Step Order | JSON array of `{id,order}`; native process order | `id` is the exact stage name. Lower `order` comes first; unlisted stages keep their native order value. |
| `hideViewBy` | Hide View By if default View By set? | Yes/No; off | Hides **View By** when enabled, even without `defaultView`. Configure the intended grouping first. |
| `allowCardMove` | Allow moving cards | Yes/No; on when not supplied | Enables dragging. Choice: saves the field value. BPF: opens the native record form to change the stage there. |
| `cardMoveValidationFunction` | Card move validation function | Text; none | Global JavaScript function name, such as `K365.Kanban.beforeMove`. Applies to moves between Choice columns. |
| `cardMoveValidationScript` | Card move validation script (web resource) | Text; none | JavaScript web resource name that makes the function above available, including publisher prefix and path. |
| `showOpenInNewTabButton` | Show open in new tab button on card | Yes/No; off | Extra button on every card to open the record in a new browser tab. |
| `hideEmptyColumns` | Hide empty columns | Yes/No; off | Hides columns without cards after applying the active filters and search term. |
| `allowCreateNew` | Allow creating new records from board | Yes/No; on when not supplied | Shows the plus button in each column. New records always open in a dialog. |

### Opening and editing — 4 options

| Property | Power Apps label | Format / default | Behavior |
| --- | --- | --- | --- |
| `recordOpenMode` | Open records in | Choice: `sidePane` / `dialog`; `sidePane` | Opens existing records and lookups alongside the board or in a centered dialog. Falls back to a dialog when a side pane is unavailable. |
| `sidePaneWidth` | Side pane width | Number; `600` pixels | Valid from `300` to `1200`; invalid input uses `600`. Only applies to the side pane. |
| `allowInlineEdit` | Editing fields on cards | Choice: `enabled` / `disabled`; `enabled` | Enables/disables the Opportunity card editor. It does not grant extra Dataverse permissions. |
| `inlineEditFields` | Editable card fields | Field list; `estimatedvalue,closeprobability,estimatedclosedate` | Explicit editable-field list. Requires a supported writable field in the view and visible on the card. `[]` selects no fields. |

### Compact cards, dates and totals — 7 options

| Property | Power Apps label | Format / default | Behavior |
| --- | --- | --- | --- |
| `compactCards` | Start with compact cards | Yes/No; off | Starts compact when enabled. Users can always choose Compact/Expanded in the toolbar. |
| `compactCardFields` | Compact card fields | Field list; `parentaccountid,estimatedvalue,closeprobability,estimatedclosedate,ownerid` | Detail fields and order on compact cards. Hidden fields stay hidden; `[]` shows only the title and any badge/actions. |
| `showCloseDateBadges` | Show close date badges | Yes/No; off | Shows overdue, today, soon or later date badges. Include `statecode` to suppress badges for closed Opportunities. |
| `closeDateField` | Close date field | Field name; `estimatedclosedate` | Badge date field; must be included in the view. |
| `closeDateWarningDays` | Close date warning days | Whole number; `7` | Days ahead that count as "soon", including the final day. `0` is valid; negative/invalid input uses `7`. |
| `columnTotalField` | Column total field | Field name; `estimatedvalue` | First numeric sum per column. Money requires `transactioncurrencyid`, except for `_base` fields. |
| `columnSecondaryTotalField` | Secondary column total field | Field name; none | Second numeric sum, such as an existing weighted revenue field. Selecting the first total's field again does not show it twice. |

### Card content and appearance — 13 options

| Property | Power Apps label | Format / default | Behavior |
| --- | --- | --- | --- |
| `hideColumnFieldOnCard` | Hide column field on card | Yes/No; off | Hides the Choice field used for the current grouping. BPF grouping does not hide a separate Opportunity stage field with this option. |
| `hiddenFieldsOnCard` | Hidden fields on card | Field list; `[]` | Loads fields through the view but hides them in card details, including expanded details. Does not hide the title. |
| `htmlFieldsOnCard` | HTML fields on card | Field list; `[]` | Displays selected detail fields as sanitized HTML. HTML detail fields have no inline editor. |
| `allowedHtmlTagsOnCard` | Allowed HTML tags on card | Comma list; see [HTML display](#html-display) | Allowed HTML tags. An explicit empty string strips tags while retaining text. |
| `allowedHtmlAttributesOnCard` | Allowed HTML attributes on card | Comma list; `href` | Allowed HTML attributes. An explicit empty string allows no attributes. |
| `hideLabelForFieldsOnCard` | Hide label for fields on card | Field list; `[]` | Displays the value without its field label. |
| `fieldDisplayNamesOnCard` | Field display names on card | JSON array of `{logicalName,displayName}`; view labels | Custom card labels, also used for field names in filter/sort choices. An empty card label falls back to the original label. |
| `booleanFieldHighlights` | Field highlights | JSON array of `{logicalName,color,type}`; none | Colored border/corner when the field value matches. Also supports other field types; see [card formatting](#card-formatting). |
| `fieldWidthsOnCard` | Field widths on card | JSON array of `{logicalName,width}`; natural width | Percentage width, greater than `0` and at most `100`. `100` spans the row; `50` uses half a row. |
| `lookupFieldsAsPersonaOnCard` | Lookup fields as Persona on card | Field list; `[]` | Displays lookups as a Persona with initials and name. This version does not retrieve profile photos. |
| `lookupFieldsPersonaIconOnlyOnCard` | Lookup Persona icon only on card | Field list; `[]` | Initials icon only, with the name in a tooltip. Requires the field to be in `lookupFieldsAsPersonaOnCard` too. |
| `showEmailAndPhoneAsLinks` | Show E-Mail and Phone as links on card | Yes/No; off | Recognizes dataset email/phone types and displays `mailto:` / `tel:` links. |
| `ellipsisFieldsOnCard` | Ellipsis fields on card | Field list; `[]` | Selected detail values use one line with `…`; other detail values use multiple clamped lines. The title already has its own truncation. |

### Filters and sorting — 5 options

| Property | Power Apps label | Format / default | Behavior |
| --- | --- | --- | --- |
| `quickFilterFields` | Quick filter fields | Field list; `[]` | Filter fields in list order, from the dataset only. Dates/numbers get range filters; text/lookups usually use multiselect; Boolean uses a single selection. See type detection under [filters](#filters-and-presets). |
| `quickFilterFieldsInPopup` | Quick filter fields in popup | Field list; `[]` | Moves some quick filters to **More filters**. Must be a subset of `quickFilterFields`. |
| `sortFields` | Sort fields | Field list; `[]` | Fields that users can sort ascending/descending. |
| `defaultSort` | Default sort | JSON object `{field,direction}`; none | Initial sort when no saved sort choice is present. `field` must be in `sortFields` and the view; `direction` is `asc` or `desc`. |
| `filterPresets` | Filter presets | JSON array of `{id,label,filters}`; `[]` | Named quick-filter combinations. Referenced fields must be in `quickFilterFields`. |

### Board layout, colors and notifications — 7 options

| Property | Power Apps label | Format / default | Behavior |
| --- | --- | --- | --- |
| `columnColors` | Column colors | JSON array of `{id,color}`; none | Column header accent and light background. `color`: six hex digits with `#`; `id`: stage GUID, exact stage name or Choice value. |
| `expandBoardToFullWidth` | Expand board to full width | Yes/No; off | Distributes available width across columns, preserving configured minimums/maximums. Uses horizontal scrolling if needed. |
| `minColumnWidth` | Minimum column width | Pixel text; `400` | Valid from `200` to `1200`; empty/invalid input uses the default. |
| `maxColumnWidth` | Maximum column width | Pixel text; no limit | Valid from `200` to `2000`; empty/invalid input sets no maximum. Choose a maximum at least as large as the minimum. |
| `initialCardsVisible` | Initial cards visible per column | Count text; `30` | Valid from `1` to `500`; empty/invalid input uses `30`. Scrolling displays 30 more cards at a time. Does not limit totals. |
| `columnWidths` | Column widths | JSON array of `{id,width}`; none | Fixed width per column; numeric pixels are clamped to `200`–`1200`. `id`: exact stage name, Choice value or `unallocated`; no stage GUID. Overrides global widths. |
| `notificationPosition` | Notification Position | Choice; Top End (`top-right`) | Toast position. See [all six values](#notifications). |

## Opportunity: recommended setup

Add these view columns:

| Column | Purpose |
| --- | --- |
| `name` first | Card title; also use this field for title sorting. |
| `parentaccountid` | Company. Use your own company lookup if your environment uses one. |
| `estimatedvalue` | Card revenue, first column total and optional editing. |
| `closeprobability` | Probability percentage; optional editing. |
| `estimatedclosedate` | Close date, badges, date filters and optional editing. |
| `ownerid` | Owner, Persona and "My opportunities" filter. |
| `transactioncurrencyid` | Correct currency separation for Money totals. |
| `statecode` | Identifies open/closed records for cards and date badges. |
| Optional `sparked_estimatedweightedrevenue` | Second total if this custom field actually exists. |

Then configure this starting profile. Each row is a **separate property value**;
this is not a JSON file that can be imported into the control all at once.

| Property | Value |
| --- | --- |
| `defaultView` | Exact display name of the intended BPF in **View By** |
| `recordOpenMode` | Side pane (`sidePane`) |
| `sidePaneWidth` | `600` |
| `compactCards` | Yes |
| `compactCardFields` | `["parentaccountid","estimatedvalue","closeprobability","estimatedclosedate","ownerid"]` |
| `hiddenFieldsOnCard` | `["transactioncurrencyid","statecode"]` |
| `allowInlineEdit` | Enabled (`enabled`) |
| `inlineEditFields` | `["estimatedvalue","closeprobability","estimatedclosedate"]` |
| `showCloseDateBadges` | Yes |
| `closeDateField` | `estimatedclosedate` |
| `closeDateWarningDays` | `7` |
| `columnTotalField` | `estimatedvalue` |
| `columnSecondaryTotalField` | Leave unset, or select an existing numeric field |
| `hideEmptyColumns` | No |
| `minColumnWidth` | `320` |
| `quickFilterFields` | `["ownerid","parentaccountid","estimatedclosedate","estimatedvalue"]` |
| `quickFilterFieldsInPopup` | `["parentaccountid","estimatedvalue"]` |
| `sortFields` | `["estimatedvalue","estimatedclosedate","name"]` |
| `defaultSort` | `{"field":"estimatedclosedate","direction":"asc"}` |
| `lookupFieldsAsPersonaOnCard` | `["ownerid"]` |

If your environment uses **`bcbi_companyid`** for the company lookup, add that
column and replace `parentaccountid` in the compact fields and filters with
`bcbi_companyid`. The component does not create this field.

Add the colors and presets below if they suit your process. Check the actual
BPF and stage names first.

## Grouping and BPF stages

**View By** (*Groeperen op* in the Dutch UI) offers Choice fields that appear
as `OptionSet` in the dataset, plus available active BPFs for the table.
Without a valid `defaultView`, the first available grouping is selected;
Choice groupings come before BPFs. Use the exact BPF display name, such as
`Opportunity Sales Process`, only if that is the name of your process.

`filteredBusinessProcessFlows` is an **exclusion list**, for example:

```json
["Project Service - Opportunity Sales Process"]
```

For `businessProcessFlowStepOrder`:

```json
[
  { "id": "Qualify", "order": 0 },
  { "id": "Develop", "order": 1 },
  { "id": "Propose", "order": 2 },
  { "id": "Close", "order": 3 }
]
```

Use stage names, not GUIDs. Start numbering at `0` to align with native order
values. List all stages when defining a complete custom order; otherwise
native and custom order numbers may tie. The setting matches stage names
across the offered processes. Stages with the same name are combined into
one column within a process.

Records with no stage found in the selected BPF appear in **Unallocated**.
That column appears only when such records remain after filtering. When
grouping on `statuscode`, only status reasons for the active state
(`statecode = 0`) are offered as regular columns; other values may therefore
appear under Unallocated.

Dragging by the handle to another **Choice column** writes the Choice value.
A failed save or rejected validator moves the card back. Reordering within
one column is temporary and is not saved as record order. Dragging between
**BPF columns** opens the native form in the configured opening mode. Change
and save the stage there; the destination stage is not filled automatically.
BPF requirements and branch rules remain in the form.

The plus button opens a new record in a dialog. With Choice grouping, the
column value is passed as a starting value; BPF grouping does not prefill a stage.

## Column colors

Enter this in `columnColors`:

```json
[
  { "id": "Qualify", "color": "#0078D4" },
  { "id": "Develop", "color": "#009C91" },
  { "id": "Propose", "color": "#8764B8" },
  { "id": "Close", "color": "#107C41" },
  { "id": "unallocated", "color": "#697580" }
]
```

Use the exact stage names from your process. For a BPF, `id` can also be the
exact `processstageid` GUID. A GUID match takes precedence over a stage-name
match. For Choice columns, use the stored numeric value as a string, such as
`{ "id": "1", "color": "#0078D4" }`, using your field's actual value.
The first matching entry is used when multiple entries match.

Only `#RRGGBB` is valid: `#ff0`, `red` and `rgba(...)` are not accepted here.
An invalid entry invalidates the color configuration and displays a message.
Unlisted columns keep their default background. Cards retain their background.
Colors are configured by the maker; the board has no end-user color picker.

## Column widths

For `columnWidths`, for example:

```json
[
  { "id": "Qualify", "width": 300 },
  { "id": "Develop", "width": 340 },
  { "id": "unallocated", "width": 280 }
]
```

These fixed column widths override `minColumnWidth` and `maxColumnWidth`,
including when `expandBoardToFullWidth` is enabled. Columns without a fixed
width follow the general layout. `columnWidths` matches stage names or Choice
values, not stage GUIDs; this differs from `columnColors`. For duplicate IDs,
the last width entered wins. Enter whole pixels and keep the global maximum
at least as large as the minimum.

## Column totals and currencies

The header shows the card count and sums the selected fields for the **active
Dataverse view plus board filters and search term**. All pages loaded by the
host count; `initialCardsVisible` only controls how many cards are rendered
initially. The component loads subsequent dataset pages before building the
board. Totals exclude records outside the view or the user's access rights.

- For `estimatedvalue`, include **`transactioncurrencyid`** in the view.
  You can hide it with `hiddenFieldsOnCard`.
- Transaction Money is totaled separately by currency, with the currency
  name displayed. No currency conversion takes place.
- For one total in base currency, use `estimatedvalue_base` and include it in
  the view. `_base` totals have no assumed currency symbol; the amount is in
  the organization's base currency.
- Whole/decimal numbers do not require a currency column. Only finite numeric
  raw values are summed; empty amounts do not count. An empty column shows `0`.
- Total labels come from the view. Card label overrides do not change these
  header labels. Amounts display two decimal places.
- A selected field missing from the view produces no total row. If the host
  supplies an explicit empty string, it disables the first total row;
  an unset value uses `estimatedvalue` again.

A second total can use an existing field such as `sparked_estimatedweightedrevenue`.
The component does not calculate weighted revenue or create the field or its
cloudflow. Refresh the board after the flow updates the field. Keep fields
maintained by a flow outside the inline edit list.

## Compact cards and date badges

`compactCards = Yes` sets the initial mode. Users switch with **Compact /
Expanded**. In compact mode, **Details** reveals the other detail fields on
one card; fields in `hiddenFieldsOnCard` stay hidden. The title is separate
from `compactCardFields`. Expanded detail fields follow view order; compact
detail fields follow the configured list.

Date badges use local calendar days: overdue, today, within the warning
period or later. With `closeDateWarningDays = 7`, day 7 also counts as "soon".
A missing/invalid date produces no badge. Hiding the date field with
`hiddenFieldsOnCard` also hides the badge. Include `statecode`: then only open
Opportunities get badges. Without this field, the component cannot suppress
badges on closed records.

## Opening records

Choose an **Open records in** value:

| Maker selection | Value | Behavior |
| --- | --- | --- |
| Side pane | `sidePane` | One reusable, closable native pane alongside the board. |
| Dialog | `dialog` | Native form in a centered dialog. |

Click the **card title** or a **lookup** to open a record. Use the separate
handle to drag and the pencil to edit a field. New records open in a dialog
in both modes. The extra new-tab button works independently of `recordOpenMode`.

The side pane requires the web model-driven host to expose `Xrm.App.sidePanes`.
Without this integration, the control uses a dialog with a notification.
Test it in the intended app; the app API is not a documented PCF context API.
According to [Microsoft's side pane documentation](https://learn.microsoft.com/en-us/power-apps/developer/model-driven-apps/clientapi/create-app-side-panes),
native mobile players do not support this pane. When switching records, the
native form handles any unsaved changes.

With a record pane open, the board checks `modifiedon` approximately every
10 seconds and refreshes data when it changes. Checks pause in a hidden
browser tab, while inline editing/dragging and while the dataset loads.
Closing the pane refreshes at the next check. Use **Refresh** after a BPF-only
change or a delayed cloudflow update.

## Editing fields on cards

This is available for **Opportunity**. Displaying a field does not make it
editable: include it in the view and `inlineEditFields`. Also add it to
`compactCardFields` if it should be immediately visible in compact mode,
or open Details. You can select the title field `name` too.

For `inlineEditFields`, for example:

```json
["estimatedvalue", "closeprobability", "estimatedclosedate", "description", "k365_nextstep"]
```

`k365_nextstep` is an example: replace it with an existing writable field in
your environment. Use `[]` to select no fields, or choose **Editing fields on
cards → Disabled** to turn off all card editing.

| Field type | Inline editing |
| --- | --- |
| Plain text, email, phone, multiline text | Yes, if metadata permits updates. |
| Whole number, decimal, floating point, Money | Yes, with metadata bounds. |
| Date with **DateOnly behavior** and dataset type `DateAndTime.DateOnly` | Yes. Date Only display format on a UserLocal field is insufficient. |
| Lookup, Choice, Boolean, URL, UserLocal date/time | Use the native form. |
| Calculated, formula, rollup, secured and `_base` fields | Use the native form; no inline save. |
| Fields on a linked table / aliased fields | No inline editor. |

The editor checks field metadata, required input, maximum text length and
numeric bounds. Only open Opportunities are editable. Product-calculated
revenue cannot be changed on the card. For some restrictions, clicking the
pencil may be the point at which the editor reports an unsupported field.

Click the pencil, change the value and choose **Save** or **Cancel**.
Enter saves a single-line input; Escape cancels. Enter in multiline text
inserts a new line. Enter numbers without grouping separators; the inline
editor accepts a comma or dot as the decimal separator. While editing,
other record actions, dragging, board filters and density controls are blocked.

Saving checks the current server value again and uses an ETag for the update.
A conflict or rejected save retains the draft and displays the error.
Cancel makes no write; a successful save refreshes cards, filters and totals.

Dataverse permissions, plugins and server validation still apply. Form
JavaScript and business rules that run only on the form do not run for an
inline Web API update. Use the native form for fields that depend on these.

## Card formatting

Enter each example in its named property.

**`fieldDisplayNamesOnCard`**:

```json
[
  { "logicalName": "estimatedvalue", "displayName": "Revenue" },
  { "logicalName": "closeprobability", "displayName": "Probability (%)" },
  { "logicalName": "estimatedclosedate", "displayName": "Close date" }
]
```

**`fieldWidthsOnCard`**:

```json
[
  { "logicalName": "parentaccountid", "width": 100 },
  { "logicalName": "estimatedvalue", "width": 50 },
  { "logicalName": "closeprobability", "width": 50 },
  { "logicalName": "description", "width": 100 }
]
```

**`booleanFieldHighlights`** (maker label **Field highlights**):

```json
[
  { "logicalName": "k365_priority", "color": "#D83B01", "type": "left" },
  { "logicalName": "description", "color": "#0078D4", "type": "cornerTopRight" }
]
```

Replace `k365_priority` with an existing field. Boolean-like values highlight
only when true (`true`, `1`, `yes`, `ja`); false and `0` do not. Other values
match when "not empty". Detection uses the card value: text `"false"` or the
number `0` can also be treated as false. This is not a general rule or
comparison expression configuration.

Allowed types: `left` (default), `right`, `cornerTopLeft`, `cornerTopRight`,
`cornerBottomLeft`, `cornerBottomRight`. The **first matching rule per type**
wins; different accent positions can be active together. Card highlights
accept CSS colors. Column colors use the stricter six-digit hex notation.

Other examples:

| Property | Example value |
| --- | --- |
| `hiddenFieldsOnCard` | `["transactioncurrencyid","statecode"]` |
| `hideLabelForFieldsOnCard` | `["parentaccountid","ownerid"]` |
| `lookupFieldsAsPersonaOnCard` | `["ownerid"]` |
| `lookupFieldsPersonaIconOnlyOnCard` | `["ownerid"]`, together with the preceding option |
| `ellipsisFieldsOnCard` | `["description"]` |

## HTML display

For example, set `htmlFieldsOnCard = ["description"]` only if that field
contains HTML you want to display as formatting. Plain text fields do not
need to be in this list.

Default `allowedHtmlTagsOnCard`:

```text
p,br,b,i,u,strong,em,a,ul,ol,li,table,thead,tbody,tr,th,td
```

Default `allowedHtmlAttributesOnCard`: `href`. Both options use a **comma list**,
not a JSON array. DOMPurify sanitizes the content with these allowlists;
a Shadow DOM isolates formatting. Shadow DOM does not replace sanitizing.
Keep the defaults unless you need additional markup.

An explicit empty tag list strips markup; an explicit empty attribute list
removes attributes. If the maker passes an empty setting as unset, defaults
still apply. To display plain text, leave the field out of `htmlFieldsOnCard`.

## Filters and presets

Search is always available and matches text values of loaded cards without
case sensitivity, including fields hidden from card details. Filters on
different fields combine with **AND**; selected alternatives within one
text/lookup filter combine with **OR**. Filter options come from the loaded
records in the view.

For `quickFilterFields`:

```json
["ownerid", "parentaccountid", "estimatedclosedate", "estimatedvalue"]
```

For `quickFilterFieldsInPopup`:

```json
["parentaccountid", "estimatedvalue"]
```

**Type detection in 1.9:** besides metadata, the control examines the first
record's raw value. A numeric Choice value can therefore receive a number
filter instead of a dropdown; this may change between datasets. Use a numeric
expression for a number filter. For a text/lookup/choice dropdown, use the
exact displayed filter value, including case and language. Lookups filter by
name, not GUID; identical names match together.

A preset has a unique `id`, a `label` and `filters`. Only fields listed in
`quickFilterFields` are applied. A preset replaces the current quick filters;
fields with no value in the preset are cleared. Search and sorting do not
change. There is no separate default-preset setting.

For `filterPresets`:

```json
[
  {
    "id": "mine",
    "label": "My opportunities",
    "filters": { "ownerid": "{{currentUser}}" }
  },
  {
    "id": "this-month",
    "label": "Closing this month",
    "filters": { "estimatedclosedate": "currentMonth" }
  },
  {
    "id": "high-value",
    "label": "Revenue at least 10,000",
    "filters": { "estimatedvalue": "gte:10000" }
  },
  {
    "id": "date-range",
    "label": "Fourth quarter 2026",
    "filters": { "estimatedclosedate": { "start": "2026-10-01", "end": "2026-12-31" } }
  }
]
```

`{{currentUser}}` is replaced by the display name from `systemuser.fullname`,
for example for `ownerid`. It is not an owner ID and does not create a secured
"only my records" view. Dataverse determines which records the user may load.

### Text, lookup and choice dropdowns

One value: `"Contoso"`; multiple values: `["Contoso","Fabrikam"]`.
Use `"__empty__"` for empty values. Boolean dropdowns use one displayed value
as it appears in your filter, not automatically the string `"true"`.
For a Choice dropdown, use display labels rather than assuming `"1"`.
If that Choice field has a number filter, use a numeric range, such as
`"between:1|1"` to match only raw value 1.

For aliased fields, presets first match the full column name, then the part
after the last dot. Use the full alias to distinguish linked fields with
the same name.

### Date filters

| Preset value | Meaning |
| --- | --- |
| `today` | Today |
| `last7` | Today and the preceding six days |
| `last30` | Today and the preceding 29 days |
| `currentWeek` | Current Monday through Sunday |
| `nextWeek` | Next Monday through Sunday |
| `currentMonth` | Entire current month |
| `nextMonth` | Entire next month |
| `currentYear` | Entire current year |
| `custom:2026-10-01\|2026-12-31` | Custom inclusive date range |
| `{ "start": "2026-10-01", "end": "2026-12-31" }` | Same range as a JSON object in a preset |

Ranges use local calendar days and include the end date. In string notation,
include `custom:` and use an ordinary `|` without a backslash. A bare
`YYYY-MM-DD|YYYY-MM-DD` is not processed as a range in this version, even
though older help text mentions it. Empty/invalid ranges apply no date
restriction. Prefer the object form in the example.

### Number and Money filters

| Preset value | Meaning |
| --- | --- |
| `gt:10000` | Greater than 10,000 |
| `gte:10000` | At least 10,000 |
| `lt:50000` | Less than 50,000 |
| `lte:50000` | At most 50,000 |
| `between:10000\|50000` | Inclusive lower and upper bounds |

Use a **dot** for decimals in preset expressions, with no grouping separators:
for example, `gte:1234.56`. Use an ordinary `|`, without a backslash, for
`between`. An invalid number filter applies no restriction.

### Remembering user choices

Quick filters, search, sorting and the selected preset are stored locally
in the browser profile per table and Dataverse view, if the host supplies a
view ID. They do not synchronize across browsers/devices. The storage key
contains no separate user ID; switching accounts in the same browser profile
can retain earlier choices. There is no general reset button: clear search,
select no preset/all filter values and choose None for sorting.
Compact/Expanded is not remembered this way.

## Sorting

For `sortFields`:

```json
["estimatedvalue", "estimatedclosedate", "name"]
```

For `defaultSort`:

```json
{ "field": "estimatedclosedate", "direction": "asc" }
```

Sorting applies **within each column**. Dates and numbers sort on raw values;
text and lookups sort on display text. Without custom sorting, the supplied
dataset order is used. A saved sort choice takes precedence over `defaultSort`.
An unknown direction falls back to `asc`; invalid JSON selects no default sort.
Reloading uses the preferences saved at that time. A maker change to
`defaultSort` therefore does not automatically replace an existing user sort.

## Move validation

This applies only to **Choice moves into a different column**. Reordering in
the same column and BPF moves do not call this function. A move validator is
separate from the inline editor.

1. Create a JavaScript web resource, for example `k365_/scripts/kanban_validate.js`.
2. Enter the exact web resource name in `cardMoveValidationScript`, without a URL.
3. Enter `K365.Kanban.beforeMove` in `cardMoveValidationFunction`.
4. Publish the resource and reload the app. A script loaded only on a record
   form is not automatically available on the list page.

Example web resource:

```javascript
window.K365 = window.K365 || {};
window.K365.Kanban = window.K365.Kanban || {};

window.K365.Kanban.beforeMove = function (args) {
  // Replace 100000001 with the actual Choice value in your environment.
  if (String(args.newValue) === "100000001") {
    const amount = Number(args.card && args.card.estimatedvalueRaw);
    if (!Number.isFinite(amount) || amount <= 0) {
      return { allow: false, message: "Enter revenue greater than zero first." };
    }
  }
  return { allow: true };
};
```

The function receives one object:

| Argument | Content |
| --- | --- |
| `recordId` | Moved record ID |
| `entityName` | Logical table name, such as `opportunity` |
| `logicalName` | Plural table name derived by the control; use the correct metadata/entity set name for Web API calls |
| `fieldName` | Choice field being changed |
| `newValue` | Destination value, or `null` for Unallocated |
| `sourceColumnId`, `destinationColumnId` | Source and destination column IDs |
| `sourceColumnTitle`, `destinationColumnTitle` | Displayed column names |
| `card` | Original card before moving; `<field>Raw` contains the raw value if the field is loaded |

Supported results: `true` / `false`, `{ allow: true }`, or
`{ allow: false, message: "Reason" }`. A Promise returning the same result
also works. `undefined` / `null` allows the move. Prefer an explicit Boolean
or object. An exception or rejected Promise blocks saving with a message.
A configured function that cannot be found also blocks the move. A script
name without a function name does not run a validator. Leave both options
unset when no custom validation is needed.

## Notifications

| Maker selection | Technical value | Position |
| --- | --- | --- |
| Top | `top-center` | Top center |
| Top Start | `top-left` | Top left |
| Top End | `top-right` | Top right; default |
| Bottom | `bottom-center` | Bottom center |
| Bottom Start | `bottom-left` | Bottom left |
| Bottom End | `bottom-right` | Bottom right |

UI language follows the app/user language: Dutch (`1043`), German (`1031`)
or otherwise English. Dataverse also supplies field and Choice labels;
custom labels/preset names in the configuration are not translated.

## Troubleshooting

| What you see | Check / solution |
| --- | --- |
| Regular list or Microsoft Kanban | Check control assignment, publishing and **Show as → Kickstart365 Kanban**. The managed package does not create view/app configuration. |
| A setting appears to do nothing | Reopen the saved configuration, check the static value and connected view, publish and reload. Also check saved filter/sort preferences. |
| Save and publish returns `400` / `0x80160028`, followed by Unsaved changes | Read the Response of the failed `savedqueries` request. For `sidePaneWidth` or `closeDateWarningDays` with type `Whole.None`, enter `600` for **Side pane width** and `7` for **Close date warning days** (or valid integers), save the component configuration and publish the view again. Reopen the view to check the saved values. Runtime defaults cannot repair configuration rejected by Dataverse. |
| Wrong BPF selected initially | `defaultView` must exactly match the display name in **View By**, not "Kanban view" or the BPF table name. |
| Records under Unallocated | Check their instance/stage in the selected BPF or whether their Choice value is offered. See the `statuscode` limitation. |
| Field missing from a card | Add it to the view; check `hiddenFieldsOnCard`, the active grouping and `compactCardFields`. Open Details if needed. |
| No pencil or field cannot be edited | Check Opportunity, `allowInlineEdit`, `inlineEditFields`, visibility, supported type/metadata, open record and write permissions. HTML detail fields and aliased fields are not edited inline. |
| Revenue cannot be saved | Check product-calculated revenue, record state, field bounds and the server error. Use the native form if needed. |
| No total or currency message | Add the total field and, for Money, `transactioncurrencyid` to the view. Check active filters and use actual numeric values. |
| Totals lag behind a flow/BPF change | Wait for the flow and choose **Refresh**. The pane watches `modifiedon`, not every related process/flow change. |
| Missing color | Check the exact stage name/Choice ID and six-digit hex color. GUID matches take precedence; `[]` means no colors. |
| Missing width | `columnWidths` uses stage names/Choice IDs, not GUIDs. Check numbers, global bounds and fixed overrides. |
| Preset does not work | Include the field in `quickFilterFields`. Use dropdown labels or the correct number/date format for the displayed filter. Use `{start,end}` or `custom:` for date ranges. |
| Side pane opens as a dialog | The host does not expose the native pane API or cannot create a pane. Check the web app integration; record opening has a dialog fallback. |
| Dragging does not change the BPF stage | It opens the form; change and save the stage there. |
| Moving is blocked | Check save errors, permissions, validator name, published web resource and function availability on the list page. |

Invalid JSON displays a configuration banner with the property name for many
settings, including field lists, presets, card formatting, BPF configuration,
inline edit lists and colors. Valid JSON with an incorrect structure may be
silently ignored by older settings. `defaultSort`, `columnWidths` and invalid
global widths use silent fallbacks; no banner does not guarantee that every
setting is valid.

After changing BPF or Choice metadata, reload the app to load fresh metadata.
Before use, check compact/expanded cards, currencies, presets, permissions,
saves and BPF stage changes in the actual app. Also see the
[1.9 pilot checks](INTERACTION-SETTINGS.md#pilot-checks-after-importing-1900)
and [technical verification](OPPORTUNITY-FOUNDATION.md).
