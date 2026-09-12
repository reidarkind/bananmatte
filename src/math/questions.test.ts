import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS, type Settings } from "../types";
import { createRng } from "./rng";
import { planMode, planRound } from "./questions";

const base: Settings = { ...DEFAULT_SETTINGS, selectedModes: [...DEFAULT_SETTINGS.selectedModes] };

describe("planMode", () => {
  it("uses tens-friend 7 for 3 and 2 for 18", () => {
    const three = planMode("tiervenn", 10, () => 0.25);
    expect((three.answer as number) + three.catchTarget).toBeGreaterThanOrEqual(10);
    expect((3 + 7) % 10).toBe(0);
    expect((18 + 2) % 10).toBe(0);

    const tens = (n: number) => (10 - (n % 10)) % 10;
    expect(tens(3)).toBe(7);
    expect(tens(18)).toBe(2);
    expect(tens(three.catchTarget)).toBe(three.answer);
  });

  it("keeps addition below max_n", () => {
    const rng = createRng(11);
    for (let i = 0; i < 30; i += 1) {
      const plan = planMode("addisjon", 10, rng);
      expect((plan.operand ?? 0) < 10 - plan.catchTarget).toBe(true);
      expect(plan.answer).toBe(plan.catchTarget + (plan.operand ?? 0));
    }
  });

  it("keeps positive subtraction non-negative", () => {
    const rng = createRng(3);
    for (let i = 0; i < 20; i += 1) {
      const plan = planMode("subtraksjon-positiv", 50, rng);
      expect(plan.answer).toBeGreaterThanOrEqual(0);
    }
  });

  it("allows negative subtraction results", () => {
    const plans = Array.from({ length: 40 }, (_, i) => planMode("subtraksjon-negativ", 10, createRng(i + 1)));
    expect(plans.some((plan) => (plan.answer as number) < 0)).toBe(true);
  });

  it("multiplies with 1-5 in mini mode", () => {
    const rng = createRng(9);
    for (let i = 0; i < 20; i += 1) {
      const plan = planMode("multiplikasjon-mini", 10, rng);
      expect(plan.operand).toBeGreaterThanOrEqual(1);
      expect(plan.operand).toBeLessThanOrEqual(5);
      expect(plan.answer).toBe(plan.catchTarget * (plan.operand ?? 0));
    }
  });

  it("only yields integer division", () => {
    const rng = createRng(21);
    for (let i = 0; i < 20; i += 1) {
      const mini = planMode("divisjon-mini", 50, rng);
      expect(Number.isInteger(mini.answer)).toBe(true);
      expect(mini.catchTarget % (mini.operand ?? 1)).toBe(0);
      const liten = planMode("divisjon-liten", 50, rng);
      expect(Number.isInteger(liten.answer)).toBe(true);
    }
  });

  it("classifies even and odd", () => {
    const plan = planMode("partall-oddetall", 10, () => 0);
    expect(plan.kind).toBe("parity");
    expect(["partall", "oddetall"]).toContain(plan.answer);
  });
});

describe("planRound", () => {
  it("falls back to tiervenn when selection is empty", () => {
    const plan = planRound({ ...base, playSelection: "selected", selectedModes: [] }, createRng(1));
    expect(plan.mode).toBe("tiervenn");
  });

  it("blocks hundrevenn when the toggle is off", () => {
    const plan = planRound(
      { ...base, maxN: 1000, hundrevennEnabled: false, playSelection: "hundrevenn" },
      createRng(2),
    );
    expect(plan.mode).toBe("tiervenn");
  });

  it("does not pick hundrevenn when maxN is not 1000", () => {
    const rng = createRng(5);
    for (let i = 0; i < 15; i += 1) {
      const plan = planRound({ ...base, maxN: 100, playSelection: "hundrevenn" }, rng);
      expect(plan.mode).not.toBe("hundrevenn");
    }
  });

  it("can pick hundrevenn when unlocked", () => {
    const plan = planRound(
      { ...base, maxN: 1000, hundrevennEnabled: true, playSelection: "hundrevenn" },
      createRng(2),
    );
    expect(plan.mode).toBe("hundrevenn");
    expect((100 - (plan.catchTarget % 100)) % 100).toBe(plan.answer);
  });
});
