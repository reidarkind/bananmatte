import { describe, expect, it } from "vitest";
import { isStandaloneDisplay } from "./display";

describe("isStandaloneDisplay", () => {
  it("is true for display-mode standalone or iOS home-screen standalone", () => {
    expect(isStandaloneDisplay({ matchMedia: () => ({ matches: true }) })).toBe(true);
    expect(isStandaloneDisplay({ matchMedia: () => ({ matches: false }), standalone: true })).toBe(true);
  });

  it("is false in a normal browser tab", () => {
    expect(isStandaloneDisplay({ matchMedia: () => ({ matches: false }), standalone: false })).toBe(false);
    expect(isStandaloneDisplay({})).toBe(false);
  });
});
