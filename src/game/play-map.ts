import type { CatchEvent, FallingKind } from "./rules";

export function attackHitEvent(kind: "orangutan" | "gorilla", value: number): CatchEvent {
  if (kind === "gorilla") return { type: "caught", kind: "rotten", value: 1 };
  return { type: "caught", kind: "banana", value };
}

export function attackMissEvent(): CatchEvent {
  return { type: "missed", kind: "banana", value: 1 };
}

export function attackLeaveEvent(kind: "orangutan" | "gorilla"): CatchEvent | null {
  if (kind === "gorilla") return null;
  return attackMissEvent();
}

export function defendHitEvent(kind: FallingKind, value: number): CatchEvent {
  if (kind === "rotten") return { type: "missed", kind: "banana", value: 1 };
  return { type: "caught", kind: "banana", value };
}

export function defendEscapeEvent(kind: FallingKind, value: number): CatchEvent {
  if (kind === "rotten") return { type: "caught", kind: "banana", value };
  return { type: "caught", kind: "rotten", value: 1 };
}
