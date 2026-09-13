import { describe, expect, it } from "vitest";
import { createRng } from "../math/rng";
import { ATTACK_THROWER_KIND, apeCountForValue, defendMaxThrowers, defendSpawnInterval, gangOffsets, gorillaWearsHelmet, peekPop, peekTime, resolvePlayStyle, shouldShowApeValue } from "./play-style";

describe("resolvePlayStyle", () => {
  it("keeps a fixed style", () => {
    expect(resolvePlayStyle("angrep", () => 0.9)).toBe("angrep");
    expect(resolvePlayStyle("forsvar", () => 0.1)).toBe("forsvar");
  });

  it("changes mix style between levels", () => {
    const rng = createRng(11);
    const first = resolvePlayStyle("mix", rng);
    const second = resolvePlayStyle("mix", rng, first);
    expect(second).not.toBe(first);
  });
});

describe("level helpers", () => {
  it("shortens peek time on later levels", () => {
    expect(peekTime(1)).toBeGreaterThanOrEqual(4);
    expect(peekTime(6)).toBeLessThan(peekTime(1));
  });

  it("lets a gorilla throw in banana attack", () => {
    expect(ATTACK_THROWER_KIND).toBe("gorilla");
  });

  it("grows orangutan gangs with banana value", () => {
    expect(apeCountForValue(1)).toBe(1);
    expect(apeCountForValue(5)).toBe(2);
    expect(apeCountForValue(10)).toBe(3);
  });

  it("shows the gang number and fans the apes out", () => {
    expect(shouldShowApeValue("orangutan", 5)).toBe(true);
    expect(shouldShowApeValue("orangutan", 4)).toBe(true);
    expect(shouldShowApeValue("orangutan", 1)).toBe(false);
    expect(shouldShowApeValue("gorilla", 8)).toBe(false);
    const huddle = gangOffsets(3);
    expect(huddle).toHaveLength(3);
    expect(huddle[2]!.y).toBeGreaterThan(huddle[0]!.y);
    expect(Math.abs(huddle[0]!.x - huddle[1]!.x)).toBeGreaterThan(60);
    expect(huddle[0]!.facing).not.toBe(huddle[1]!.facing);
  });

  it("packs several defense throwers on screen at once", () => {
    expect(defendMaxThrowers(1)).toBeGreaterThanOrEqual(3);
    expect(defendMaxThrowers(5)).toBeGreaterThan(defendMaxThrowers(1));
    expect(defendSpawnInterval(1)).toBeLessThan(0.45);
  });

  it("puts the saucepan helmet only on the defense gorilla", () => {
    expect(gorillaWearsHelmet("forsvar")).toBe(true);
    expect(gorillaWearsHelmet("sank")).toBe(false);
    expect(gorillaWearsHelmet("angrep")).toBe(false);
  });

  it("lets peeking apes rise in and sink away", () => {
    expect(peekPop(0, 4)).toBe(0);
    expect(peekPop(0.4, 4)).toBeCloseTo(1);
    expect(peekPop(2, 4)).toBeCloseTo(1);
    expect(peekPop(4, 4)).toBe(0);
    expect(peekPop(0.18, 4)).toBeGreaterThan(0.2);
    expect(peekPop(0.18, 4)).toBeLessThan(0.9);
  });
});
