import { ROTTEN_LIMIT } from "../game/rules";
import { modeLabel, t } from "../i18n";
import type { Locale, ModeId } from "../types";
import { html, onClick } from "./dom";

export function renderGameShell(
  root: HTMLElement,
  mode: ModeId,
  onQuit: () => void,
  locale: Locale = "nb",
): { canvas: HTMLCanvasElement; overlay: HTMLElement; hud: HTMLElement } {
  root.replaceChildren(html`
    <section class="play">
      <canvas id="stage" aria-label="${t(locale, "game.canvas")}"></canvas>
      <div id="overlay" class="overlay-layer"></div>
      <header class="hud" id="hud"></header>
    </section>
  `);
  const hud = root.querySelector("#hud") as HTMLElement;
  hud.replaceChildren(html`
    <div class="hud-stack">
      <div class="hud-row">
        <button class="back tiny" data-quit type="button">${t(locale, "quit")}</button>
        <span data-mode>${modeLabel(locale, mode)}</span>
        <span data-level>${t(locale, "level", { n: 1 })}</span>
      </div>
      <div class="hud-row">
        <span data-lives></span>
        <span class="rotten-meter" data-rotten></span>
        <span data-progress></span>
        <span data-score>0</span>
      </div>
    </div>
  `);
  paintRotten(hud, 0, locale);
  onClick(hud, "[data-quit]", onQuit);
  return {
    canvas: root.querySelector("#stage") as HTMLCanvasElement,
    overlay: root.querySelector("#overlay") as HTMLElement,
    hud,
  };
}

export function updateHud(
  hud: HTMLElement,
  info: {
    mode: ModeId;
    level: number;
    lives: number;
    collected: number;
    target: number;
    score: number;
    rottenCaught?: number;
    locale?: Locale;
  },
): void {
  const locale = info.locale ?? "nb";
  const lives = "🍌".repeat(info.lives) + "✕".repeat(Math.max(0, 2 - info.lives));
  setText(hud, "[data-mode]", modeLabel(locale, info.mode));
  setText(hud, "[data-level]", t(locale, "level", { n: info.level }));
  setText(hud, "[data-lives]", lives);
  paintRotten(hud, info.rottenCaught ?? 0, locale);
  setText(hud, "[data-progress]", `${info.collected} / ${info.target}`);
  setText(hud, "[data-score]", String(info.score));
}

function rottenBananaSvg(): string {
  return `<svg class="rotten-icon" viewBox="-24 -28 50 52" aria-hidden="true">
    <path class="peel" d="M-16-10C-4-22 18-8 16 14C8 8-8 2-16-10Z"/>
    <path class="stem" d="M-18-11c-1.2-4.2 1.6-7.6 3.6-6.2 1.4 1.4.2 5.2-1.8 6.2z"/>
    <ellipse class="spot" cx="2" cy="1" rx="3.1" ry="2.2" transform="rotate(23 2 1)"/>
    <ellipse class="spot" cx="9" cy="8" rx="2.3" ry="1.7" transform="rotate(-17 9 8)"/>
    <path class="cross" d="M-12-18 12 16M12-18-12 16"/>
  </svg>`;
}

function paintRotten(hud: HTMLElement, caught: number, locale: Locale): void {
  const meter = hud.querySelector("[data-rotten]");
  if (!meter) return;
  const filled = Math.min(ROTTEN_LIMIT, Math.max(0, caught));
  const slots = Array.from({ length: ROTTEN_LIMIT }, (_, i) =>
    `<i class="rotten-slot${i < filled ? " on" : ""}" aria-hidden="true">${rottenBananaSvg()}</i>`,
  ).join("");
  meter.setAttribute("aria-label", t(locale, "game.rottenCount", { n: filled, max: ROTTEN_LIMIT }));
  meter.innerHTML = `<span class="rotten-label">${t(locale, "game.rotten")}</span><span class="rotten-slots">${slots}</span>`;
}

function setText(root: ParentNode, selector: string, value: string): void {
  const node = root.querySelector(selector);
  if (node) node.textContent = value;
}
