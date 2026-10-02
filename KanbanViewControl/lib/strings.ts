/**
 * Localized UI strings for the Kanban control.
 * The control uses the app language (context.userSettings.languageId) to pick the locale.
 */

export interface Strings {
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
}

const en: Strings = {
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
