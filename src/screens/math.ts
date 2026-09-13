import { t } from "../i18n";
import type { CompareAnswer, Locale, Parity, RoundPlan } from "../types";
import { html, onClick } from "./dom";

function mathPrompt(plan: RoundPlan): string {
  return `
    <h2 class="math-q">${plan.prompt}</h2>
    ${plan.expression ? `<p class="math-expr">${plan.expression}</p>` : ""}
  `;
}

export function renderMath(
  root: HTMLElement,
  plan: RoundPlan,
  onAnswer: (value: number | Parity | CompareAnswer, raw?: string) => void,
  locale: Locale = "nb",
  options?: { hideCatch?: boolean },
): void {
  const pill = options?.hideCatch ? "" : `<p class="mode-pill">${t(locale, "math.bananas", { n: plan.catchTarget })}</p>`;
  if (plan.kind === "parity") {
    root.replaceChildren(html`
      <section class="overlay">
        ${pill}
        ${mathPrompt(plan)}
        <div class="stack">
          <button class="btn" data-p="partall">${t(locale, "math.even")}</button>
          <button class="btn" data-p="oddetall">${t(locale, "math.odd")}</button>
        </div>
      </section>
    `);
    onClick(root, "[data-p]", (button) => onAnswer(button.dataset.p as Parity));
    return;
  }

  if (plan.kind === "compare") {
    const words = plan.mode === "ulikhet-ord";
    root.replaceChildren(html`
      <section class="overlay">
        ${pill}
        ${mathPrompt(plan)}
        <div class="stack">
          <button class="btn" data-c="gt">${t(locale, words ? "math.gtWord" : "math.gt")}</button>
          <button class="btn" data-c="lt">${t(locale, words ? "math.ltWord" : "math.lt")}</button>
          <button class="btn" data-c="eq">${t(locale, words ? "math.eqWord" : "math.eq")}</button>
        </div>
      </section>
    `);
    onClick(root, "[data-c]", (button) => onAnswer(button.dataset.c as CompareAnswer));
    return;
  }

  let buffer = "";
  const paint = () => {
    root.replaceChildren(html`
      <section class="overlay">
        ${pill}
        ${mathPrompt(plan)}
        <div class="answer">${buffer || "?"}</div>
        <div class="numpad">
          ${["1","2","3","4","5","6","7","8","9","−","0", t(locale, "math.delete")].map((key) => `<button class="key" data-k="${key}">${key}</button>`).join("")}
          <button class="btn primary wide" data-ok>OK</button>
        </div>
      </section>
    `);
    onClick(root, "[data-k]", (button) => {
      const key = button.dataset.k ?? "";
      if (key === t(locale, "math.delete") || key === "slett" || key === "delete") buffer = buffer.slice(0, -1);
      else if (key === "−") buffer = buffer.startsWith("-") ? buffer.slice(1) : `-${buffer.replace("-", "")}`;
      else buffer += key;
      paint();
    });
    onClick(root, "[data-ok]", () => {
      if (!buffer || buffer === "-") return;
      onAnswer(Number(buffer), buffer);
    });
  };
  paint();
}
