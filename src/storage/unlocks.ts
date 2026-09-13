import { BONUS_MILESTONES } from "../bonus/milestones";
import { browserStore, type KeyValueStore } from "./adapter";

export const UNLOCK_KEY = "bananmatte.unlocks.v1";

function isMilestone(value: number): boolean {
  return (BONUS_MILESTONES as readonly number[]).includes(value);
}

export function parseUnlocks(raw: string | null): number[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const next = parsed.filter((value): value is number => typeof value === "number" && isMilestone(value));
    return [...new Set(next)].sort((a, b) => a - b);
  } catch {
    return [];
  }
}

export function loadUnlocks(store: KeyValueStore = browserStore()): number[] {
  return parseUnlocks(store.getItem(UNLOCK_KEY));
}

export function saveUnlocks(milestones: number[], store: KeyValueStore = browserStore()): number[] {
  const next = [...new Set(milestones.filter(isMilestone))].sort((a, b) => a - b);
  store.setItem(UNLOCK_KEY, JSON.stringify(next));
  return next;
}

export function unlockBonus(milestone: number, store: KeyValueStore = browserStore()): number[] {
  if (!isMilestone(milestone)) return loadUnlocks(store);
  return saveUnlocks([...loadUnlocks(store), milestone], store);
}

export function clearUnlocks(store: KeyValueStore = browserStore()): number[] {
  return saveUnlocks([], store);
}
