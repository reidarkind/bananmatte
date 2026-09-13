import type { FallingKind } from "./rules";

export const TRICK_BLINK_SEC = 0.55;
export const TRICK_BLINK_MS = 90;

export interface TrickLookItem {
  kind: FallingKind;
  y: number;
  vy?: number;
  trickAt?: number;
}

export function planTrickReveal(startY: number, height: number): number {
  const floorY = height * 0.78;
  const travel = Math.max(140, floorY - startY);
  return startY + travel * 0.5;
}

export function trickBananaPhase(item: TrickLookItem): "ripe" | "blink" | "rotten" {
  if (item.kind !== "trick") return item.kind === "rotten" ? "rotten" : "ripe";
  const at = item.trickAt ?? Number.POSITIVE_INFINITY;
  if (item.y >= at) return "rotten";
  const vy = item.vy ?? 0;
  const eta = vy > 0 ? (at - item.y) / vy : Number.POSITIVE_INFINITY;
  if (eta <= TRICK_BLINK_SEC) return "blink";
  return "ripe";
}

export function trickLooksRotten(item: TrickLookItem, nowMs: number): boolean {
  const phase = trickBananaPhase(item);
  if (phase === "rotten") return true;
  if (phase === "ripe") return false;
  return Math.floor(nowMs / TRICK_BLINK_MS) % 2 === 1;
}
