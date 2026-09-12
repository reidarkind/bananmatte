import type { ModeId, Parity, Rng, RoundPlan, Settings } from "../types";
import {
  explainAdd,
  explainDiv,
  explainHundrevenn,
  explainMul,
  explainParity,
  explainParityDiff,
  explainParitySum,
  explainSub,
  explainTiervenn,
} from "./explanations";
import { resolveRoundMode } from "./modes";
import { pickOne, randomInt } from "./rng";

function parityOf(n: number): Parity {
  return n % 2 === 0 ? "partall" : "oddetall";
}

function tensFriend(n: number): number {
  return (10 - (n % 10)) % 10;
}

function hundredsFriend(n: number): number {
  return (100 - (n % 100)) % 100;
}

function randomX(maxN: number, rng: Rng, min = 1, max = maxN): number {
  return randomInt(Math.max(1, min), Math.max(Math.max(1, min), Math.min(maxN, max)), rng);
}

function planTiervenn(maxN: number, rng: Rng): RoundPlan {
  const x = randomX(maxN, rng);
  const answer = tensFriend(x);
  return {
    mode: "tiervenn",
    catchTarget: x,
    prompt: `Hva er tiervennen til ${x}?`,
    kind: "number",
    answer,
    explanation: explainTiervenn(x, answer),
  };
}

function planHundrevenn(maxN: number, rng: Rng): RoundPlan {
  const x = randomX(maxN, rng);
  const answer = hundredsFriend(x);
  return {
    mode: "hundrevenn",
    catchTarget: x,
    prompt: `Hva er hundrevennen til ${x}?`,
    kind: "number",
    answer,
    explanation: explainHundrevenn(x, answer),
  };
}

function planAddisjon(maxN: number, rng: Rng): RoundPlan {
  let x = randomX(maxN, rng);
  if (x >= maxN) {
    x = randomX(maxN, rng, 1, Math.max(1, maxN - 1));
  }
  const yMax = maxN - x - 1;
  const y = yMax >= 0 ? randomInt(0, yMax, rng) : 0;
  return {
    mode: "addisjon",
    catchTarget: x,
    prompt: `Hva er ${x} + ${y}?`,
    kind: "number",
    answer: x + y,
    operand: y,
    explanation: explainAdd(x, y),
  };
}

function planSubtraksjonPositiv(maxN: number, rng: Rng): RoundPlan {
  const x = randomX(maxN, rng);
  const y = randomInt(0, x, rng);
  return {
    mode: "subtraksjon-positiv",
    catchTarget: x,
    prompt: `Hva er ${x} − ${y}?`,
    kind: "number",
    answer: x - y,
    operand: y,
    explanation: explainSub(x, y),
  };
}

function planSubtraksjonNegativ(maxN: number, rng: Rng): RoundPlan {
  const x = randomX(maxN, rng);
  const y = randomX(maxN, rng);
  return {
    mode: "subtraksjon-negativ",
    catchTarget: x,
    prompt: `Hva er ${x} − ${y}?`,
    kind: "number",
    answer: x - y,
    operand: y,
    explanation: explainSub(x, y),
  };
}

function planMultiplikasjon(mode: "multiplikasjon-mini" | "multiplikasjon-liten", maxN: number, rng: Rng): RoundPlan {
  const kMax = mode === "multiplikasjon-mini" ? 5 : 10;
  const x = randomX(maxN, rng);
  const k = randomInt(1, kMax, rng);
  return {
    mode,
    catchTarget: x,
    prompt: `Hva er ${x} · ${k}?`,
    kind: "number",
    answer: x * k,
    operand: k,
    explanation: explainMul(x, k),
  };
}

function multiplesUpTo(maxN: number, d: number): number[] {
  const values: number[] = [];
  for (let n = d; n <= maxN; n += d) {
    values.push(n);
  }
  if (values.length === 0) values.push(d <= maxN ? d : 1);
  return values;
}

function planDivisjonMini(maxN: number, rng: Rng): RoundPlan {
  const d = pickOne([1, 2, 3] as const, rng);
  const x = pickOne(multiplesUpTo(maxN, d), rng);
  return {
    mode: "divisjon-mini",
    catchTarget: x,
    prompt: `Hva er ${x} : ${d}?`,
    kind: "number",
    answer: x / d,
    operand: d,
    explanation: explainDiv(x, d, x / d),
  };
}

function planDivisjonLiten(maxN: number, rng: Rng): RoundPlan {
  if (rng() < 0.5) {
    const d = randomInt(1, 10, rng);
    const x = pickOne(multiplesUpTo(maxN, d), rng);
    return {
      mode: "divisjon-liten",
      catchTarget: x,
      prompt: `Hva er ${x} : ${d}?`,
      kind: "number",
      answer: x / d,
      operand: d,
      explanation: explainDiv(x, d, x / d),
    };
  }

  const x = randomInt(1, Math.min(10, maxN), rng);
  const maxQuotient = Math.max(1, Math.floor(maxN / x));
  const quotient = randomInt(1, maxQuotient, rng);
  const numerator = x * quotient;
  return {
    mode: "divisjon-liten",
    catchTarget: x,
    prompt: `Hva er ${numerator} : ${x}?`,
    kind: "number",
    answer: quotient,
    operand: numerator,
    explanation: explainDiv(numerator, x, quotient),
  };
}

function planParity(maxN: number, rng: Rng): RoundPlan {
  const x = randomX(maxN, rng);
  const answer = parityOf(x);
  return {
    mode: "partall-oddetall",
    catchTarget: x,
    prompt: `Er ${x} partall eller oddetall?`,
    kind: "parity",
    answer,
    explanation: explainParity(x),
  };
}

function planParityAdd(maxN: number, rng: Rng): RoundPlan {
  const x = randomX(maxN, rng);
  const y = randomX(maxN, rng);
  const sum = x + y;
  return {
    mode: "partall-oddetall-addisjon",
    catchTarget: x,
    prompt: `Er ${x} + ${y} partall eller oddetall?`,
    kind: "parity",
    answer: parityOf(sum),
    operand: y,
    explanation: explainParitySum(x, y),
  };
}

function planParitySub(maxN: number, rng: Rng): RoundPlan {
  const x = randomX(maxN, rng);
  const y = randomInt(0, x, rng);
  const diff = x - y;
  return {
    mode: "partall-oddetall-subtraksjon",
    catchTarget: x,
    prompt: `Er ${x} − ${y} partall eller oddetall?`,
    kind: "parity",
    answer: parityOf(diff),
    operand: y,
    explanation: explainParityDiff(x, y),
  };
}

export function planMode(mode: ModeId, maxN: number, rng: Rng): RoundPlan {
  switch (mode) {
    case "tiervenn":
      return planTiervenn(maxN, rng);
    case "hundrevenn":
      return planHundrevenn(maxN, rng);
    case "addisjon":
      return planAddisjon(maxN, rng);
    case "subtraksjon-positiv":
      return planSubtraksjonPositiv(maxN, rng);
    case "subtraksjon-negativ":
      return planSubtraksjonNegativ(maxN, rng);
    case "multiplikasjon-mini":
    case "multiplikasjon-liten":
      return planMultiplikasjon(mode, maxN, rng);
    case "divisjon-mini":
      return planDivisjonMini(maxN, rng);
    case "divisjon-liten":
      return planDivisjonLiten(maxN, rng);
    case "partall-oddetall":
      return planParity(maxN, rng);
    case "partall-oddetall-addisjon":
      return planParityAdd(maxN, rng);
    case "partall-oddetall-subtraksjon":
      return planParitySub(maxN, rng);
  }
}

export function planRound(settings: Settings, rng: Rng): RoundPlan {
  const mode = resolveRoundMode(settings, rng);
  return planMode(mode, settings.maxN, rng);
}

export function answersMatch(expected: number | Parity, given: number | Parity): boolean {
  return expected === given;
}
