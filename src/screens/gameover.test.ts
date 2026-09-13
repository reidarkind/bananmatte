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
        cancel: () => {},
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

  it("lets the player cancel the name prompt without saving", () => {
    const root = document.createElement("div");
    document.body.append(root);
    let submitted = false;
    let afterSave = false;
    let cancelled = false;
    renderGameOver(
      root,
      { title: "Slutt", detail: "Bra jobba", score: 40, level: 3, askName: true },
      {
        submit: () => {
          submitted = true;
        },
        afterSave: () => {
          afterSave = true;
        },
        cancel: () => {
          cancelled = true;
        },
        again: () => {},
        menu: () => {},
      },
    );
    const cancel = root.querySelector<HTMLButtonElement>("[data-cancel]");
    expect(cancel?.textContent).toBe("Avbryt");
    cancel!.click();
    expect(submitted).toBe(false);
    expect(afterSave).toBe(false);
    expect(cancelled).toBe(true);
    root.remove();
  });

  it("asks before saving a blank name as Anonym", () => {
    const root = document.createElement("div");
    document.body.append(root);
    let submitted = "";
    let afterSave = false;
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
        cancel: () => {},
        again: () => {},
        menu: () => {},
      },
    );
    root.querySelector<HTMLButtonElement>("[data-save]")!.click();
    expect(submitted).toBe("");
    expect(afterSave).toBe(false);
    expect(root.textContent).toContain("Anonym");
    root.querySelector<HTMLButtonElement>("[data-anon-back]")!.click();
    expect(root.querySelector("[data-name]")).not.toBeNull();
    root.querySelector<HTMLButtonElement>("[data-save]")!.click();
    root.querySelector<HTMLButtonElement>("[data-anon-yes]")!.click();
    expect(afterSave).toBe(true);
    root.remove();
  });

  it("shows the answer key before the name field", () => {
    const root = document.createElement("div");
    document.body.append(root);
    renderGameOver(
      root,
      { title: "Feil svar", detail: "3 + 2 = 5", score: 10, level: 2, askName: true, ackFasit: true },
      { submit: () => {}, afterSave: () => {}, cancel: () => {}, again: () => {}, menu: () => {} },
    );
    expect(root.querySelector("[data-name]")).toBeNull();
    expect(root.querySelector(".fasit")?.textContent).toContain("3 + 2 = 5");
    root.querySelector<HTMLButtonElement>("[data-gotit]")!.click();
    expect(root.querySelector("[data-name]")).not.toBeNull();
    root.remove();
  });

  it("uses English save label when locale is en", () => {
    const root = document.createElement("div");
    document.body.append(root);
    renderGameOver(
      root,
      { title: "Over", detail: "Nice", score: 10, level: 1, askName: true, locale: "en" },
      { submit: () => {}, afterSave: () => {}, cancel: () => {}, again: () => {}, menu: () => {} },
    );
    expect(root.querySelector("[data-save]")?.textContent).toBe("Save");
    expect(root.textContent).toContain("Score 10");
    root.remove();
  });
});
