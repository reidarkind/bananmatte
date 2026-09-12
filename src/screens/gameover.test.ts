/** @vitest-environment jsdom */

import { describe, expect, it } from "vitest";
import { renderGameOver } from "./gameover";

describe("game over name", () => {
  it("lets the player type a full name on the keyboard", () => {
    const root = document.createElement("div");
    document.body.append(root);
    let submitted = "";
    renderGameOver(
      root,
      { title: "Slutt", detail: "Bra jobba", score: 40, level: 3, askName: true },
      {
        submit: (name) => {
          submitted = name;
        },
        again: () => {},
        menu: () => {},
      },
    );
    const input = root.querySelector<HTMLInputElement>("[data-name]");
    expect(input).not.toBeNull();
    expect(input?.maxLength).toBe(20);
    expect(root.querySelector(".arcade")).toBeNull();
    input!.value = "Emma Sofie";
    root.querySelector<HTMLButtonElement>("[data-again]")!.click();
    expect(submitted).toBe("Emma Sofie");
    root.remove();
  });
});
