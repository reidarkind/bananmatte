export type MaxN = 10 | 50 | 100 | 1000;

export type Locale = "nb" | "en";

export type ModeId =
  | "tiervenn"
  | "femmervenn"
  | "sekservenn"
  | "syvervenn"
  | "attervenn"
  | "niervenn"
  | "hundrevenn"
  | "addisjon"
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
  | "ulikhet-ord";

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
  "tiervenn",
  "femmervenn",
  "sekservenn",
  "syvervenn",
  "attervenn",
  "niervenn",
  "hundrevenn",
  "addisjon",
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
};
