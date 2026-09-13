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
  return Math.max(2.6, 4.4 - (level - 1) * 0.16);
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
  return Math.max(0.16, 0.36 - level * 0.025);
}

export function defendMaxThrowers(level: number): number {
  return Math.min(6, 3 + Math.floor((level - 1) / 2));
}

export function gorillaWearsHelmet(style: PlayStyle): boolean {
  return style === "forsvar";
}

export const ATTACK_THROWER_KIND = "gorilla" as const;

export function apeCountForValue(value: number): number {
  if (value >= 10) return 3;
  if (value >= 5) return 2;
  return 1;
}

export function shouldShowApeValue(kind: "orangutan" | "gorilla", value: number): boolean {
  return kind === "orangutan" && value > 1;
}

export function peekPop(age: number, life: number): number {
  const up = 0.4;
  const down = 0.35;
  const enter = age <= 0 ? 0 : Math.min(1, age / up);
  const leave = age >= life ? 0 : age > life - down ? Math.max(0, (life - age) / down) : 1;
  const raw = Math.min(enter, leave);
  return raw * raw * (3 - 2 * raw);
}

export function gangOffsets(count: number): { x: number; y: number; scale: number; facing: number }[] {
  if (count <= 1) return [{ x: 0, y: 0, scale: 1, facing: 1 }];
  if (count === 2) {
    return [
      { x: -34, y: -6, scale: 0.9, facing: -1 },
      { x: 32, y: 8, scale: 1, facing: 1 },
    ];
  }
  return [
    { x: -38, y: -8, scale: 0.86, facing: -1 },
    { x: 36, y: -6, scale: 0.86, facing: 1 },
    { x: 0, y: 16, scale: 1.08, facing: 1 },
  ];
}
