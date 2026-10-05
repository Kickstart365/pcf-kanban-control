# BPF-fases wijzigen door te slepen

**Nederlands | [English](BPF-DRAG.en.md)**

Vanaf **control 1.11.0 / solution 1.11.0.0** wijzigt slepen tussen BPF-kolommen
de actieve procesfase. Kies bij **View By** het juiste BPF en laat
`allowCardMove` aan. Er is geen extra instelling nodig.

## Gebruik

1. Sleep de kaart met de verplaatsgreep naar de gewenste fase.
2. De control leest de actuele procesinstantie en actieve route uit Dataverse.
3. Verplichte stappen en een ingestelde kaartvalidator worden gecontroleerd.
4. Na opslaan verhuist de kaart; het board ververst kaarten, aantallen en totalen.

Bij een succesvolle verplaatsing opent geen zijpaneel. Klik op de kaarttitel
om het record te openen in de ingestelde openmodus. Ontbrekende verplichte
stappen tonen hun namen en openen het recordformulier. Vul ze in, sla op en
sleep opnieuw. De eerdere mislukte sleep wordt niet automatisch hervat.

## Routes en controles

- De fase wordt opgeslagen op de **BPF-procesinstantie**, met `activestageid`
  en `traversedpath`. Verouderde Opportunity-procesvelden worden niet gewijzigd.
- Built-in en custom processen gebruiken hun echte relatie- en tabelmetadata.
  Bij meerdere instanties van het gekozen proces wordt de laatst gewijzigde
  instantie gebruikt, zowel voor de kaartindeling als voor het slepen.
- Alleen fases op de **actieve route** van deze instantie zijn bereikbaar.
  Een andere tak kiezen of de visuele kolomvolgorde wijzigen verandert die route niet.
- Een sleep over meerdere fases slaat opeenvolgende aangrenzende overgangen
  op. Vooraf worden de bekende verplichte stappen van alle te verlaten fases
  gecontroleerd. Ook terugwaarts gelden deze controles.
- Verplichte tekst/lookup/getal-stappen mogen niet leeg zijn. Nul is een geldig
  getal. Een verplichte Two Options-stap moet **Ja / true** zijn.
- Twee gelijknamige fases in dezelfde actieve route zijn ambigu en worden
  geblokkeerd. De naam kan wel elders in een andere tak voorkomen.
- Geen instantie, een voltooid/afgebroken proces, Niet toegewezen,
  cross-table overgangen of onbekende/speciale stapmetadata worden niet
  automatisch veranderd. Gebruik daarvoor het native procesformulier.
- Dit beëindigt het proces niet en markeert een Opportunity niet als Won/Lost.

## Rechten, fouten en eigen regels

De gebruiker heeft leesrechten op de procesmetadata en BPF-tabel nodig, plus
schrijfrechten op de gekozen procesinstantie. Serverplugins en servervalidatie
blijven van toepassing. Fouten tonen de reden en laten de kaart staan.

Een verse procesversie wordt vóór iedere save gelezen. Een conditionele update
voorkomt het overschrijven van een gelijktijdige proceswijziging. Het board
ververst bij een conflict. Meerdere faseovergangen vormen **geen transactie**:
als een latere overgang faalt, blijven eerdere opgeslagen overgangen bestaan.
De melding vermeldt dit en het board toont na verversen de werkelijk opgeslagen fase.

**Formulier-JavaScript**, `OnPreStageChange` / `OnStageChange` en regels die
uitsluitend op het formulier werken worden niet uitgevoerd door deze Web API-save.
De control controleert opgeslagen verplichte BPF-veldwaarden conservatief;
formulierlogica die een verplichte stap verbergt kan daardoor alsnog blokkeren.
Zet aanvullende bedrijfsregels in servervalidatie of de bestaande
[kaartvalidator](CONFIGURATION.md#validatie-bij-verplaatsen). Die wordt nu ook
voor BPF aangeroepen met `fieldName: "activestageid"`, de echte fase-GUID als
`newValue`, `processInstanceId` en `processName`.

## Controle na import

Controleer in de eigen model-driven app: vooruit en terug, meerdere fases,
elke actieve tak, ontbrekende verplichte velden, BPF-rechten en gelijktijdige
wijzigingen. Test ook eigen plugins en formulierregels. Automatische regressies
en de browserproef gebruiken gesimuleerde Dataverse-antwoorden; ze vervangen
deze controle in de eigen omgeving niet.

## Microsoft references

- [BPF instances, active paths and stage updates](https://learn.microsoft.com/en-us/power-automate/developer/business-process-flows-code)
- [Required Two Options steps](https://learn.microsoft.com/en-us/power-automate/business-process-flows-overview)
- [Conditional Web API updates](https://learn.microsoft.com/en-us/power-apps/developer/data-platform/webapi/perform-conditional-operations-using-web-api)
