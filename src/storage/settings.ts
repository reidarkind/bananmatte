import { parsePlayStyle } from "../game/play-style";
import { localeFromNavigator } from "../lib/locale";
import { sanitizeSettings } from "../math/modes";
import { DEFAULT_SETTINGS, parseModeFilter, tryParseLocale, type Settings } from "../types";
import { browserStore, type KeyValueStore } from "./adapter";

export const SETTINGS_KEY = "bananmatte.settings.v1";

function isMaxN(value: unknown): value is Settings["maxN"] {
  return value === 10 || value === 20 || value === 50 || value === 100 || value === 1000;
}

function phoneLanguages(): readonly string[] {
  if (typeof navigator === "undefined") return [];
  const list = navigator.languages?.length ? [...navigator.languages] : [];
  if (navigator.language) list.push(navigator.language);
  return list;
}

function emptySettings(locale: Settings["locale"]): Settings {
  return { ...DEFAULT_SETTINGS, selectedModes: [...DEFAULT_SETTINGS.selectedModes], locale };
}

export function hasChosenLocale(store: KeyValueStore = browserStore()): boolean {
  const raw = store.getItem(SETTINGS_KEY);
  if (!raw) return false;
  try {
    return tryParseLocale((JSON.parse(raw) as Partial<Settings>).locale) !== null;
  } catch {
    return false;
  }
}

export function clearChosenLocale(store: KeyValueStore = browserStore()): void {
  const raw = store.getItem(SETTINGS_KEY);
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    delete parsed.locale;
    store.setItem(SETTINGS_KEY, JSON.stringify(parsed));
  } catch {
    // leave corrupt JSON; parseSettings already recovers
  }
}

export function parseSettings(raw: string | null, languages: readonly string[] = []): Settings {
  const fallbackLocale = localeFromNavigator(languages);
  if (!raw) return emptySettings(fallbackLocale);
  try {
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return sanitizeSettings({
      maxN: isMaxN(parsed.maxN) ? parsed.maxN : DEFAULT_SETTINGS.maxN,
      playSelection: parsed.playSelection ?? DEFAULT_SETTINGS.playSelection,
      selectedModes: Array.isArray(parsed.selectedModes)
        ? parsed.selectedModes
        : [...DEFAULT_SETTINGS.selectedModes],
      hundrevennEnabled: parsed.hundrevennEnabled ?? true,
      sound: parsed.sound ?? true,
      locale: tryParseLocale(parsed.locale) ?? fallbackLocale,
      playStyle: parsePlayStyle(parsed.playStyle),
      modeFilter: parseModeFilter(parsed.modeFilter),
    });
  } catch {
    return emptySettings(fallbackLocale);
  }
}

export function loadSettings(
  store: KeyValueStore = browserStore(),
  languages: readonly string[] = phoneLanguages(),
): Settings {
  return parseSettings(store.getItem(SETTINGS_KEY), languages);
}

export function saveSettings(settings: Settings, store: KeyValueStore = browserStore()): void {
  store.setItem(SETTINGS_KEY, JSON.stringify(sanitizeSettings(settings)));
}
