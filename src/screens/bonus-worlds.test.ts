/** @vitest-environment jsdom */

import { describe, expect, it } from "vitest";
import { renderBonusWorlds } from "./bonus-worlds";

describe("bonus worlds menu", () => {
  it("lets the player start an unlocked world and keeps locked worlds shut", () => {
    const root = document.createElement("div");
    document.body.append(root);
    const played: number[] = [];
    renderBonusWorlds(root, [10], {
      back: () => {},
      play: (milestone) => {
        played.push(milestone);
      },
    }, "nb");
    expect(root.textContent).toContain("Opplåste bonusspill");
    expect(root.querySelector<HTMLButtonElement>('[data-world="10"]')?.disabled).toBe(false);
    expect(root.querySelector<HTMLButtonElement>('[data-world="20"]')?.disabled).toBe(true);
    root.querySelector<HTMLButtonElement>('[data-world="10"]')!.click();
    expect(played).toEqual([10]);
    root.remove();
  });
});
