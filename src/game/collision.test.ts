import { describe, expect, it } from "vitest";
import { intersects } from "./collision";

describe("intersects", () => {
  it("detects overlapping baskets and bananas", () => {
    expect(intersects({ x: 10, y: 10, w: 20, h: 10 }, { x: 25, y: 12, w: 8, h: 8 })).toBe(true);
  });

  it("rejects separated rectangles", () => {
    expect(intersects({ x: 0, y: 0, w: 10, h: 10 }, { x: 11, y: 0, w: 10, h: 10 })).toBe(false);
  });
});
