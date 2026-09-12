import { describe, expect, it } from "vitest";
import { createRng } from "../math/rng";
import { ATTACK_THROWER_KIND, apeCountForValue, peekTime, resolvePlayStyle } from "./play-style";

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
});
