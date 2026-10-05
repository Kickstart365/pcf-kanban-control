# Save & Publish: invalid component value

**English | [Nederlands](VIEW-PUBLISH.md)**

Dataverse error `0x80160028`, such as `compactCards cannot be parsed to type
TwoOptions`, blocks saving the **view configuration**. The message identifies
the property and type Dataverse rejects. This happens before the Kanban
component can read its runtime settings. Config (JSON) cannot repair an invalid
individual maker value during Save & Publish.

## Correction from 1.11.1.0

All ten Yes/No inputs have an explicit `true` or `false` manifest default.
The two integer inputs and three enum inputs also have valid defaults. Existing
default behaviour is preserved. Property names and types remain the same.
The build verifies defaults in **both packaged solution manifests**.

A new component configuration receives valid typed defaults. A manifest default
does not automatically replace an invalid value already configured on a view.

## Repair an existing view

1. Import the new solution using the same package type as the existing installation.
2. Reload the maker page and open the affected view's component settings.
3. Explicitly choose Yes or No for **every Yes/No setting**. Use your intended
   values; the table below lists defaults. Choose with the maker selector and
   leave none of these settings blank.
4. Confirm both integer values and all three enum choices. Keep your intended
   Config (JSON) and other field settings.
5. Save the component settings, then **Save & Publish** the view.
6. Reload the view and verify the settings persisted. Then test the Kanban in the app.

| Property / maker label | Default |
| --- | --- |
| `compactCards` / Start with compact cards | No |
| `showCloseDateBadges` / Show close date badges | No |
| `hideViewBy` / Hide View By if default View By set? | No |
| `allowCardMove` / Allow moving cards | Yes |
| `showOpenInNewTabButton` / Show open in new tab button on card | No |
| `hideEmptyColumns` / Hide empty columns | No |
| `hideColumnFieldOnCard` / Hide column field on card | No |
| `showEmailAndPhoneAsLinks` / Show E-Mail and Phone as links on card | No |
| `expandBoardToFullWidth` / Expand board to full width | No |
| `allowCreateNew` / Allow creating new records from board | Yes |
| `sidePaneWidth` / Side pane width | 600 |
| `closeDateWarningDays` / Close date warning days | 7 |
| `recordOpenMode` / Open records in | Side pane |
| `allowInlineEdit` / Editing fields on cards | Enabled |
| `notificationPosition` / Notification Position | top-right |

If a label differs in the maker, identify the setting by its property name.
Config (JSON) values still override individual settings when the board runs.

## If saving still fails

Check the new server message: does it name the same property or another one?
Capture the failed `savedqueries` **request payload**, including
`controlDescriptionXml`, as well as its response. The server error alone may
not show the actual submitted settings. Keep the existing configuration; do
not replace values just because the error details contain `PlaceholderString`.

## Live validation on 5 October 2026

In a clean Dataverse DEV environment with sample data, the managed installation
was updated from 1.11.0.0 to 1.11.1.0. With the old version, the view still
warned about unsaved changes after Save & Publish. With 1.11.1.0, all ten boolean
defaults were selected automatically. Adding the control, Save & Publish and
navigating away without a warning succeeded. The settings persisted after
reopening; this was also checked with Config (JSON).

The Opportunity view then ran in Sales Hub with BPF columns, colors, compact
cards, date badges and estimated revenue per column. The five sample
opportunities totaled €116,000. Moving a card from Qualify to Develop also
changed the active BPF stage on the record; its side pane showed Develop.
The sample opportunity was returned to Qualify and checked after refreshing.

Automated checks cover manifest defaults, Config (JSON) overrides and packaged
manifests. This live validation covers the DEV test described above; validate
Save & Publish in your own environment as well. A successful compile/build
alone does not prove that server operation.

[Microsoft: input property defaults](https://learn.microsoft.com/en-us/power-apps/developer/component-framework/manifest-schema-reference/property)
