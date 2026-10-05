# Config (JSON): één inrichting voor je Kanban

**Taal: Nederlands | [English](CONFIG-JSON.en.md)**

Vanaf **control 1.10.0 / solution 1.10.0.0** kun je alle 46 bestaande opties
instellen via één extra property: **Config (JSON)** (`config`). De losse
instellingen blijven ondersteund. De JSON vervangt geen Dataverse-view:
voeg de benodigde kolommen nog steeds toe aan de view.

## Beginnen

1. Importeer de nieuwe solution met hetzelfde managed/unmanaged-pakkettype
   als je huidige installatie.
2. Open **Kickstart365 Kanban** bij **Components** in de view-editor.
3. Plak één JSON-object in **Config (JSON)** en sla de componentconfiguratie op.
4. Houd de losse numerieke instellingen **Side pane width** en
   **Close date warning days** gevuld met geldige getallen, bijvoorbeeld `600`
   en `7`. Power Apps valideert deze vóór de control draait, ook wanneer de
   JSON een andere runtimewaarde opgeeft.
5. Sla de view op en publiceer. Herlaad de app en controleer de inrichting.

De property gebruikt het PCF-type `Multiple`, zodat de gecombineerde
configuratie niet aan het type `SingleLine.TextArea` met 4.000 tekens is
gebonden. Eventuele beperkingen van de gebruikte Power Apps-editor blijven
van toepassing.

## Opportunity-voorbeeld

Zie het kopieerbare bestand [opportunity.config.json](../examples/opportunity.config.json).
Het schakelt compacte kaarten, zijpaneel, expliciete bewerkbare velden,
datumlabels, kolomkleuren en omzettotalen in. Pas BPF-fasenamen/IDs aan je
omgeving aan. Gebruik de namen van de velden die werkelijk in je view staan.
Neem `transactioncurrencyid` op voor geldtotalen. `ownerid` en `customerid`
worden in dit voorbeeld alleen getoond; lookups worden niet inline bewerkt.

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
      "estimatedvalue": { "displayName": "Geschatte omzet", "hideLabel": true },
      "ownerid": { "persona": true },
      "description": { "width": 100, "ellipsis": true }
    }
  },
  "filters": { "quickFilters": ["estimatedvalue", { "field": "ownerid", "inPopup": true }] },
  "notifications": { "position": "top-right" }
}
```

## Bestaande inrichting overnemen

Open het board in de app en kies **Configuratie exporteren → JSON kopiëren**.
Plak die JSON in **Config (JSON)** in de view-editor. Er is geen consolecommando
nodig. De export bevat de effectieve makerinstellingen van dit board, inclusief
geldige JSON-overrides. Recordgegevens, dataset/viewdefinitie, zoektekst,
persoonlijke filterkeuzes en de tijdelijk gekozen kaartdichtheid staan er niet in.

Controleer na opslaan/publiceren dat het board hetzelfde werkt. Je hoeft de
losse instellingen niet te wissen: ze blijven als terugval beschikbaar. Wis je
ze later, houd dan de twee numerieke instellingen gevuld zoals hierboven.
Voor een nieuw board kan een export meteen als startpunt dienen.

De export bundelt de normale veldopmaak onder `card.fields`. Lege lijsten
blijven als collectie staan om expliciet te kunnen wissen. Highlights blijven
als geordende `card.highlights`-array staan, zodat hun voorrangsregels behouden
blijven. Ongeldige of niet exporteerbare losse waarden worden gemeld; de
kopieerknop is dan uitgeschakeld en de JSON-preview is onvolledig. Herstel die
instellingen vóór migratie. Wanneer browserbeleid kopiëren blokkeert, selecteer
je de JSON en gebruik je Ctrl+C (Cmd+C op Mac).

## Voorrang en fouten

- Een opgegeven geldige JSON-waarde wint van de losse property. Ontbreekt
  de waarde, dan blijft de losse property gelden en daarna de runtime-default.
- `false`, `0`, `""` en `[]` zijn expliciete waarden. `null` is ongeldig,
  behalve `card.fields.<veld>.highlight: null`: dat wist dat veldhighlight.
- `card.fields` wijzigt per veld én per instelling. `ownerid.hidden: false`
  verwijdert alleen `ownerid` uit de verborgen velden; andere verborgen velden
  blijven behouden. Een lege `card.fields: {}` wijzigt niets.
- Collecties zoals `card.hiddenFields` of `filters.quickFilters` vervangen
  de hele lijst. `[]` wist deze lijst. Voor veldopmaak geldt de volgorde:
  `card.fields` → collectie in dezelfde JSON → losse property → default.
- Getallen zijn JSON-getallen en booleans zijn `true`/`false`, geen strings.
  Kolomkleuren gebruiken zesdelige hexkleuren. Breedtes en aantallen worden
  op hun toegestane bereik gecontroleerd.
- Een onleesbaar document of een niet ondersteunde `schemaVersion` gebruikt
  de losse instellingen. Een ongeldige sectie/waarde valt afzonderlijk terug;
  een ongeldige array valt als geheel terug. Geldige andere secties blijven werken.
- De banner **Configuratiefouten** noemt het exacte pad, bijvoorbeeld
  `config.card.open.width`. Onbekende keys/typefouten worden gemeld en genegeerd.
  Herstelde fouten verdwijnen bij de volgende configuratie-update.

## Veldopmaak

| Key in `card.fields.<logicalName>` | Waarde | Werking |
| --- | --- | --- |
| `hidden`, `hideLabel`, `html`, `ellipsis` | Boolean | Voeg dit veld toe aan / verwijder dit veld uit de betreffende instelling. |
| `displayName` | String | Eigen label; een lege waarde valt terug op het bestaande veldlabel. |
| `width` | Getal `1`–`100` | Breedte in procenten. |
| `persona` | `true`, `false` of `"iconOnly"` | Lookup met naam/avatar, normale lookup of alleen icoon. Wijzigt ook de icoonmodus van dit veld. |
| `personaIconOnly` | Boolean | Afzonderlijke icoonoptie, gebruikt voor verliesloze export van bestaande configuraties. |
| `highlight` | `{color,type}` of `null` | Vervang/wis highlights voor dit veld. `type` is optioneel en standaard `left`. |

De betekenis van HTML, highlights, bewerken, valuta en BPF-fasen blijft zoals
beschreven in de [complete handleiding](CONFIGURATION.md). De configuratie geeft
geen extra schrijfrechten en maakt ontbrekende viewkolommen niet aan.

## Schema en alle opties

Voeg dit toe aan je JSON-bestand voor autocomplete en validatie in een editor
met JSON Schema-ondersteuning:

```json
{
  "$schema": "https://raw.githubusercontent.com/Kickstart365/pcf-kanban-control/main/docs/kanban-config.schema.json",
  "schemaVersion": 1
}
```

[kanban-config.schema.json](kanban-config.schema.json) wordt met dezelfde
definities als de runtime gevalideerd. `schemaVersion` mag ontbreken en wordt
dan als versie 1 behandeld; exports voegen hem toe. Het schema wordt niet bij
runtime van het internet geladen. De mapping hieronder dekt alle 46 losse
opties; de collectie-vormen voor veldopmaak zijn optioneel naast `card.fields`.

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

Het ontwerp is geïnspireerd door de
[gecombineerde configuratie van vonmaehlen](https://github.com/vonmaehlen/pcf-kanban-control/tree/feat/form-id-by-field#config-all-settings-in-one-json).
Deze implementatie gebruikt de opties en bestaande runtime van Kickstart365.
