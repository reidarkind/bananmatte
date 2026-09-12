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
      prompt: "Hvilket tegn passer? 4 □ 2",
      kind: "compare",
      answer: "gt",
      explanation: "4 er større enn 2",
      operand: 2,
    };
    renderMath(root, plan, (value) => {
      given = String(value);
    });
    expect(root.textContent).toContain(">");
    root.querySelector<HTMLButtonElement>('[data-c="gt"]')!.click();
    expect(given).toBe("gt");
    root.remove();
  });
});
