import { type HighscoreEntry, type MaxN } from "../types";
import { browserStore, type KeyValueStore } from "./adapter";

export const HIGHSCORE_KEY = "bananmatte.highscores.v1";
export const HIGHSCORE_LIMIT = 10;
export const PLAYER_NAME_MAX = 20;

export type HighscoreBoard = Record<string, HighscoreEntry[]>;

export function emptyBoard(): HighscoreBoard {
  return { "10": [], "20": [], "50": [], "100": [], "1000": [] };
}

export function parseBoard(raw: string | null): HighscoreBoard {
  const board = emptyBoard();
  if (!raw) return board;
  try {
    const parsed = JSON.parse(raw) as HighscoreBoard;
    for (const key of Object.keys(board)) {
      if (Array.isArray(parsed[key])) {
        board[key] = parsed[key]!.slice(0, HIGHSCORE_LIMIT);
      }
    }
  } catch {
    return board;
  }
  return board;
}

export function loadHighscores(store: KeyValueStore = browserStore()): HighscoreBoard {
  return parseBoard(store.getItem(HIGHSCORE_KEY));
}

export function saveHighscores(board: HighscoreBoard, store: KeyValueStore = browserStore()): void {
  store.setItem(HIGHSCORE_KEY, JSON.stringify(board));
}

export function clearHighscores(store: KeyValueStore = browserStore()): HighscoreBoard {
  const board = emptyBoard();
  saveHighscores(board, store);
  return board;
}

export function isBlankPlayerName(name: string): boolean {
  return name.replace(/[\u0000-\u001F\u007F]/g, "").replace(/\s+/g, " ").trim() === "";
}

export function normalizePlayerName(name: string): string {
  const cleaned = name
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, PLAYER_NAME_MAX)
    .trim();
  return cleaned || "Anonym";
}

export function qualifies(board: HighscoreBoard, maxN: MaxN, score: number): boolean {
  const list = board[String(maxN)] ?? [];
  if (score <= 0) return false;
  if (list.length < HIGHSCORE_LIMIT) return true;
  return score > (list[list.length - 1]?.score ?? 0);
}

export function submitHighscore(
  board: HighscoreBoard,
  maxN: MaxN,
  entry: HighscoreEntry,
): HighscoreBoard {
  const key = String(maxN);
  const next = { ...board, [key]: [...(board[key] ?? [])] };
  next[key].push({ ...entry, name: normalizePlayerName(entry.name) });
  next[key].sort((a, b) => b.score - a.score || b.level - a.level);
  next[key] = next[key].slice(0, HIGHSCORE_LIMIT);
  return next;
}
