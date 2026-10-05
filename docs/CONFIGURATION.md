# Kickstart365 Kanban: complete configuratiehandleiding

**Taal: Nederlands | [English](CONFIGURATION.en.md)**

Voor **control 1.9.1 / solution 1.9.1.0**. Deze handleiding beschrijft alle
**46 inputinstellingen** uit `ControlManifest.Input.xml`, gecontroleerd tegen
de implementatie. `dataset` is de gekoppelde Dataverse-weergave en staat los
van die 46 opties. Alle inputinstellingen zijn optioneel.

## Solutions downloaden

Dit zijn de gecontroleerde pakketten van **1.9.1.0** uit de geslaagde build
van [`main` op `759bdd6`](https://github.com/Kickstart365/pcf-kanban-control/actions/runs/37283524363).
Elke link downloadt rechtstreeks een importeerbare solution-ZIP.

| Pakket | Download | Gebruik |
| --- | --- | --- |
| Managed | [Kickstart365Kanban_1_9_1_0_managed.zip](https://raw.githubusercontent.com/Kickstart365/pcf-kanban-control/main/downloads/1.9.1.0/Kickstart365Kanban_1_9_1_0_managed.zip) | Installeren of bijwerken van een bestaande managed installatie. |
| Unmanaged | [Kickstart365Kanban_1_9_1_0_unmanaged.zip](https://raw.githubusercontent.com/Kickstart365/pcf-kanban-control/main/downloads/1.9.1.0/Kickstart365Kanban_1_9_1_0_unmanaged.zip) | Ontwikkeling/customization of bijwerken van een bestaande unmanaged installatie. |

Importeer de gedownloade ZIP via **Solutions → Import** in Power Apps. Houd
bij een bestaande installatie hetzelfde managed/unmanaged-pakkettype aan.
Deze directe downloads hoef je niet uit te pakken.
[Checksums en buildherkomst](../downloads/1.9.1.0/README.md) staan bij de downloads.

## Inhoud

- [Solutions downloaden](#solutions-downloaden)
- [Instellen in Power Apps](#instellen-in-power-apps)
- [Veldnamen, JSON en standaardwaarden](#veldnamen-json-en-standaardwaarden)
- [Alle configuratieopties](#alle-configuratieopties)
- [Opportunity: aanbevolen inrichting](#opportunity-aanbevolen-inrichting)
- [Groeperen en BPF-fases](#groeperen-en-bpf-fases)
- [Kolomkleuren](#kolomkleuren)
- [Kolombreedtes](#kolombreedtes)
- [Kolomtotalen en valuta](#kolomtotalen-en-valuta)
- [Compacte kaarten en datumlabels](#compacte-kaarten-en-datumlabels)
- [Records openen](#records-openen)
- [Velden op de kaart bewerken](#velden-op-de-kaart-bewerken)
- [Kaartopmaak](#kaartopmaak)
- [HTML-weergave](#html-weergave)
- [Filters en presets](#filters-en-presets)
- [Sorteren](#sorteren)
- [Validatie bij verplaatsen](#validatie-bij-verplaatsen)
- [Meldingen](#meldingen)
- [Problemen oplossen](#problemen-oplossen)

## Instellen in Power Apps

1. Importeer de solution in de gewenste omgeving. Gebruik bij een bestaande
   installatie hetzelfde pakkettype: managed bij managed, unmanaged bij unmanaged.
   Zie [installatie en upgrades](DEV-INSTALLATION.md).
2. Maak/open een weergave voor **Opportunity**. Zet `name` als eerste kolom;
   deze levert de kaarttitel. Voeg alle velden toe die je wilt tonen, filteren,
   sorteren, bewerken of optellen. Alleen een naam in de configuratie invullen
   voegt geen veld toe aan de weergave.
3. Voeg **Kickstart365 Kanban** toe aan de dataset/controlconfiguratie voor de
   weergave. Het beschikbare configuratiescherm kan per Power Apps-designer
   verschillen. Gebruik de Engelse labels in de tabellen hieronder.
4. Voer tekst-/JSON-opties als vaste configuratiewaarde in. Gebruik bij
   TwoOptions de Ja/Nee-keuze en bij Enum de aangeboden keuzelijst.
   Laat **Side pane width** en **Close date warning days** niet leeg: gebruik
   respectievelijk `600` en `7`, of andere geldige gehele getallen. Vanaf
   control 1.9.1 biedt het manifest deze standaardwaarden ook in de maker aan.
5. Sla de configuratie en weergave op en publiceer de wijzigingen. Controleer
   dat de weergave in de model-driven app beschikbaar is; publiceer ook de app
   als je de appconfiguratie hebt gewijzigd.
6. Open de app en selecteer de weergave. Kies zo nodig **Show as / Weergeven als
   → Kickstart365 Kanban**. Alleen de naam van een weergave veranderen naar
   "Kanban view" activeert het component niet. Microsoft Kanban is een andere control.
7. Herlaad de app en controleer of de ingevulde instellingen na opnieuw openen
   van de configuratie nog aanwezig zijn.

Het solution-pakket bevat uitsluitend het component. De Opportunity-weergave,
Business Process Flow, custom velden en model-driven app worden niet meegeleverd.

## Veldnamen, JSON en standaardwaarden

Gebruik **logische veldnamen**, zoals `estimatedvalue`, niet het zichtbare label
"Estimated Revenue". De naam moet exact overeenkomen met de kolom in de dataset.
Bij gekoppelde tabellen kan dat een volledige alias zijn, zoals `a_account.ownerid`.
De configureerbare inline editor ondersteunt uitsluitend directe Opportunity-
veldnamen, zonder alias.

Gebruik `name` voor het Opportunity-titelveld. `title` is een interne kaartwaarde
en hoort niet in `sortFields`, `compactCardFields` of andere veldlijsten.
Een verborgen detailveld kan nog steeds worden gebruikt voor filters of totalen.
De titel uit de eerste weergavekolom blijft zichtbaar.

In de tabellen betekent:

| Formaat | Invoer |
| --- | --- |
| Ja/Nee | TwoOptions in de maker; in technische voorbeelden `true` / `false`. |
| Keuze | Enum in de maker; de tabel vermeldt de onderliggende waarde. |
| Veldlijst | JSON-array zoals `["ownerid","estimatedvalue"]`, of `ownerid,estimatedvalue`. De volgorde wordt gebruikt waar relevant. |
| JSON-array / JSON-object | Geldige JSON met dubbele aanhalingstekens, zonder comments of afsluitende komma. |
| Getal / pixels | Een getal; bij tekstinstellingen voor breedte/aantal alleen de cijfers invullen, bijvoorbeeld `320`. |

Een standaardwaarde geldt als een instelling **niet is opgegeven**. Een lege
JSON-array `[]` is een expliciete lege lijst: gebruik deze bijvoorbeeld om geen
compacte detailvelden of geen inline bewerkbare velden te selecteren. Een lege
tekst kan door de maker als "niet opgegeven" worden aangeleverd; gebruik voor
uitschakelen liever de beschikbare aan/uit-optie of `[]`.

## Alle configuratieopties

### Groepering en recordacties — 10 opties

| Property | Label in Power Apps | Formaat / standaard | Werking |
| --- | --- | --- | --- |
| `defaultView` | Default View By | Tekst; eerste beschikbare groepering | Exacte zichtbare naam van het gewenste BPF of Choice-veld in **View By**. Dit is niet de naam van de Dataverse-weergave. |
| `filteredBusinessProcessFlows` | Filter out Business Process Flows | JSON-array met BPF-namen; `[]` | Sluit de genoemde processen uit. Alleen actieve BPF's worden aangeboden. |
| `businessProcessFlowStepOrder` | Business Process Flow Step Order | JSON-array met `{id,order}`; native procesvolgorde | `id` is de exacte fasenaam. Lager `order` komt eerder; niet genoemde fases houden hun native volgordewaarde. |
| `hideViewBy` | Hide View By if default View By set? | Ja/Nee; uit | Verbergt **View By** wanneer aan, ook als geen `defaultView` is ingevuld. Stel de gewenste groepering eerst in. |
| `allowCardMove` | Allow moving cards | Ja/Nee; aan als niet opgegeven | Staat slepen toe. Choice: veldwaarde opslaan. BPF: native recordformulier openen om de fase daar te wijzigen. |
| `cardMoveValidationFunction` | Card move validation function | Tekst; geen | Globale JavaScript-functienaam, bijvoorbeeld `K365.Kanban.beforeMove`. Geldt voor verplaatsingen tussen Choice-kolommen. |
| `cardMoveValidationScript` | Card move validation script (web resource) | Tekst; geen | Naam van de JavaScript-webresource die de bovenstaande functie beschikbaar maakt, inclusief publisherprefix en pad. |
| `showOpenInNewTabButton` | Show open in new tab button on card | Ja/Nee; uit | Extra knop op elke kaart om het record in een nieuw browsertabblad te openen. |
| `hideEmptyColumns` | Hide empty columns | Ja/Nee; uit | Verbergt kolommen zonder kaarten na toepassing van de actieve filters en zoekterm. |
| `allowCreateNew` | Allow creating new records from board | Ja/Nee; aan als niet opgegeven | Toont de plusknop per kolom. Nieuwe records openen altijd in een dialoog. |

### Openen en bewerken — 4 opties

| Property | Label in Power Apps | Formaat / standaard | Werking |
| --- | --- | --- | --- |
| `recordOpenMode` | Open records in | Keuze: `sidePane` / `dialog`; `sidePane` | Opent bestaande records en lookups naast het bord of in een centrale dialoog. Valt terug op een dialoog als een zijpaneel niet beschikbaar is. |
| `sidePaneWidth` | Side pane width | Getal; `600` pixels | Geldig van `300` t/m `1200`; ongeldige invoer gebruikt `600`. Alleen voor het zijpaneel. |
| `allowInlineEdit` | Editing fields on cards | Keuze: `enabled` / `disabled`; `enabled` | Schakelt de kaarteditor voor Opportunity in of uit. Dit verleent geen extra Dataverse-rechten. |
| `inlineEditFields` | Editable card fields | Veldlijst; `estimatedvalue,closeprobability,estimatedclosedate` | Expliciete lijst van bewerkbare velden. Vereist een ondersteund schrijfbaar veld in de weergave en zichtbaar op de kaart. `[]` selecteert geen velden. |

### Compacte kaarten, datums en totalen — 7 opties

| Property | Label in Power Apps | Formaat / standaard | Werking |
| --- | --- | --- | --- |
| `compactCards` | Start with compact cards | Ja/Nee; uit | Start compact wanneer aan. De gebruiker kan via de werkbalk altijd Compact/Uitgebreid kiezen. |
| `compactCardFields` | Compact card fields | Veldlijst; `parentaccountid,estimatedvalue,closeprobability,estimatedclosedate,ownerid` | Detailvelden en hun volgorde in compacte kaarten. Verborgen velden blijven verborgen; `[]` toont alleen de titel en eventuele badge/acties. |
| `showCloseDateBadges` | Show close date badges | Ja/Nee; uit | Toont een label voor verlopen, vandaag, binnenkort of later. Voeg `statecode` toe om labels bij gesloten Opportunities te onderdrukken. |
| `closeDateField` | Close date field | Veldnaam; `estimatedclosedate` | Datumveld voor het label; moet in de weergave staan. |
| `closeDateWarningDays` | Close date warning days | Geheel getal; `7` | Aantal dagen vooruit voor "binnenkort", inclusief de laatste dag. `0` is geldig; negatief/ongeldig gebruikt `7`. |
| `columnTotalField` | Column total field | Veldnaam; `estimatedvalue` | Eerste numerieke som per kolom. Money vereist `transactioncurrencyid`, behalve `_base`-velden. |
| `columnSecondaryTotalField` | Secondary column total field | Veldnaam; geen | Tweede numerieke som, bijvoorbeeld een bestaande gewogen omzet. Hetzelfde veld als de eerste som wordt niet dubbel getoond. |

### Kaartinhoud en opmaak — 13 opties

| Property | Label in Power Apps | Formaat / standaard | Werking |
| --- | --- | --- | --- |
| `hideColumnFieldOnCard` | Hide column field on card | Ja/Nee; uit | Verbergt het Choice-veld dat voor de huidige groepering wordt gebruikt. Bij BPF-groepering wordt hiermee geen afzonderlijk Opportunity-faseveld verborgen. |
| `hiddenFieldsOnCard` | Hidden fields on card | Veldlijst; `[]` | Laadt velden via de weergave, maar verbergt ze in kaartdetails, ook na uitklappen. Verbergt de titel niet. |
| `htmlFieldsOnCard` | HTML fields on card | Veldlijst; `[]` | Toont geselecteerde detailvelden als opgeschoonde HTML. HTML-detailvelden krijgen geen inline editor. |
| `allowedHtmlTagsOnCard` | Allowed HTML tags on card | Kommalijst; zie [HTML-weergave](#html-weergave) | Toegestane HTML-tags. Een expliciete lege string verwijdert tags en behoudt de tekst. |
| `allowedHtmlAttributesOnCard` | Allowed HTML attributes on card | Kommalijst; `href` | Toegestane HTML-attributen. Een expliciete lege string staat geen attributen toe. |
| `hideLabelForFieldsOnCard` | Hide label for fields on card | Veldlijst; `[]` | Toont de waarde zonder veldlabel. |
| `fieldDisplayNamesOnCard` | Field display names on card | JSON-array met `{logicalName,displayName}`; weergavelabels | Eigen kaartlabels; wordt ook gebruikt voor veldnamen in filter- en sorteerkeuzes. Een leeg kaartlabel valt terug op het oorspronkelijke label. |
| `booleanFieldHighlights` | Field highlights | JSON-array met `{logicalName,color,type}`; geen | Kleurrand of hoekaccent bij een passende veldwaarde. Werkt ook voor andere veldtypen; zie [kaartopmaak](#kaartopmaak). |
| `fieldWidthsOnCard` | Field widths on card | JSON-array met `{logicalName,width}`; natuurlijke breedte | Breedte in procenten, groter dan `0` en maximaal `100`. `100` is volle breedte; `50` is een halve rij. |
| `lookupFieldsAsPersonaOnCard` | Lookup fields as Persona on card | Veldlijst; `[]` | Toont lookups als Persona met initialen en naam. Deze versie haalt geen profielfoto op. |
| `lookupFieldsPersonaIconOnlyOnCard` | Lookup Persona icon only on card | Veldlijst; `[]` | Alleen het initialenicoon, met naam als tooltip. Vereist dat het veld ook in `lookupFieldsAsPersonaOnCard` staat. |
| `showEmailAndPhoneAsLinks` | Show E-Mail and Phone as links on card | Ja/Nee; uit | Herkent e-mail-/telefoontypen in de dataset en toont `mailto:`-/`tel:`-links. |
| `ellipsisFieldsOnCard` | Ellipsis fields on card | Veldlijst; `[]` | Geselecteerde detailwaarden op één regel met `…`; overige detailwaarden gebruiken meerdere begrensde regels. De titel heeft al een eigen afkorting. |

### Filters en sortering — 5 opties

| Property | Label in Power Apps | Formaat / standaard | Werking |
| --- | --- | --- | --- |
| `quickFilterFields` | Quick filter fields | Veldlijst; `[]` | Filtervelden in opgegeven volgorde, uitsluitend uit de dataset. Datum/getal krijgen een bereikfilter; tekst/lookups meestal multiselect; Boolean een enkele keuze. Zie ook de opmerking over typeherkenning bij [filters](#filters-en-presets). |
| `quickFilterFieldsInPopup` | Quick filter fields in popup | Veldlijst; `[]` | Verplaatst een deel van de quick filters naar **Meer filters**. Moet een subset van `quickFilterFields` zijn. |
| `sortFields` | Sort fields | Veldlijst; `[]` | Velden waarvoor de gebruiker oplopend/aflopend kan sorteren. |
| `defaultSort` | Default sort | JSON-object `{field,direction}`; geen | Eerste sortering als geen opgeslagen sorteerkeuze aanwezig is. `field` moet ook in `sortFields` en de weergave staan; `direction` is `asc` of `desc`. |
| `filterPresets` | Filter presets | JSON-array met `{id,label,filters}`; `[]` | Benoemde combinaties van quick filters. De gebruikte velden moeten in `quickFilterFields` staan. |

### Bordlayout, kleuren en meldingen — 7 opties

| Property | Label in Power Apps | Formaat / standaard | Werking |
| --- | --- | --- | --- |
| `columnColors` | Column colors | JSON-array met `{id,color}`; geen | Kleuraccent bovenaan de kolom en een lichte achtergrond. `color`: zes hex-cijfers met `#`; `id`: fase-GUID, exacte fasenaam of Choice-waarde. |
| `expandBoardToFullWidth` | Expand board to full width | Ja/Nee; uit | Verdeelt beschikbare breedte over de kolommen, met behoud van ingestelde minima/maxima. Zo nodig horizontaal scrollen. |
| `minColumnWidth` | Minimum column width | Tekst met pixels; `400` | Geldig van `200` t/m `1200`; leeg/ongeldig gebruikt de standaard. |
| `maxColumnWidth` | Maximum column width | Tekst met pixels; geen limiet | Geldig van `200` t/m `2000`; leeg/ongeldig stelt geen maximum in. Kies een maximum dat minstens het minimum is. |
| `initialCardsVisible` | Initial cards visible per column | Tekst met aantal; `30` | Geldig van `1` t/m `500`; leeg/ongeldig gebruikt `30`. Scrollen toont telkens 30 extra kaarten. Beperkt de totalen niet. |
| `columnWidths` | Column widths | JSON-array met `{id,width}`; geen | Vaste breedte per kolom; numerieke pixels worden begrensd tot `200`–`1200`. `id`: exacte fasenaam, Choice-waarde of `unallocated`; geen fase-GUID. Gaat vóór algemene breedtes. |
| `notificationPosition` | Notification Position | Keuze; Top End (`top-right`) | Positie van toastmeldingen. Zie [alle zes waarden](#meldingen). |

## Opportunity: aanbevolen inrichting

Voeg deze kolommen aan de weergave toe:

| Kolom | Doel |
| --- | --- |
| `name` als eerste | Kaarttitel; gebruik dit veld ook voor sortering op titel. |
| `parentaccountid` | Bedrijf. Gebruik je eigen bedrijfslookup als je omgeving die gebruikt. |
| `estimatedvalue` | Omzet op de kaart, eerste kolomtotaal en optioneel bewerken. |
| `closeprobability` | Kanspercentage; optioneel bewerken. |
| `estimatedclosedate` | Sluitingsdatum, badges, datumfilters en optioneel bewerken. |
| `ownerid` | Eigenaar, Persona en "Mijn opportunities"-filter. |
| `transactioncurrencyid` | Correcte valuta-uitsplitsing van Money-totalen. |
| `statecode` | Open/gesloten herkennen voor kaarten en datumlabels. |
| Optioneel `sparked_estimatedweightedrevenue` | Tweede totaal als dit custom veld daadwerkelijk bestaat. |

Stel daarna dit startprofiel in. De tabel bevat **afzonderlijke propertywaarden**;
dit is geen JSON-bestand dat je in één keer in de control kunt importeren.

| Property | Waarde |
| --- | --- |
| `defaultView` | Exacte naam van het gewenste BPF uit **View By** |
| `recordOpenMode` | Side pane (`sidePane`) |
| `sidePaneWidth` | `600` |
| `compactCards` | Ja |
| `compactCardFields` | `["parentaccountid","estimatedvalue","closeprobability","estimatedclosedate","ownerid"]` |
| `hiddenFieldsOnCard` | `["transactioncurrencyid","statecode"]` |
| `allowInlineEdit` | Enabled (`enabled`) |
| `inlineEditFields` | `["estimatedvalue","closeprobability","estimatedclosedate"]` |
| `showCloseDateBadges` | Ja |
| `closeDateField` | `estimatedclosedate` |
| `closeDateWarningDays` | `7` |
| `columnTotalField` | `estimatedvalue` |
| `columnSecondaryTotalField` | Niet instellen, of een bestaand numeriek veld |
| `hideEmptyColumns` | Nee |
| `minColumnWidth` | `320` |
| `quickFilterFields` | `["ownerid","parentaccountid","estimatedclosedate","estimatedvalue"]` |
| `quickFilterFieldsInPopup` | `["parentaccountid","estimatedvalue"]` |
| `sortFields` | `["estimatedvalue","estimatedclosedate","name"]` |
| `defaultSort` | `{"field":"estimatedclosedate","direction":"asc"}` |
| `lookupFieldsAsPersonaOnCard` | `["ownerid"]` |

Gebruikt jouw omgeving bijvoorbeeld **`bcbi_companyid`** als bedrijfslookup?
Voeg die kolom toe en vervang `parentaccountid` in de compacte velden en filters
door `bcbi_companyid`. Het component maakt dit veld niet aan.

Voeg de kleuren en presets uit de voorbeelden hieronder toe als die bij je
proces passen. Controleer eerst de echte BPF- en fasenamen.

## Groeperen en BPF-fases

**View By** (*Groeperen op* in de Nederlandse UI) biedt de Choice-velden die
in de dataset als `OptionSet` voorkomen en de beschikbare actieve BPF's voor
de tabel. Zonder geldige `defaultView`
wordt de eerste beschikbare groepering gekozen; Choice-groeperingen komen vóór
de BPF's. Gebruik dus de exacte zichtbare BPF-naam, bijvoorbeeld
`Opportunity Sales Process`, uitsluitend als jouw proces zo heet.

`filteredBusinessProcessFlows` is een **uitsluitlijst**, bijvoorbeeld:

```json
["Project Service - Opportunity Sales Process"]
```

Voor `businessProcessFlowStepOrder`:

```json
[
  { "id": "Qualify", "order": 0 },
  { "id": "Develop", "order": 1 },
  { "id": "Propose", "order": 2 },
  { "id": "Close", "order": 3 }
]
```

Gebruik fasenamen, geen GUID's. Nummer vanaf `0` om goed aan te sluiten op de
native volgordewaarden. Geef bij een volledige eigen volgorde alle fases op;
anders kunnen native en eigen nummers gelijk zijn. De instelling geldt op
fasenaam voor de aangeboden processen. Fases met dezelfde naam worden binnen
één proces samengevoegd tot één kolom.

Records zonder gevonden fase in het gekozen BPF komen in **Unallocated /
Niet toegewezen**. Die kolom verschijnt alleen als er zulke records zijn na
filtering. Bij groepering op `statuscode` worden alleen statusredenen voor de
actieve toestand (`statecode = 0`) als gewone kolom aangeboden; andere waarden
kunnen daardoor bij Niet toegewezen terechtkomen.

Slepen met de greep naar een andere **Choice-kolom** schrijft de Choice-waarde;
een mislukte save of afgewezen validator zet de kaart terug. Binnen dezelfde
kolom herschikken is tijdelijk en wordt niet als recordvolgorde opgeslagen.
Slepen tussen **BPF-kolommen** opent het native formulier in de ingestelde
openmodus. Wijzig en bewaar de fase daar; de bestemmingsfase wordt niet
automatisch ingevuld. BPF-verplichtingen en branchregels blijven in het formulier.

De plusknop opent een nieuw record in een dialoog. Bij Choice-groepering wordt
de kolomwaarde meegegeven als beginwaarde; bij BPF wordt geen fase vooringevuld.

## Kolomkleuren

Voer bij `columnColors` in:

```json
[
  { "id": "Qualify", "color": "#0078D4" },
  { "id": "Develop", "color": "#009C91" },
  { "id": "Propose", "color": "#8764B8" },
  { "id": "Close", "color": "#107C41" },
  { "id": "unallocated", "color": "#697580" }
]
```

Gebruik exact de fasenamen in jouw proces. Voor BPF mag `id` ook de exacte
`processstageid`-GUID zijn. Een match op de GUID heeft voorrang op een match op
de fasenaam. Gebruik voor Choice-kolommen de opgeslagen numerieke waarde als
string, bijvoorbeeld `{ "id": "1", "color": "#0078D4" }`; gebruik de echte
waarde van jouw veld. Bij dubbele passende regels wordt de eerste match gebruikt.

Alleen `#RRGGBB` is geldig: `#ff0`, `red` en `rgba(...)` werken hier niet.
Een ongeldige regel maakt de kleurconfiguratie ongeldig en geeft een melding.
Niet genoemde kolommen houden de standaardachtergrond. De kaartachtergrond
blijft behouden. Kleuren worden door de maker ingesteld; er is geen
kleurenkiezer voor gebruikers op het bord.

## Kolombreedtes

Voor `columnWidths`, bijvoorbeeld:

```json
[
  { "id": "Qualify", "width": 300 },
  { "id": "Develop", "width": 340 },
  { "id": "unallocated", "width": 280 }
]
```

Deze vaste kolombreedtes gaan vóór `minColumnWidth` en `maxColumnWidth`, ook
bij `expandBoardToFullWidth`. Kolommen zonder eigen breedte volgen de algemene
layout. `columnWidths` matcht op fasenaam of Choice-waarde, niet op de fase-GUID;
dit verschilt van `columnColors`. Bij dubbele ids geldt de laatst ingevoerde
breedte. Vul gehele pixels in en houd het algemene maximum minstens gelijk
aan het minimum.

## Kolomtotalen en valuta

De header toont het aantal kaarten en de som van de gekozen velden voor de
**actieve Dataverse-weergave plus de bordfilters en zoekterm**. Alle door de
host geladen pagina's tellen mee; `initialCardsVisible` bepaalt uitsluitend
hoeveel kaarten meteen worden gerenderd. Het component laadt volgende
datasetpagina's voordat het bord wordt opgebouwd. Totalen omvatten geen records
buiten de weergave of buiten de toegangsrechten van de gebruiker.

- Voor `estimatedvalue` voeg je **`transactioncurrencyid`** toe aan de weergave.
  Je kunt dit veld met `hiddenFieldsOnCard` verbergen.
- Transaction Money wordt per valuta opgeteld, met de valutanaam erbij.
  Er vindt geen valutaomrekening plaats.
- Voor één totaal in basisvaluta kun je `estimatedvalue_base` gebruiken en dat
  veld aan de weergave toevoegen. `_base`-totalen hebben geen verondersteld
  valutasymbool; het bedrag is in de basisvaluta van de organisatie.
- Gehele/decimale getallen vereisen geen valutakolom. Alleen eindige numerieke
  raw values worden opgeteld; lege bedragen tellen niet mee. Een lege kolom toont `0`.
- De veldlabels komen voor totalen uit de weergave. De kaartlabel-overrides
  veranderen deze headerlabels niet. Bedragen worden met twee decimalen getoond.
- Een gekozen veld dat ontbreekt in de weergave levert geen totaalregel op.
  Als de host een expliciete lege string aanlevert, schakelt die de eerste
  totaalregel uit; niet opgegeven gebruikt weer `estimatedvalue`.

Een tweede totaal kan een bestaand veld zoals `sparked_estimatedweightedrevenue`
gebruiken. Het component berekent geen gewogen omzet en maakt het veld of de
bijbehorende cloudflow niet aan. Vernieuw het bord nadat een flow het veld heeft
bijgewerkt. Houd zulke door een flow beheerde velden buiten de inline edit-lijst.

## Compacte kaarten en datumlabels

`compactCards = Ja` bepaalt de beginstand. Met **Compact / Uitgebreid** wisselt
de gebruiker de weergave. In compacte modus toont **Details** de overige
detailvelden op één kaart; velden uit `hiddenFieldsOnCard` blijven verborgen.
De titel staat los van `compactCardFields`. Uitgebreide detailvelden volgen de
weergavevolgorde, compacte detailvelden volgen de ingestelde lijst.

Datumlabels gebruiken lokale kalenderdagen: verlopen, vandaag, binnen de
waarschuwingsperiode of later. Met `closeDateWarningDays = 7` valt ook dag 7
onder "binnenkort". Een ontbrekende/ongeldige datum geeft geen label. Staat het
datumveld in `hiddenFieldsOnCard`, dan wordt ook de badge verborgen. Voeg
`statecode` toe: alleen open Opportunities krijgen dan een badge. Zonder dit
veld kan het component de badge niet onderdrukken voor gesloten records.

## Records openen

Kies bij **Open records in**:

| Makerkeuze | Waarde | Gedrag |
| --- | --- | --- |
| Side pane | `sidePane` | Eén herbruikbaar, sluitbaar native zijpaneel naast het bord. |
| Dialog | `dialog` | Native formulier in een centrale dialoog. |

Klik op de **kaarttitel** of een **lookup** om te openen. Gebruik de aparte
greep om te slepen en het potlood om een veld te bewerken. Nieuwe records
openen in beide modi in een dialoog. De extra nieuw-tabbladknop heeft zijn
eigen werking, onafhankelijk van `recordOpenMode`.

Het zijpaneel vereist dat de web model-driven host `Xrm.App.sidePanes` beschikbaar
maakt. Zonder deze integratie gebruikt de control een dialoog met een melding.
Test dit in de beoogde app; de app-API is geen gedocumenteerde PCF-context-API.
Volgens [Microsofts zijpaneeldocumentatie](https://learn.microsoft.com/en-us/power-apps/developer/model-driven-apps/clientapi/create-app-side-panes)
ondersteunen native mobiele spelers dit zijpaneel niet. Bij wisselen van
records handelt het native formulier eventuele niet-opgeslagen wijzigingen af.

Bij een open zijpaneel controleert het bord ongeveer iedere 10 seconden of
`modifiedon` is gewijzigd en vernieuwt het dan de data. Deze controle pauzeert
in een verborgen browsertab, tijdens inline bewerken/slepen en bij datasetladen.
Sluiten van het paneel vernieuwt bij de volgende controle. Gebruik **Verversen**
na een uitsluitend BPF-gerelateerde wijziging of een vertraagde cloudflow-update.

## Velden op de kaart bewerken

Dit is beschikbaar voor **Opportunity**. Alleen tonen op de kaart maakt een
veld nog niet bewerkbaar: voeg het toe aan de weergave én `inlineEditFields`.
Voeg het ook aan `compactCardFields` toe als het meteen compact zichtbaar moet
zijn, of open Details. Je kunt ook het titelveld `name` selecteren.

Voor `inlineEditFields`, bijvoorbeeld:

```json
["estimatedvalue", "closeprobability", "estimatedclosedate", "description", "k365_nextstep"]
```

`k365_nextstep` is een voorbeeld: vervang het door een bestaand, schrijfbaar
veld in jouw omgeving. Gebruik `[]` voor geen geselecteerde velden, of kies
**Editing fields on cards → Disabled** om alle kaartbewerking uit te schakelen.

| Veldtype | Direct bewerken |
| --- | --- |
| Gewone tekst, e-mail, telefoon, meerdere regels tekst | Ja, als metadata schrijven toestaat. |
| Geheel getal, decimal, floating point, Money | Ja, met metadata-grenzen. |
| Datum met **DateOnly behavior** en datasettype `DateAndTime.DateOnly` | Ja. Alleen Date Only-weergave van een UserLocal-veld is onvoldoende. |
| Lookup, Choice, Boolean, URL, UserLocal datum/tijd | Via het native formulier. |
| Calculated, formula, rollup, secured en `_base`-velden | Via het native formulier; geen inline save. |
| Velden op een gekoppelde tabel / aliasvelden | Geen inline editor. |

De editor controleert veldmetadata, verplichte invoer, maximale tekstlengte en
numerieke grenzen. Bewerken geldt alleen voor open Opportunities. Product-
berekende omzet kan niet via de kaart worden gewijzigd. Het potlood kan bij
sommige beperkingen pas na openen melden dat een veld niet ondersteund is.

Klik het potlood, wijzig de waarde en kies **Opslaan** of **Annuleren**.
Enter slaat een enkelregelige invoer op; Escape annuleert. In multiline tekst
maakt Enter een nieuwe regel. Getallen voer je zonder duizendtalscheiding in;
de inline editor accepteert een komma of punt als decimaalteken. Tijdens een
edit zijn andere recordacties, slepen, bordfilters en de dichtheidskeuze geblokkeerd.

Bij opslaan wordt de actuele serverwaarde opnieuw gecontroleerd en voor de
update een ETag gebruikt. Een conflict of afgewezen save houdt het concept
beschikbaar en toont de fout. Annuleren schrijft niets; een geslaagde save
vernieuwt de kaarten, filters en totalen.

Dataverse-rechten, plugins en servervalidatie blijven gelden. Formulier-
JavaScript en business rules die uitsluitend op het formulier werken draaien
niet voor de inline Web API-update. Kies voor zulke velden het native formulier.

## Kaartopmaak

Voer elk voorbeeld in bij de genoemde property.

**`fieldDisplayNamesOnCard`**:

```json
[
  { "logicalName": "estimatedvalue", "displayName": "Omzet" },
  { "logicalName": "closeprobability", "displayName": "Kans (%)" },
  { "logicalName": "estimatedclosedate", "displayName": "Sluitingsdatum" }
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

**`booleanFieldHighlights`** (makerlabel **Field highlights**):

```json
[
  { "logicalName": "k365_priority", "color": "#D83B01", "type": "left" },
  { "logicalName": "description", "color": "#0078D4", "type": "cornerTopRight" }
]
```

Vervang `k365_priority` door een bestaand veld. Een Boolean-achtige waarde
accentueert alleen bij waar (`true`, `1`, `yes`, `ja`); onwaar en `0` doen dat
niet. Bij andere waarden geldt "niet leeg". Deze herkenning gebruikt de
kaartwaarde: ook tekst `"false"` of getal `0` kan als onwaar worden behandeld.
De configuratie is geen algemene regels- of vergelijkingsexpressie.

Toegestane types: `left` (standaard), `right`, `cornerTopLeft`, `cornerTopRight`,
`cornerBottomLeft`, `cornerBottomRight`. De **eerste passende regel per type**
wint; meerdere verschillende accentposities kunnen tegelijk verschijnen.
Deze kaartaccenten accepteren CSS-kleuren. Voor kolomkleuren geldt de strengere
zes-cijferige hexnotatie.

Andere voorbeelden:

| Property | Voorbeeldwaarde |
| --- | --- |
| `hiddenFieldsOnCard` | `["transactioncurrencyid","statecode"]` |
| `hideLabelForFieldsOnCard` | `["parentaccountid","ownerid"]` |
| `lookupFieldsAsPersonaOnCard` | `["ownerid"]` |
| `lookupFieldsPersonaIconOnlyOnCard` | `["ownerid"]`, samen met de voorgaande optie |
| `ellipsisFieldsOnCard` | `["description"]` |

## HTML-weergave

Bijvoorbeeld `htmlFieldsOnCard = ["description"]`, alleen als dat veld HTML
bevat die je als opmaak wilt tonen. Gewone tekstvelden hoeven niet in deze lijst.

Standaard `allowedHtmlTagsOnCard`:

```text
p,br,b,i,u,strong,em,a,ul,ol,li,table,thead,tbody,tr,th,td
```

Standaard `allowedHtmlAttributesOnCard`: `href`. Beide opties gebruiken een
**kommalijst**, geen JSON-array. DOMPurify schoont de inhoud op met deze
allowlists; een Shadow DOM isoleert de opmaak. Een Shadow DOM is geen vervanging
voor sanitizing. Behoud de standaard als je geen aanvullende markup nodig hebt.

Een expliciete lege taglijst stript markup; een expliciete lege attributenlijst
verwijdert attributen. Als de maker een leeg veld als niet-opgegeven doorgeeft,
blijven de defaults gelden. Wil je uitsluitend gewone tekst tonen, laat het
veld dan uit `htmlFieldsOnCard`.

## Filters en presets

Zoeken is standaard beschikbaar en zoekt hoofdletterongevoelig in tekstwaarden
van de geladen kaarten, inclusief velden die voor kaartdetails zijn verborgen.
Filters op verschillende velden werken samen als **EN**; meerdere geselecteerde
waarden binnen één tekst-/lookupfilter als **OF**. Filteropties komen uit de
geladen records van de weergave.

Voor `quickFilterFields`:

```json
["ownerid", "parentaccountid", "estimatedclosedate", "estimatedvalue"]
```

Voor `quickFilterFieldsInPopup`:

```json
["parentaccountid", "estimatedvalue"]
```

**Typeherkenning in 1.9:** naast metadata kijkt de control naar de raw value
van het eerste record. Een numerieke Choice-waarde kan daardoor een getalfilter
krijgen in plaats van een keuzelijst; dit kan per dataset veranderen. Gebruik
bij een getalfilter een numerieke expressie. Bij een tekst-/lookup-/keuzelijst
gebruik je precies de zichtbare filterwaarde, inclusief hoofdletters en taal.
Een lookup filtert op naam, niet op GUID; gelijke namen worden samen gematcht.

Een preset bestaat uit een unieke `id`, een `label` en `filters`. Alleen velden
uit `quickFilterFields` worden toegepast. Een preset vervangt de huidige quick
filters; velden zonder waarde in de preset worden vrijgegeven. De zoekterm en
sortering veranderen niet. Er is geen aparte standaardpreset-instelling.

Voor `filterPresets`:

```json
[
  {
    "id": "mine",
    "label": "Mijn opportunities",
    "filters": { "ownerid": "{{currentUser}}" }
  },
  {
    "id": "this-month",
    "label": "Sluit deze maand",
    "filters": { "estimatedclosedate": "currentMonth" }
  },
  {
    "id": "high-value",
    "label": "Omzet vanaf 10.000",
    "filters": { "estimatedvalue": "gte:10000" }
  },
  {
    "id": "date-range",
    "label": "Vierde kwartaal 2026",
    "filters": { "estimatedclosedate": { "start": "2026-10-01", "end": "2026-12-31" } }
  }
]
```

`{{currentUser}}` wordt vervangen door de zichtbare naam uit
`systemuser.fullname`, bijvoorbeeld voor `ownerid`. Het is geen eigenaar-ID
en maakt geen beveiligde "alleen mijn records"-weergave. Dataverse bepaalt
welke records de gebruiker mag laden.

### Tekst, lookup en keuze-dropdowns

Eén waarde: `"Contoso"`; meerdere waarden: `["Contoso","Fabrikam"]`.
Voor lege waarden gebruik je `"__empty__"`. Boolean-dropdowns gebruiken één
zichtbare waarde zoals die in jouw filter voorkomt; niet automatisch de string
`"true"`. Voor een Choice-dropdown gebruik je de zichtbare labels, niet zomaar
`"1"`. Heeft datzelfde Choice-veld een getalfilter, dan gebruik je een numeriek
bereik, bijvoorbeeld `"between:1|1"` voor uitsluitend raw value 1.

Met aliasvelden matcht de preset eerst de volledige kolomnaam en anders het
deel na de laatste punt. Gebruik de volledige alias om verschillende gekoppelde
velden met dezelfde naam uit elkaar te houden.

### Datumfilters

| Presetwaarde | Betekenis |
| --- | --- |
| `today` | Vandaag |
| `last7` | Vandaag plus de zes voorgaande dagen |
| `last30` | Vandaag plus de 29 voorgaande dagen |
| `currentWeek` | Huidige maandag t/m zondag |
| `nextWeek` | Volgende maandag t/m zondag |
| `currentMonth` | De hele huidige maand |
| `nextMonth` | De hele volgende maand |
| `currentYear` | Het hele huidige jaar |
| `custom:2026-10-01\|2026-12-31` | Eigen inclusief datumbereik |
| `{ "start": "2026-10-01", "end": "2026-12-31" }` | Hetzelfde bereik als JSON-object in een preset |

Bereiken gebruiken lokale kalenderdagen, inclusief de einddatum. Gebruik bij
de stringnotatie daadwerkelijk `custom:` en een gewone `|` zonder backslash.
Een kale `YYYY-MM-DD|YYYY-MM-DD` wordt in deze versie niet als bereik verwerkt,
ook al noemt oudere helptekst deze notatie. Een leeg/ongeldig bereik past geen
datumbeperking toe. Gebruik liever de objectvorm uit het voorbeeld.

### Getal- en Money-filters

| Presetwaarde | Betekenis |
| --- | --- |
| `gt:10000` | Groter dan 10.000 |
| `gte:10000` | Minstens 10.000 |
| `lt:50000` | Kleiner dan 50.000 |
| `lte:50000` | Hoogstens 50.000 |
| `between:10000\|50000` | Inclusief onder- en bovengrens |

Gebruik in presetexpressies een **punt** voor decimalen en geen duizendtals-
scheiding: bijvoorbeeld `gte:1234.56`. Gebruik een gewone `|`, zonder backslash,
voor `between`. Een ongeldig getalfilter past geen beperking toe.

### Onthouden van gebruikerskeuzes

Quick filters, zoekterm, sortering en gekozen preset worden lokaal in het
browserprofiel onthouden per tabel en Dataverse-weergave, als de host een
view-ID aanlevert. Ze synchroniseren niet tussen browsers/apparaten. De sleutel
bevat geen afzonderlijk gebruikers-ID; wisselen van account in hetzelfde
browserprofiel kan eerdere keuzes behouden. Er is geen algemene resetknop:
wis de zoekterm, kies geen preset/alle filterwaarden en zet sortering op Geen.
Compact/Uitgebreid wordt niet op deze manier onthouden.

## Sorteren

Voor `sortFields`:

```json
["estimatedvalue", "estimatedclosedate", "name"]
```

Voor `defaultSort`:

```json
{ "field": "estimatedclosedate", "direction": "asc" }
```

Sortering geldt **binnen elke kolom**. Datums en getallen worden op raw values
gesorteerd; tekst en lookups op weergegeven tekst. Zonder custom sort blijft
de aangeleverde datasetvolgorde leidend. Een opgeslagen sorteerkeuze gaat vóór
`defaultSort`. Een onbekende richting valt terug op `asc`; ongeldige JSON
selecteert geen standaard sortering. Opnieuw laden gebruikt de op dat moment
opgeslagen voorkeuren. Een makerwijziging aan `defaultSort` neemt dus niet
automatisch de plaats in van een eerder opgeslagen gebruikerssortering.

## Validatie bij verplaatsen

Dit geldt alleen voor **Choice-verplaatsingen naar een andere kolom**.
Verplaatsen binnen dezelfde kolom en BPF-verplaatsingen roepen deze functie
niet aan. Een validator staat los van de inline editor.

1. Maak een JavaScript-webresource, bijvoorbeeld `k365_/scripts/kanban_validate.js`.
2. Vul die exacte webresourcenaam in bij `cardMoveValidationScript`, zonder URL.
3. Vul `K365.Kanban.beforeMove` in bij `cardMoveValidationFunction`.
4. Publiceer de resource en herlaad de app. Een script dat alleen op een
   recordformulier wordt geladen, is niet vanzelf beschikbaar op de lijstpagina.

Voorbeeld van de webresource:

```javascript
window.K365 = window.K365 || {};
window.K365.Kanban = window.K365.Kanban || {};

window.K365.Kanban.beforeMove = function (args) {
  // Vervang 100000001 door de echte Choice-waarde in jouw omgeving.
  if (String(args.newValue) === "100000001") {
    const amount = Number(args.card && args.card.estimatedvalueRaw);
    if (!Number.isFinite(amount) || amount <= 0) {
      return { allow: false, message: "Vul eerst een omzet groter dan nul in." };
    }
  }
  return { allow: true };
};
```

De functie ontvangt één object:

| Argument | Inhoud |
| --- | --- |
| `recordId` | ID van het verplaatste record |
| `entityName` | Logische tabelnaam, bijvoorbeeld `opportunity` |
| `logicalName` | Door de control afgeleide meervoudige tabelnaam; gebruik bij Web API-calls de juiste metadata/entity-setnaam |
| `fieldName` | Choice-veld dat wordt gewijzigd |
| `newValue` | Bestemmingswaarde, of `null` voor Niet toegewezen |
| `sourceColumnId`, `destinationColumnId` | Bron- en bestemmingskolom-id |
| `sourceColumnTitle`, `destinationColumnTitle` | Zichtbare kolomnamen |
| `card` | Oorspronkelijke kaart vóór verplaatsen; `<field>Raw` bevat de raw value als het veld geladen is |

Ondersteunde resultaten: `true` / `false`, `{ allow: true }`, of
`{ allow: false, message: "Reden" }`. Een Promise met hetzelfde resultaat werkt
ook. `undefined` / `null` staat de verplaatsing toe. Geef liever expliciet een
Boolean of het object terug. Een exception of afgewezen Promise blokkeert de
save met een melding. Een ingestelde functie die niet kan worden gevonden
blokkeert eveneens. Alleen een scriptnaam zonder functienaam voert geen
validator uit. Laat beide opties leeg als geen custom validatie nodig is.

## Meldingen

| Makerkeuze | Technische waarde | Positie |
| --- | --- | --- |
| Top | `top-center` | Boven midden |
| Top Start | `top-left` | Boven links |
| Top End | `top-right` | Boven rechts; standaard |
| Bottom | `bottom-center` | Onder midden |
| Bottom Start | `bottom-left` | Onder links |
| Bottom End | `bottom-right` | Onder rechts |

De UI-taal volgt de app/gebruikerstaal: Nederlands (`1043`), Duits (`1031`)
of anders Engels. Veldlabels en Choice-labels worden daarnaast door Dataverse
geleverd; eigen labels/presetnamen uit de configuratie worden niet vertaald.

## Problemen oplossen

| Wat je ziet | Controle / oplossing |
| --- | --- |
| Normale lijst of Microsoft Kanban | Controleer controltoewijzing, publicatie en **Show as → Kickstart365 Kanban**. Het managed pakket maakt geen view/appconfiguratie aan. |
| Instelling lijkt geen effect te hebben | Open de opgeslagen configuratie opnieuw, controleer vaste waarde en gekoppelde view, publiceer en herlaad. Controleer ook een eventuele opgeslagen filter-/sorteervoorkeur. |
| Save and publish geeft `400` / `0x80160028` en daarna Unsaved changes | Lees de Response van het mislukte `savedqueries`-verzoek. Bij `sidePaneWidth` of `closeDateWarningDays` en type `Whole.None`: vul **Side pane width** met `600` en **Close date warning days** met `7` (of geldige gehele getallen), sla de componentconfiguratie op en publiceer de view opnieuw. Heropen de view om de opgeslagen waarden te controleren. De runtime-default kan een door Dataverse afgekeurde configuratie niet herstellen. |
| Verkeerd BPF als beginweergave | `defaultView` moet exact de zichtbare naam in **View By** zijn, niet "Kanban view" of de BPF-tabelnaam. |
| Records bij Niet toegewezen | Controleer of ze een instantie/fase in het gekozen BPF hebben, of een aangeboden Choice-waarde. Zie de beperking voor `statuscode`. |
| Een veld ontbreekt op de kaart | Voeg het aan de view toe; controleer `hiddenFieldsOnCard`, de actieve groepering en `compactCardFields`. Open eventueel Details. |
| Geen potlood of veld kan niet worden bewerkt | Controleer Opportunity, `allowInlineEdit`, `inlineEditFields`, zichtbaarheid, ondersteund type/metadata, open record en schrijfrechten. HTML-detailvelden en aliasvelden worden niet inline bewerkt. |
| Omzet kan niet worden opgeslagen | Controleer product-berekende omzet, recordstatus, veldgrenzen en de serverfout. Gebruik zo nodig het native formulier. |
| Geen totaal of melding over valuta | Voeg totaalveld én bij Money `transactioncurrencyid` toe aan de view. Controleer actieve filters en gebruik echte numerieke waarden. |
| Totalen lopen achter op een flow/BPF-wijziging | Wacht op de flow en kies **Verversen**. Het zijpaneel volgt `modifiedon`, niet alle gekoppelde proces-/flowwijzigingen. |
| Kleur ontbreekt | Controleer exacte fasenaam/Choice-id en zes-cijferige hexkleur. GUID-match heeft voorrang; `[]` betekent geen kleuren. |
| Breedte ontbreekt | `columnWidths` gebruikt fasenaam/Choice-id, geen GUID. Controleer getallen, algemene grenzen en vaste overrides. |
| Preset werkt niet | Zet het veld in `quickFilterFields`. Gebruik dropdownlabels of het correcte getal-/datumformaat voor de getoonde filter. Voor een datumbereik gebruik je `{start,end}` of `custom:`. |
| Zijpaneel opent als dialoog | De host biedt de native zijpaneel-API niet aan of kan het paneel niet maken. Controleer de web-appintegratie; de recordopening heeft een dialoogfallback. |
| Slepen wijzigt geen BPF-fase | Dit opent het formulier; voer en bewaar de fasewijziging daar uit. |
| Verplaatsen wordt geblokkeerd | Controleer savefout, rechten, validatornaam, gepubliceerde webresource en beschikbaarheid van de functie op de lijstpagina. |

Ongeldige JSON geeft bij veel instellingen een configuratiebanner met de
propertynaam. Dit geldt onder meer voor veldlijsten, presets, kaartopmaak,
BPF-configuratie, inline edit-lijsten en kleuren. Geldige JSON met een verkeerde
structuur kan bij oudere instellingen stil worden genegeerd. `defaultSort`,
`columnWidths` en ongeldige algemene breedtes gebruiken een stille fallback;
geen banner betekent dus niet automatisch dat iedere instelling geldig is.

Na aanpassingen aan BPF- of Choice-metadata kun je de app herladen om de
metadata opnieuw te laden. Controleer voor ingebruikname compacte/uitgebreide
kaarten, valuta, presets, rechten, saves en BPF-fasewijzigingen in de echte app.
Zie ook [de 1.9-pilotchecks](INTERACTION-SETTINGS.md#pilot-checks-after-importing-1900)
en [technische verificatie](OPPORTUNITY-FOUNDATION.md).
