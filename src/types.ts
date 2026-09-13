export type MaxN = 10 | 20 | 50 | 100 | 1000;

export const ALL_MAX_N: MaxN[] = [10, 20, 50, 100, 1000];

export type ModeFilter = "alle" | "klasse1" | "klasse2" | "utfordring";

export const MODE_FILTERS: ModeFilter[] = ["alle", "klasse1", "klasse2", "utfordring"];

export function parseModeFilter(value: unknown): ModeFilter {
  return MODE_FILTERS.includes(value as ModeFilter) ? (value as ModeFilter) : "alle";
}

export type Locale = "nb" | "en" | "es" | "de" | "pt" | "sv" | "da";

export const LOCALES: Locale[] = ["nb", "en", "es", "de", "pt", "sv", "da"];

export const LOCALE_NAMES: Record<Locale, string> = {
  nb: "Norsk",
  en: "English",
  es: "Español",
  de: "Deutsch",
  pt: "Português",
  sv: "Svenska",
  da: "Dansk",
};

export const LOCALE_HTML: Record<Locale, string> = {
  nb: "no",
  en: "en",
  es: "es",
  de: "de",
  pt: "pt",
  sv: "sv",
  da: "da",
};

export function parseLocale(value: unknown): Locale {
  return LOCALES.includes(value as Locale) ? (value as Locale) : "nb";
}

export type PlayStyle = "sank" | "angrep" | "forsvar";

export type PlayStyleChoice = PlayStyle | "mix";

export type ModeId =
  | "tiervenn"
  | "femmervenn"
  | "sekservenn"
  | "syvervenn"
  | "attervenn"
  | "niervenn"
  | "hundrevenn"
  | "addisjon"
  | "plassverdi"
  | "subtraksjon-positiv"
  | "subtraksjon-negativ"
  | "multiplikasjon-mini"
  | "multiplikasjon-liten"
  | "divisjon-mini"
  | "divisjon-liten"
  | "partall-oddetall"
  | "partall-oddetall-addisjon"
  | "partall-oddetall-subtraksjon"
  | "avrunding-tier-opp"
  | "avrunding-tier-ned"
  | "avrunding-tier"
  | "avrunding-hundre-opp"
  | "avrunding-hundre-ned"
  | "avrunding-hundre"
  | "ulikhet-tegn"
  | "ulikhet-ord"
  | "manglende-tall"
  | "bytteplass"
  | "likhet"
  | "ti-mer-mindre"
  | "hoppetelling"
  | "dobbelt-halv"
  | "klokke";

export type PlaySelection = ModeId | "mix" | "selected";

export type AnswerKind = "number" | "parity" | "compare";

export type Parity = "partall" | "oddetall";

export type CompareAnswer = "gt" | "lt" | "eq";

export type Rng = () => number;

export interface Settings {
  maxN: MaxN;
  playSelection: PlaySelection;
  selectedModes: ModeId[];
  hundrevennEnabled: boolean;
  sound: boolean;
  locale: Locale;
  playStyle: PlayStyleChoice;
  modeFilter: ModeFilter;
}

export interface HighscoreEntry {
  name: string;
  score: number;
  level: number;
  date: string;
}

export interface RoundPlan {
  mode: ModeId;
  catchTarget: number;
  prompt: string;
  expression?: string;
  kind: AnswerKind;
  answer: number | Parity | CompareAnswer;
  explanation: string;
  operand?: number;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export const ALL_MODES: ModeId[] = [
  "femmervenn",
  "sekservenn",
  "syvervenn",
  "attervenn",
  "niervenn",
  "tiervenn",
  "hundrevenn",
  "addisjon",
  "plassverdi",
  "subtraksjon-positiv",
  "subtraksjon-negativ",
  "multiplikasjon-mini",
  "multiplikasjon-liten",
  "divisjon-mini",
  "divisjon-liten",
  "partall-oddetall",
  "partall-oddetall-addisjon",
  "partall-oddetall-subtraksjon",
  "avrunding-tier-opp",
  "avrunding-tier-ned",
  "avrunding-tier",
  "avrunding-hundre-opp",
  "avrunding-hundre-ned",
  "avrunding-hundre",
  "ulikhet-tegn",
  "ulikhet-ord",
  "manglende-tall",
  "bytteplass",
  "likhet",
  "ti-mer-mindre",
  "hoppetelling",
  "dobbelt-halv",
  "klokke",
];

export const FRIEND_BASE: Partial<Record<ModeId, number>> = {
  femmervenn: 5,
  sekservenn: 6,
  syvervenn: 7,
  attervenn: 8,
  niervenn: 9,
  tiervenn: 10,
  hundrevenn: 100,
};

export const DEFAULT_SETTINGS: Settings = {
  maxN: 10,
  playSelection: "tiervenn",
  selectedModes: ["tiervenn", "addisjon", "partall-oddetall"],
  hundrevennEnabled: true,
  sound: true,
  locale: "nb",
  playStyle: "sank",
  modeFilter: "alle",
};
