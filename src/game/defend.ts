import { nextBananaValue } from "../math/banana-values";
import { attackPeekBand } from "./attack";
import { defendMaxThrowers, defendSpawnInterval, peekTime } from "./play-style";
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
  fallMul: number;
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
  fallMul: number;
}

let nextId = 1;

export function bananaKindForThrower(kind: "orangutan" | "gorilla"): FallingKind {
  return kind === "gorilla" ? "banana" : "rotten";
}

export function createDefendWorld(): DefendWorld {
  return { targets: [], spawnAcc: 99 };
}

function placeThrowerX(width: number, w: number, existing: DefendThrower[], rng: () => number): number {
  const maxX = Math.max(8, width - 24 - w);
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const x = 12 + rng() * maxX;
    if (existing.every((other) => Math.abs(other.x - x) >= 52)) return x;
  }
  return 12 + rng() * maxX;
}

export function spawnDefendThrower(
  width: number,
  remaining: number,
  maxN: number,
  level: number,
  rng: () => number,
  height: number,
  existing: DefendThrower[] = [],
): DefendThrower {
  const gorilla = spawnRotten(level, rng);
  const value = nextBananaValue(maxN, remaining, rng);
  const life = peekTime(level);
  const band = attackPeekBand(height);
  const w = 56;
  const h = 64;
  const span = Math.max(8, band.maxY - band.minY - h);
  return {
    id: nextId++,
    kind: gorilla ? "gorilla" : "orangutan",
    value,
    x: placeThrowerX(width, w, existing, rng),
    y: band.minY + rng() * span,
    w,
    h,
    age: 0,
    life,
    throwAt: 0.12 + rng() * Math.min(0.72, life * 0.32),
    thrown: false,
    fallMul: 0.62 + rng() * 1.05,
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
  const max = defendMaxThrowers(level);
  const interval = defendSpawnInterval(level);
  while (world.targets.length < max && world.spawnAcc >= interval) {
    world.spawnAcc -= interval;
    world.targets.push(spawnDefendThrower(width, remaining, maxN, level, rng, height, world.targets));
  }
  if (world.spawnAcc > interval) world.spawnAcc = interval;
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
        value: target.value,
        x: target.x + target.w / 2,
        y: target.y + target.h * 0.75,
        fallMul: target.fallMul,
      });
    }
    if (target.age >= target.life) left.push(target);
    else kept.push(target);
  }
  world.targets = kept;
  return { throws, left };
}
