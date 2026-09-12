import { describe, expect, it } from "vitest";
import { bananaCurves, pointOnCubic } from "./draw";
import { GORILLA, basketRect } from "./entities";

function distToChord(
  point: { x: number; y: number },
  a: { x: number; y: number },
  b: { x: number; y: number },
): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const length = Math.hypot(dx, dy) || 1;
  return (dx * (a.y - point.y) - dy * (a.x - point.x)) / length;
}

describe("gorilla layout", () => {
  it("holds the basket at the chest, like the start-screen ape", () => {
    expect(GORILLA.basket.y).toBeGreaterThan(GORILLA.head.cy + 12);
    const box = basketRect(100, 200);
    expect(box).toEqual({
      x: 100 + GORILLA.basket.x,
      y: 200 + GORILLA.basket.y,
      w: GORILLA.basket.w,
      h: GORILLA.basket.h,
    });
  });
});

describe("banana silhouette", () => {
  it("is a long crescent, not a round blob", () => {
    const curve = bananaCurves();
    const length = Math.hypot(curve.tip.x - curve.stem.x, curve.tip.y - curve.stem.y);
    expect(length).toBeGreaterThan(28);

    const outer = pointOnCubic(curve.stem, curve.outer[0], curve.outer[1], curve.tip, 0.5);
    const inner = pointOnCubic(curve.tip, curve.inner[0], curve.inner[1], curve.stem, 0.5);
    const outerBend = Math.abs(distToChord(outer, curve.stem, curve.tip));
    const innerBend = Math.abs(distToChord(inner, curve.stem, curve.tip));
    expect(outerBend).toBeGreaterThan(10);
    expect(outerBend).toBeGreaterThan(innerBend + 4);
  });
});
