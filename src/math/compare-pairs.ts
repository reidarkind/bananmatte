import type { Rng } from "../types";
import { pickOne, randomInt } from "./rng";

function digitsOf(n: number): number[] {
  return String(n).split("").map(Number);
}

function fromDigits(digits: number[]): number {
  return Number(digits.join(""));
}

function uniquePerms(digits: number[]): number[][] {
  const out: number[][] = [];
  const seen = new Set<string>();
  const walk = (current: number[], rest: number[]) => {
    if (rest.length === 0) {
      const key = current.join(",");
      if (!seen.has(key)) {
        seen.add(key);
        out.push(current);
      }
      return;
    }
    for (let i = 0; i < rest.length; i += 1) {
      walk([...current, rest[i]!], rest.filter((_, index) => index !== i));
    }
  };
  walk([], digits);
  return out;
}

function nudgeVariants(n: number, maxN: number): number[] {
  const digits = digitsOf(n);
  const out: number[] = [];
  for (let i = 0; i < digits.length; i += 1) {
    for (const delta of [-1, 1]) {
      const next = digits[i]! + delta;
      if (next < 0 || next > 9) continue;
      const copy = [...digits];
      copy[i] = next;
      const value = fromDigits(copy);
      if (value >= 1 && value <= maxN && value !== n) out.push(value);
    }
  }
  return out;
}

export function compareTwists(n: number, maxN: number): number[] {
  const seen = new Set<number>();
  const add = (value: number) => {
    if (value >= 1 && value <= maxN && value !== n) seen.add(value);
  };
  for (const perm of uniquePerms(digitsOf(n))) {
    const value = fromDigits(perm);
    add(value);
    for (const nudged of nudgeVariants(value, maxN)) add(nudged);
  }
  for (const nudged of nudgeVariants(n, maxN)) add(nudged);
  return [...seen];
}

export function trickyComparePair(maxN: number, rng: Rng): { x: number; y: number } {
  const minX = maxN >= 10 ? Math.min(10, maxN) : 1;
  let x = randomInt(minX, maxN, rng);
  if (maxN >= 100 && rng() < 0.55) {
    x = randomInt(Math.min(100, maxN), maxN, rng);
  }
  if (rng() < 0.18) return { x, y: x };
  const twists = compareTwists(x, maxN);
  if (twists.length === 0) return { x, y: randomInt(1, maxN, rng) };
  return { x, y: pickOne(twists, rng) };
}
