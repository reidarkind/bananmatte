import { ALL_MODES, FRIEND_BASE, type ModeFilter, type ModeId, type Settings } from "../types";

const KLASSE1: ModeId[] = [
  "femmervenn",
  "sekservenn",
  "syvervenn",
  "attervenn",
  "niervenn",
  "tiervenn",
  "addisjon",
  "subtraksjon-positiv",
  "partall-oddetall",
  "ulikhet-tegn",
  "ulikhet-ord",
  "manglende-tall",
  "bytteplass",
];

const KLASSE2: ModeId[] = [
  "addisjon",
  "subtraksjon-positiv",
  "plassverdi",
  "partall-oddetall",
  "partall-oddetall-addisjon",
  "ulikhet-tegn",
  "ulikhet-ord",
  "manglende-tall",
  "bytteplass",
  "likhet",
  "ti-mer-mindre",
  "hoppetelling",
  "dobbelt-halv",
  "klokke",
  "avrunding-tier-opp",
  "avrunding-tier-ned",
  "avrunding-tier",
  "multiplikasjon-mini",
  "divisjon-mini",
];

const UTFORDRING: ModeId[] = [
  "subtraksjon-negativ",
  "multiplikasjon-liten",
  "divisjon-liten",
  "partall-oddetall-subtraksjon",
  "hundrevenn",
  "avrunding-hundre-opp",
  "avrunding-hundre-ned",
  "avrunding-hundre",
  "plassverdi",
];

const MODE_BANDS: Record<Exclude<ModeFilter, "alle">, ModeId[]> = {
  klasse1: KLASSE1,
  klasse2: KLASSE2,
  utfordring: UTFORDRING,
};

export function isHundrevennAvailable(settings: Pick<Settings, "maxN" | "hundrevennEnabled">): boolean {
  return settings.maxN === 1000 && settings.hundrevennEnabled;
}

export function isModeAvailable(mode: ModeId, settings: Pick<Settings, "maxN" | "hundrevennEnabled">): boolean {
  if (mode === "hundrevenn") return isHundrevennAvailable(settings);
  if (mode === "plassverdi") return settings.maxN === 100 || settings.maxN === 1000;
  if (mode === "ti-mer-mindre") return settings.maxN >= 20;
  if (FRIEND_BASE[mode]) return settings.maxN === 10 || settings.maxN === 20;
  if (mode.startsWith("avrunding-hundre")) return settings.maxN === 1000;
  if (mode.startsWith("avrunding-")) return settings.maxN > 10;
  return true;
}

export function availableModes(settings: Pick<Settings, "maxN" | "hundrevennEnabled">): ModeId[] {
  return ALL_MODES.filter((mode) => isModeAvailable(mode, settings));
}

export function visibleModes(
  settings: Pick<Settings, "maxN" | "hundrevennEnabled" | "modeFilter">,
): ModeId[] {
  const available = availableModes(settings);
  if (settings.modeFilter === "alle") return available;
  const band = MODE_BANDS[settings.modeFilter];
  return available.filter((mode) => band.includes(mode));
}

export function fallbackMode(settings: Pick<Settings, "maxN" | "hundrevennEnabled" | "modeFilter">): ModeId {
  return visibleModes(settings)[0] ?? availableModes(settings)[0] ?? "addisjon";
}

export function sanitizeSettings<T extends Settings>(settings: T): T {
  const available = availableModes(settings);
  const visible = visibleModes(settings);
  let selectedModes = settings.selectedModes.filter((mode) => available.includes(mode));
  if (selectedModes.length === 0) selectedModes = [fallbackMode(settings)];
  let playSelection = settings.playSelection;
  if (playSelection !== "mix" && playSelection !== "selected" && !visible.includes(playSelection)) {
    playSelection = "mix";
  }
  return { ...settings, selectedModes, playSelection };
}

export function resolveRoundMode(settings: Settings, rng: () => number, previous?: ModeId): ModeId {
  const clean = sanitizeSettings(settings);
  const visible = visibleModes(clean);
  let pool: ModeId[] = [];
  if (clean.playSelection === "mix") {
    pool = visible;
  } else if (clean.playSelection === "selected") {
    pool = clean.selectedModes.filter((mode) => visible.includes(mode));
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
