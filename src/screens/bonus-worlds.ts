import { BONUS_MILESTONES, bonusVehicle } from "../bonus/milestones";
import { t } from "../i18n";
import type { Locale } from "../types";
import { html, onClick } from "./dom";

export function renderBonusWorlds(
  root: HTMLElement,
  unlocked: number[],
  actions: { back: () => void; play: (milestone: number) => void },
  locale: Locale = "nb",
): void {
  const open = new Set(unlocked);
  const rows = BONUS_MILESTONES.map((milestone) => {
    const vehicle = bonusVehicle(milestone);
    const ready = open.has(milestone);
    return `
      <button class="btn world-btn ${ready ? "" : "locked"}" data-world="${milestone}" type="button" ${ready ? "" : "disabled"}>
        <strong>${t(locale, `bonus.world.${milestone}`)}</strong>
        <span>${ready ? t(locale, `bonus.lead.${vehicle}`) : t(locale, "bonus.worlds.locked")}</span>
      </button>`;
  }).join("");

  root.replaceChildren(html`
    <section class="screen pad">
      <button class="back" data-back type="button">${t(locale, "back")}</button>
      <h1>${t(locale, "bonus.worlds.title")}</h1>
      <p class="muted">${open.size === 0 ? t(locale, "bonus.worlds.empty") : t(locale, "bonus.worlds.lead")}</p>
      <div class="stack world-list">${rows}</div>
    </section>
  `);
  onClick(root, "[data-back]", actions.back);
  onClick(root, "[data-world]", (button) => {
    if (button.disabled) return;
    actions.play(Number(button.dataset.world));
  });
}
