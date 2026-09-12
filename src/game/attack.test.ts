import { describe, expect, it } from "vitest";
import { aimShot, createAttackWorld, throwAt } from "./attack";

describe("attack throw", () => {
  it("aims a banana toward the tap", () => {
    const shot = aimShot(100, 400, 100, 40, 500);
    expect(shot.vy).toBeLessThan(0);
    expect(Math.abs(shot.vx)).toBeLessThan(1);
  });

  it("only keeps one banana in the air", () => {
    const world = createAttackWorld();
    throwAt(world, 100, 400, 80, 60, 1);
    throwAt(world, 100, 400, 140, 60, 1);
    expect(world.shots).toHaveLength(1);
  });
});
