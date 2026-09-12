import { describe, expect, it } from "vitest";
import { emptyBoard, normalizeArcadeName, qualifies, submitHighscore } from "./highscores";

describe("highscores", () => {
  it("normalizes arcade names to three letters", () => {
    expect(normalizeArcadeName("bo")).toBe("BOA");
    expect(normalizeArcadeName("æøå")).toBe("ÆØÅ");
    expect(normalizeArcadeName("aeoe")).toBe("ÆØA");
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
