import { describe, expect, it } from "vitest";
import { APE_BODY, APE_FUR, APE_ORANGUTAN, PAN_HELMET, apeFaceFill, bananaCurves, pointOnCubic } from "./draw";
import { GORILLA, bananaInBasketPose, basketRect } from "./entities";

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
    expect(GORILLA.basket.y).toBeGreaterThan(GORILLA.head.cy);
    const box = basketRect(100, 200);
    expect(box).toEqual({
      x: 100 + GORILLA.basket.x,
      y: 200 + GORILLA.basket.y,
      w: GORILLA.basket.w,
      h: GORILLA.basket.h,
    });
  });
});

describe("bananas in the basket", () => {
  it("places a caught banana inside the basket bowl", () => {
    const gorilla = { x: 120, y: 400 };
    const box = basketRect(gorilla.x, gorilla.y);
    const pose = bananaInBasketPose(gorilla.x, gorilla.y, 0);
    const cx = pose.x + pose.w / 2;
    const cy = pose.y + pose.h / 2;
    expect(cx).toBeGreaterThan(box.x);
    expect(cx).toBeLessThan(box.x + box.w);
    expect(cy).toBeGreaterThan(box.y);
    expect(cy).toBeLessThan(box.y + box.h + 8);
  });
});

describe("ape colors", () => {
  it("keeps gorillas dark brown and orangutans orange", () => {
    expect(APE_FUR.gorilla).toBe("#3b2416");
    expect(APE_FUR.orangutan.startsWith("#c") || APE_FUR.orangutan.startsWith("#b")).toBe(true);
    expect(APE_FUR.gorilla).not.toBe(APE_FUR.orangutan);
  });

  it("sits the head down onto the shoulders", () => {
    const headBottom = GORILLA.head.cy + GORILLA.head.r;
    const bodyTop = APE_BODY.cy - APE_BODY.ry;
    expect(headBottom - bodyTop).toBeGreaterThanOrEqual(8);
  });

  it("gives orangutans a dark muzzle face, not the gorilla peach mask", () => {
    expect(apeFaceFill("orangutan")).not.toBe(apeFaceFill("gorilla"));
    expect(apeFaceFill("gorilla")).toMatch(/^#f/i);
    expect(apeFaceFill("orangutan")).toMatch(/^#[0-6]/i);
  });

  it("gives orangutans wide cheek flanges and a long dark muzzle", () => {
    expect(APE_ORANGUTAN.flangeRx).toBeGreaterThan(APE_ORANGUTAN.faceRx * 2);
    expect(APE_ORANGUTAN.faceRy).toBeGreaterThan(APE_ORANGUTAN.faceRx);
  });

  it("sits a saucepan helmet on the catcher gorilla", () => {
    expect(PAN_HELMET.cyOffset).toBeLessThan(0);
    expect(PAN_HELMET.rimRx).toBeGreaterThan(12);
    expect(PAN_HELMET.bowlRy).toBeGreaterThan(7);
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
