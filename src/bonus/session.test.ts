/** @vitest-environment jsdom */

import { afterEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_SETTINGS } from "../types";

vi.mock("./ride", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./ride")>();
  return {
    ...actual,
    createRide: () => actual.emptyRide({
      phase: "drive",
      s: 8.9,
      obstacles: [{ id: 1, kind: "book", x: 0, s: 10 }],
    }),
  };
});

import { playBonusRide } from "./session";

function stubCanvas(): void {
  const gradient = { addColorStop: () => {} };
  const fake2d = new Proxy({}, {
    get(_target, prop) {
      if (prop === "createLinearGradient" || prop === "createRadialGradient") return () => gradient;
      if (prop === "measureText") return () => ({ width: 12 });
      return () => gradient;
    },
    set() {
      return true;
    },
  }) as CanvasRenderingContext2D;
  HTMLCanvasElement.prototype.getContext = ((id: string) => (
    id === "2d" ? fake2d : null
  )) as typeof HTMLCanvasElement.prototype.getContext;
  Object.defineProperty(HTMLCanvasElement.prototype, "clientWidth", { configurable: true, get: () => 400 });
  Object.defineProperty(HTMLCanvasElement.prototype, "clientHeight", { configurable: true, get: () => 700 });
}

describe("bonus math overlay", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.replaceChildren();
  });

  it("opens the math overlay when the vehicle hits a book", () => {
    stubCanvas();
    const frames: FrameRequestCallback[] = [];
    let now = 0;
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      frames.push(cb);
      return frames.length;
    });
    vi.stubGlobal("cancelAnimationFrame", () => {});
    vi.spyOn(performance, "now").mockImplementation(() => now);

    const host = document.createElement("div");
    document.body.append(host);
    const stop = playBonusRide(host, {
      milestone: 10,
      locale: "nb",
      settings: { ...DEFAULT_SETTINGS, selectedModes: [...DEFAULT_SETTINGS.selectedModes] },
      rng: () => 0.5,
      onDone: () => {},
    });

    now += 50;
    const tick = frames.shift();
    tick?.(now);

    const overlay = host.querySelector(".bonus-math .overlay");
    expect(overlay).not.toBeNull();
    expect(overlay?.textContent).toMatch(/Hva er|Partall|Hvilket/);
    stop();
  });
});
