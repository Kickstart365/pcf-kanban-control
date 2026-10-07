# Kickstart365 Kanban

**Language: English | [Nederlands](README.md)**

A Kanban component for Dataverse views in model-driven Power Apps. This fork
of [novalogica/pcf-kanban-control](https://github.com/novalogica/pcf-kanban-control)
adds compact cards, column totals, column colors, a record side pane and
editable fields on Opportunity cards.

Current version: **control 1.12.0 / solution 1.12.0.0**.

## Download the solutions

| Package 1.12.0.0 | Download |
| --- | --- |
| Managed | [Kickstart365Kanban_1_12_0_0_managed.zip](https://raw.githubusercontent.com/Kickstart365/pcf-kanban-control/main/downloads/1.12.0.0/Kickstart365Kanban_1_12_0_0_managed.zip) |
| Unmanaged | [Kickstart365Kanban_1_12_0_0_unmanaged.zip](https://raw.githubusercontent.com/Kickstart365/pcf-kanban-control/main/downloads/1.12.0.0/Kickstart365Kanban_1_12_0_0_unmanaged.zip) |

Import these ZIPs directly using **Solutions → Import**. For an existing
installation, keep its managed/unmanaged package type. See
[installation and upgrades](docs/DEV-INSTALLATION.en.md) and
[checksums/build source](downloads/1.12.0.0/README.md).

## Configuration guide

The **[complete English configuration guide](docs/CONFIGURATION.en.md)** covers
all 47 settings, defaults and examples. It includes the English Power Apps
maker labels and technical property names so you can find each option.

The same complete guide is available in [Nederlands](docs/CONFIGURATION.md).

From 1.10.0: [one Config (JSON), export and autocomplete schema](docs/CONFIG-JSON.en.md).

- [Opportunity quick start](docs/OPPORTUNITY-CONFIGURATION.en.md)
- [All configuration options](docs/CONFIGURATION.en.md#all-configuration-options)
- [Column colors](docs/CONFIGURATION.en.md#column-colors)
- [Opening records in a side pane or dialog](docs/CONFIGURATION.en.md#opening-records)
- [Editing fields directly on cards](docs/CONFIGURATION.en.md#editing-fields-on-cards)
- [Filters and presets](docs/CONFIGURATION.en.md#filters-and-presets)
- [Troubleshooting](docs/CONFIGURATION.en.md#troubleshooting)

## Component behavior

- Groups records by a Choice field in the view or a Business Process Flow.
- Displays counts and up to two numeric totals per column, separating Money
  amounts by currency.
- Provides compact/expanded cards, date badges, card highlights and column colors.
- Opens existing records and lookups in a side pane or dialog.
- Lets users edit selected writable Opportunity fields directly on cards
  and save automatically when leaving the editor.
- Provides search, field filters, filter presets and sorting.
- Moves Choice cards with saving and optional JavaScript validation.
  BPF dragging saves the process stage and moves the card after success.
  See [BPF dragging (EN)](docs/BPF-DRAG.en.md) / [BPF-slepen (NL)](docs/BPF-DRAG.md).

## Installation and use

Follow [installation and upgrades](docs/DEV-INSTALLATION.en.md) for the managed
or unmanaged solution. The package contains only **Kickstart365 Kanban**;
create/configure the view and include it in your model-driven app.

Open the view in the app and, where available, select **Show as → Kickstart365
Kanban**. Microsoft Kanban is a separate component. See
[the configuration guide](docs/CONFIGURATION.en.md#set-up-in-power-apps)
for the full steps.

## HTML on cards

HTML fields are sanitized with DOMPurify and rendered in a Shadow DOM.
The default allowed tags and attributes are described under
[HTML display](docs/CONFIGURATION.en.md#html-display). Keep the default list
unless other markup is needed; Shadow DOM provides style isolation.

## Development and verification

Use Node 22 and the locked dependencies:

```sh
npm ci --no-audit --no-fund
node --test tests/*.test.cjs
npm run lint
npm run build -- --buildMode production
```

The Windows workflow builds and verifies both solution packages.
[Installation and build](docs/DEV-INSTALLATION.en.md),
[technical foundation](docs/OPPORTUNITY-FOUNDATION.md) and
[1.9 interaction/pilot checks](docs/INTERACTION-SETTINGS.md) provide further
technical details. Test native side pane integration and saves in the intended
Sales app.

## Origin and license

The original MIT license and attribution are retained; see [LICENSE](LICENSE).
[KICKSTART365.md](docs/KICKSTART365.md) describes the initial fork changes.
Contributions through issues and pull requests are welcome.
