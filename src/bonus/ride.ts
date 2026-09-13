import type { Rng } from "../types";

export type RideKind = "banana" | "crate" | "book";
export type RidePhase = "drive" | "math" | "bank" | "crash" | "done";

export interface RideObstacle {
  id: number;
  kind: RideKind;
  x: number;
  s: number;
  resolved?: boolean;
}

export interface RideState {
  x: number;
  s: number;
  speed: number;
  track: number;
  phase: RidePhase;
  hold: number;
  obstacles: RideObstacle[];
  hitId?: number;
}

const HIT_X = 0.4;
const HIT_S = 1.15;
const HOLD = 1.35;

export function emptyRide(overrides: Partial<RideState> = {}): RideState {
  return {
    x: 0,
    s: 0,
    speed: 7,
    track: 36,
    phase: "drive",
    hold: 0,
    obstacles: [],
    ...overrides,
  };
}

export function createRide(rng: Rng, track = 36): RideState {
  const kinds: RideKind[] = ["banana", "crate", "book", "banana", "book", "crate"];
  return emptyRide({
    track,
    obstacles: kinds.map((kind, i) => ({
      id: i + 1,
      kind,
      x: rng() * 1.4 - 0.7,
      s: 8 + i * 4.5,
    })),
  });
}

export function stepRide(state: RideState, dt: number, steer: number): RideState {
  if (state.phase === "done" || state.phase === "math") return state;
  if (state.phase === "bank" || state.phase === "crash") {
    const hold = state.hold + dt;
    return { ...state, hold, phase: hold >= HOLD ? "done" : state.phase };
  }

  const x = Math.max(-1, Math.min(1, state.x + steer * 1.85 * dt));
  const s = state.s + state.speed * dt;
  const obstacles = state.obstacles.map((obs) => ({ ...obs }));

  for (const obs of obstacles) {
    if (obs.resolved) continue;
    if (s < obs.s || s >= obs.s + HIT_S || Math.abs(x - obs.x) >= HIT_X) continue;
    if (obs.kind === "banana") {
      obs.resolved = true;
    } else if (obs.kind === "crate") {
      return { ...state, x, s, obstacles, phase: "crash", hold: 0, hitId: obs.id };
    } else {
      return { ...state, x, s, obstacles, phase: "math", hold: 0, hitId: obs.id };
    }
  }

  if (s >= state.track) {
    return { ...state, x, s: state.track, obstacles, phase: "bank", hold: 0 };
  }
  return { ...state, x, s, obstacles };
}

export function resolveBook(state: RideState, ok: boolean): RideState {
  if (state.phase !== "math") return state;
  if (!ok) return { ...state, phase: "done" };
  return {
    ...state,
    phase: "drive",
    hitId: undefined,
    obstacles: state.obstacles.map((obs) => (obs.id === state.hitId ? { ...obs, resolved: true } : obs)),
  };
}

export function skipRide(state: RideState): RideState {
  return { ...state, phase: "done" };
}
