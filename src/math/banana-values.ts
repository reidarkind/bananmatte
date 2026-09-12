import type { Rng } from "../types";
import { pickOne } from "./rng";

export function bananaOptions(maxN: number): number[] {
  if (maxN <= 10) return [1];
  if (maxN <= 50) return [1, 5];
  if (maxN <= 100) return [1, 5, 10];
  return [1, 10, 50, 100];
}

export function nextBananaValue(maxN: number, remaining: number, rng: Rng): number {
  if (remaining <= 0) return 1;
  const fit = bananaOptions(maxN).filter((value) => value <= remaining);
  if (fit.length === 0) return Math.min(1, remaining);
  return pickOne(fit, rng);
}
