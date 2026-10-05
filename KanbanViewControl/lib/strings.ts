/**
 * Localized UI strings for the Kanban control.
 * The control uses the app language (context.userSettings.languageId) to pick the locale.
 */

function bpfErrorMessage(locale: "en" | "nl" | "de", code: string, detail: string, savedSteps: number): string {
  const messages: Record<string, Record<string, string>> = {
    en: { required: "Fill in the required process steps first", missingInstance: "This record has no instance of the selected process", inactive: "This process is finished or aborted", conflict: "The process changed. Refresh the board and try again", route: "The destination is not a unique stage in the active process path", unsupported: "Use the native process form for this transition", validation: "The card move was rejected", server: "Dynamics could not save the process stage" },
    nl: { required: "Vul eerst de verplichte processtappen in", missingInstance: "Dit record heeft geen instance van het gekozen proces", inactive: "Dit proces is voltooid of afgebroken", conflict: "Het proces is gewijzigd. Vernieuw het board en probeer opnieuw", route: "De bestemming is geen unieke fase in de actieve procesroute", unsupported: "Gebruik voor deze overgang het procesformulier", validation: "Het verplaatsen is afgewezen", server: "Dynamics kon de procesfase niet opslaan" },
    de: { required: "Zuerst die erforderlichen Prozessschritte ausfüllen", missingInstance: "Dieser Datensatz hat keine Instanz des ausgewählten Prozesses", inactive: "Dieser Prozess ist abgeschlossen oder abgebrochen", conflict: "Der Prozess wurde geändert. Board aktualisieren und erneut versuchen", route: "Das Ziel ist keine eindeutige Phase im aktiven Prozesspfad", unsupported: "Für diesen Übergang das Prozessformular verwenden", validation: "Die Kartenverschiebung wurde abgelehnt", server: "Dynamics konnte die Prozessphase nicht speichern" }
  };
  const message = messages[locale][code] ?? messages[locale].server;
  const partial = savedSteps > 0 ? ({ en: ` ${savedSteps} stage transition(s) were already saved. The board will refresh.`, nl: ` Er zijn al ${savedSteps} faseovergang(en) opgeslagen. Het board wordt ververst.`, de: ` ${savedSteps} Phasenübergänge wurden bereits gespeichert. Das Board wird aktualisiert.` })[locale] : "";
  return `${message}${detail ? `: ${detail}` : "."}${partial}`;
}

export interface Strings {
  configurationErrorsLabel: string;
  configurationExportLabel: string;
  configurationExportHelp: string;
  configurationExportBlocked: string;
  configurationCopyLabel: string;
  configurationCopied: string;
  configurationCopyFallback: string;
  configurationCloseLabel: string;
  // Date filter
  dateFilterAll: string;
  dateFilterToday: string;
  dateFilterLast7: string;
  dateFilterLast30: string;
  dateFilterCurrentMonth: string;
  dateFilterCurrentYear: string;
  dateFilterCurrentWeek: string;
  dateFilterNextWeek: string;
  dateFilterNextMonth: string;
  dateFilterCustomRange: string;
  dateFilterFrom: string;
  dateFilterTo: string;
  dateFilterStartAria: string;
  dateFilterEndAria: string;

  // Number filter
  numberFilterAll: string;
  numberFilterGreaterThan: string;
  numberFilterLessThan: string;
  numberFilterGreaterOrEqual: string;
  numberFilterLessOrEqual: string;
  numberFilterBetween: string;
  numberFilterValuePlaceholder: string;
  numberFilterValueAriaLabel: string;
  numberFilterMinPlaceholder: string;
  numberFilterMinAriaLabel: string;
  numberFilterMaxPlaceholder: string;
  numberFilterMaxAriaLabel: string;

  // Quick filters & sort
  quickFilterAll: string;
  quickFiltersMoreFilters: string;
  quickFiltersMoreFiltersOpen: string;
  quickFiltersSearchPlaceholder: string;
  quickFiltersSearchAriaLabel: string;
  quickFiltersAriaLabel: string;
  sortByLabel: string;
  sortNone: string;
  sortAscending: string;
  sortDescending: string;
  filterPresetLabel: string;
  filterPresetNone: string;

  // Drag & drop toasts
  bpfMoveError: (code: string, detail: string, savedSteps: number) => string;
  toastSaving: string;
  toastSuccessMoved: (columnName: string) => string;
  toastUnallocated: string;
  toastValidationFunctionNotFound: string;

  // Loading
  loadingLabel: string;
  openingRecordLabel: string;
  cardDensityLabel: string;
  compactCardsLabel: string;
  expandedCardsLabel: string;
  showDetailsLabel: string;
  collapseDetailsLabel: string;
  openNewTabLabel: string;
  noRecordsLabel: string;
  emptyColumnLabel: string;
  viewByLabel: string;
  closeDateOverdue: string;
  closeDateToday: string;
  closeDateSoon: string;
  closeDateLater: string;
  recordCountLabel: (count: number) => string;
  columnTotalsLabel: string;
  totalNeedsCurrencyLabel: string;
  recordDetailsLabel: string;
  sidePaneFallbackLabel: string;
  openRecordErrorLabel: string;
  saveLabel: string;
  cancelLabel: string;
  editLabel: string;
  dragCardLabel: string;
  refreshLabel: string;
  finishEditingLabel: string;
  inlineSaveErrorLabel: string;
  inlineErrors: Record<string, string>;
}

const en: Strings = {
  configurationErrorsLabel: "Configuration errors", configurationExportLabel: "Export configuration",
  configurationExportHelp: "Copy these settings into Config (JSON) in the view editor, then save and publish. This contains board configuration, without record data or your current search/filter choices.",
  configurationExportBlocked: "Correct these settings before migrating. This preview is incomplete.",
  configurationCopyLabel: "Copy JSON", configurationCopied: "Configuration copied.",
  configurationCopyFallback: "Select the JSON and press Ctrl+C (Cmd+C on Mac).", configurationCloseLabel: "Close",
  recordDetailsLabel: "Record details", sidePaneFallbackLabel: "Side pane unavailable here; opened in a dialog.",
  openRecordErrorLabel: "Could not open the record.", saveLabel: "Save", cancelLabel: "Cancel", editLabel: "Edit",
  dragCardLabel: "Move card", refreshLabel: "Refresh", finishEditingLabel: "Save or cancel your edit first.",
  inlineSaveErrorLabel: "Could not save this change.",
  inlineErrors: { invalidNumber: "Enter a number without grouping separators.", invalidProbability: "Enter a whole number from 0 to 100.",
    invalidDate: "Enter a valid date.", closed: "Only open Opportunities can be edited here.", calculated: "Revenue is calculated from products. Edit it in the record form.",
    conflict: "This value changed while you were editing. Cancel and reopen the editor to load the current value.",
    unsupported: "This field cannot be edited here. Use the record form.", required: "This field is required.",
    tooLong: "The text exceeds this field's maximum length.", range: "The number is outside this field's allowed range." },
  dateFilterAll: "(All)",
  dateFilterToday: "Today",
  dateFilterLast7: "Last 7 days",
  dateFilterLast30: "Last 30 days",
  dateFilterCurrentMonth: "Current month",
  dateFilterCurrentYear: "Current year",
  dateFilterCurrentWeek: "Current calendar week",
  dateFilterNextWeek: "Next calendar week",
  dateFilterNextMonth: "Next month",
  dateFilterCustomRange: "Custom range",
  dateFilterFrom: "From",
  dateFilterTo: "To",
  dateFilterStartAria: "Select start date",
  dateFilterEndAria: "Select end date",

  numberFilterAll: "(All)",
  numberFilterGreaterThan: "Greater than",
  numberFilterLessThan: "Less than",
  numberFilterGreaterOrEqual: "Greater or equal",
  numberFilterLessOrEqual: "Less or equal",
  numberFilterBetween: "Between",
  numberFilterValuePlaceholder: "Value",
  numberFilterValueAriaLabel: "Numeric value",
  numberFilterMinPlaceholder: "Min",
  numberFilterMinAriaLabel: "Minimum value",
  numberFilterMaxPlaceholder: "Max",
  numberFilterMaxAriaLabel: "Maximum value",

  quickFilterAll: "(All)",
  quickFiltersMoreFilters: "More filters",
  quickFiltersMoreFiltersOpen: "Open more filters",
  quickFiltersSearchPlaceholder: "Search in all fields…",
  quickFiltersSearchAriaLabel: "Search in all card fields",
  quickFiltersAriaLabel: "Quick filters and search",
  sortByLabel: "Sort by",
  sortNone: "(None)",
  sortAscending: "Ascending",
  sortDescending: "Descending",
  filterPresetLabel: "Filter preset",
  filterPresetNone: "(No preset)",

  toastSaving: "Saving...",
  toastSuccessMoved: (columnName) => `Successfully moved to ${columnName} 🎉`,
  toastUnallocated: "Unallocated",
  toastValidationFunctionNotFound: "Card move validation function is not available. Check that the web resource is loaded and the function path is correct.",
  bpfMoveError: (code, detail, savedSteps) => bpfErrorMessage("en", code, detail, savedSteps),

  loadingLabel: "Loading...",
  openingRecordLabel: "Opening record...",
  cardDensityLabel: "Card layout",
  compactCardsLabel: "Compact",
  expandedCardsLabel: "Expanded",
  showDetailsLabel: "Show details",
  collapseDetailsLabel: "Hide details",
  openNewTabLabel: "Open in new tab",
  noRecordsLabel: "No records found",
  emptyColumnLabel: "No records in this stage",
  viewByLabel: "View by",
  closeDateOverdue: "Overdue",
  closeDateToday: "Due today",
  closeDateSoon: "Due soon",
  closeDateLater: "Expected close",
  recordCountLabel: count => `${count} records`,
  columnTotalsLabel: "Totals for visible records",
  totalNeedsCurrencyLabel: "Add transaction currency to the view",
};

const de: Strings = {
  configurationErrorsLabel: "Konfigurationsfehler", configurationExportLabel: "Konfiguration exportieren",
  configurationExportHelp: "Diese Einstellungen in Config (JSON) im Ansichtseditor einfügen, speichern und veröffentlichen. Enthält keine Datensatzdaten oder aktuellen Such-/Filterauswahlen.",
  configurationExportBlocked: "Diese Einstellungen vor der Migration korrigieren. Die Vorschau ist unvollständig.",
  configurationCopyLabel: "JSON kopieren", configurationCopied: "Konfiguration kopiert.",
  configurationCopyFallback: "JSON markieren und Strg+C (Cmd+C am Mac) drücken.", configurationCloseLabel: "Schließen",
  recordDetailsLabel: "Datensatzdetails", sidePaneFallbackLabel: "Seitenbereich nicht verfügbar; als Dialog geöffnet.",
  openRecordErrorLabel: "Der Datensatz konnte nicht geöffnet werden.", saveLabel: "Speichern", cancelLabel: "Abbrechen", editLabel: "Bearbeiten",
  dragCardLabel: "Karte verschieben", refreshLabel: "Aktualisieren", finishEditingLabel: "Zuerst speichern oder abbrechen.",
  inlineSaveErrorLabel: "Die Änderung konnte nicht gespeichert werden.",
  inlineErrors: { invalidNumber: "Eine Zahl ohne Tausendertrennzeichen eingeben.", invalidProbability: "Eine ganze Zahl von 0 bis 100 eingeben.",
    invalidDate: "Ein gültiges Datum eingeben.", closed: "Hier können nur offene Verkaufschancen bearbeitet werden.", calculated: "Der Umsatz wird aus Produkten berechnet. Das Formular verwenden.",
    conflict: "Der Wert wurde inzwischen geändert. Abbrechen und erneut öffnen.", unsupported: "Dieses Feld im Formular bearbeiten.",
    required: "Dieses Feld ist erforderlich.", tooLong: "Der Text ist zu lang.", range: "Die Zahl liegt außerhalb des erlaubten Bereichs." },
  dateFilterAll: "(Alle)",
  dateFilterToday: "Heute",
  dateFilterLast7: "Letzte 7 Tage",
  dateFilterLast30: "Letzte 30 Tage",
  dateFilterCurrentMonth: "Aktueller Monat",
  dateFilterCurrentYear: "Aktuelles Jahr",
  dateFilterCurrentWeek: "Aktuelle Kalenderwoche",
  dateFilterNextWeek: "Nächste Kalenderwoche",
  dateFilterNextMonth: "Nächster Monat",
  dateFilterCustomRange: "Benutzerdefinierter Bereich",
  dateFilterFrom: "Von",
  dateFilterTo: "Bis",
  dateFilterStartAria: "Startdatum auswählen",
  dateFilterEndAria: "Enddatum auswählen",

  numberFilterAll: "(Alle)",
  numberFilterGreaterThan: "Größer als",
  numberFilterLessThan: "Kleiner als",
  numberFilterGreaterOrEqual: "Größer oder gleich",
  numberFilterLessOrEqual: "Kleiner oder gleich",
  numberFilterBetween: "Zwischen",
  numberFilterValuePlaceholder: "Wert",
  numberFilterValueAriaLabel: "Zahlenwert",
  numberFilterMinPlaceholder: "Min",
  numberFilterMinAriaLabel: "Mindestwert",
  numberFilterMaxPlaceholder: "Max",
  numberFilterMaxAriaLabel: "Höchstwert",

  quickFilterAll: "(Alle)",
  quickFiltersMoreFilters: "Weitere Filter",
  quickFiltersMoreFiltersOpen: "Weitere Filter öffnen",
  quickFiltersSearchPlaceholder: "In allen Feldern suchen…",
  quickFiltersSearchAriaLabel: "Suche in allen Kartenfeldern",
  quickFiltersAriaLabel: "Schnellfilter und Suche",
  sortByLabel: "Sortieren nach",
  sortNone: "(Keine)",
  sortAscending: "Aufsteigend",
  sortDescending: "Absteigend",
  filterPresetLabel: "Filter-Preset",
  filterPresetNone: "(Kein Preset)",

  toastSaving: "Speichern...",
  toastSuccessMoved: (columnName) => `Erfolgreich verschoben nach ${columnName} 🎉`,
  toastUnallocated: "Nicht zugeordnet",
  toastValidationFunctionNotFound: "Die Validierungsfunktion für Kartenverschiebungen ist nicht verfügbar. Prüfen Sie, ob die Webressource geladen ist und der Funktionspfad stimmt.",
  bpfMoveError: (code, detail, savedSteps) => bpfErrorMessage("de", code, detail, savedSteps),

  loadingLabel: "Laden...",
  openingRecordLabel: "Datensatz wird geöffnet...",
  cardDensityLabel: "Kartenansicht",
  compactCardsLabel: "Kompakt",
  expandedCardsLabel: "Ausführlich",
  showDetailsLabel: "Details anzeigen",
  collapseDetailsLabel: "Details ausblenden",
  openNewTabLabel: "In neuem Tab öffnen",
  noRecordsLabel: "Keine Datensätze gefunden",
  emptyColumnLabel: "Keine Datensätze in dieser Phase",
  viewByLabel: "Gruppieren nach",
  closeDateOverdue: "Überfällig",
  closeDateToday: "Heute fällig",
  closeDateSoon: "Bald fällig",
  closeDateLater: "Erwarteter Abschluss",
  recordCountLabel: count => `${count} Datensätze`,
  columnTotalsLabel: "Summen der sichtbaren Datensätze",
  totalNeedsCurrencyLabel: "Transaktionswährung zur Ansicht hinzufügen",
};

const nl: Strings = {
  configurationErrorsLabel: "Configuratiefouten", configurationExportLabel: "Configuratie exporteren",
  configurationExportHelp: "Plak deze instellingen in Config (JSON) in de view-editor, sla op en publiceer. De export bevat de boardinrichting, zonder recordgegevens of je huidige zoek-/filterkeuzes.",
  configurationExportBlocked: "Herstel deze instellingen voordat je migreert. Dit voorbeeld is onvolledig.",
  configurationCopyLabel: "JSON kopiëren", configurationCopied: "Configuratie gekopieerd.",
  configurationCopyFallback: "Selecteer de JSON en druk op Ctrl+C (Cmd+C op Mac).", configurationCloseLabel: "Sluiten",
  recordDetailsLabel: "Recorddetails", sidePaneFallbackLabel: "Zijpaneel hier niet beschikbaar; geopend in een dialoog.",
  openRecordErrorLabel: "Het record kon niet worden geopend.", saveLabel: "Opslaan", cancelLabel: "Annuleren", editLabel: "Aanpassen",
  dragCardLabel: "Kaart verplaatsen", refreshLabel: "Verversen", finishEditingLabel: "Sla je wijziging eerst op of annuleer deze.",
  inlineSaveErrorLabel: "De wijziging kon niet worden opgeslagen.",
  inlineErrors: { invalidNumber: "Voer een getal in zonder duizendtalscheiding.", invalidProbability: "Voer een geheel getal van 0 tot 100 in.",
    invalidDate: "Voer een geldige datum in.", closed: "Je kunt hier alleen open Opportunities aanpassen.", calculated: "Omzet wordt uit producten berekend. Pas deze aan in het formulier.",
    conflict: "Deze waarde is ondertussen gewijzigd. Annuleer en open de bewerking opnieuw om de actuele waarde te laden.",
    unsupported: "Dit veld kun je hier niet aanpassen. Gebruik het formulier.", required: "Dit veld is verplicht.",
    tooLong: "De tekst is langer dan dit veld toestaat.", range: "Het getal valt buiten het toegestane bereik van dit veld." },
  dateFilterAll: "(Alles)", dateFilterToday: "Vandaag", dateFilterLast7: "Laatste 7 dagen",
  dateFilterLast30: "Laatste 30 dagen", dateFilterCurrentMonth: "Deze maand", dateFilterCurrentYear: "Dit jaar",
  dateFilterCurrentWeek: "Deze week", dateFilterNextWeek: "Volgende week", dateFilterNextMonth: "Volgende maand",
  dateFilterCustomRange: "Eigen periode", dateFilterFrom: "Van", dateFilterTo: "Tot",
  dateFilterStartAria: "Kies begindatum", dateFilterEndAria: "Kies einddatum",
  numberFilterAll: "(Alles)", numberFilterGreaterThan: "Groter dan", numberFilterLessThan: "Kleiner dan",
  numberFilterGreaterOrEqual: "Groter dan of gelijk aan", numberFilterLessOrEqual: "Kleiner dan of gelijk aan",
  numberFilterBetween: "Tussen", numberFilterValuePlaceholder: "Waarde", numberFilterValueAriaLabel: "Getalswaarde",
  numberFilterMinPlaceholder: "Min", numberFilterMinAriaLabel: "Minimumwaarde", numberFilterMaxPlaceholder: "Max",
  numberFilterMaxAriaLabel: "Maximumwaarde", quickFilterAll: "(Alles)", quickFiltersMoreFilters: "Meer filters",
  quickFiltersMoreFiltersOpen: "Meer filters openen", quickFiltersSearchPlaceholder: "Zoeken in alle velden…",
  quickFiltersSearchAriaLabel: "Zoeken in alle kaartvelden", quickFiltersAriaLabel: "Filters en zoeken",
  sortByLabel: "Sorteren op", sortNone: "(Geen)", sortAscending: "Oplopend", sortDescending: "Aflopend",
  filterPresetLabel: "Filterpreset", filterPresetNone: "(Geen preset)", toastSaving: "Opslaan…",
  toastSuccessMoved: column => `Verplaatst naar ${column}`, toastUnallocated: "Niet toegewezen",
  toastValidationFunctionNotFound: "De validatiefunctie voor verplaatsen is niet beschikbaar. Controleer de webresource en functienaam.",
  bpfMoveError: (code, detail, savedSteps) => bpfErrorMessage("nl", code, detail, savedSteps),
  loadingLabel: "Laden…", openingRecordLabel: "Record openen…", cardDensityLabel: "Kaartweergave",
  compactCardsLabel: "Compact", expandedCardsLabel: "Uitgebreid", showDetailsLabel: "Details tonen",
  collapseDetailsLabel: "Details verbergen", openNewTabLabel: "Openen in nieuw tabblad", noRecordsLabel: "Geen records gevonden",
  emptyColumnLabel: "Geen records in deze fase", viewByLabel: "Groeperen op", closeDateOverdue: "Datum verstreken",
  closeDateToday: "Sluit vandaag", closeDateSoon: "Sluit binnenkort", closeDateLater: "Verwachte sluiting",
  recordCountLabel: count => `${count} ${count === 1 ? "record" : "records"}`,
  columnTotalsLabel: "Totalen van zichtbare records", totalNeedsCurrencyLabel: "Voeg transactievaluta toe aan de view",
};

const stringsByLocale: Record<string, Strings> = {
  en,
  "en-US": en,
  "en-GB": en,
  de,
  "de-DE": de,
  nl,
  "nl-NL": nl,
};

/**
 * Maps Power Apps / Dataverse languageId (LCID) to a locale string for getStrings.
 * Common LCIDs: 1033 = en-US, 1031 = de-DE, 1034 = es-ES, 1036 = fr-FR, 1040 = it-IT.
 */
const LCID_TO_LOCALE: Record<number, string> = {
  1025: "ar",
  1026: "bg",
  1027: "ca",
  1028: "zh-TW",
  1029: "cs",
  1030: "da",
  1031: "de",
  1032: "el",
  1033: "en",
  1034: "es",
  1035: "fi",
  1036: "fr",
  1037: "he",
  1038: "hu",
  1039: "is",
  1040: "it",
  1041: "ja",
  1042: "ko",
  1043: "nl",
  1044: "nb",
  1045: "pl",
  1046: "pt",
  1048: "ro",
  1049: "ru",
  1050: "hr",
  1051: "sk",
  1052: "sq",
  1053: "sv",
  1054: "th",
  1055: "tr",
  2052: "zh-CN",
};

/**
 * Returns the locale string (e.g. "en", "de") for a given languageId (LCID).
 * Unknown IDs fall back to "en".
 */
export function getLocaleFromLanguageId(languageId: number | undefined): string {
  if (languageId == null) return "en";
  const locale = LCID_TO_LOCALE[languageId];
  if (locale) return locale;
  // Fallback: try first two digits (e.g. 1033 -> 10 -> not in map; use "en")
  return "en";
}

/**
 * Returns localized strings for the given locale.
 * Unknown locales fall back to English.
 */
export function getStrings(locale: string): Strings {
  const normalized = locale?.split("-")[0]?.toLowerCase() ?? "en";
  return stringsByLocale[locale] ?? stringsByLocale[normalized] ?? en;
}
