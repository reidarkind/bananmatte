/** @vitest-environment jsdom */

import { describe, expect, it } from "vitest";
import { renderLanguage } from "./language";

describe("first-run language", () => {
  it("preselects the phone locale and saves the tapped language", () => {
    const root = document.createElement("div");
    document.body.append(root);
    let chosen = "";
    renderLanguage(root, "sv", (locale) => {
      chosen = locale;
    });
    expect(root.querySelector("h1")?.textContent).toBe("Välj språk");
    expect(root.querySelector<HTMLButtonElement>('[data-lang="sv"]')?.classList.contains("primary")).toBe(true);
    root.querySelector<HTMLButtonElement>('[data-lang="en"]')!.click();
    expect(root.querySelector("h1")?.textContent).toBe("Choose language");
    root.querySelector<HTMLButtonElement>("[data-ok]")!.click();
    expect(chosen).toBe("en");
    root.remove();
  });
});
