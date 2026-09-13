/** @vitest-environment jsdom */

import { describe, expect, it } from "vitest";
import type { RoundPlan } from "../types";
import { renderMath } from "./math";

describe("math overlay", () => {
  it("asks for a comparison sign", () => {
    const root = document.createElement("div");
    document.body.append(root);
    let given = "";
    const plan: RoundPlan = {
      mode: "ulikhet-tegn",
      catchTarget: 4,
      prompt: "Hvilket tegn passer?",
      expression: "4 □ 2",
      kind: "compare",
      answer: "gt",
      explanation: "4 er større enn 2",
      operand: 2,
    };
    renderMath(root, plan, (value) => {
      given = String(value);
    });
    expect(root.textContent).toContain(">");
    expect(root.querySelector(".math-expr")?.textContent).toBe("4 □ 2");
    expect(root.querySelector(".btn.primary")).toBeNull();
    root.querySelector<HTMLButtonElement>('[data-c="gt"]')!.click();
    expect(given).toBe("gt");
    root.remove();
  });

  it("sends the raw number buffer so a bonus cheat can be read", () => {
    const root = document.createElement("div");
    document.body.append(root);
    let raw = "";
    const plan: RoundPlan = {
      mode: "addisjon",
      catchTarget: 2,
      prompt: "Hva er",
      expression: "1 + 1",
      kind: "number",
      answer: 2,
      explanation: "1 + 1 = 2",
    };
    renderMath(root, plan, (_value, typed) => {
      raw = typed ?? "";
    });
    for (const digit of "1337210") {
      root.querySelector<HTMLButtonElement>(`[data-k="${digit}"]`)!.click();
    }
    root.querySelector<HTMLButtonElement>("[data-ok]")!.click();
    expect(raw).toBe("1337210");
    root.remove();
  });

  it("accepts a bonus cheat typed on the keyboard", () => {
    const root = document.createElement("div");
    document.body.append(root);
    let raw = "";
    const plan: RoundPlan = {
      mode: "tiervenn",
      catchTarget: 7,
      prompt: "Hva er tiervennen til",
      expression: "7",
      kind: "number",
      answer: 3,
      explanation: "7 + 3 = 10",
    };
    renderMath(root, plan, (_value, typed) => {
      raw = typed ?? "";
    });
    for (const key of "1337310") {
      window.dispatchEvent(new KeyboardEvent("keydown", { key }));
    }
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    expect(raw).toBe("1337310");
    root.remove();
  });
});
