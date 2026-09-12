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
}

let nextId = 1;

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

export function gorillaRect(x: number, y: number) {
  return { x: x - 28, y: y - 18, w: 56, h: 28 };
}

export function basketRect(x: number, y: number) {
  return { x: x - 30, y: y - 36, w: 60, h: 22 };
}
