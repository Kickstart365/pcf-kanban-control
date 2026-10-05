# Kickstart365 Kanban

**Taal: Nederlands | [English](README.en.md)**

Kanban-component voor Dataverse-weergaven in model-driven Power Apps. Deze fork
van [novalogica/pcf-kanban-control](https://github.com/novalogica/pcf-kanban-control)
voegt onder meer compacte kaarten, kolomtotalen, kolomkleuren, een recordzijpaneel
en bewerkbare velden op Opportunity-kaarten toe.

Huidige versie: **control 1.11.0 / solution 1.11.0.0**.

## Solutions downloaden

| Pakket 1.11.0.0 | Download |
| --- | --- |
| Managed | [Kickstart365Kanban_1_11_0_0_managed.zip](https://raw.githubusercontent.com/Kickstart365/pcf-kanban-control/main/downloads/1.11.0.0/Kickstart365Kanban_1_11_0_0_managed.zip) |
| Unmanaged | [Kickstart365Kanban_1_11_0_0_unmanaged.zip](https://raw.githubusercontent.com/Kickstart365/pcf-kanban-control/main/downloads/1.11.0.0/Kickstart365Kanban_1_11_0_0_unmanaged.zip) |

Deze ZIPs kun je direct importeren via **Solutions → Import**. Gebruik voor
een bestaande installatie hetzelfde managed/unmanaged-pakkettype.
Zie [installatie en upgrades](docs/DEV-INSTALLATION.md) en
[checksums/buildherkomst](downloads/1.11.0.0/README.md).

## Configuratiehandleiding

**[Alle 47 instellingen, standaardwaarden en voorbeelden](docs/CONFIGURATION.md)**
staan in de complete Nederlandstalige configuratiehandleiding. De Engelse
instellingsnamen uit Power Apps en de technische propertynamen staan erbij,
zodat je de juiste optie direct kunt terugvinden.

Dezelfde complete handleiding is beschikbaar in
[English](docs/CONFIGURATION.en.md).

Vanaf 1.10.0: [één Config (JSON), export en autocomplete-schema](docs/CONFIG-JSON.md).

- [Snel starten met Opportunity](docs/OPPORTUNITY-CONFIGURATION.md)
- [Alle configuratieopties](docs/CONFIGURATION.md#alle-configuratieopties)
- [Kolomkleuren](docs/CONFIGURATION.md#kolomkleuren)
- [Records openen in een zijpaneel of dialoog](docs/CONFIGURATION.md#records-openen)
- [Velden direct op de kaart bewerken](docs/CONFIGURATION.md#velden-op-de-kaart-bewerken)
- [Filters en presets](docs/CONFIGURATION.md#filters-en-presets)
- [Problemen oplossen](docs/CONFIGURATION.md#problemen-oplossen)

## Wat het component doet

- Groepeert records op een Choice-veld uit de weergave of een Business Process Flow.
- Toont aantallen en maximaal twee numerieke totalen per kolom, met geldbedragen
  uitgesplitst per valuta.
- Biedt compacte/uitgebreide kaarten, datumlabels, kaartaccenten en kolomkleuren.
- Opent bestaande records en lookups in een zijpaneel of dialoog.
- Laat geselecteerde, schrijfbare Opportunity-velden direct op de kaart bewerken.
- Biedt zoeken, veldfilters, filterpresets en sortering.
- Verplaatst Choice-kaarten met opslaan en optionele JavaScript-validatie.
  Slepen in een BPF slaat de procesfase op en verplaatst de kaart na succes.
  Zie [BPF-slepen (NL)](docs/BPF-DRAG.md) / [BPF dragging (EN)](docs/BPF-DRAG.en.md).

## Installeren en gebruiken

Volg [installatie en upgrades](docs/DEV-INSTALLATION.md) voor de managed of
unmanaged solution. Het pakket bevat alleen **Kickstart365 Kanban**; maak en
configureer de weergave en voeg deze toe aan je model-driven app.

Open vervolgens de weergave in de app en kies, waar beschikbaar, **Show as /
Weergeven als → Kickstart365 Kanban**. De Microsoft Kanban is een afzonderlijk
component. Zie [de configuratiehandleiding](docs/CONFIGURATION.md#instellen-in-power-apps)
voor de volledige stappen.

## HTML op kaarten

HTML-velden worden met DOMPurify opgeschoond en in een Shadow DOM weergegeven.
De standaard toegestane tags en attributen zijn beschreven bij
[HTML-weergave](docs/CONFIGURATION.md#html-weergave). Behoud de standaardlijst
tenzij andere markup nodig is; Shadow DOM verzorgt stijlisolatie.

## Ontwikkeling en verificatie

Gebruik Node 22 en de vastgelegde dependencies:

```sh
npm ci --no-audit --no-fund
node --test tests/*.test.cjs
npm run lint
npm run build -- --buildMode production
```

De Windows-workflow bouwt en controleert beide solution-pakketten.
[Installatie en build](docs/DEV-INSTALLATION.md),
[technische basis](docs/OPPORTUNITY-FOUNDATION.md) en
[interactie- en pilotchecks voor 1.9](docs/INTERACTION-SETTINGS.md) bevatten de
verdere technische details. Test de native zijpaneelintegratie en saves in
de beoogde Sales-app.

## Herkomst en licentie

De oorspronkelijke MIT-licentie en auteursvermelding blijven behouden; zie
[LICENSE](LICENSE). [KICKSTART365.md](docs/KICKSTART365.md) beschrijft de eerste
forkwijzigingen. Bijdragen via issues en pull requests zijn welkom.
