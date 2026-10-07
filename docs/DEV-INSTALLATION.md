# Kickstart365 Kanban 1.12.1: downloaden, installeren en bouwen

**Taal: Nederlands | [English](DEV-INSTALLATION.en.md)**

Alle instellingen en voorbeelden staan in de
[complete configuratiehandleiding](CONFIGURATION.md). De technische details
en pilotchecks voor zijpanelen, kleuren en bewerken staan in
[Interaction settings](INTERACTION-SETTINGS.md).

## Solutions downloaden

Download de gecontroleerde versie **1.12.1.0** rechtstreeks:

| Pakket | Download | Gebruik |
| --- | --- | --- |
| Managed | [Kickstart365Kanban_1_12_1_0_managed.zip](https://raw.githubusercontent.com/Kickstart365/pcf-kanban-control/main/downloads/1.12.1.0/Kickstart365Kanban_1_12_1_0_managed.zip) | Installeren of bijwerken van een managed installatie. |
| Unmanaged | [Kickstart365Kanban_1_12_1_0_unmanaged.zip](https://raw.githubusercontent.com/Kickstart365/pcf-kanban-control/main/downloads/1.12.1.0/Kickstart365Kanban_1_12_1_0_unmanaged.zip) | Ontwikkeling/customization of bijwerken van een unmanaged installatie. |

Deze twee links leveren ieder een **direct importeerbare solution-ZIP** op.
Je hoeft deze ZIPs niet uit te pakken. Zie
[checksums en buildherkomst](../downloads/1.12.1.0/README.md).

De pakketten komen uit [de geslaagde solution-build](https://github.com/Kickstart365/pcf-kanban-control/actions/runs/37589775619)
voor commit `34252bd8449c0068471a8959459e1217eeebd1e4`. De bron en versie
staan vast in de downloadmap. Voor toekomstige builds kun je ook naar
[Dataverse solution build](https://github.com/Kickstart365/pcf-kanban-control/actions/workflows/solution-build.yml):
open een geslaagde run op `main` en download onder **Artifacts** het
`Kickstart365Kanban-…`-pakket. Pak **dat buitenste Actions-archief** wel uit
en importeer alleen de gewenste binnenste managed/unmanaged solution-ZIP.

## Installeren, upgraden en configureren

1. Selecteer de bedoelde omgeving op https://make.powerapps.com en importeer
   de gekozen ZIP via **Solutions → Import**.
2. Is `Kickstart365Kanban` al geïnstalleerd? Houd hetzelfde pakkettype aan:
   managed bij managed, unmanaged bij unmanaged. Behoud dezelfde solution-
   identiteit en importeer de nieuwere versie. Verwijder de control niet om
   te upgraden. De identiteit is ongewijzigd ten opzichte van 1.8.
3. Voeg in de Opportunity-weergave **Kickstart365 Kanban** toe en volg
   [de snelstart](OPPORTUNITY-CONFIGURATION.md) of
   [de volledige inrichting](CONFIGURATION.md#instellen-in-power-apps).
4. Sla de weergave/app op en publiceer. Selecteer in de app de weergave en
   kies waar nodig **Show as → Kickstart365 Kanban**; Microsoft Kanban is een
   andere control. Voer de checks uit in de snelstart, plus
   [de technische checks](OPPORTUNITY-FOUNDATION.md).

Het pakket bevat uitsluitend de control. Het maakt geen Opportunity-weergave,
BPF, klantvelden of model-driven app aan. Een geslaagde build bewijst nog
geen uitgevoerde import-/runtimetest in de beoogde InSpark Dataverse-omgeving.

## Identiteit

- Controlnamespace: `kickstart365`; constructor: `KanbanViewControl`.
- Controlversie: `1.12.1`; zichtbare naam: **Kickstart365 Kanban**.
- Solution: `Kickstart365Kanban`, versie `1.12.1.0`.
- Publisher: `kickstart365`; customizationprefix: `k365`.

Deze identiteit staat los van de oorspronkelijke `novalogica`-control; je
kunt beide naast elkaar testen. Weergaven met de originele control moeten
expliciet op de nieuwe worden ingesteld. Behoud bij verspreiding de
oorspronkelijke MIT-licentie en auteursvermelding.

## Zelf bouwen

De workflow **Dataverse solution build** gebruikt Windows MSBuild, Node 22,
vastgelegde npm-dependencies, .NET 10 en PAC CLI 2.12.2. Hij bouwt productie-
PCF-resources en beide solution-ZIPs. Daarna controleert hij solution-/control-
identiteit, versie en aanwezigheid van de bundle. Het artifact bevat ook
SHA-256-checksums en de bronmetadata van het solutionproject.

Het solutionproject en de publishermetadata staan onder
`solutions/Kickstart365Kanban`. Volgende builds gebruiken daarmee dezelfde
bron. De workflow logt niet in op Dataverse en deployt geen omgeving.

Op Windows met Visual Studio Build Tools/MSBuild:

```powershell
dotnet tool install --global Microsoft.PowerApps.CLI.Tool --version 2.12.2
npm ci --no-audit --no-fund
./scripts/build-solution.ps1
```

Microsoft-referentie:
[Custom controls importeren](https://learn.microsoft.com/en-us/power-apps/developer/component-framework/import-custom-controls).
