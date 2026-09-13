import { describe, expect, it } from "vitest";
import { localeFromNavigator } from "./locale";

describe("localeFromNavigator", () => {
  it("maps a Norwegian phone to nb", () => {
    expect(localeFromNavigator(["nb-NO", "en-US"])).toBe("nb");
    expect(localeFromNavigator(["no-NO"])).toBe("nb");
    expect(localeFromNavigator(["nn-NO"])).toBe("nb");
  });

  it("maps other supported languages from the phone list", () => {
    expect(localeFromNavigator(["sv-SE"])).toBe("sv");
    expect(localeFromNavigator(["pt-BR", "en"])).toBe("pt");
    expect(localeFromNavigator(["de"])).toBe("de");
  });

  it("falls back to English when the phone language is unknown", () => {
    expect(localeFromNavigator(["fr-FR"])).toBe("en");
    expect(localeFromNavigator([])).toBe("en");
  });
});
