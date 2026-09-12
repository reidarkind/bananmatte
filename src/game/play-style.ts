import type { PlayStyle, PlayStyleChoice } from "../types";

export type { PlayStyle, PlayStyleChoice };

export const PLAY_STYLES: PlayStyle[] = ["sank", "angrep", "forsvar"];

export function parsePlayStyle(value: unknown): PlayStyleChoice {
  if (value === "sank" || value === "angrep" || value === "forsvar" || value === "mix") return value;
  return "sank";
}

export function resolvePlayStyle(choice: PlayStyleChoice, rng: () => number, previous?: PlayStyle): PlayStyle {
  if (choice !== "mix") return choice;
  let pool = [...PLAY_STYLES];
  if (previous && pool.length > 1) {
    const rest = pool.filter((style) => style !== previous);
    if (rest.length > 0) pool = rest;
  }
  return pool[Math.floor(rng() * pool.length)] ?? "sank";
}

export function peekTime(level: number): number {
  return Math.max(0.8, 2.3 - (level - 1) * 0.14);
}

export function attackSpawnInterval(level: number): number {
  return Math.max(0.5, 1.45 - level * 0.07);
}

export function attackMaxTargets(level: number): number {
  return Math.min(4, 1 + Math.floor((level - 1) / 2));
}

export function throwSpeed(level: number): number {
  return 480 + (level - 1) * 28;
}

export function defendSpawnInterval(level: number): number {
  return Math.max(0.42, 1.2 - level * 0.07);
}

export function apeCountForValue(value: number): number {
  if (value >= 10) return 3;
  if (value >= 5) return 2;
  return 1;
}
