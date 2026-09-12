import { describe, expect, it } from "vitest";
import { applyScore, catchPoints, mathBonus, SCORE_MISS, SCORE_ROTTEN } from "./scoring";

describe("applyScore", () => {
  it("clamps at zero", () => {
    expect(applyScore(3, SCORE_ROTTEN)).toBe(0);
    expect(applyScore(0, SCORE_MISS)).toBe(0);
  });

  it("adds catch points by value", () => {
    expect(applyScore(0, catchPoints(5))).toBe(50);
  });

  it("awards math bonus from level", () => {
    expect(mathBonus(1)).toBe(60);
    expect(mathBonus(3)).toBe(80);
  });
});
