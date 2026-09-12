import { describe, expect, it } from "vitest";
import { attackPeekBand, aimShot, createAttackWorld, maybeSpawnTarget, spawnAttackTarget, throwAt } from "./attack";

describe("attack throw", () => {
  it("aims a banana toward the tap", () => {
    const shot = aimShot(100, 400, 100, 40, 500);
    expect(shot.vy).toBeLessThan(0);
    expect(Math.abs(shot.vx)).toBeLessThan(1);
  });

  it("places peeking apes below the HUD in the tree band", () => {
    const band = attackPeekBand(640);
    expect(band.minY).toBeGreaterThanOrEqual(120);
    const target = spawnAttackTarget(360, 8, 10, 1, () => 0.2, 640);
    expect(target.y).toBeGreaterThanOrEqual(band.minY);
    expect(target.y + target.h).toBeLessThanOrEqual(band.maxY + target.h);
  });

  it("shows the first ape right away", () => {
    const world = createAttackWorld();
    maybeSpawnTarget(world, 360, 8, 10, 1, 0.016, () => 0.1, 640);
    expect(world.targets.length).toBeGreaterThan(0);
  });

  it("only keeps one banana in the air", () => {
    const world = createAttackWorld();
    throwAt(world, 100, 400, 80, 60, 1);
    throwAt(world, 100, 400, 140, 60, 1);
    expect(world.shots).toHaveLength(1);
  });
});
