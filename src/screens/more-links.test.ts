/** @vitest-environment jsdom */

import { describe, expect, it } from "vitest";
import { renderAbout } from "./about";
import { renderInstall } from "./install";

describe("more links", () => {
  it("shows other apps and a coffee-cup button on About and Install", () => {
    const root = document.createElement("div");
    document.body.append(root);
    renderAbout(root, () => {}, "nb");
    const aboutApps = root.querySelector<HTMLAnchorElement>("[data-apps]");
    const aboutCoffee = root.querySelector<HTMLAnchorElement>("[data-coffee]");
    expect(aboutApps?.href).toBe("https://reidarkind.github.io/myapps/");
    expect(aboutApps?.textContent).toContain("Andre apper jeg har laget");
    expect(aboutCoffee?.href).toBe("https://buymeacoffee.com/reidarkind");
    expect(aboutCoffee?.textContent).toContain("☕");
    expect(aboutCoffee?.textContent).toContain("Spander en kaffe");

    renderInstall(root, () => {}, "nb");
    const installCoffee = root.querySelector<HTMLAnchorElement>("[data-coffee]");
    expect(root.querySelector<HTMLAnchorElement>("[data-apps]")?.href).toBe("https://reidarkind.github.io/myapps/");
    expect(installCoffee?.href).toBe("https://buymeacoffee.com/reidarkind");
    expect(installCoffee?.textContent).toContain("☕");
    root.remove();
  });
});
