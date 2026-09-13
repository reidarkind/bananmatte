import { describe, expect, it } from "vitest";
import { createRng } from "./rng";
import { planMode } from "./questions";

describe("plassverdi", () => {
  it("adds ones and tens, and uses one of those parts as the catch target", () => {
    const rng = createRng(4);
    for (let i = 0; i < 20; i += 1) {
      const plan = planMode("plassverdi", 100, rng);
      expect(plan.mode).toBe("plassverdi");
      const parts = (plan.expression ?? "").split(" + ").map(Number);
      expect(parts).toHaveLength(2);
      expect(parts[0]).toBeGreaterThanOrEqual(0);
      expect(parts[0]).toBeLessThanOrEqual(9);
      expect(parts[1] % 10).toBe(0);
      expect(parts[1]).toBeGreaterThanOrEqual(0);
      expect(parts[1]).toBeLessThanOrEqual(90);
      expect(parts).toContain(plan.catchTarget);
      expect(plan.catchTarget).toBeGreaterThan(0);
      expect(plan.answer).toBe(parts[0]! + parts[1]!);
    }
  });

  it("adds a hundreds part when maxN is 1000", () => {
    const plan = planMode("plassverdi", 1000, createRng(8));
    const parts = (plan.expression ?? "").split(" + ").map(Number);
    expect(parts).toHaveLength(3);
    expect(parts[2]! % 100).toBe(0);
    expect(parts[2]).toBeGreaterThanOrEqual(0);
    expect(parts[2]).toBeLessThanOrEqual(1000);
    expect(parts).toContain(plan.catchTarget);
    expect(plan.answer).toBe(parts[0]! + parts[1]! + parts[2]!);
  });
});
