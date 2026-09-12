import { describe, expect, it } from "vitest";
import { playTone, sfx } from "./audio";

describe("playTone", () => {
  it("does not throw without a browser AudioContext", () => {
    expect(() => playTone(true, 440)).not.toThrow();
    expect(() => sfx.catch(true)).not.toThrow();
    expect(() => playTone(false, 440)).not.toThrow();
  });
});
