import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS } from "../types";
import { memoryStore } from "./adapter";
import { loadSettings, saveSettings, SETTINGS_KEY } from "./settings";

describe("settings storage", () => {
  it("returns defaults for empty store", () => {
    expect(loadSettings(memoryStore()).maxN).toBe(DEFAULT_SETTINGS.maxN);
  });

  it("roundtrips a saved settings object", () => {
    const store = memoryStore();
    saveSettings({ ...DEFAULT_SETTINGS, maxN: 100, sound: false }, store);
    expect(store.getItem(SETTINGS_KEY)).toContain("100");
    expect(loadSettings(store)).toMatchObject({ maxN: 100, sound: false });
  });

  it("recovers from corrupt JSON", () => {
    const store = memoryStore({ [SETTINGS_KEY]: "{not json" });
    expect(loadSettings(store).maxN).toBe(10);
  });

  it("roundtrips English locale", () => {
    const store = memoryStore();
    saveSettings({ ...DEFAULT_SETTINGS, locale: "en" }, store);
    expect(loadSettings(store).locale).toBe("en");
  });
});
