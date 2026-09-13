import { describe, expect, it } from "vitest";
import { PLAY_REF_HEIGHT, PLAY_REF_WIDTH, playSpeedScale } from "./scale";

describe("play speed scale", () => {
  it("leaves phone-sized screens unchanged", () => {
    expect(playSpeedScale(667, PLAY_REF_HEIGHT)).toBe(1);
    expect(playSpeedScale(840, PLAY_REF_HEIGHT)).toBe(1);
    expect(playSpeedScale(390, PLAY_REF_WIDTH)).toBe(1);
    expect(playSpeedScale(430, PLAY_REF_WIDTH)).toBe(1);
  });

  it("speeds up tall or wide tablet screens so travel time stays similar", () => {
    expect(playSpeedScale(1366, PLAY_REF_HEIGHT)).toBeCloseTo(1366 / PLAY_REF_HEIGHT);
    expect(playSpeedScale(1024, PLAY_REF_WIDTH)).toBeCloseTo(1024 / PLAY_REF_WIDTH);
  });
});
