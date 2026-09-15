import { describe, expect, it } from "vitest";
import { countdownMark, createRide, depositShown, emptyRide, laneFromPointer, laneToPixel, resolveBook, rideSpeed, skipRide, startRide, stepRide } from "./ride";

describe("bonus ride", () => {
  it("splats a banana, keeps driving, and starts a spin", () => {
    const next = stepRide(
      emptyRide({ s: 8.9, obstacles: [{ id: 1, kind: "banana", x: 0.2, s: 10 }] }),
      0.2,
      0,
    );
    expect(next.phase).toBe("drive");
    expect(next.obstacles[0]?.resolved).toBe(true);
    expect(Math.abs(next.spinLeft)).toBeGreaterThan(5);
  });

  it("waits on the how-to until Start, then counts 3-2-1", () => {
    const parked = createRide(() => 0.4);
    expect(parked.phase).toBe("intro");
    expect(stepRide(parked, 0.4, 1).s).toBe(0);
    const start = startRide(parked);
    expect(start.phase).toBe("countdown");
    expect(countdownMark(start.hold)).toBe(3);
    const still = stepRide(start, 0.4, 1);
    expect(still.s).toBe(0);
    let ride = start;
    for (let i = 0; i < 24; i += 1) ride = stepRide(ride, 0.2, 0);
    expect(ride.phase).toBe("drive");
    expect(ride.s).toBeGreaterThan(0);
  });

  it("ends the tour on a crate", () => {
    const next = stepRide(
      emptyRide({ s: 8.9, obstacles: [{ id: 1, kind: "crate", x: 0, s: 10 }] }),
      0.2,
      0,
    );
    expect(next.phase).toBe("crash");
  });

  it("stops for a book, continues when right, ends when wrong", () => {
    const hit = stepRide(
      emptyRide({ s: 8.9, obstacles: [{ id: 1, kind: "book", x: 0, s: 10 }] }),
      0.2,
      0,
    );
    expect(hit.phase).toBe("math");
    expect(resolveBook(hit, true).phase).toBe("drive");
    expect(resolveBook(hit, false).phase).toBe("done");
  });

  it("pauses for a math book while it is still in front of the vehicle", () => {
    const hit = stepRide(
      emptyRide({ s: 8.9, obstacles: [{ id: 1, kind: "book", x: 0, s: 10 }] }),
      0.2,
      0,
    );
    expect(hit.s).toBeLessThan(10);
    expect(hit.phase).toBe("math");
  });

  it("counts a math book that overlaps the vehicle in the same lane", () => {
    const hit = stepRide(
      emptyRide({ s: 8.9, obstacles: [{ id: 1, kind: "book", x: 0.48, s: 10 }] }),
      0.2,
      0,
    );
    expect(hit.phase).toBe("math");
  });

  it("lets a math book in the far lane go by", () => {
    const next = stepRide(
      emptyRide({ s: 8.9, obstacles: [{ id: 1, kind: "book", x: 0.9, s: 10 }] }),
      0.2,
      0,
    );
    expect(next.phase).toBe("drive");
  });

  it("does not start math after the book has already gone past", () => {
    const next = stepRide(
      emptyRide({ s: 10.4, obstacles: [{ id: 1, kind: "book", x: 0, s: 10 }] }),
      0.2,
      0,
    );
    expect(next.phase).toBe("drive");
  });

  it("maps a finger on a lane to the same world x the vehicle uses", () => {
    expect(laneToPixel(0, 400)).toBe(200);
    expect(laneFromPointer(200, 400)).toBe(0);
    expect(laneFromPointer(laneToPixel(0.5, 400), 400)).toBeCloseTo(0.5);
  });

  it("starts slower than it finishes", () => {
    const track = createRide(() => 0.5).track;
    expect(rideSpeed(0, track)).toBeLessThan(rideSpeed(track * 0.7, track));
    expect(rideSpeed(0, track)).toBeLessThan(3.2);
  });

  it("drives at least one minute before the bank", () => {
    const track = createRide(() => 0.5).track;
    let ride = emptyRide({ phase: "drive", s: 0, track, obstacles: [] });
    let seconds = 0;
    while (ride.phase === "drive" && seconds < 180) {
      ride = stepRide(ride, 0.05, 0);
      seconds += 0.05;
    }
    expect(ride.phase).toBe("bank");
    expect(seconds).toBeGreaterThanOrEqual(60);
  });

  it("keeps a long clear stretch before the bank", () => {
    const ride = createRide(() => 0.5);
    const last = Math.max(...ride.obstacles.map((obs) => obs.s));
    expect(ride.track - last).toBeGreaterThan(14);
  });

  it("reaches the bank and can be skipped", () => {
    const bank = stepRide(emptyRide({ s: 35.5, track: 36, speed: 7 }), 0.2, 0);
    expect(bank.phase).toBe("bank");
    expect(skipRide(bank).phase).toBe("done");
  });

  it("fills theatre points into the bank before the ride ends", () => {
    expect(depositShown(0, 50)).toBe(0);
    expect(depositShown(1.2, 50)).toBeGreaterThan(10);
    expect(depositShown(1.2, 50)).toBeLessThan(50);
    expect(depositShown(2.3, 50)).toBe(50);
    const bank = stepRide(emptyRide({ s: 35.5, track: 36 }), 0.2, 0);
    expect(stepRide(bank, 1.6, 0).phase).toBe("bank");
    expect(stepRide(bank, 3, 0).phase).toBe("done");
  });
});
