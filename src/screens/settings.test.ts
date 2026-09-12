/** @vitest-environment jsdom */

import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS } from "../types";
import { renderSettings } from "./settings";

describe("settings highscores", () => {
  it("asks before clearing all records", () => {
    const root = document.createElement("div");
    document.body.append(root);
    let cleared = false;
    renderSettings(root, { ...DEFAULT_SETTINGS, selectedModes: [...DEFAULT_SETTINGS.selectedModes] }, {
      back: () => {},
      save: () => {},
      resetHighscores: () => {
        cleared = true;
      },
    });

    const start = root.querySelector<HTMLButtonElement>("[data-reset-scores]");
    expect(start).not.toBeNull();
    start!.click();
    expect(cleared).toBe(false);

    root.querySelector<HTMLButtonElement>("[data-reset-confirm]")!.click();
    expect(cleared).toBe(true);
    expect(root.textContent).toContain("Rekordene er slettet");
    root.remove();
  });
});
