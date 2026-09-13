import { describe, expect, it } from "vitest";
import { planTrickReveal, trickBananaPhase, trickLooksRotten } from "./trick";

function trickItem(y: number, trickAt: number, vy = 180) {
  return { kind: "trick" as const, y, trickAt, vy };
}

describe("trick banana look", () => {
  it("stays ripe, then blinks, then stays rotten", () => {
    expect(trickBananaPhase(trickItem(80, 300))).toBe("ripe");
    expect(trickBananaPhase(trickItem(220, 300, 180))).toBe("blink");
    expect(trickBananaPhase(trickItem(300, 300))).toBe("rotten");
    expect(trickBananaPhase(trickItem(400, 300))).toBe("rotten");
  });

  it("flips ripe and rotten while blinking", () => {
    const item = trickItem(220, 300, 180);
    expect(trickBananaPhase(item)).toBe("blink");
    expect(trickLooksRotten(item, 0)).not.toBe(trickLooksRotten(item, 90));
    expect(trickLooksRotten(trickItem(400, 300), 0)).toBe(true);
    expect(trickLooksRotten(trickItem(80, 300), 90)).toBe(false);
  });

  it("reveals mid-fall so the blink can be seen before the gorilla", () => {
    const startY = 160;
    const height = 640;
    const at = planTrickReveal(startY, height);
    expect(at).toBeGreaterThan(startY + 80);
    expect(at).toBeLessThan(height * 0.8);
  });
});
