import { t } from "../i18n";
import type { Locale, Rng, RoundPlan } from "../types";
import {
  explainClock,
  explainDoubleHalf,
  explainLikhet,
  explainManglendeTall,
  explainSkipCount,
  explainTenMoreLess,
} from "./explanations";
import { pickOne, randomInt } from "./rng";

function hopSteps(maxN: number): number[] {
  const steps = [2];
  if (maxN >= 20) steps.push(5);
  if (maxN >= 50) steps.push(10);
  return steps;
}

function clockHour(hour: number): string {
  return `${String(hour).padStart(2, "0")}:00`;
}

function clockHalf(hour: number): string {
  return `${String(hour).padStart(2, "0")}:30`;
}

export function planManglendeTall(maxN: number, rng: Rng, locale: Locale = "nb"): RoundPlan {
  const sum = randomInt(2, Math.max(2, maxN), rng);
  const known = randomInt(1, sum - 1, rng);
  const missing = sum - known;
  const hideLeft = rng() < 0.5;
  const expression = hideLeft ? `□ + ${known} = ${sum}` : `${known} + □ = ${sum}`;
  const catchChoices = known === missing ? [sum] : [known, sum];
  return {
    mode: "manglende-tall",
    catchTarget: pickOne(catchChoices, rng),
    prompt: t(locale, "math.missing"),
    expression,
    kind: "number",
    answer: missing,
    explanation: explainManglendeTall(known, missing, sum, locale),
  };
}

export function planBytteplass(maxN: number, rng: Rng, locale: Locale = "nb"): RoundPlan {
  const a = randomInt(1, Math.max(1, maxN), rng);
  const b = randomInt(1, Math.max(1, maxN), rng);
  const hideFirst = rng() < 0.5;
  const expression = hideFirst ? `${a} + ${b} = □ + ${a}` : `${a} + ${b} = ${b} + □`;
  const answer = hideFirst ? b : a;
  return {
    mode: "bytteplass",
    catchTarget: pickOne([a, b], rng),
    prompt: t(locale, "math.missing"),
    expression,
    kind: "number",
    answer,
    explanation: explainLikhet(a, b, b, a, locale),
  };
}

export function planLikhet(maxN: number, rng: Rng, locale: Locale = "nb"): RoundPlan {
  const cap = Math.max(3, maxN);
  let a = randomInt(1, cap - 1, rng);
  let b = randomInt(1, cap - a, rng);
  let sum = a + b;
  if (sum < 2) {
    a = 1;
    b = 1;
    sum = 2;
  }
  let c = randomInt(1, sum - 1, rng);
  let answer = sum - c;
  let catchable = [a, b, c].filter((n) => n !== answer);
  if (catchable.length === 0) {
    a = 2;
    b = 1;
    c = 1;
    answer = 2;
    catchable = [1];
  }
  return {
    mode: "likhet",
    catchTarget: pickOne(catchable.length > 0 ? catchable : [a], rng),
    prompt: t(locale, "math.missing"),
    expression: `${a} + ${b} = □ + ${c}`,
    kind: "number",
    answer,
    explanation: explainLikhet(a, b, answer, c, locale),
  };
}

export function planTiMerMindre(maxN: number, rng: Rng, locale: Locale = "nb"): RoundPlan {
  const canMore = maxN >= 11;
  const wantMore = canMore && (maxN < 11 || rng() < 0.5);
  const n = wantMore ? randomInt(1, maxN - 10, rng) : randomInt(11, maxN, rng);
  const delta = wantMore ? 10 : -10;
  return {
    mode: "ti-mer-mindre",
    catchTarget: n,
    prompt: t(locale, wantMore ? "math.tenMore" : "math.tenLess"),
    expression: String(n),
    kind: "number",
    answer: n + delta,
    explanation: explainTenMoreLess(n, delta, locale),
  };
}

export function planHoppetelling(maxN: number, rng: Rng, locale: Locale = "nb"): RoundPlan {
  const step = pickOne(hopSteps(maxN), rng);
  const canForward = maxN >= 1 + 3 * step;
  const canBack = maxN >= 1 + 3 * step;
  const forward = canForward && (!canBack || rng() < 0.5);
  let shown: number[];
  let answer: number;
  if (forward) {
    const start = randomInt(1, maxN - 3 * step, rng);
    shown = [start, start + step, start + 2 * step];
    answer = start + 3 * step;
  } else {
    const start = randomInt(1 + 3 * step, maxN, rng);
    shown = [start, start - step, start - 2 * step];
    answer = start - 3 * step;
  }
  return {
    mode: "hoppetelling",
    catchTarget: answer,
    prompt: t(locale, "math.skipAsk"),
    expression: `${shown.join(", ")}, □`,
    kind: "number",
    answer,
    explanation: explainSkipCount(shown, answer, locale),
  };
}

export function planDobbeltHalv(maxN: number, rng: Rng, locale: Locale = "nb"): RoundPlan {
  const halfMax = Math.max(1, Math.floor(maxN / 2));
  const evens: number[] = [];
  for (let n = 2; n <= maxN; n += 2) evens.push(n);
  const useHalf = evens.length > 0 && rng() < 0.5;
  const x = useHalf ? pickOne(evens, rng) : randomInt(1, halfMax, rng);
  const answer = useHalf ? x / 2 : x * 2;
  return {
    mode: "dobbelt-halv",
    catchTarget: x,
    prompt: t(locale, useHalf ? "math.halfAsk" : "math.doubleAsk"),
    expression: String(x),
    kind: "number",
    answer,
    explanation: explainDoubleHalf(x, answer, locale),
  };
}

export function planKlokke(maxN: number, rng: Rng, locale: Locale = "nb"): RoundPlan {
  const maxHour = maxN >= 20 ? 12 : 10;
  let hour = randomInt(1, maxHour, rng);
  const kinds = ["hour", "next", "half"] as const;
  let kind = pickOne(kinds, rng);
  if (kind === "next" && hour === maxHour && maxHour < 12) {
    hour = randomInt(1, maxHour - 1, rng);
  }
  if (kind === "hour") {
    return {
      mode: "klokke",
      catchTarget: hour,
      prompt: t(locale, "math.clockHour"),
      expression: clockHour(hour),
      kind: "number",
      answer: hour,
      explanation: explainClock(hour, hour, "hour", locale),
    };
  }
  if (kind === "next") {
    const answer = hour === 12 ? 1 : hour + 1;
    return {
      mode: "klokke",
      catchTarget: hour,
      prompt: t(locale, "math.clockNext"),
      expression: clockHour(hour),
      kind: "number",
      answer,
      explanation: explainClock(hour, answer, "next", locale),
    };
  }
  return {
    mode: "klokke",
    catchTarget: hour,
    prompt: t(locale, "math.clockHalf", { h: hour }),
    expression: clockHalf(hour),
    kind: "number",
    answer: 30,
    explanation: explainClock(hour, 30, "half", locale),
  };
}
