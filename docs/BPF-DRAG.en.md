# Change BPF stages by dragging

**English | [Nederlands](BPF-DRAG.md)**

From **control 1.11.0 / solution 1.11.0.0**, dragging between BPF columns saves
the active process stage. Select the intended BPF in **View By** and leave
`allowCardMove` enabled. No additional setting is needed.

## Usage

1. Drag the card by its move handle to the destination stage.
2. The control reads the current process instance and active path from Dataverse.
3. Required steps and any configured card move validator are checked.
4. After saving, the card moves and the board refreshes cards, counts and totals.

Successful moves do not open a pane. Click the card title to open the record
in the configured opening mode. Missing required steps show their names and
open the record form. Complete them, save and drag again. The previous failed
drop is not resumed automatically.

## Paths and checks

- Stages are saved on the **BPF instance** through `activestageid` and
  `traversedpath`. Deprecated Opportunity process fields are not changed.
- Built-in and custom processes use their actual relationship and table metadata.
  If several instances of the selected process exist, the latest modified
  instance is used for both card grouping and dragging.
- Only stages in that instance's **active path** can be reached. Choosing another
  branch or changing the visual column order does not change this path.
- Dropping across several stages saves sequential adjacent transitions.
  Known required steps of all stages being left are checked before the first
  save. Backward moves also use these checks.
- Required text/lookup/number steps must have a value. Zero is a valid number.
  A required Two Options step must be **Yes / true**.
- Two stages with the same name in one active path are ambiguous and blocked.
  That name may occur elsewhere in a different branch.
- Missing instances, completed/aborted processes, Unallocated, cross-table
  transitions and unknown/special step metadata are not changed automatically.
  Use the native process form for these cases.
- This does not finish the process or mark an Opportunity Won/Lost.

## Permissions, failures and custom rules

Users need read access to process metadata and the BPF table, plus write access
to the selected process instance. Server plugins and server validation still
apply. Failures display the reason and retain the card.

A fresh process version is read before each save. A conditional update prevents
overwriting concurrent process changes. Conflicts refresh the board. Multiple
transitions are **not a transaction**: if a later transition fails, earlier
saved stages remain saved. The message explains this and the refreshed board
shows the actual persisted stage.

**Form JavaScript**, `OnPreStageChange` / `OnStageChange` and form-only rules do
not run for this Web API save. The control conservatively checks persisted
required BPF field values; form logic hiding a required step may therefore
still cause a block. Put additional business rules in server validation or the
existing [card move validator](CONFIGURATION.en.md#move-validation). It is now
also called for BPF with `fieldName: "activestageid"`, the actual stage GUID as
`newValue`, `processInstanceId` and `processName`.

## Check after importing

In your own model-driven app, check forward/backward and multi-stage moves,
every active branch, missing required fields, BPF permissions and concurrent
changes. Also check custom plugins and form rules. Automated regressions and
the browser preview use simulated Dataverse responses; they do not replace
validation in your own environment.
