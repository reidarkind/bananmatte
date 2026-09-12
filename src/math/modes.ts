import {
  ALL_MODES,
  type ModeId,
  type Settings,
} from "../types";

export function isHundrevennAvailable(settings: Pick<Settings, "maxN" | "hundrevennEnabled">): boolean {
  return settings.maxN === 1000 && settings.hundrevennEnabled;
}

export function availableModes(settings: Settings): ModeId[] {
  return ALL_MODES.filter((mode) => {
    if (mode === "hundrevenn") {
      return isHundrevennAvailable(settings);
    }
    return true;
  });
}

export function resolveRoundMode(settings: Settings, rng: () => number): ModeId {
  const available = availableModes(settings);

  if (settings.playSelection === "mix") {
    return available[Math.floor(rng() * available.length)] ?? "tiervenn";
  }

  if (settings.playSelection === "selected") {
    const picked = settings.selectedModes.filter((mode) => available.includes(mode));
    if (picked.length === 0) return "tiervenn";
    return picked[Math.floor(rng() * picked.length)] ?? "tiervenn";
  }

  if (settings.playSelection === "hundrevenn" && !isHundrevennAvailable(settings)) {
    return "tiervenn";
  }

  if (!available.includes(settings.playSelection)) {
    return "tiervenn";
  }

  return settings.playSelection;
}
