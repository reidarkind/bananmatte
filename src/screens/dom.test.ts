/** @vitest-environment jsdom */

import { describe, expect, it } from "vitest";
import { html } from "./dom";
import { renderGameShell, updateHud } from "./game";

describe("html helper", () => {
  it("keeps every top-level node, not only the first", () => {
    const node = html`<div data-a="1"></div><div data-b="2"></div>`;
    expect(node.querySelector("[data-a]")).not.toBeNull();
    expect(node.querySelector("[data-b]")).not.toBeNull();
  });
});

describe("info screens", () => {
  it("keep Rekorder, Innstillinger and Om appen off the numpad grid class", async () => {
    const { renderHighscores } = await import("./highscore");
    const { renderSettings } = await import("./settings");
    const { renderAbout } = await import("./about");
    const { emptyBoard } = await import("../storage/highscores");
    const { DEFAULT_SETTINGS } = await import("../types");

    const root = document.createElement("div");
    document.body.append(root);
    renderHighscores(root, emptyBoard(), 10, { back: () => {}, change: () => {} });
    expect(root.querySelector(".screen.pad")).not.toBeNull();
    expect(root.querySelector(".numpad")).toBeNull();
    expect(root.querySelector("h1")?.textContent).toBe("Rekorder");

    renderSettings(root, { ...DEFAULT_SETTINGS, selectedModes: [...DEFAULT_SETTINGS.selectedModes] }, {
      back: () => {},
      save: () => {},
      resetHighscores: () => {},
    });
    expect(root.querySelector(".screen.pad")).not.toBeNull();
    expect(root.querySelector(".numpad")).toBeNull();
    expect(root.querySelector("h1")?.textContent).toBe("Innstillinger");

    renderAbout(root, () => {});
    expect(root.querySelector(".screen.pad")).not.toBeNull();
    expect(root.querySelector(".numpad")).toBeNull();
    expect(root.querySelector("h1")?.textContent).toBe("Om appen");
    root.remove();
  });
});

describe("game HUD", () => {
  it("can update lives and score after a catch without throwing", () => {
    const root = document.createElement("div");
    document.body.append(root);
    const { hud } = renderGameShell(root, "tiervenn", () => {});
    expect(hud.querySelector("[data-lives]")).not.toBeNull();
    expect(() =>
      updateHud(hud, { mode: "tiervenn", level: 1, lives: 2, collected: 1, target: 5, score: 10 }),
    ).not.toThrow();
    expect(hud.querySelector("[data-score]")?.textContent).toBe("10");
    expect(hud.querySelector("[data-progress]")?.textContent).toBe("1 / 5");
    root.remove();
  });

  it("shows a rotten-banana meter with three slots at the top", () => {
    const root = document.createElement("div");
    document.body.append(root);
    const { hud } = renderGameShell(root, "addisjon", () => {});
    const meter = hud.querySelector("[data-rotten]");
    expect(meter).not.toBeNull();
    expect(meter?.textContent).toContain("Råtten");
    expect(hud.querySelectorAll(".rotten-slot")).toHaveLength(3);
    expect(hud.querySelectorAll(".rotten-icon")).toHaveLength(3);
    expect(hud.querySelectorAll(".rotten-slot.on")).toHaveLength(0);
    expect(hud.querySelectorAll(".rotten-slot .cross")).toHaveLength(3);

    updateHud(hud, {
      mode: "addisjon",
      level: 2,
      lives: 2,
      collected: 0,
      target: 6,
      score: 20,
      rottenCaught: 2,
    });
    expect(hud.querySelectorAll(".rotten-icon")).toHaveLength(3);
    expect(hud.querySelectorAll(".rotten-slot.on")).toHaveLength(2);
    expect(hud.querySelectorAll(".rotten-slot.on .cross")).toHaveLength(2);
    expect(meter?.getAttribute("aria-label")).toContain("2");
    root.remove();
  });
});
