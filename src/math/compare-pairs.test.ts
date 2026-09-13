import { describe, expect, it } from "vitest";
import { compareTwists, trickyComparePair } from "./compare-pairs";
import { createRng } from "./rng";

describe("compare twists", () => {
  it("shuffles digits and nudges one digit for lookalike traps", () => {
    expect(compareTwists(13, 100)).toContain(31);
    expect(compareTwists(15, 100)).toContain(41);
    expect(compareTwists(131, 1000)).toContain(121);
    expect(compareTwists(142, 1000)).toContain(124);
    expect(compareTwists(153, 1000)).toContain(145);
  });

  it("keeps both numbers inside maxN", () => {
    const rng = createRng(11);
    for (let i = 0; i < 40; i += 1) {
      const { x, y } = trickyComparePair(50, rng);
      expect(x).toBeGreaterThanOrEqual(1);
      expect(x).toBeLessThanOrEqual(50);
      expect(y).toBeGreaterThanOrEqual(1);
      expect(y).toBeLessThanOrEqual(50);
    }
  });
});
