/** @vitest-environment jsdom */

import { describe, expect, it, vi } from "vitest";
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
    expect(start?.textContent).toBe("Nullstill");
    start!.click();
    expect(cleared).toBe(false);
    expect(root.textContent).toContain("Rekorder, opplåste bonusspill og språk");

    root.querySelector<HTMLButtonElement>("[data-reset-confirm]")!.click();
    expect(cleared).toBe(true);
    expect(root.textContent).toContain("Rekorder, bonusspill og språk er nullstilt");
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
    expect(lang?.querySelectorAll("option")).toHaveLength(8);
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

  it("checks for an app update from settings", async () => {
    const root = document.createElement("div");
    document.body.append(root);
    const check = vi.fn(async () => "current" as const);
    renderSettings(root, { ...DEFAULT_SETTINGS, selectedModes: [...DEFAULT_SETTINGS.selectedModes] }, {
      back: () => {},
      save: () => {},
      resetHighscores: () => {},
      checkUpdate: check,
      applyUpdate: () => {},
    });
    const button = root.querySelector<HTMLButtonElement>("[data-check-update]");
    expect(button?.textContent).toBe("Sjekk for oppdateringer");
    button!.click();
    await vi.waitFor(() => {
      expect(check).toHaveBeenCalledTimes(1);
      expect(root.textContent).toContain("Du har nyeste versjon");
    });
    root.remove();
  });

  it("offers to load a waiting app update", async () => {
    const root = document.createElement("div");
    document.body.append(root);
    const apply = vi.fn();
    renderSettings(root, { ...DEFAULT_SETTINGS, selectedModes: [...DEFAULT_SETTINGS.selectedModes] }, {
      back: () => {},
      save: () => {},
      resetHighscores: () => {},
      checkUpdate: async () => "available",
      applyUpdate: apply,
    });
    root.querySelector<HTMLButtonElement>("[data-check-update]")!.click();
    await vi.waitFor(() => {
      expect(root.textContent).toContain("Ny versjon. Trykk for å laste inn");
    });
    root.querySelector<HTMLButtonElement>("[data-apply-update]")!.click();
    expect(apply).toHaveBeenCalledTimes(1);
    root.remove();
  });
});
