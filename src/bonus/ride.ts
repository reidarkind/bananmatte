import type { Rng } from "../types";

export type RideKind = "banana" | "crate" | "book";
export type RidePhase = "intro" | "countdown" | "drive" | "math" | "bank" | "crash" | "done";

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
  spin: number;
  spinLeft: number;
  obstacles: RideObstacle[];
  hitId?: number;
}

const HIT_X = 0.55;
const HIT_S = 1.15;
const LANE_SPAN = 0.3;
const HOLD_CRASH = 1.5;
const HOLD_BANK = 2.9;
const COUNTDOWN = 4;
const TRACK = 330;
const DEPOSIT_START = 0.35;
const DEPOSIT_END = 2.2;

export function rideSpeed(s: number, track: number): number {
  const t = Math.min(1, Math.max(0, s / (track * 0.72)));
  return 3.1 + 6.6 * t * t;
}

export function depositShown(hold: number, score: number): number {
  const safe = Math.max(0, Math.round(score));
  if (hold <= DEPOSIT_START) return 0;
  const t = Math.min(1, (hold - DEPOSIT_START) / (DEPOSIT_END - DEPOSIT_START));
  const eased = t * t * (3 - 2 * t);
  return Math.round(safe * eased);
}

export function depositCoinT(hold: number, index: number): number {
  const start = DEPOSIT_START + index * 0.11;
  return Math.min(1, Math.max(0, (hold - start) / 0.55));
}

export function countdownMark(hold: number): 3 | 2 | 1 | "go" | null {
  if (hold < 1) return 3;
  if (hold < 2) return 2;
  if (hold < 3) return 1;
  if (hold < COUNTDOWN) return "go";
  return null;
}

export function laneToPixel(worldX: number, width: number): number {
  return width / 2 + worldX * width * LANE_SPAN;
}

export function laneFromPointer(pixelX: number, width: number): number {
  if (width <= 0) return 0;
  return Math.max(-1, Math.min(1, (pixelX - width / 2) / (width * LANE_SPAN)));
}

function hitsObstacle(playerX: number, playerS: number, obs: RideObstacle): boolean {
  const dist = obs.s - playerS;
  return dist > 0 && dist <= HIT_S && Math.abs(playerX - obs.x) < HIT_X;
}

export function emptyRide(overrides: Partial<RideState> = {}): RideState {
  return {
    x: 0,
    s: 0,
    speed: 3.1,
    track: TRACK,
    phase: "drive",
    hold: 0,
    spin: 0,
    spinLeft: 0,
    obstacles: [],
    ...overrides,
  };
}

export function createRide(rng: Rng, track = TRACK): RideState {
  const kinds: RideKind[] = [
    "banana", "crate", "book",
    "banana", "book", "crate",
    "banana", "book", "banana",
    "crate", "book", "banana",
  ];
  return emptyRide({
    track,
    phase: "intro",
    hold: 0,
    speed: rideSpeed(0, track),
    obstacles: kinds.map((kind, i) => ({
      id: i + 1,
      kind,
      x: rng() * 1.4 - 0.7,
      s: 24 + i * 22,
    })),
  });
}

export function startRide(state: RideState): RideState {
  if (state.phase !== "intro") return state;
  return { ...state, phase: "countdown", hold: 0 };
}

function twist(state: RideState, dt: number): { spin: number; spinLeft: number } {
  let { spin, spinLeft } = state;
  if (spinLeft !== 0) {
    const step = Math.sign(spinLeft) * 12 * dt;
    if (Math.abs(step) >= Math.abs(spinLeft)) {
      spin += spinLeft;
      spinLeft = 0;
    } else {
      spin += step;
      spinLeft -= step;
    }
    return { spin, spinLeft };
  }
  return { spin: spin * Math.max(0, 1 - 5 * dt), spinLeft: 0 };
}

export function stepRide(state: RideState, dt: number, steer: number): RideState {
  if (state.phase === "done" || state.phase === "math" || state.phase === "intro") return state;
  if (state.phase === "countdown") {
    const hold = state.hold + dt;
    if (hold < COUNTDOWN) return { ...state, hold };
    return stepRide({ ...state, phase: "drive", hold: 0, speed: rideSpeed(0, state.track) }, hold - COUNTDOWN, steer);
  }
  if (state.phase === "bank" || state.phase === "crash") {
    const hold = state.hold + dt;
    const limit = state.phase === "bank" ? HOLD_BANK : HOLD_CRASH;
    return { ...state, hold, phase: hold >= limit ? "done" : state.phase };
  }

  const spun = twist(state, dt);
  let x = Math.max(-1, Math.min(1, state.x + steer * 1.85 * dt));
  const speed = rideSpeed(state.s, state.track);
  const s = state.s + speed * dt;
  const obstacles = state.obstacles.map((obs) => ({ ...obs }));
  let spin = spun.spin;
  let spinLeft = spun.spinLeft;

  for (const obs of obstacles) {
    if (obs.resolved) continue;
    if (!hitsObstacle(x, s, obs)) continue;
    if (obs.kind === "banana") {
      obs.resolved = true;
      const dir = obs.x >= x ? 1 : -1;
      spinLeft = dir * Math.PI * 2;
      x = Math.max(-1, Math.min(1, x + dir * 0.12));
    } else if (obs.kind === "crate") {
      return { ...state, x, s, speed, spin, spinLeft: 0, obstacles, phase: "crash", hold: 0, hitId: obs.id };
    } else {
      return { ...state, x, s, speed, spin, spinLeft: 0, obstacles, phase: "math", hold: 0, hitId: obs.id };
    }
  }

  if (s >= state.track) {
    return { ...state, x, s: state.track, speed, spin: 0, spinLeft: 0, obstacles, phase: "bank", hold: 0 };
  }
  return { ...state, x, s, speed, spin, spinLeft, obstacles };
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
