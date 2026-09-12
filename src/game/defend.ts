import { nextBananaValue } from "../math/banana-values";
import { attackPeekBand } from "./attack";
import { attackMaxTargets, attackSpawnInterval, peekTime } from "./play-style";
import { spawnRotten, type FallingKind } from "./rules";

export interface DefendThrower {
  id: number;
  kind: "orangutan" | "gorilla";
  value: number;
  x: number;
  y: number;
  w: number;
  h: number;
  age: number;
  life: number;
  throwAt: number;
  thrown: boolean;
}

export interface DefendWorld {
  targets: DefendThrower[];
  spawnAcc: number;
}

export interface DefendThrow {
  kind: FallingKind;
  value: number;
  x: number;
  y: number;
}

let nextId = 1;

export function bananaKindForThrower(kind: "orangutan" | "gorilla"): FallingKind {
  return kind === "gorilla" ? "banana" : "rotten";
}

export function createDefendWorld(): DefendWorld {
  return { targets: [], spawnAcc: 99 };
}

export function spawnDefendThrower(
  width: number,
  remaining: number,
  maxN: number,
  level: number,
  rng: () => number,
  height: number,
): DefendThrower {
  const gorilla = spawnRotten(level, rng);
  const value = gorilla ? nextBananaValue(maxN, remaining, rng) : 1;
  const life = peekTime(level);
  const band = attackPeekBand(height);
  const w = 56;
  const h = 64;
  const span = Math.max(8, band.maxY - band.minY - h);
  return {
    id: nextId++,
    kind: gorilla ? "gorilla" : "orangutan",
    value,
    x: 12 + rng() * Math.max(8, width - 24 - w),
    y: band.minY + rng() * span,
    w,
    h,
    age: 0,
    life,
    throwAt: Math.min(0.55, life * 0.28),
    thrown: false,
  };
}

export function maybeSpawnThrower(
  world: DefendWorld,
  width: number,
  remaining: number,
  maxN: number,
  level: number,
  dt: number,
  rng: () => number,
  height: number,
): void {
  world.spawnAcc += dt;
  if (world.targets.length >= attackMaxTargets(level)) return;
  if (world.spawnAcc < attackSpawnInterval(level)) return;
  world.spawnAcc = 0;
  world.targets.push(spawnDefendThrower(width, remaining, maxN, level, rng, height));
}

export function stepThrowers(world: DefendWorld, dt: number): { throws: DefendThrow[]; left: DefendThrower[] } {
  const throws: DefendThrow[] = [];
  const left: DefendThrower[] = [];
  const kept: DefendThrower[] = [];
  for (const target of world.targets) {
    target.age += dt;
    if (!target.thrown && target.age >= target.throwAt) {
      target.thrown = true;
      throws.push({
        kind: bananaKindForThrower(target.kind),
        value: target.kind === "gorilla" ? target.value : 1,
        x: target.x + target.w / 2,
        y: target.y + target.h * 0.75,
      });
    }
    if (target.age >= target.life) left.push(target);
    else kept.push(target);
  }
  world.targets = kept;
  return { throws, left };
}
