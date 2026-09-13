import { modeLabel, t } from "../i18n";
import { FRIEND_BASE, type CompareAnswer, type Locale, type ModeId, type Parity, type Rng, type RoundPlan, type Settings } from "../types";
import {
  compareOf,
  explainAdd,
  explainCompare,
  explainDiv,
  explainFriend,
  explainMul,
  explainParity,
  explainParityDiff,
  explainParitySum,
  explainRound,
  explainSub,
  nFriend,
  roundTo,
} from "./explanations";
import { resolveRoundMode } from "./modes";
import { pickOne, randomInt } from "./rng";

function parityOf(n: number): Parity {
  return n % 2 === 0 ? "partall" : "oddetall";
}

function randomX(maxN: number, rng: Rng, min = 1, max = maxN): number {
  return randomInt(Math.max(1, min), Math.max(Math.max(1, min), Math.min(maxN, max)), rng);
}

export function friendCatchMax(base: number, maxN: number): number {
  return Math.max(1, Math.min(maxN, base) - 1);
}

function planFriend(mode: ModeId, base: number, maxN: number, rng: Rng, locale: Locale): RoundPlan {
  const x = randomX(friendCatchMax(base, maxN), rng);
  const answer = nFriend(x, base);
  const name = modeLabel(locale, mode);
  return {
    mode,
    catchTarget: x,
    prompt: t(locale, "math.friendAsk", { name: name.toLowerCase() }),
    expression: String(x),
    kind: "number",
    answer,
    explanation: explainFriend(name, x, answer, base, locale),
  };
}

function planAddisjon(maxN: number, rng: Rng, locale: Locale): RoundPlan {
  let x = randomX(maxN, rng);
  if (x >= maxN) {
    x = randomX(maxN, rng, 1, Math.max(1, maxN - 1));
  }
  const yMax = maxN - x - 1;
  const y = yMax >= 0 ? randomInt(0, yMax, rng) : 0;
  return {
    mode: "addisjon",
    catchTarget: x,
    prompt: t(locale, "math.ask"),
    expression: `${x} + ${y}`,
    kind: "number",
    answer: x + y,
    operand: y,
    explanation: explainAdd(x, y, locale),
  };
}

function planSubtraksjonPositiv(maxN: number, rng: Rng, locale: Locale): RoundPlan {
  const x = randomX(maxN, rng);
  const y = randomInt(0, x, rng);
  return {
    mode: "subtraksjon-positiv",
    catchTarget: x,
    prompt: t(locale, "math.ask"),
    expression: `${x} − ${y}`,
    kind: "number",
    answer: x - y,
    operand: y,
    explanation: explainSub(x, y, locale),
  };
}

function planSubtraksjonNegativ(maxN: number, rng: Rng, locale: Locale): RoundPlan {
  const x = randomX(maxN, rng);
  const y = randomX(maxN, rng);
  return {
    mode: "subtraksjon-negativ",
    catchTarget: x,
    prompt: t(locale, "math.ask"),
    expression: `${x} − ${y}`,
    kind: "number",
    answer: x - y,
    operand: y,
    explanation: explainSub(x, y, locale),
  };
}

function planMultiplikasjon(mode: "multiplikasjon-mini" | "multiplikasjon-liten", maxN: number, rng: Rng, locale: Locale): RoundPlan {
  const kMax = mode === "multiplikasjon-mini" ? 5 : 10;
  const x = randomX(maxN, rng);
  const k = randomInt(1, kMax, rng);
  return {
    mode,
    catchTarget: x,
    prompt: t(locale, "math.ask"),
    expression: `${x} · ${k}`,
    kind: "number",
    answer: x * k,
    operand: k,
    explanation: explainMul(x, k, locale),
  };
}

function multiplesUpTo(maxN: number, d: number): number[] {
  const values: number[] = [];
  for (let n = d; n <= maxN; n += d) values.push(n);
  if (values.length === 0) values.push(d <= maxN ? d : 1);
  return values;
}

function planDivisjonMini(maxN: number, rng: Rng, locale: Locale): RoundPlan {
  const d = pickOne([1, 2, 3] as const, rng);
  const x = pickOne(multiplesUpTo(maxN, d), rng);
  return {
    mode: "divisjon-mini",
    catchTarget: x,
    prompt: t(locale, "math.ask"),
    expression: `${x} : ${d}`,
    kind: "number",
    answer: x / d,
    operand: d,
    explanation: explainDiv(x, d, x / d, locale),
  };
}

function planDivisjonLiten(maxN: number, rng: Rng, locale: Locale): RoundPlan {
  if (rng() < 0.5) {
    const d = randomInt(1, 10, rng);
    const x = pickOne(multiplesUpTo(maxN, d), rng);
    return {
      mode: "divisjon-liten",
      catchTarget: x,
      prompt: t(locale, "math.ask"),
      expression: `${x} : ${d}`,
      kind: "number",
      answer: x / d,
      operand: d,
      explanation: explainDiv(x, d, x / d, locale),
    };
  }
  const x = randomInt(1, Math.min(10, maxN), rng);
  const maxQuotient = Math.max(1, Math.floor(maxN / x));
  const quotient = randomInt(1, maxQuotient, rng);
  const numerator = x * quotient;
  return {
    mode: "divisjon-liten",
    catchTarget: x,
    prompt: t(locale, "math.ask"),
    expression: `${numerator} : ${x}`,
    kind: "number",
    answer: quotient,
    operand: numerator,
    explanation: explainDiv(numerator, x, quotient, locale),
  };
}

function planParity(maxN: number, rng: Rng, locale: Locale): RoundPlan {
  const x = randomX(maxN, rng);
  return {
    mode: "partall-oddetall",
    catchTarget: x,
    prompt: t(locale, "math.askParity"),
    expression: String(x),
    kind: "parity",
    answer: parityOf(x),
    explanation: explainParity(x, locale),
  };
}

function planParityAdd(maxN: number, rng: Rng, locale: Locale): RoundPlan {
  const x = randomX(maxN, rng);
  const y = randomX(maxN, rng);
  const sum = x + y;
  return {
    mode: "partall-oddetall-addisjon",
    catchTarget: x,
    prompt: t(locale, "math.askParity"),
    expression: `${x} + ${y}`,
    kind: "parity",
    answer: parityOf(sum),
    operand: y,
    explanation: explainParitySum(x, y, locale),
  };
}

function planParitySub(maxN: number, rng: Rng, locale: Locale): RoundPlan {
  const x = randomX(maxN, rng);
  const y = randomInt(0, x, rng);
  const diff = x - y;
  return {
    mode: "partall-oddetall-subtraksjon",
    catchTarget: x,
    prompt: t(locale, "math.askParity"),
    expression: `${x} − ${y}`,
    kind: "parity",
    answer: parityOf(diff),
    operand: y,
    explanation: explainParityDiff(x, y, locale),
  };
}

function planRoundMode(
  mode: ModeId,
  maxN: number,
  rng: Rng,
  locale: Locale,
  base: number,
  dir: "up" | "down" | "nearest",
): RoundPlan {
  const x = randomX(maxN, rng);
  const answer = roundTo(x, base, dir);
  const unit = t(locale, base === 100 ? "math.unitHundred" : "math.unitTen");
  const key = dir === "up" ? "math.roundUp" : dir === "down" ? "math.roundDown" : "math.roundNear";
  return {
    mode,
    catchTarget: x,
    prompt: t(locale, key, { unit }),
    expression: String(x),
    kind: "number",
    answer,
    explanation: explainRound(x, answer, base, dir, locale),
  };
}

function planCompare(mode: "ulikhet-tegn" | "ulikhet-ord", maxN: number, rng: Rng, locale: Locale): RoundPlan {
  const x = randomX(maxN, rng);
  let y = randomX(maxN, rng);
  if (rng() < 0.22) y = x;
  const answer = compareOf(x, y);
  return {
    mode,
    catchTarget: x,
    prompt: t(locale, mode === "ulikhet-tegn" ? "math.askSign" : "math.askWord"),
    expression: mode === "ulikhet-tegn" ? `${x} □ ${y}` : `${x}  ___  ${y}`,
    kind: "compare",
    answer,
    operand: y,
    explanation: explainCompare(x, y, answer, locale),
  };
}

export function planMode(mode: ModeId, maxN: number, rng: Rng, locale: Locale = "nb"): RoundPlan {
  const friendBase = FRIEND_BASE[mode];
  if (friendBase) return planFriend(mode, friendBase, maxN, rng, locale);
  switch (mode) {
    case "addisjon":
      return planAddisjon(maxN, rng, locale);
    case "subtraksjon-positiv":
      return planSubtraksjonPositiv(maxN, rng, locale);
    case "subtraksjon-negativ":
      return planSubtraksjonNegativ(maxN, rng, locale);
    case "multiplikasjon-mini":
    case "multiplikasjon-liten":
      return planMultiplikasjon(mode, maxN, rng, locale);
    case "divisjon-mini":
      return planDivisjonMini(maxN, rng, locale);
    case "divisjon-liten":
      return planDivisjonLiten(maxN, rng, locale);
    case "partall-oddetall":
      return planParity(maxN, rng, locale);
    case "partall-oddetall-addisjon":
      return planParityAdd(maxN, rng, locale);
    case "partall-oddetall-subtraksjon":
      return planParitySub(maxN, rng, locale);
    case "avrunding-tier-opp":
      return planRoundMode(mode, maxN, rng, locale, 10, "up");
    case "avrunding-tier-ned":
      return planRoundMode(mode, maxN, rng, locale, 10, "down");
    case "avrunding-tier":
      return planRoundMode(mode, maxN, rng, locale, 10, "nearest");
    case "avrunding-hundre-opp":
      return planRoundMode(mode, maxN, rng, locale, 100, "up");
    case "avrunding-hundre-ned":
      return planRoundMode(mode, maxN, rng, locale, 100, "down");
    case "avrunding-hundre":
      return planRoundMode(mode, maxN, rng, locale, 100, "nearest");
    case "ulikhet-tegn":
    case "ulikhet-ord":
      return planCompare(mode, maxN, rng, locale);
    default:
      return planAddisjon(maxN, rng, locale);
  }
}

export function planRound(settings: Settings, rng: Rng, previous?: ModeId): RoundPlan {
  const mode = resolveRoundMode(settings, rng, previous);
  return planMode(mode, settings.maxN, rng, settings.locale);
}

export function answersMatch(
  expected: number | Parity | CompareAnswer,
  given: number | Parity | CompareAnswer,
): boolean {
  return expected === given;
}
