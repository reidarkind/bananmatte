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
});
