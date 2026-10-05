# Save & Publish: ongeldige componentwaarde

**Nederlands | [English](VIEW-PUBLISH.en.md)**

Een Dataverse-fout `0x80160028` zoals `compactCards cannot be parsed to type
TwoOptions` blokkeert het opslaan van de **viewconfiguratie**. Het bericht zegt
welke property en welk type Dataverse afwijst. Dit gebeurt voordat het Kanban
component zijn runtime-instellingen kan lezen. Een waarde in Config (JSON)
herstelt een ongeldige losse makerinstelling daarom niet tijdens Save & Publish.

## Correctie vanaf 1.11.1.0

Alle tien Ja/Nee-inputs krijgen expliciet `true` of `false` als manifestdefault.
De twee getalinputs en drie enuminputs hebben ook geldige defaults. De bestaande
standaardwerking blijft gelijk. Namen en types van instellingen blijven gelijk.
De build controleert de defaults ook in **beide verpakte solutionmanifesten**.

Een nieuwe componentconfiguratie krijgt hierdoor geldige getypeerde defaults.
Een al ingevulde ongeldige waarde in een bestaande view wordt niet automatisch
overschreven door een nieuwe manifestdefault.

## Bestaande view herstellen

1. Importeer de nieuwe solution met hetzelfde pakkettype als de bestaande installatie.
2. Herlaad de makerpagina en open de componentinstellingen van de getroffen view.
3. Kies bij **alle Ja/Nee-opties** expliciet Ja of Nee. Gebruik de gewenste
   waarden; onderstaande tabel geeft de defaults. Maak een keuze met de
   makerselector en laat deze opties niet leeg.
4. Bevestig de twee getalwaarden en de drie keuzelijsten. Behoud de gewenste
   Config (JSON) en overige veldinstellingen.
5. Sla de componentinstellingen op en doe **Save & Publish** op de view.
6. Herlaad de view en controleer dat de wijzigingen blijven staan. Test vervolgens
   het Kanban in de app.

| Property / makerlabel | Standaard |
| --- | --- |
| `compactCards` / Start with compact cards | Nee |
| `showCloseDateBadges` / Show close date badges | Nee |
| `hideViewBy` / Hide View By if default View By set? | Nee |
| `allowCardMove` / Allow moving cards | Ja |
| `showOpenInNewTabButton` / Show open in new tab button on card | Nee |
| `hideEmptyColumns` / Hide empty columns | Nee |
| `hideColumnFieldOnCard` / Hide column field on card | Nee |
| `showEmailAndPhoneAsLinks` / Show E-Mail and Phone as links on card | Nee |
| `expandBoardToFullWidth` / Expand board to full width | Nee |
| `allowCreateNew` / Allow creating new records from board | Ja |
| `sidePaneWidth` / Side pane width | 600 |
| `closeDateWarningDays` / Close date warning days | 7 |
| `recordOpenMode` / Open records in | Side pane |
| `allowInlineEdit` / Editing fields on cards | Enabled |
| `notificationPosition` / Notification position | top-right |

Als een property een andere naam heeft in de maker, gebruik de propertynaam om
hem te herkennen. Een ingevulde Config (JSON)-waarde wint bij het uitvoeren van
het board nog steeds van de losse instelling.

## Als opslaan nog wordt geweigerd

Controleer de nieuwe servermelding: noemt die nog dezelfde property of een
andere? Leg bij de mislukte `savedqueries`-request ook de **request payload**
vast, inclusief `controlDescriptionXml`, en de response. Het serverfoutbericht
alleen toont niet noodzakelijk de werkelijk ingestuurde instellingen. Behoud
de bestaande config; vervang niet op basis van de tekst `PlaceholderString`
alle waarden in de foutmelding.

Automatische tests bewaken manifestdefaults, Config (JSON)-overrides en de
verpakte manifesten. De definitieve Save & Publish-proef moet in de betreffende
Dataverse-omgeving worden gedaan; een succesvolle compile/build bewijst die
serveractie niet.

[Microsoft: input property defaults](https://learn.microsoft.com/en-us/power-apps/developer/component-framework/manifest-schema-reference/property)
