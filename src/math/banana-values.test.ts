import { describe, expect, it } from "vitest";
import { bananaOptions, nextBananaValue } from "./banana-values";
import { createRng } from "./rng";

describe("bananaOptions", () => {
  it("uses ones for max 10", () => {
    expect(bananaOptions(10)).toEqual([1]);
  });

  it("adds fives for max 20", () => {
    expect(bananaOptions(20)).toEqual([1, 5]);
  });

  it("adds fives for max 50", () => {
    expect(bananaOptions(50)).toEqual([1, 5]);
  });

  it("adds tens for max 100", () => {
    expect(bananaOptions(100)).toEqual([1, 5, 10]);
  });

  it("uses bunches for max 1000", () => {
    expect(bananaOptions(1000)).toEqual([1, 10, 50, 100]);
  });
});

describe("nextBananaValue", () => {
  it("never exceeds remaining", () => {
    const rng = createRng(7);
    for (let i = 0; i < 40; i += 1) {
      expect(nextBananaValue(1000, 7, rng)).toBeLessThanOrEqual(7);
    }
  });

  it("can finish an exact remainder of 1", () => {
    expect(nextBananaValue(1000, 1, () => 0.99)).toBe(1);
  });
});
