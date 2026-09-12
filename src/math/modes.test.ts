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
  it("keeps friend modes only when maxN is 10", () => {
    const atTen = availableModes({ ...DEFAULT_SETTINGS, maxN: 10 });
    const atFifty = availableModes({ ...DEFAULT_SETTINGS, maxN: 50 });
    for (const mode of ["tiervenn", "femmervenn", "sekservenn", "syvervenn", "attervenn", "niervenn"] as const) {
      expect(atTen).toContain(mode);
      expect(atFifty).not.toContain(mode);
    }
  });

  it("does not offer rounding down under 10", () => {
    expect(availableModes({ ...DEFAULT_SETTINGS, maxN: 50 }).join(" ")).not.toMatch(/ned-sma/);
    expect(availableModes({ ...DEFAULT_SETTINGS, maxN: 10 }).join(" ")).not.toMatch(/ned-sma/);
  });

  it("keeps rounding to ten when maxN is over 10, and to a hundred only at 1000", () => {
    expect(availableModes({ ...DEFAULT_SETTINGS, maxN: 10 })).not.toContain("avrunding-tier");
    expect(availableModes({ ...DEFAULT_SETTINGS, maxN: 50 })).toContain("avrunding-tier");
    expect(availableModes({ ...DEFAULT_SETTINGS, maxN: 50 })).not.toContain("avrunding-hundre");
    expect(availableModes({ ...DEFAULT_SETTINGS, maxN: 100 })).not.toContain("avrunding-hundre-opp");
    expect(availableModes({ ...DEFAULT_SETTINGS, maxN: 100 })).not.toContain("avrunding-hundre-ned");
    expect(availableModes({ ...DEFAULT_SETTINGS, maxN: 1000 })).toContain("avrunding-hundre");
    expect(availableModes({ ...DEFAULT_SETTINGS, maxN: 1000 })).toContain("avrunding-hundre-opp");
    expect(availableModes({ ...DEFAULT_SETTINGS, maxN: 1000 })).toContain("avrunding-hundre-ned");
  });
});

describe("sanitizeSettings", () => {
  it("keeps at least one selected mode", () => {
    const next = sanitizeSettings({ ...DEFAULT_SETTINGS, selectedModes: [] });
    expect(next.selectedModes.length).toBeGreaterThan(0);
  });

  it("drops hundred-rounding modes when maxN is not 1000", () => {
    const next = sanitizeSettings({
      ...DEFAULT_SETTINGS,
      maxN: 100,
      playSelection: "avrunding-hundre",
      selectedModes: ["avrunding-hundre", "avrunding-hundre-opp", "avrunding-hundre-ned", "addisjon"],
    });
    expect(next.playSelection).toBe("mix");
    expect(next.selectedModes).not.toContain("avrunding-hundre");
    expect(next.selectedModes).not.toContain("avrunding-hundre-opp");
    expect(next.selectedModes).not.toContain("avrunding-hundre-ned");
    expect(next.selectedModes).toContain("addisjon");
  });

  it("drops friend modes from the selection when maxN is 50", () => {
    const next = sanitizeSettings({
      ...DEFAULT_SETTINGS,
      maxN: 50,
      playSelection: "femmervenn",
      selectedModes: ["tiervenn", "femmervenn", "addisjon"],
    });
    expect(next.playSelection).toBe("mix");
    expect(next.selectedModes).not.toContain("tiervenn");
    expect(next.selectedModes).not.toContain("femmervenn");
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
