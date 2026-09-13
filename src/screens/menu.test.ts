/** @vitest-environment jsdom */

import { describe, expect, it } from "vitest";
import { renderMenu } from "./menu";

const actions = {
  play: () => {},
  bonus: () => {},
  scores: () => {},
  settings: () => {},
  about: () => {},
  install: () => {},
};

describe("menu install hint", () => {
  it("shows a hint to Installer in a browser tab, not in standalone", () => {
    const root = document.createElement("div");
    document.body.append(root);
    renderMenu(root, actions, "nb", false);
    const hint = root.querySelector<HTMLButtonElement>("[data-install-hint]");
    expect(hint?.textContent).toContain("Installer");
    expect(hint?.textContent).toContain("hjemskjermen");

    renderMenu(root, actions, "nb", true);
    expect(root.querySelector("[data-install-hint]")).toBeNull();
    root.remove();
  });

  it("opens Installer from the hint", () => {
    const root = document.createElement("div");
    document.body.append(root);
    let opened = false;
    renderMenu(root, { ...actions, install: () => { opened = true; } }, "nb", false);
    root.querySelector<HTMLButtonElement>("[data-install-hint]")!.click();
    expect(opened).toBe(true);
    root.remove();
  });
});
