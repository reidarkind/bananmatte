import { describe, expect, it } from "vitest";
import {
  bananaKindForThrower,
  createDefendWorld,
  maybeSpawnThrower,
  stepThrowers,
  type DefendThrower,
} from "./defend";

function thrower(partial: Partial<DefendThrower> & Pick<DefendThrower, "id" | "kind">): DefendThrower {
  return {
    value: 4,
    x: 140,
    y: 140,
    w: 56,
    h: 64,
    age: 0,
    life: 4,
    throwAt: 0.4,
    thrown: false,
    ...partial,
  };
}

describe("defend throwers", () => {
  it("lets orangutans throw rotten bananas and gorillas throw ripe ones", () => {
    expect(bananaKindForThrower("orangutan")).toBe("rotten");
    expect(bananaKindForThrower("gorilla")).toBe("banana");
  });

  it("throws from the ape after a short wind-up", () => {
    const world = createDefendWorld();
    world.targets = [thrower({ id: 1, kind: "orangutan", throwAt: 0.2 })];
    expect(stepThrowers(world, 0.1).throws).toHaveLength(0);
    const { throws } = stepThrowers(world, 0.2);
    expect(throws).toHaveLength(1);
    expect(throws[0]?.kind).toBe("rotten");
    expect(throws[0]?.x).toBe(140 + 28);
    expect(stepThrowers(world, 0.2).throws).toHaveLength(0);
  });

  it("shows the first thrower right away", () => {
    const world = createDefendWorld();
    maybeSpawnThrower(world, 360, 8, 10, 1, 0.016, () => 0.1, 640);
    expect(world.targets.length).toBeGreaterThan(0);
    expect(world.targets[0]?.kind).toBe("orangutan");
  });
});
