export const BACKGROUNDS = [
  { id: "jungel", sky: ["#8ecae6", "#219ebc"], ground: "#2d6a4f", extra: "#95d5b2" },
  { id: "strand", sky: ["#ade8f4", "#f9c74f"], ground: "#f4a261", extra: "#e9c46a" },
  { id: "natt", sky: ["#1d3557", "#457b9d"], ground: "#1b4332", extra: "#a8dadc" },
  { id: "skole", sky: ["#caf0f8", "#90e0ef"], ground: "#d4a373", extra: "#f4d35e" },
  { id: "vulkan", sky: ["#6a040f", "#e85d04"], ground: "#370617", extra: "#faa307" },
  { id: "undervann", sky: ["#023e8a", "#48cae4"], ground: "#0077b6", extra: "#90e0ef" },
  { id: "rom", sky: ["#10002b", "#240046"], ground: "#3c096c", extra: "#e0aaff" },
  { id: "godteri", sky: ["#ffc8dd", "#ffafcc"], ground: "#bde0fe", extra: "#ffd6a5" },
] as const;

export function backgroundFor(level: number) {
  return BACKGROUNDS[(level - 1) % BACKGROUNDS.length]!;
}

export interface Decor {
  kind: "leaf" | "bird" | "star" | "bubble";
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  phase: number;
}

export function createDecor(level: number, width: number, height: number, rng: () => number): Decor[] {
  const count = Math.min(2 + level, 10);
  const kinds: Decor["kind"][] = level >= 6 ? ["leaf", "bird", "star", "bubble"] : level >= 4 ? ["leaf", "bird"] : ["leaf"];
  return Array.from({ length: count }, () => ({
    kind: kinds[Math.floor(rng() * kinds.length)] ?? "leaf",
    x: rng() * width,
    y: rng() * height * 0.7,
    vx: (rng() - 0.5) * (20 + level * 4),
    vy: 8 + rng() * 18,
    size: 10 + rng() * 16,
    phase: rng() * Math.PI * 2,
  }));
}
