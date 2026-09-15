import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS } from "../types";
import { memoryStore } from "./adapter";
import { clearChosenLocale, hasChosenLocale, loadSettings, saveSettings, SETTINGS_KEY } from "./settings";

describe("settings storage", () => {
  it("returns defaults for empty store", () => {
    expect(loadSettings(memoryStore()).maxN).toBe(DEFAULT_SETTINGS.maxN);
  });

  it("roundtrips a saved settings object", () => {
    const store = memoryStore();
    saveSettings({ ...DEFAULT_SETTINGS, maxN: 100, sound: false }, store);
    expect(store.getItem(SETTINGS_KEY)).toContain("100");
    expect(loadSettings(store)).toMatchObject({ maxN: 100, sound: false, playStyle: "sank" });
  });

  it("recovers from corrupt JSON", () => {
    const store = memoryStore({ [SETTINGS_KEY]: "{not json" });
    expect(loadSettings(store).maxN).toBe(10);
  });

  it("roundtrips a play style", () => {
    const store = memoryStore();
    saveSettings({ ...DEFAULT_SETTINGS, playStyle: "angrep" }, store);
    expect(loadSettings(store).playStyle).toBe("angrep");
  });

  it("roundtrips English locale", () => {
    const store = memoryStore();
    saveSettings({ ...DEFAULT_SETTINGS, locale: "en" }, store);
    expect(loadSettings(store).locale).toBe("en");
  });

  it("roundtrips Spanish locale", () => {
    const store = memoryStore();
    saveSettings({ ...DEFAULT_SETTINGS, locale: "es" }, store);
    expect(loadSettings(store).locale).toBe("es");
  });

  it("roundtrips maxN 20 and a grade filter", () => {
    const store = memoryStore();
    saveSettings({ ...DEFAULT_SETTINGS, maxN: 20, modeFilter: "klasse1" }, store);
    expect(loadSettings(store)).toMatchObject({ maxN: 20, modeFilter: "klasse1" });
  });

  it("treats an empty store as no chosen language and suggests the phone locale", () => {
    const store = memoryStore();
    expect(hasChosenLocale(store)).toBe(false);
    expect(loadSettings(store, ["sv-SE"]).locale).toBe("sv");
    expect(loadSettings(store, ["it-IT"]).locale).toBe("en");
  });

  it("forgets the chosen language on reset and keeps other settings", () => {
    const store = memoryStore();
    saveSettings({ ...DEFAULT_SETTINGS, locale: "de", maxN: 20, sound: false }, store);
    expect(hasChosenLocale(store)).toBe(true);
    clearChosenLocale(store);
    expect(hasChosenLocale(store)).toBe(false);
    expect(loadSettings(store, ["en-GB"]).locale).toBe("en");
    expect(loadSettings(store, ["en-GB"]).maxN).toBe(20);
    expect(loadSettings(store, ["en-GB"]).sound).toBe(false);
  });
});
