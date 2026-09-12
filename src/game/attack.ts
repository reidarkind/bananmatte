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
  targetId?: number;
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

export function visualTargetRect(target: AttackTarget): Rect {
  const count = target.kind === "gorilla" ? 1 : apeCountForValue(target.value);
  const scale = target.kind === "gorilla" ? 0.72 : 0.58;
  const cx = target.x + target.w / 2;
  const cy = target.y + target.h * 0.7;
  const w = (48 + (count - 1) * 36) * scale;
  const h = (72 + (count > 1 ? 18 : 0)) * scale;
  return { x: cx - w / 2, y: cy - h * 0.58, w, h };
}

function containsPoint(box: Rect, x: number, y: number): boolean {
  return x >= box.x && x <= box.x + box.w && y >= box.y && y <= box.y + box.h;
}

function apeCenterDist(target: AttackTarget, x: number, y: number): number {
  return Math.hypot(target.x + target.w / 2 - x, target.y + target.h * 0.7 - y);
}

const AIM_SNAP = 110;

export function apeAtPoint(targets: AttackTarget[], x: number, y: number): AttackTarget | undefined {
  if (targets.length === 0) return undefined;
  const inside = targets.filter((target) => containsPoint(targetRect(target), x, y));
  const pool = inside.length > 0 ? inside : targets;
  const nearest = pool.reduce((best, target) =>
    apeCenterDist(target, x, y) < apeCenterDist(best, x, y) ? target : best,
  );
  if (inside.length === 0 && apeCenterDist(nearest, x, y) > AIM_SNAP) return undefined;
  return nearest;
}

function shotHit(shot: AttackShot, targets: AttackTarget[]): AttackTarget | undefined {
  if (shot.targetId == null) return undefined;
  const box = shotRect(shot);
  const pool = targets.filter((target) => target.id === shot.targetId);
  const hits = pool.filter((target) => intersects(box, visualTargetRect(target)));
  if (hits.length === 0) return undefined;
  const sx = shot.x + shot.w / 2;
  const sy = shot.y + shot.h / 2;
  return hits.reduce((best, target) => {
    const bestBox = visualTargetRect(best);
    const nextBox = visualTargetRect(target);
    const bestDist = Math.hypot(bestBox.x + bestBox.w / 2 - sx, bestBox.y + bestBox.h / 2 - sy);
    const nextDist = Math.hypot(nextBox.x + nextBox.w / 2 - sx, nextBox.y + nextBox.h / 2 - sy);
    return nextDist < bestDist ? target : best;
  });
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
  const w = 56 + (count - 1) * 36;
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

export const ATTACK_MAX_SHOTS = 4;

export function throwAt(world: AttackWorld, fromX: number, fromY: number, toX: number, toY: number, level: number): void {
  if (world.shots.length >= ATTACK_MAX_SHOTS) return;
  const aimed = apeAtPoint(world.targets, toX, toY);
  const aimX = aimed ? aimed.x + aimed.w / 2 : toX;
  const aimY = aimed ? aimed.y + aimed.h * 0.7 : toY;
  const shot = aimShot(fromX, fromY, aimX, aimY, throwSpeed(level));
  shot.targetId = aimed?.id;
  world.shots.push(shot);
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
    const hit = shotHit(shot, world.targets);
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
