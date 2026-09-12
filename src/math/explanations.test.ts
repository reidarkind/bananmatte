import { describe, expect, it } from "vitest";
import {
  explainAdd,
  explainDiv,
  explainHundrevenn,
  explainMul,
  explainParity,
  explainParityDiff,
  explainParitySum,
  explainSub,
  explainTiervenn,
} from "./explanations";

describe("wrong-answer explanations", () => {
  it("says why a number is odd or even", () => {
    expect(explainParity(5)).toBe("5 kan ikke deles på 2 og er derfor et oddetall.");
    expect(explainParity(8)).toBe("8 kan deles på 2 og er derfor et partall.");
  });

  it("explains parity after adding or subtracting", () => {
    expect(explainParitySum(3, 2)).toBe("3 + 2 = 5. 5 kan ikke deles på 2 og er derfor et oddetall.");
    expect(explainParityDiff(9, 4)).toBe("9 − 4 = 5. 5 kan ikke deles på 2 og er derfor et oddetall.");
  });

  it("explains the other modes with a because", () => {
    expect(explainTiervenn(3, 7)).toContain("3 + 7 = 10");
    expect(explainHundrevenn(40, 60)).toContain("40 + 60 = 100");
    expect(explainAdd(4, 2)).toBe("Når du legger 2 til 4, får du 6.");
    expect(explainSub(9, 3)).toBe("Når du tar 3 fra 9, får du 6.");
    expect(explainMul(4, 3)).toBe("4 · 3 betyr 3 ganger 4. Det blir 12.");
    expect(explainDiv(12, 3, 4)).toBe("3 får plass 4 ganger i 12, fordi 3 · 4 = 12.");
  });
});
