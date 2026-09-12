import { nextBananaValue } from "../math/banana-values";
import type { Rect } from "../types";
import { intersects } from "./collision";
import { apeCountForValue, attackMaxTargets, attackSpawnInterval, peekTime, throwSpeed } from "./play-style";
import { spawnRotten } from "./rules";

export interface AttackTarget {
  id: number;
  kind: "orangutan" | "gorilla";
  value: number;
  x: number;
  y: number;
  w: number;
  h: number;
  age: number;
  life: number;
}

export interface AttackShot {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  rot: number;
}

export interface AttackWorld {
  targets: AttackTarget[];
  shots: AttackShot[];
  spawnAcc: number;
}

let nextTargetId = 1;

export function attackPeekBand(height: number): { minY: number; maxY: number } {
  const minY = Math.max(128, height * 0.22);
  const maxY = Math.max(minY + 100, height * 0.5);
  return { minY, maxY };
}

export function createAttackWorld(): AttackWorld {
  return { targets: [], shots: [], spawnAcc: 99 };
}

export function aimShot(fromX: number, fromY: number, toX: number, toY: number, speed: number): AttackShot {
  const dx = toX - fromX;
  const dy = toY - fromY;
  const len = Math.hypot(dx, dy) || 1;
  return {
    x: fromX - 12,
    y: fromY - 12,
    w: 24,
    h: 24,
    vx: (dx / len) * speed,
    vy: (dy / len) * speed,
    rot: Math.atan2(dy, dx),
  };
}

export function shotRect(shot: AttackShot): Rect {
  return { x: shot.x, y: shot.y, w: shot.w, h: shot.h };
}

export function targetRect(target: AttackTarget): Rect {
  return { x: target.x, y: target.y, w: target.w, h: target.h };
}

export function spawnAttackTarget(
  width: number,
  remaining: number,
  maxN: number,
  level: number,
  rng: () => number,
  height: number,
): AttackTarget {
  const gorilla = spawnRotten(level, rng);
  const value = gorilla ? 1 : nextBananaValue(maxN, remaining, rng);
  const count = gorilla ? 1 : apeCountForValue(value);
  const w = 52 + (count - 1) * 22;
  const h = 64;
  const band = attackPeekBand(height);
  const span = Math.max(8, band.maxY - band.minY - h);
  return {
    id: nextTargetId++,
    kind: gorilla ? "gorilla" : "orangutan",
    value,
    x: 12 + rng() * Math.max(8, width - 24 - w),
    y: band.minY + rng() * span,
    w,
    h,
    age: 0,
    life: peekTime(level),
  };
}

export function maybeSpawnTarget(
  world: AttackWorld,
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
  world.targets.push(spawnAttackTarget(width, remaining, maxN, level, rng, height));
}

export function throwAt(world: AttackWorld, fromX: number, fromY: number, toX: number, toY: number, level: number): void {
  if (world.shots.length > 0) return;
  world.shots.push(aimShot(fromX, fromY, toX, toY, throwSpeed(level)));
}

export function stepShots(world: AttackWorld, dt: number, width: number, height: number): {
  hits: { target: AttackTarget }[];
  whiffs: number;
} {
  const hits: { target: AttackTarget }[] = [];
  let whiffs = 0;
  const kept: AttackShot[] = [];
  for (const shot of world.shots) {
    shot.x += shot.vx * dt;
    shot.y += shot.vy * dt;
    shot.rot += 8 * dt;
    const box = shotRect(shot);
    const hit = world.targets.find((target) => intersects(box, targetRect(target)));
    if (hit) {
      world.targets = world.targets.filter((target) => target.id !== hit.id);
      hits.push({ target: hit });
      continue;
    }
    if (shot.x < -40 || shot.x > width + 40 || shot.y < -40 || shot.y > height + 40) {
      whiffs += 1;
      continue;
    }
    kept.push(shot);
  }
  world.shots = kept;
  return { hits, whiffs };
}

export function stepTargets(world: AttackWorld, dt: number): AttackTarget[] {
  const left: AttackTarget[] = [];
  const kept: AttackTarget[] = [];
  for (const target of world.targets) {
    target.age += dt;
    if (target.age >= target.life) left.push(target);
    else kept.push(target);
  }
  world.targets = kept;
  return left;
}
