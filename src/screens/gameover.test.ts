/** @vitest-environment jsdom */

import { describe, expect, it } from "vitest";
import { renderGameOver } from "./gameover";

describe("game over name", () => {
  it("lets the player type a full name on the keyboard", () => {
    const root = document.createElement("div");
    document.body.append(root);
    let submitted = "";
    let afterSave = false;
    let again = false;
    renderGameOver(
      root,
      { title: "Slutt", detail: "Bra jobba", score: 40, level: 3, askName: true },
      {
        submit: (name) => {
          submitted = name;
        },
        afterSave: () => {
          afterSave = true;
        },
        again: () => {
          again = true;
        },
        menu: () => {},
      },
    );
    const input = root.querySelector<HTMLInputElement>("[data-name]");
    const save = root.querySelector<HTMLButtonElement>("[data-save]");
    expect(input).not.toBeNull();
    expect(input?.maxLength).toBe(20);
    expect(save?.textContent).toBe("Lagre");
    expect(root.querySelector("[data-again]")).toBeNull();
    input!.value = "Emma Sofie";
    save!.click();
    expect(submitted).toBe("Emma Sofie");
    expect(afterSave).toBe(true);
    expect(again).toBe(false);
    root.remove();
  });

  it("uses English save label when locale is en", () => {
    const root = document.createElement("div");
    document.body.append(root);
    renderGameOver(
      root,
      { title: "Over", detail: "Nice", score: 10, level: 1, askName: true, locale: "en" },
      { submit: () => {}, afterSave: () => {}, again: () => {}, menu: () => {} },
    );
    expect(root.querySelector("[data-save]")?.textContent).toBe("Save");
    expect(root.textContent).toContain("Score 10");
    root.remove();
  });
});
