import { describe, expect, it } from "vitest";
import { overCopy, t } from "./i18n";

describe("extra languages", () => {
  it("has Spanish play label", () => {
    expect(t("es", "menu.play")).toBe("Jugar");
    expect(t("de", "over.gotIt")).toBe("Verstanden");
    expect(t("sv", "settings.language")).toBe("Språk");
    expect(t("fr", "menu.play")).toBe("Jouer");
  });
});

describe("bonus how-to", () => {
  it("explains the bonus ride in short Bokmål sentences", () => {
    expect(t("nb", "bonus.headline")).toBe("BONUSSPILL!");
    expect(t("nb", "bonus.how")).toBe("Kjør fram til banken. Styr med fingeren.");
    expect(t("nb", "bonus.rule.banana")).toBe("Treffer du en banan, svinger du rundt. Det går fint.");
    expect(t("nb", "bonus.rule.crate")).toBe("Treffer du en banankasse, kræsjer du. Da er bonusturen over.");
    expect(t("nb", "bonus.rule.book")).toBe("Treffer du en mattebok, må du regne. Riktig svar, så kjører du videre.");
    expect(t("nb", "bonus.worlds.title")).toBe("Opplåste bonusspill");
    expect(t("nb", "bonus.journey.title")).toBe("Du klarte hele reisen!");
  });
});

describe("settings update copy", () => {
  it("explains update check in short Bokmål", () => {
    expect(t("nb", "settings.update")).toBe("Sjekk for oppdateringer");
    expect(t("nb", "settings.update.current")).toBe("Du har nyeste versjon.");
    expect(t("nb", "settings.update.available")).toBe("Ny versjon. Trykk for å laste inn.");
    expect(t("nb", "settings.update.apply")).toBe("Last inn ny versjon");
    expect(t("nb", "settings.update.offline")).toBe("Ingen nett. Prøv senere.");
  });
});

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
