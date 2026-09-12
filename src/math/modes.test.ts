import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS, type ModeId } from "../types";
import { createRng } from "./rng";
import { availableModes, resolveRoundMode, sanitizeSettings } from "./modes";

const mix = {
  ...DEFAULT_SETTINGS,
  playSelection: "mix" as const,
  selectedModes: ["addisjon", "femmervenn", "partall-oddetall"] as ModeId[],
};

describe("availableModes", () => {
  it("keeps tiervenn only when maxN is 10", () => {
    expect(availableModes({ ...DEFAULT_SETTINGS, maxN: 10 })).toContain("tiervenn");
    expect(availableModes({ ...DEFAULT_SETTINGS, maxN: 50 })).not.toContain("tiervenn");
    expect(availableModes({ ...DEFAULT_SETTINGS, maxN: 50 })).toContain("femmervenn");
  });

  it("keeps rounding modes only when maxN is over 10", () => {
    expect(availableModes({ ...DEFAULT_SETTINGS, maxN: 10 })).not.toContain("avrunding-tier");
    expect(availableModes({ ...DEFAULT_SETTINGS, maxN: 50 })).toContain("avrunding-tier");
    expect(availableModes({ ...DEFAULT_SETTINGS, maxN: 50 })).toContain("avrunding-hundre");
  });
});

describe("sanitizeSettings", () => {
  it("keeps at least one selected mode", () => {
    const next = sanitizeSettings({ ...DEFAULT_SETTINGS, selectedModes: [] });
    expect(next.selectedModes.length).toBeGreaterThan(0);
  });

  it("drops tiervenn from the selection when maxN is 50", () => {
    const next = sanitizeSettings({
      ...DEFAULT_SETTINGS,
      maxN: 50,
      playSelection: "tiervenn",
      selectedModes: ["tiervenn", "addisjon"],
    });
    expect(next.playSelection).toBe("mix");
    expect(next.selectedModes).not.toContain("tiervenn");
    expect(next.selectedModes).toContain("addisjon");
  });
});

describe("resolveRoundMode", () => {
  it("picks a new mix mode each round when more than one is available", () => {
    const rng = createRng(42);
    const seen = new Set<ModeId>();
    let previous: ModeId | undefined;
    for (let i = 0; i < 8; i += 1) {
      const mode = resolveRoundMode({ ...mix, maxN: 10 }, rng, previous);
      if (previous) expect(mode).not.toBe(previous);
      seen.add(mode);
      previous = mode;
    }
    expect(seen.size).toBeGreaterThan(1);
  });

  it("picks from the selection only, and changes each round", () => {
    const settings = {
      ...DEFAULT_SETTINGS,
      playSelection: "selected" as const,
      selectedModes: ["addisjon", "femmervenn", "partall-oddetall"] as ModeId[],
    };
    const rng = createRng(7);
    let previous: ModeId | undefined;
    const seen = new Set<ModeId>();
    for (let i = 0; i < 9; i += 1) {
      const mode = resolveRoundMode(settings, rng, previous);
      expect(["addisjon", "femmervenn", "partall-oddetall"]).toContain(mode);
      if (previous) expect(mode).not.toBe(previous);
      seen.add(mode);
      previous = mode;
    }
    expect(seen.size).toBeGreaterThan(1);
  });
});
