import { describe, expect, it } from "vitest";
import { emptyRide, resolveBook, skipRide, stepRide } from "./ride";

describe("bonus ride", () => {
  it("splats a banana and keeps driving", () => {
    const next = stepRide(
      emptyRide({ s: 9.6, obstacles: [{ id: 1, kind: "banana", x: 0, s: 10 }] }),
      0.2,
      0,
    );
    expect(next.phase).toBe("drive");
    expect(next.obstacles[0]?.resolved).toBe(true);
  });

  it("ends the tour on a crate", () => {
    const next = stepRide(
      emptyRide({ s: 9.6, obstacles: [{ id: 1, kind: "crate", x: 0, s: 10 }] }),
      0.2,
      0,
    );
    expect(next.phase).toBe("crash");
  });

  it("stops for a book, continues when right, ends when wrong", () => {
    const hit = stepRide(
      emptyRide({ s: 9.6, obstacles: [{ id: 1, kind: "book", x: 0, s: 10 }] }),
      0.2,
      0,
    );
    expect(hit.phase).toBe("math");
    expect(resolveBook(hit, true).phase).toBe("drive");
    expect(resolveBook(hit, false).phase).toBe("done");
  });

  it("reaches the bank and can be skipped", () => {
    const bank = stepRide(emptyRide({ s: 35.5, track: 36, speed: 7 }), 0.2, 0);
    expect(bank.phase).toBe("bank");
    expect(skipRide(bank).phase).toBe("done");
  });
});
