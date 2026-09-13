import { describe, expect, it } from "vitest";
import { memoryStore } from "./adapter";
import { clearHighscores, emptyBoard, isBlankPlayerName, loadHighscores, normalizePlayerName, qualifies, saveHighscores, submitHighscore } from "./highscores";

describe("highscores", () => {
  it("keeps a full typed name, trimmed to 20 characters", () => {
    expect(normalizePlayerName("  Emma Sofie  ")).toBe("Emma Sofie");
    expect(normalizePlayerName("Ægir Øyvind Åse")).toBe("Ægir Øyvind Åse");
    expect(normalizePlayerName("abcdefghijklmnopqrstuvwxyz")).toBe("abcdefghijklmnopqrst");
  });

  it("uses Anonym when the name is empty", () => {
    expect(normalizePlayerName("   ")).toBe("Anonym");
    expect(normalizePlayerName("")).toBe("Anonym");
  });

  it("knows a blank typed name before save", () => {
    expect(isBlankPlayerName("   ")).toBe(true);
    expect(isBlankPlayerName("Kari")).toBe(false);
  });

  it("stores the typed name on submit", () => {
    const board = submitHighscore(emptyBoard(), 10, {
      name: "  Kari Nordmann  ",
      score: 40,
      level: 3,
      date: "2026-09-12",
    });
    expect(board["10"]?.[0]?.name).toBe("Kari Nordmann");
  });

  it("clears every max_n list", () => {
    let board = submitHighscore(emptyBoard(), 10, {
      name: "Kari",
      score: 40,
      level: 2,
      date: "2026-09-12",
    });
    board = submitHighscore(board, 50, {
      name: "Ola",
      score: 80,
      level: 3,
      date: "2026-09-12",
    });
    const store = memoryStore();
    saveHighscores(board, store);
    expect(clearHighscores(store)).toEqual(emptyBoard());
    expect(loadHighscores(store)).toEqual(emptyBoard());
  });

  it("keeps top 10 per max_n", () => {
    let board = emptyBoard();
    for (let i = 1; i <= 12; i += 1) {
      board = submitHighscore(board, 10, {
        name: "AAA",
        score: i * 10,
        level: i,
        date: "2026-09-12",
      });
    }
    expect(board["10"]).toHaveLength(10);
    expect(board["10"][0]?.score).toBe(120);
    expect(board["50"]).toHaveLength(0);
  });

  it("qualifies a new score against the lowest top-10", () => {
    let board = emptyBoard();
    for (let i = 1; i <= 10; i += 1) {
      board = submitHighscore(board, 10, { name: "AAA", score: i, level: 1, date: "2026-09-12" });
    }
    expect(qualifies(board, 10, 11)).toBe(true);
    expect(qualifies(board, 10, 1)).toBe(false);
    expect(qualifies(board, 10, 0)).toBe(false);
  });

  it("qualifies against the matching max_n list only", () => {
    let board = emptyBoard();
    for (let i = 1; i <= 10; i += 1) {
      board = submitHighscore(board, 50, { name: "AAA", score: i * 100, level: 1, date: "2026-09-12" });
    }
    expect(qualifies(board, 10, 1)).toBe(true);
    expect(qualifies(board, 50, 50)).toBe(false);
  });
});
