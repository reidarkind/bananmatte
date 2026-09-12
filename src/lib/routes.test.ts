import { describe, expect, it } from "vitest";
import { installUrl, isInstallRoute } from "./routes";

describe("installUrl", () => {
  it("joins origin, base and install without double slashes", () => {
    expect(installUrl("https://ada.github.io", "/bananmatte/")).toBe(
      "https://ada.github.io/bananmatte/install",
    );
  });

  it("adds a trailing slash to base when missing", () => {
    expect(installUrl("https://ada.github.io", "/bananmatte")).toBe(
      "https://ada.github.io/bananmatte/install",
    );
  });
});

describe("isInstallRoute", () => {
  it("matches /install and #/install", () => {
    expect(isInstallRoute("/bananmatte/install", "")).toBe(true);
    expect(isInstallRoute("/bananmatte/install/", "")).toBe(true);
    expect(isInstallRoute("/install", "")).toBe(true);
    expect(isInstallRoute("/bananmatte/", "#/install")).toBe(true);
  });

  it("rejects the home path", () => {
    expect(isInstallRoute("/bananmatte/", "")).toBe(false);
    expect(isInstallRoute("/", "")).toBe(false);
  });
});
