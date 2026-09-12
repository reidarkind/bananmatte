import { describe, expect, it } from "vitest";
import {
  ATTACK_MAX_SHOTS,
  attackPeekBand,
  aimShot,
  createAttackWorld,
  maybeSpawnTarget,
  spawnAttackTarget,
  stepShots,
  throwAt,
  type AttackTarget,
} from "./attack";

function ape(partial: Partial<AttackTarget> & Pick<AttackTarget, "id" | "kind" | "y">): AttackTarget {
  return {
    value: partial.kind === "gorilla" ? 1 : 4,
    x: 140,
    w: 52,
    h: 64,
    age: 0,
    life: 8,
    ...partial,
  };
}

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

  it("lets you throw another banana before the first hits", () => {
    const world = createAttackWorld();
    throwAt(world, 100, 400, 80, 60, 1);
    throwAt(world, 100, 400, 140, 60, 1);
    expect(world.shots).toHaveLength(2);
  });

  it("stops adding bananas after a few are already flying", () => {
    const world = createAttackWorld();
    for (let i = 0; i < ATTACK_MAX_SHOTS + 2; i += 1) {
      throwAt(world, 100, 400, 80 + i * 10, 60, 1);
    }
    expect(world.shots).toHaveLength(ATTACK_MAX_SHOTS);
  });

  it("can hit two apes with bananas in the air at once", () => {
    const world = createAttackWorld();
    const left = ape({ id: 1, kind: "orangutan", x: 70, y: 140 });
    const right = ape({ id: 2, kind: "orangutan", x: 220, y: 150 });
    world.targets = [left, right];
    throwAt(world, 166, 520, left.x + left.w / 2, left.y + left.h * 0.7, 1);
    throwAt(world, 166, 520, right.x + right.w / 2, right.y + right.h * 0.7, 1);
    expect(world.shots).toHaveLength(2);

    const hitIds: number[] = [];
    while (world.shots.length > 0) {
      const { hits } = stepShots(world, 0.016, 360, 640);
      hitIds.push(...hits.map((hit) => hit.target.id));
    }
    expect(hitIds.sort()).toEqual([1, 2]);
  });

  it("flies past a lower gorilla when the tap was on a higher orangutan", () => {
    const world = createAttackWorld();
    const orangutan = ape({ id: 1, kind: "orangutan", y: 140 });
    const gorilla = ape({ id: 2, kind: "gorilla", y: 154 });
    world.targets = [orangutan, gorilla];
    throwAt(world, 166, 520, 166, orangutan.y + orangutan.h * 0.7, 1);

    const hitKinds: string[] = [];
    while (world.shots.length > 0) {
      const shot = world.shots[0];
      if (!shot) break;
      const overGorilla =
        shot.y + shot.h > gorilla.y + gorilla.h * 0.45 && shot.y < gorilla.y + gorilla.h;
      const { hits } = stepShots(world, 0.016, 360, 640);
      hitKinds.push(...hits.map((hit) => hit.target.kind));
      if (overGorilla && world.shots.length > 0) {
        expect(world.targets.map((target) => target.kind)).toContain("orangutan");
        expect(hits.map((hit) => hit.target.kind)).not.toContain("orangutan");
      }
    }

    expect(hitKinds).toEqual(["orangutan"]);
    expect(world.targets.map((target) => target.kind)).toEqual(["gorilla"]);
  });

  it("still hits a gorilla you tap even if an orangutan sits above it", () => {
    const world = createAttackWorld();
    const orangutan = ape({ id: 1, kind: "orangutan", y: 140 });
    const gorilla = ape({ id: 2, kind: "gorilla", y: 154 });
    world.targets = [orangutan, gorilla];
    throwAt(world, 166, 520, 166, gorilla.y + gorilla.h * 0.7, 1);
    const hitKinds: string[] = [];
    while (world.shots.length > 0) {
      const { hits } = stepShots(world, 0.016, 360, 640);
      hitKinds.push(...hits.map((hit) => hit.target.kind));
    }
    expect(hitKinds).toEqual(["gorilla"]);
    expect(world.targets.map((target) => target.kind)).toEqual(["orangutan"]);
  });

  it("does not hit an orangutan that pops into the shot path after the throw", () => {
    const world = createAttackWorld();
    const aimed = ape({ id: 1, kind: "orangutan", y: 130 });
    world.targets = [aimed];
    throwAt(world, 166, 520, 200, 118, 1);
    world.targets.push(ape({ id: 3, kind: "orangutan", y: 220 }));

    const hitIds: number[] = [];
    while (world.shots.length > 0) {
      const { hits } = stepShots(world, 0.016, 360, 640);
      hitIds.push(...hits.map((hit) => hit.target.id));
    }

    expect(hitIds).toEqual([1]);
    expect(world.targets.map((target) => target.id)).toEqual([3]);
  });
});
