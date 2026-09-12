import type { Parity, RoundPlan } from "../types";
import { html, onClick } from "./dom";

export function renderMath(
  root: HTMLElement,
  plan: RoundPlan,
  onAnswer: (value: number | Parity) => void,
): void {
  if (plan.kind === "parity") {
    root.replaceChildren(html`
      <section class="overlay">
        <p class="mode-pill">${plan.catchTarget} bananer</p>
        <h2>${plan.prompt}</h2>
        <div class="stack">
          <button class="btn primary" data-p="partall">Partall</button>
          <button class="btn" data-p="oddetall">Oddetall</button>
        </div>
      </section>
    `);
    onClick(root, "[data-p]", (button) => onAnswer(button.dataset.p as Parity));
    return;
  }

  let buffer = "";
  const paint = () => {
    root.replaceChildren(html`
      <section class="overlay">
        <p class="mode-pill">${plan.catchTarget} bananer</p>
        <h2>${plan.prompt}</h2>
        <div class="answer">${buffer || "?"}</div>
        <div class="numpad">
          ${["1","2","3","4","5","6","7","8","9","−","0","slett"].map((key) => `<button class="key" data-k="${key}">${key}</button>`).join("")}
          <button class="btn primary wide" data-ok>OK</button>
        </div>
      </section>
    `);
    onClick(root, "[data-k]", (button) => {
      const key = button.dataset.k ?? "";
      if (key === "slett") buffer = buffer.slice(0, -1);
      else if (key === "−") buffer = buffer.startsWith("-") ? buffer.slice(1) : `-${buffer.replace("-", "")}`;
      else buffer += key;
      paint();
    });
    onClick(root, "[data-ok]", () => {
      if (!buffer || buffer === "-") return;
      onAnswer(Number(buffer));
    });
  };
  paint();
}
