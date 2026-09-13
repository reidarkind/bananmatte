import { ALL_MODES, FRIEND_BASE, type ModeId, type Settings } from "../types";

export function isHundrevennAvailable(settings: Pick<Settings, "maxN" | "hundrevennEnabled">): boolean {
  return settings.maxN === 1000 && settings.hundrevennEnabled;
}

export function isModeAvailable(mode: ModeId, settings: Pick<Settings, "maxN" | "hundrevennEnabled">): boolean {
  if (mode === "hundrevenn") return isHundrevennAvailable(settings);
  if (mode === "plassverdi") return settings.maxN === 100 || settings.maxN === 1000;
  if (FRIEND_BASE[mode]) return settings.maxN === 10;
  if (mode.startsWith("avrunding-hundre")) return settings.maxN === 1000;
  if (mode.startsWith("avrunding-")) return settings.maxN > 10;
  return true;
}

export function availableModes(settings: Pick<Settings, "maxN" | "hundrevennEnabled">): ModeId[] {
  return ALL_MODES.filter((mode) => isModeAvailable(mode, settings));
}

export function fallbackMode(settings: Pick<Settings, "maxN" | "hundrevennEnabled">): ModeId {
  return availableModes(settings)[0] ?? "addisjon";
}

export function sanitizeSettings<T extends Settings>(settings: T): T {
  const available = availableModes(settings);
  let selectedModes = settings.selectedModes.filter((mode) => available.includes(mode));
  if (selectedModes.length === 0) selectedModes = [fallbackMode(settings)];
  let playSelection = settings.playSelection;
  if (playSelection !== "mix" && playSelection !== "selected" && !available.includes(playSelection)) {
    playSelection = "mix";
  }
  return { ...settings, selectedModes, playSelection };
}

export function resolveRoundMode(settings: Settings, rng: () => number, previous?: ModeId): ModeId {
  const clean = sanitizeSettings(settings);
  const available = availableModes(clean);
  let pool: ModeId[] = [];
  if (clean.playSelection === "mix") {
    pool = available;
  } else if (clean.playSelection === "selected") {
    pool = clean.selectedModes.filter((mode) => available.includes(mode));
  } else {
    pool = [clean.playSelection];
  }
  if (pool.length === 0) pool = [fallbackMode(clean)];
  if (previous && pool.length > 1) {
    const rest = pool.filter((mode) => mode !== previous);
    if (rest.length > 0) pool = rest;
  }
  return pool[Math.floor(rng() * pool.length)] ?? fallbackMode(clean);
}
