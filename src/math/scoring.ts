export const SCORE_CATCH = 10;
export const SCORE_MISS = -5;
export const SCORE_ROTTEN = -20;

export function mathBonus(level: number): number {
  return 50 + level * 10;
}

export function applyScore(score: number, delta: number): number {
  return Math.max(0, score + delta);
}

export function catchPoints(value: number): number {
  return SCORE_CATCH * value;
}
