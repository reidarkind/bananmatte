export type MaxN = 10 | 50 | 100 | 1000;

export type ModeId =
  | "tiervenn"
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
  | "partall-oddetall-subtraksjon";

export type PlaySelection = ModeId | "mix" | "selected";

export type AnswerKind = "number" | "parity";

export type Parity = "partall" | "oddetall";

export type Rng = () => number;

export interface Settings {
  maxN: MaxN;
  playSelection: PlaySelection;
  selectedModes: ModeId[];
  hundrevennEnabled: boolean;
  sound: boolean;
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
  answer: number | Parity;
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
];

export const MODE_LABELS: Record<ModeId | "mix" | "selected", string> = {
  tiervenn: "Tiervenn",
  hundrevenn: "Hundrevenn",
  addisjon: "Addering",
  "subtraksjon-positiv": "Subtraksjon",
  "subtraksjon-negativ": "Subtraksjon (±)",
  "multiplikasjon-mini": "Multiplikasjon mini",
  "multiplikasjon-liten": "Multiplikasjon liten",
  "divisjon-mini": "Divisjon mini",
  "divisjon-liten": "Divisjon liten",
  "partall-oddetall": "Partall / oddetall",
  "partall-oddetall-addisjon": "Partall / oddetall +",
  "partall-oddetall-subtraksjon": "Partall / oddetall −",
  mix: "Mix",
  selected: "Utvalg",
};

export const DEFAULT_SETTINGS: Settings = {
  maxN: 10,
  playSelection: "tiervenn",
  selectedModes: ["tiervenn", "addisjon", "partall-oddetall"],
  hundrevennEnabled: true,
  sound: true,
};
