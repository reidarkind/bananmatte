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
    expect(root.textContent).toContain("Opplåste bonusspill");

    root.querySelector<HTMLButtonElement>("[data-reset-confirm]")!.click();
    expect(cleared).toBe(true);
    expect(root.textContent).toContain("Rekordene og opplåste bonusspill er slettet");
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

  it("lets the player pick banana attack", () => {
    const root = document.createElement("div");
    document.body.append(root);
    let saved = DEFAULT_SETTINGS.playStyle;
    renderSettings(root, { ...DEFAULT_SETTINGS, selectedModes: [...DEFAULT_SETTINGS.selectedModes] }, {
      back: () => {},
      save: (next) => {
        saved = next.playStyle;
      },
      resetHighscores: () => {},
    });
    expect(root.textContent).toContain("Banansanking");
    root.querySelector<HTMLButtonElement>('[data-play="angrep"]')!.click();
    root.querySelector<HTMLButtonElement>("[data-back]")!.click();
    expect(saved).toBe("angrep");
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
    const lang = root.querySelector<HTMLSelectElement>("[data-lang]");
    expect(lang?.querySelectorAll("option")).toHaveLength(7);
    lang!.value = "en";
    lang!.dispatchEvent(new Event("change"));
    expect(root.querySelector("h1")?.textContent).toBe("Settings");
    root.remove();
  });

  it("offers maxN 20 and a 1st-grade filter that hides challenge modes", () => {
    const root = document.createElement("div");
    document.body.append(root);
    renderSettings(root, { ...DEFAULT_SETTINGS, selectedModes: [...DEFAULT_SETTINGS.selectedModes] }, {
      back: () => {},
      save: () => {},
      resetHighscores: () => {},
    });
    expect(root.querySelector('[data-max="20"]')).not.toBeNull();
    expect(root.textContent).toContain("1. klasse");
    root.querySelector<HTMLButtonElement>('[data-filter="klasse1"]')!.click();
    const options = [...root.querySelectorAll<HTMLOptionElement>("[data-mode] option")].map((option) => option.value);
    expect(options).toContain("manglende-tall");
    expect(options).not.toContain("subtraksjon-negativ");
    expect(options).not.toContain("likhet");
    root.remove();
  });
});
