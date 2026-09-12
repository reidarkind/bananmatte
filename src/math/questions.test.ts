import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS, type ModeId, type Settings } from "../types";
import { createRng } from "./rng";
import { planMode, planRound } from "./questions";
import { compareOf, nFriend, roundTo } from "./explanations";

const base: Settings = { ...DEFAULT_SETTINGS, selectedModes: [...DEFAULT_SETTINGS.selectedModes] };

describe("planMode", () => {
  it("uses tens-friend 7 for 3 and 2 for 18", () => {
    const three = planMode("tiervenn", 10, () => 0.25);
    expect(three.answer as number + three.catchTarget).toBeGreaterThanOrEqual(10);
    expect((3 + 7) % 10).toBe(0);
    expect((18 + 2) % 10).toBe(0);

    const tens = (n: number) => (10 - (n % 10)) % 10;
    expect(tens(3)).toBe(7);
    expect(tens(18)).toBe(2);
    expect(tens(three.catchTarget)).toBe(three.answer);
  });

  it("keeps addition below maxN", () => {
    const rng = createRng(11);
    for (let i = 0; i < 30; i += 1) {
      const plan = planMode("addisjon", 10, rng);
      expect(plan.operand ?? 0).toBeLessThan(10 - plan.catchTarget);
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
    const rng = createRng(2);
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

  it("makes a fives friend", () => {
    const plan = planMode("femmervenn", 10, () => 0.4);
    expect(plan.answer).toBe(nFriend(plan.catchTarget, 5));
  });

  it("rounds up, down and to nearest ten", () => {
    expect(roundTo(14, 10, "up")).toBe(20);
    expect(roundTo(14, 10, "down")).toBe(10);
    expect(roundTo(15, 10, "nearest")).toBe(20);
    expect(roundTo(7, 10, "down")).toBe(0);
    const down = planMode("avrunding-tier-ned-sma", 50, () => 0.2);
    expect(down.catchTarget).toBeLessThan(10);
    expect(down.answer).toBe(0);
  });

  it("compares with signs", () => {
    const plan = planMode("ulikhet-tegn", 20, createRng(5));
    expect(plan.kind).toBe("compare");
    expect(["gt", "lt", "eq"]).toContain(plan.answer);
    expect(plan.answer).toBe(compareOf(plan.catchTarget, plan.operand ?? 0));
  });
});

describe("planRound", () => {
  it("falls back to a valid mode when selection is empty", () => {
    const plan = planRound({ ...base, playSelection: "selected", selectedModes: [] }, createRng(1));
    expect(["tiervenn", "addisjon", "femmervenn"]).toContain(plan.mode);
  });

  it("blocks hundrevenn when the toggle is off", () => {
    const plan = planRound(
      { ...base, maxN: 1000, hundrevennEnabled: false, playSelection: "hundrevenn" },
      createRng(2),
    );
    expect(plan.mode).not.toBe("hundrevenn");
  });

  it("does not pick hundrevenn when maxN is not 1000", () => {
    const rng = createRng(4);
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

  it("changes mix mode between rounds", () => {
    const settings = { ...base, playSelection: "mix" as const, maxN: 10 as const };
    const rng = createRng(21);
    const first = planRound(settings, rng);
    const second = planRound(settings, rng, first.mode);
    expect(second.mode).not.toBe(first.mode);
  });

  it("changes selected mode between rounds", () => {
    const settings = {
      ...base,
      playSelection: "selected" as const,
      selectedModes: ["addisjon", "femmervenn", "partall-oddetall"] as ModeId[],
    };
    const rng = createRng(8);
    const first = planRound(settings, rng);
    const second = planRound(settings, rng, first.mode);
    expect(["addisjon", "femmervenn", "partall-oddetall"]).toContain(first.mode);
    expect(["addisjon", "femmervenn", "partall-oddetall"]).toContain(second.mode);
    expect(second.mode).not.toBe(first.mode);
  });
});
