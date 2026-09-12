import { describe, expect, it } from "vitest";
import { overCopy, t } from "./i18n";

describe("menu lead", () => {
  it("talks about ape tricks, not only catching bananas", () => {
    expect(t("nb", "menu.lead")).toBe("Gjør apestreker. Regn etterpå.");
  });
});

describe("overCopy", () => {
  it("keeps harvest wording for sanking", () => {
    const miss = overCopy("nb", "sank", "misses");
    expect(miss.title).toBe("Du mistet for mange bananer!");
    const rotten = overCopy("nb", "sank", "rotten");
    expect(rotten.title).toBe("Du tok for mange brune bananer!");
  });

  it("names gorillas and orangutans in attack, and yellow bananas in defense", () => {
    expect(overCopy("nb", "angrep", "misses").title).toContain("orangutanger");
    expect(overCopy("nb", "angrep", "rotten").title).toContain("gorillaer");
    expect(overCopy("nb", "forsvar", "misses").title).toContain("brune");
    expect(overCopy("nb", "forsvar", "rotten").title).toContain("gule");
  });
});
