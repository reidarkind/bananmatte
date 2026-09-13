import { t } from "../i18n";
import type { Locale, Rng, RoundPlan } from "../types";
import { explainPlaceValue } from "./explanations";
import { pickOne, randomInt } from "./rng";

export function planPlaceValue(maxN: number, rng: Rng, locale: Locale): RoundPlan {
  const ones = randomInt(0, 9, rng);
  const tens = randomInt(0, 9, rng) * 10;
  const parts = [ones, tens];
  if (maxN >= 1000) parts.push(randomInt(0, 10, rng) * 100);
  let catchable = parts.filter((part) => part > 0);
  if (catchable.length === 0) {
    parts[0] = randomInt(1, 9, rng);
    catchable = [parts[0]!];
  }
  const x = pickOne(catchable, rng);
  return {
    mode: "plassverdi",
    catchTarget: x,
    prompt: t(locale, "math.ask"),
    expression: parts.join(" + "),
    kind: "number",
    answer: parts.reduce((sum, part) => sum + part, 0),
    explanation: explainPlaceValue(parts, locale),
  };
}
