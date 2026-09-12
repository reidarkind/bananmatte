import { DEFAULT_SETTINGS, type Settings } from "../types";
import { browserStore, type KeyValueStore } from "./adapter";

export const SETTINGS_KEY = "bananmatte.settings.v1";

function isMaxN(value: unknown): value is Settings["maxN"] {
  return value === 10 || value === 50 || value === 100 || value === 1000;
}

export function parseSettings(raw: string | null): Settings {
  if (!raw) return { ...DEFAULT_SETTINGS, selectedModes: [...DEFAULT_SETTINGS.selectedModes] };
  try {
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return {
      maxN: isMaxN(parsed.maxN) ? parsed.maxN : DEFAULT_SETTINGS.maxN,
      playSelection: parsed.playSelection ?? DEFAULT_SETTINGS.playSelection,
      selectedModes: Array.isArray(parsed.selectedModes)
        ? parsed.selectedModes
        : [...DEFAULT_SETTINGS.selectedModes],
      hundrevennEnabled: parsed.hundrevennEnabled ?? true,
      sound: parsed.sound ?? true,
    };
  } catch {
    return { ...DEFAULT_SETTINGS, selectedModes: [...DEFAULT_SETTINGS.selectedModes] };
  }
}

export function loadSettings(store: KeyValueStore = browserStore()): Settings {
  return parseSettings(store.getItem(SETTINGS_KEY));
}

export function saveSettings(settings: Settings, store: KeyValueStore = browserStore()): void {
  store.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
