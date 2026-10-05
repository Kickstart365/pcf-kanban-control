# Kickstart365 Opportunity Kanban: snel starten met 1.9

**Taal: Nederlands | [English](OPPORTUNITY-CONFIGURATION.en.md)**

De volledige Nederlandstalige handleiding staat in
[CONFIGURATION.md](CONFIGURATION.md), met alle **47 instellingen**, hun
standaardwaarden, voorbeelden en oplossingen voor veelvoorkomende problemen.

## Inrichten

1. [Download de managed of unmanaged solution](CONFIGURATION.md#solutions-downloaden)
   en importeer **Kickstart365Kanban 1.10.0.0** in de gewenste omgeving.
   Zie [installatie en upgrades](DEV-INSTALLATION.md); houd bij een bestaande
   installatie hetzelfde managed/unmanaged-pakkettype aan.
2. Maak/open een Opportunity-weergave met `name` als eerste kolom. Voeg
   `parentaccountid`, `estimatedvalue`, `closeprobability`, `estimatedclosedate`,
   `ownerid`, `transactioncurrencyid` en `statecode` toe. Gebruik je eigen
   bedrijfslookup, bijvoorbeeld `bcbi_companyid`, als die in jouw omgeving
   `parentaccountid` vervangt.
3. Voeg **Kickstart365 Kanban** toe en voer
   [het aanbevolen startprofiel](CONFIGURATION.md#opportunity-aanbevolen-inrichting)
   in. Kies bij `defaultView` de exacte zichtbare naam van het gewenste BPF.
   Voeg desgewenst [kolomkleuren](CONFIGURATION.md#kolomkleuren) en
   [filterpresets](CONFIGURATION.md#filters-en-presets) toe.
4. Sla op, publiceer en open de weergave in de app. Kies waar nodig
   **Show as / Weergeven als → Kickstart365 Kanban**.

Elke instelling krijgt zijn eigen waarde; het startprofiel is geen bestand
dat je in één keer kunt importeren. Alleen velden die in de weergave zijn
opgenomen kunnen op kaarten worden gebruikt. Money-totalen vereisen
`transactioncurrencyid`; dit veld en `statecode` kun je op de kaart verbergen.

Voor een tweede totaal kun je een bestaand numeriek veld gebruiken, zoals
`sparked_estimatedweightedrevenue`. Het component maakt dit veld niet aan en
berekent geen gewogen omzet. Houd door een cloudflow beheerde waarden buiten
de inline edit-lijst en vernieuw het bord nadat de flow is uitgevoerd.

Het solution-pakket bevat alleen de control. De klantweergave, Opportunity-tabel,
BPF, custom velden en model-driven app worden niet meegeleverd.

## Controleren in de app

- Wissel Compact/Uitgebreid en klap Details op één kaart open. Verborgen velden
  blijven verborgen; titel, potlood en sleepgreep hebben elk hun eigen actie.
- Vergelijk kolomaantallen en totalen met dezelfde gefilterde weergave. Test
  nulbedragen, lege fases, meerdere valuta en meerdere datasetpagina's.
- Controleer datumlabels voor vandaag, verlopen datums en gesloten records.
- Open een record in het zijpaneel, sla een wijziging op en controleer de
  vernieuwde kaart. Gebruik Verversen na een BPF- of cloudflowwijziging.
- Bewerk een toegestaan veld, annuleer een concept en controleer een afgewezen
  save. Test ook een gesloten record en een gebruiker zonder schrijfrechten.
- Sleep tussen BPF-kolommen: wijzig de fase in het geopende native formulier.
  De control schrijft geen BPF-fase rechtstreeks.
- Test zoeken, presets, datum-/getalfilters, sortering en toetsenbordbediening.

Zie [de volledige 1.9-pilotchecks](INTERACTION-SETTINGS.md#pilot-checks-after-importing-1900),
[de technische basis](OPPORTUNITY-FOUNDATION.md) en
[problemen oplossen](CONFIGURATION.md#problemen-oplossen).
