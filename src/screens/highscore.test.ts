/** @vitest-environment jsdom */

import { describe, expect, it } from "vitest";
import { emptyBoard } from "../storage/highscores";
import { renderHighscores } from "./highscore";

describe("highscore list", () => {
  it("shows at most ten rows and escapes names", () => {
    const root = document.createElement("div");
    document.body.append(root);
    const board = emptyBoard();
    board["10"] = Array.from({ length: 10 }, (_, i) => ({
      name: i === 0 ? "<img data-x>" : `Navn ${i + 1}`,
      score: 100 - i,
      level: 2,
      date: "2026-09-12",
    }));
    renderHighscores(root, board, 10, { back: () => {}, change: () => {} });
    expect(root.querySelectorAll(".scores li")).toHaveLength(10);
    expect(root.querySelector("img")).toBeNull();
    expect(root.textContent).toContain("<img data-x>");
    root.remove();
  });

  it("marks the newly placed row", () => {
    const root = document.createElement("div");
    document.body.append(root);
    const board = emptyBoard();
    board["10"] = [
      { name: "Ada", score: 90, level: 4, date: "a" },
      { name: "Bo", score: 40, level: 2, date: "b" },
    ];
    renderHighscores(root, board, 10, { back: () => {}, change: () => {} }, 1);
    const rows = root.querySelectorAll(".scores li");
    expect(rows[0]?.classList.contains("mine")).toBe(false);
    expect(rows[1]?.classList.contains("mine")).toBe(true);
    expect(rows[1]?.textContent).toContain("Ny");
    root.remove();
  });

  it("offers a tab for maxN 20", () => {
    const root = document.createElement("div");
    document.body.append(root);
    renderHighscores(root, emptyBoard(), 20, { back: () => {}, change: () => {} });
    const tabs = [...root.querySelectorAll<HTMLButtonElement>("[data-n]")].map((tab) => tab.dataset.n);
    expect(tabs).toEqual(["10", "20", "50", "100", "1000"]);
    expect(root.querySelector('[data-n="20"]')?.classList.contains("on")).toBe(true);
    root.remove();
  });
});
