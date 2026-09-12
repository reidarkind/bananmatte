import { MODE_LABELS, type MaxN } from "../types";
import type { HighscoreBoard } from "../storage/highscores";
import { escapeHtml, html, onClick } from "./dom";

const TABS: MaxN[] = [10, 50, 100, 1000];

export function renderHighscores(
  root: HTMLElement,
  board: HighscoreBoard,
  selected: MaxN,
  actions: { back: () => void; change: (maxN: MaxN) => void },
): void {
  const rows = (board[String(selected)] ?? [])
    .map((entry, i) => `<li><span>${i + 1}. ${escapeHtml(entry.name)}</span><strong>${entry.score}</strong><em>nivå ${entry.level}</em></li>`)
    .join("") || "<li class='empty'>Ingen rekorder ennå.</li>";

  root.replaceChildren(html`
    <section class="screen pad">
      <button class="back" data-back type="button">Tilbake</button>
      <h1>Rekorder</h1>
      <p class="muted">Beste poeng per største tall. ${MODE_LABELS.mix} og vanlige runder deler liste.</p>
      <div class="tabs">
        ${TABS.map((n) => `<button class="tab ${n === selected ? "on" : ""}" data-n="${n}">${n}</button>`).join("")}
      </div>
      <ol class="scores">${rows}</ol>
    </section>
  `);
  onClick(root, "[data-back]", actions.back);
  onClick(root, "[data-n]", (button) => actions.change(Number(button.dataset.n) as MaxN));
}
