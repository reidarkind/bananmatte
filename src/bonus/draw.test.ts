import { describe, expect, it } from "vitest";
import { bonusApePose, chaseLayout } from "./draw";
import { bonusVehicle } from "./milestones";

describe("bonus chase camera", () => {
  it("shows the ape face only while spinning on a banana", () => {
    expect(bonusApePose(0, 0)).toBe("rear");
    expect(bonusApePose(0.1, 0)).toBe("rear");
    expect(bonusApePose(2.4, 0)).toBe("face");
    expect(bonusApePose(0, 6)).toBe("face");
  });

  it("draws every vehicle from behind, wider at the rear", () => {
    for (const level of [10, 20, 30, 40, 50, 60, 70] as const) {
      const layout = chaseLayout(bonusVehicle(level));
      expect(layout.rearW).toBeGreaterThan(layout.frontW);
      expect(layout.depth).toBeGreaterThan(40);
    }
  });
});
