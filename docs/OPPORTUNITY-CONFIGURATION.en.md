# Kickstart365 Opportunity Kanban: quick start for 1.9

**Language: English | [Nederlands](OPPORTUNITY-CONFIGURATION.md)**

The complete English guide is in [CONFIGURATION.en.md](CONFIGURATION.en.md),
covering all **47 settings**, defaults, examples and troubleshooting.

## Setup

1. [Download the managed or unmanaged solution](CONFIGURATION.en.md#download-the-solutions)
   and import **Kickstart365Kanban 1.11.0.0** into the intended environment.
   See [installation and upgrades](DEV-INSTALLATION.en.md); keep the same
   managed/unmanaged package type for an existing installation.
2. Create/open an Opportunity view with `name` first. Add `parentaccountid`,
   `estimatedvalue`, `closeprobability`, `estimatedclosedate`, `ownerid`,
   `transactioncurrencyid` and `statecode`. Use your own company lookup,
   such as `bcbi_companyid`, if it replaces `parentaccountid` in your environment.
3. Add **Kickstart365 Kanban** and configure
   [the recommended starting profile](CONFIGURATION.en.md#opportunity-recommended-setup).
   Set `defaultView` to the exact display name of the intended BPF. Add
   [column colors](CONFIGURATION.en.md#column-colors) and
   [filter presets](CONFIGURATION.en.md#filters-and-presets) if needed.
4. Save, publish and open the view in the app. If needed, select
   **Show as → Kickstart365 Kanban**.

Each setting has its own value; the starting profile is not a single importable
file. Only fields included in the view can be used on cards. Money totals
require `transactioncurrencyid`; you can hide this field and `statecode` on cards.

For a second total, use an existing numeric field such as
`sparked_estimatedweightedrevenue`. The component does not create this field
or calculate weighted revenue. Keep values maintained by a cloudflow outside
the inline edit list and refresh the board after the flow runs.

The package contains only the control. It does not include the customer view,
Opportunity table, BPF, custom fields or model-driven app.

## Verify in the app

- Switch Compact/Expanded and open Details on one card. Hidden fields stay
  hidden; the title, pencil and drag handle each have a separate action.
- Compare counts and totals with the same filtered view. Test zero amounts,
  empty stages, multiple currencies and multiple dataset pages.
- Check badges for today, overdue dates and closed records.
- Open a record in the side pane, save a change and check the refreshed card.
  Use Refresh after a BPF or cloudflow change.
- Edit an allowed field, cancel a draft and check a rejected save. Also test
  a closed record and a user without write permissions.
- Drag between BPF columns: from 1.11.0 the stage is saved on the process
  instance and the card moves after success. Missing required steps open the
  form; fill them in and drag again. See [BPF dragging](BPF-DRAG.en.md).
- Test search, presets, date/number filters, sorting and keyboard operation.

See [the full 1.9 pilot checks](INTERACTION-SETTINGS.md#pilot-checks-after-importing-1900),
[the technical foundation](OPPORTUNITY-FOUNDATION.md) and
[troubleshooting](CONFIGURATION.en.md#troubleshooting).
