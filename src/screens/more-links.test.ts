/** @vitest-environment jsdom */

import { describe, expect, it } from "vitest";
import { renderAbout } from "./about";
import { renderInstall } from "./install";

describe("more links", () => {
  it("shows other apps and coffee on About and Install", () => {
    const root = document.createElement("div");
    document.body.append(root);
    renderAbout(root, () => {}, "nb");
    const aboutApps = root.querySelector<HTMLAnchorElement>("[data-apps]");
    const aboutCoffee = root.querySelector<HTMLScriptElement>("[data-bmc-host] script");
    expect(aboutApps?.href).toBe("https://reidarkind.github.io/myapps/");
    expect(aboutApps?.textContent).toContain("Andre apper jeg har laget");
    expect(aboutCoffee?.src).toBe("https://cdnjs.buymeacoffee.com/1.0.0/button.prod.min.js");
    expect(aboutCoffee?.dataset.slug).toBe("reidarkind");

    renderInstall(root, () => {}, "nb");
    expect(root.querySelector<HTMLAnchorElement>("[data-apps]")?.href).toBe("https://reidarkind.github.io/myapps/");
    const installCoffee = root.querySelector<HTMLScriptElement>("[data-bmc-host] script");
    expect(installCoffee?.src).toBe("https://cdnjs.buymeacoffee.com/1.0.0/button.prod.min.js");
    expect(installCoffee?.dataset.slug).toBe("reidarkind");
    root.remove();
  });
});
