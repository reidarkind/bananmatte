import type { CompareAnswer, Parity } from "../types";
import { isBonusLevel } from "./milestones";

export function parseBonusCheat(typed: string, expected: number): number | null {
  if (!typed.startsWith("1337")) return null;
  const rest = typed.slice(4);
  for (let cut = 2; cut <= rest.length; cut += 1) {
    const suffix = rest.slice(-cut);
    const mid = rest.slice(0, -cut);
    const milestone = Number(suffix);
    if (isBonusLevel(milestone) && String(milestone) === suffix && mid === String(expected)) {
      return milestone;
    }
  }
  return null;
}

export function bonusMilestoneFromAnswer(
  expected: number | Parity | CompareAnswer,
  given: number | Parity | CompareAnswer,
  raw?: string,
): number | null {
  if (typeof expected !== "number") return null;
  const texts: string[] = [];
  if (raw) texts.push(raw);
  if (typeof given === "number" && Number.isFinite(given)) texts.push(String(given));
  for (const text of texts) {
    const milestone = parseBonusCheat(text, expected);
    if (milestone !== null) return milestone;
  }
  return null;
}
