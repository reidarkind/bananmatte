import type { Rng } from "../types";

export function createRng(seed: number): Rng {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

export function randomInt(min: number, max: number, rng: Rng): number {
  if (max < min) {
    return min;
  }
  return min + Math.floor(rng() * (max - min + 1));
}

export function pickOne<T>(items: readonly T[], rng: Rng): T {
  if (items.length === 0) {
    throw new Error("pickOne: empty list");
  }
  return items[Math.floor(rng() * items.length)] as T;
}
