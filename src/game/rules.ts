import { applyScore, catchPoints, SCORE_MISS, SCORE_ROTTEN } from "../math/scoring";

export type FallingKind = "banana" | "rotten";

export type CatchEvent =
  | { type: "caught"; kind: FallingKind; value: number }
  | { type: "missed"; kind: FallingKind; value: number };

export interface PlayState {
  lives: number;
  score: number;
  collected: number;
  target: number;
  ended: boolean;
  endReason: "misses" | null;
  roundComplete: boolean;
}

export function createPlayState(target: number, score = 0): PlayState {
  return {
    lives: 2,
    score,
    collected: 0,
    target,
    ended: false,
    endReason: null,
    roundComplete: false,
  };
}

export function applyCatchEvent(state: PlayState, event: CatchEvent): PlayState {
  if (state.ended || state.roundComplete) return state;

  if (event.type === "missed") {
    if (event.kind === "rotten") return { ...state };
    const lives = state.lives - 1;
    const ended = lives <= 0;
    return {
      ...state,
      lives,
      score: applyScore(state.score, SCORE_MISS),
      ended,
      endReason: ended ? "misses" : null,
    };
  }

  if (event.kind === "rotten") {
    return {
      ...state,
      score: applyScore(state.score, SCORE_ROTTEN),
    };
  }

  const collected = state.collected + event.value;
  return {
    ...state,
    collected,
    score: applyScore(state.score, catchPoints(event.value)),
    roundComplete: collected >= state.target,
  };
}

export function fallSpeed(level: number): number {
  return 1 + 0.12 * (level - 1);
}

export function spawnRotten(level: number, rng: () => number): boolean {
  if (level < 3) return false;
  const chance = Math.min(0.08 + level * 0.02, 0.28);
  return rng() < chance;
}
