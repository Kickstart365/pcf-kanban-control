# Opportunity Kanban foundation

The Kickstart365 fork selectively adopts ideas from
[upstream PR #25](https://github.com/novalogica/pcf-kanban-control/pull/25),
reviewed at `540a1daf2b62e62885bdeeebf3ee7a5791ea1426`.
The original MIT license and attribution remain in place. The full PR is not
merged: activity/SharePoint actions, preset defaults and additional UI are deferred.

## Behavior

- Choice dragging moves the card immediately, validates the original card,
  and rolls back rejected validation or a failed Dataverse save. A successful
  save triggers one dataset refresh. Another drag is disabled while saving.
- Reordering in one column and cancelled drops do not save or refresh.
- BPF dragging opens the native Opportunity form. It does **not** directly
  update the BPF stage or infer valid branch transitions.
- Empty datasets still load column metadata. Paging completes before metadata
  loading; the old 2,500-record cutoff no longer silently limits totals.
- Choice metadata is cached per entity, language and column set. BPF record
  stages remain uncached and are queried in groups of 100 IDs, at most four
  concurrent requests. Grouping uses numeric choice values rather than labels.
- Host dataset updates invalidate transformed cards even if IDs/references stay
  unchanged. Searching/filtering reuses the transformed data, excludes raw
  metadata from full-text search, and sorts date/number fields on raw values.
- Lookup titles display names. Raw metadata is excluded from card details.
- BPF ordering preserves disconnected paths and avoids loops. Stages missing
  from workflow UI data are appended rather than sorting at index -1.
  `businessProcessFlowStepOrder` remains the explicit override for branches.

Run `node --test tests/*.test.cjs`, `npm run lint`, and
`npm run build -- --buildMode production` after `npm ci` with Node 22.
Tests execute real TypeScript logic with the host/UI boundary mocked; they do
not replace keyboard, drag/drop or BPF testing in a model-driven DEV app.

Microsoft host refresh contract:
https://learn.microsoft.com/en-us/power-apps/developer/component-framework/reference/updatedproperties

## DEV checks

Use an Opportunity view containing `name`, `estimatedvalue`,
`estimatedclosedate`, account/owner lookup fields and the configured choice fields.
Test an empty view, translated choices, lookup-first views, filters, denied
saves, same-ID amount updates, and a paged view larger than 2,500 records.
Check the intended BPF and each conditional branch with explicit stage order
where needed. Verify keyboard Space/arrow dragging and Enter-to-open.

Totals describe the loaded view and active client filters. For multi-currency
data use a base-currency value field or distinguish currencies; transaction
amounts in different currencies must not be combined under one symbol.
