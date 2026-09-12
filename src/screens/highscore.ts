import { t } from "../i18n";
import type { HighscoreBoard } from "../storage/highscores";
import type { Locale, MaxN } from "../types";
import { escapeHtml, html, onClick } from "./dom";

const TABS: MaxN[] = [10, 50, 100, 1000];

export function renderHighscores(
  root: HTMLElement,
  board: HighscoreBoard,
  selected: MaxN,
  actions: { back: () => void; change: (maxN: MaxN) => void },
  highlightIndex?: number,
  locale: Locale = "nb",
): void {
  const rows = (board[String(selected)] ?? [])
    .map((entry, i) => {
      const mine = i === highlightIndex;
      return `<li class="${mine ? "mine" : ""}"><span>${i + 1}. ${escapeHtml(entry.name)}</span><strong>${entry.score}</strong><em>${t(locale, "scores.level", { n: entry.level })}</em>${mine ? `<b class="tag">${t(locale, "scores.new")}</b>` : ""}</li>`;
    })
    .join("") || `<li class='empty'>${t(locale, "scores.empty")}</li>`;

  root.replaceChildren(html`
    <section class="screen pad">
      <button class="back" data-back type="button">${t(locale, "back")}</button>
      <h1>${t(locale, "scores.title")}</h1>
      <p class="muted">${t(locale, "scores.lead")}</p>
      <div class="tabs">
        ${TABS.map((n) => `<button class="tab ${n === selected ? "on" : ""}" data-n="${n}">${n}</button>`).join("")}
      </div>
      <ol class="scores">${rows}</ol>
    </section>
  `);
  onClick(root, "[data-back]", actions.back);
  onClick(root, "[data-n]", (button) => actions.change(Number(button.dataset.n) as MaxN));
}
