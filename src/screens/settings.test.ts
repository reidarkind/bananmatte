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

  it("keeps at least one selected mode checked", () => {
    const root = document.createElement("div");
    document.body.append(root);
    renderSettings(
      root,
      { ...DEFAULT_SETTINGS, playSelection: "selected", selectedModes: ["addisjon"] },
      { back: () => {}, save: () => {}, resetHighscores: () => {} },
    );
    const box = root.querySelector<HTMLInputElement>('[data-sel="addisjon"]');
    expect(box?.checked).toBe(true);
    box!.checked = false;
    box!.dispatchEvent(new Event("change"));
    const again = root.querySelector<HTMLInputElement>('[data-sel="addisjon"]');
    expect(again?.checked).toBe(true);
    expect(root.textContent).toContain("Velg minst én modus");
    root.remove();
  });

  it("switches labels to English", () => {
    const root = document.createElement("div");
    document.body.append(root);
    renderSettings(root, { ...DEFAULT_SETTINGS, selectedModes: [...DEFAULT_SETTINGS.selectedModes] }, {
      back: () => {},
      save: () => {},
      resetHighscores: () => {},
    });
    root.querySelector<HTMLButtonElement>('[data-lang="en"]')!.click();
    expect(root.querySelector("h1")?.textContent).toBe("Settings");
    root.remove();
  });
});
