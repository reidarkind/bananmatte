import type { FallingKind } from "./rules";

export interface FallingItem {
  id: number;
  kind: FallingKind;
  value: number;
  x: number;
  y: number;
  w: number;
  h: number;
  vy: number;
  rot: number;
  spin: number;
  trickAt?: number;
}

let nextId = 1;

export function spawnFallingAt(
  kind: FallingKind,
  value: number,
  x: number,
  y: number,
  speed: number,
  rng: () => number,
): FallingItem {
  const item = spawnFalling(kind, value, Math.max(x + 40, 80), speed, rng);
  item.x = x - item.w / 2;
  item.y = y;
  return item;
}

export function spawnFalling(
  kind: FallingKind,
  value: number,
  width: number,
  speed: number,
  rng: () => number,
): FallingItem {
  const size = kind === "rotten" ? 34 : 38;
  return {
    id: nextId++,
    kind,
    value,
    x: 16 + rng() * Math.max(8, width - 32 - size),
    y: -size,
    w: size,
    h: size,
    vy: (110 + rng() * 40) * speed,
    rot: rng() * Math.PI,
    spin: (rng() - 0.5) * 2.4,
  };
}

export const GORILLA = {
  head: { cx: 0, cy: -2, r: 20 },
  basket: { x: -27, y: 14, w: 54, h: 20 },
};

export function gorillaRect(x: number, y: number) {
  return { x: x - 30, y: y - 36, w: 60, h: 86 };
}

export function basketRect(x: number, y: number) {
  const box = GORILLA.basket;
  return { x: x + box.x, y: y + box.y, w: box.w, h: box.h };
}

export function bananaInBasketPose(gorillaX: number, gorillaY: number, slot: number): {
  x: number;
  y: number;
  w: number;
  h: number;
} {
  const box = basketRect(gorillaX, gorillaY);
  const wobble = (slot % 3) * 8 - 8;
  const size = 28;
  return {
    x: box.x + box.w / 2 - size / 2 + wobble,
    y: box.y - 2,
    w: size,
    h: size,
  };
}
