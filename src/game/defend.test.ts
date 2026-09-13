import { describe, expect, it } from "vitest";
import {
  bananaKindForThrower,
  createDefendWorld,
  maybeSpawnThrower,
  pickDefendThrower,
  spawnDefendThrower,
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
    fallMul: 1,
    ...partial,
  };
}

describe("defend throwers", () => {
  it("lets orangutans throw rotten bananas and gorillas throw ripe ones", () => {
    expect(bananaKindForThrower("orangutan")).toBe("rotten");
    expect(bananaKindForThrower("gorilla")).toBe("banana");
    expect(bananaKindForThrower("chimpanzee")).toBe("trick");
  });

  it("keeps chimpanzees off level 1 and lets them appear later", () => {
    expect(pickDefendThrower(1, () => 0.01)).toBe("orangutan");
    expect(pickDefendThrower(3, () => 0.01)).toBe("chimpanzee");
  });

  it("throws from the ape after a short wind-up", () => {
    const world = createDefendWorld();
    world.targets = [thrower({ id: 1, kind: "orangutan", throwAt: 0.2 })];
    expect(stepThrowers(world, 0.1).throws).toHaveLength(0);
    const { throws } = stepThrowers(world, 0.2);
    expect(throws).toHaveLength(1);
    expect(throws[0]?.kind).toBe("rotten");
    expect(throws[0]?.value).toBe(4);
    expect(throws[0]?.x).toBe(140 + 28);
    expect(throws[0]?.fallMul).toBe(1);
    expect(stepThrowers(world, 0.2).throws).toHaveLength(0);
  });

  it("shows several throwers right away", () => {
    const world = createDefendWorld();
    maybeSpawnThrower(world, 360, 80, 100, 1, 0.016, () => 0.1, 640);
    expect(world.targets.length).toBeGreaterThanOrEqual(3);
    expect(world.targets[0]?.kind).toBe("orangutan");
  });

  it("lets orangutans throw numbered bunches at different speeds", () => {
    let n = 0;
    const rng = () => {
      n += 1;
      return (n * 0.19) % 1;
    };
    const throwers = Array.from({ length: 10 }, () => spawnDefendThrower(360, 80, 100, 3, rng, 640));
    const orangutans = throwers.filter((target) => target.kind === "orangutan");
    expect(orangutans.some((target) => target.value > 1)).toBe(true);
    const throwAts = throwers.map((target) => target.throwAt);
    const fallMuls = throwers.map((target) => target.fallMul);
    expect(Math.max(...throwAts) - Math.min(...throwAts)).toBeGreaterThan(0.12);
    expect(Math.max(...fallMuls) - Math.min(...fallMuls)).toBeGreaterThan(0.2);
  });
});
