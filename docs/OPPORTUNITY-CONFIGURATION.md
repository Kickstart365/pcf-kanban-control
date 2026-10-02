# Kickstart365 Opportunity Kanban: DEV configuration

## Opportunity view

Start with an Opportunity view that contains these columns, in this order:

1. `name` (the first column supplies the card title).
2. `parentaccountid`, `estimatedvalue`, `estimatedclosedate`, `ownerid`.
3. `transactioncurrencyid` and `statecode` (loaded, hidden on cards).
4. Optional `sparked_estimatedweightedrevenue`, if this custom field exists.

Use the native Business Process Flow name as `defaultView`. Stage names form
the board columns. BPF dragging opens the native Opportunity form for the
stage change; the control does not bypass BPF requirements or branch rules.

## Recommended pilot settings

| Property | Value |
| --- | --- |
| `compactCards` | `true` |
| `compactCardFields` | `["parentaccountid","estimatedvalue","estimatedclosedate","ownerid"]` |
| `hiddenFieldsOnCard` | `["transactioncurrencyid","statecode"]` |
| `hideColumnFieldOnCard` | `true` |
| `showCloseDateBadges` | `true` |
| `closeDateField` | `estimatedclosedate` |
| `closeDateWarningDays` | `7` |
| `columnTotalField` | `estimatedvalue` |
| `columnSecondaryTotalField` | `sparked_estimatedweightedrevenue` if available |
| `hideEmptyColumns` | `false` |
| `minColumnWidth` | `320` |
| `quickFilterFields` | `["ownerid","parentaccountid","estimatedclosedate","estimatedvalue"]` |
| `sortFields` | `["estimatedvalue","estimatedclosedate","name"]` |
| `defaultSort` | `{"field":"estimatedclosedate","direction":"asc"}` |

Existing `filterPresets` support saved configurations, for example:

```json
[
  {"id":"mine","label":"Mijn opportunities","filters":{"ownerid":"{{currentUser}}"}},
  {"id":"this-month","label":"Sluit deze maand","filters":{"estimatedclosedate":"currentMonth"}}
]
```

Users can switch between Compact and Expanded in the toolbar. In compact
mode, Details shows the remaining fields for that card. Configured hidden
fields remain hidden. Card totals/counts reflect the active view and filters,
including all loaded pages; progressive rendering does not change totals.

Transaction money totals are grouped by `transactioncurrencyid` and shown
with the currency name. If currency data is missing, the header requests it
rather than inventing a currency. Empty columns display zero. For one combined
multi-currency pipeline total, configure `estimatedvalue_base` and include
that field in the view; the numeric total is in the organization's base currency.
Secondary totals follow the same currency rules. Base totals have no assumed
currency symbol. For numeric, non-money fields no currency is required.

Close-date badges use local calendar dates: overdue, today, within the warning
period, or later. Include `statecode` to suppress them for won/lost opportunities.
They are also suppressed if the date field is in `hiddenFieldsOnCard`.
Dutch UI follows app language 1043; English and German remain supported.

## Runtime verification

- Switch compact/expanded and expand one card; its details button must not
  open the record or start a drag. Check keyboard operation and narrow columns.
- Compare header totals/counts to the same filtered Dataverse view. Include
  an empty stage, zero amounts, multiple currencies and multiple pages.
- Check badges around midnight and won/lost records.
- Verify BPF order, conditional branches, native-form transitions and refresh.
- Validate denied saves, lookup-first titles, text/date/number filters and
  amount changes on records whose IDs remain the same.

The managed/unmanaged ZIPs built by the solution workflow contain only the
control, not the customer view, Opportunity table, BPF, custom fields or app.
