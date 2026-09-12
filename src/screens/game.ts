import { ROTTEN_LIMIT } from "../game/rules";
import { modeLabel, playStyleLabel, t } from "../i18n";
import type { Locale, ModeId, PlayStyle } from "../types";
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
      <p class="hud-goal" data-style>${playStyleLabel(locale, "sank")}</p>
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
  paintLives(hud, 2, "sank");
  paintRotten(hud, 0, locale, "sank");
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
    playStyle?: PlayStyle;
    locale?: Locale;
  },
): void {
  const locale = info.locale ?? "nb";
  const style = info.playStyle ?? "sank";
  setText(hud, "[data-style]", playStyleLabel(locale, style));
  setText(hud, "[data-mode]", modeLabel(locale, info.mode));
  setText(hud, "[data-level]", t(locale, "level", { n: info.level }));
  paintLives(hud, info.lives, style);
  paintRotten(hud, info.rottenCaught ?? 0, locale, style);
  setText(hud, "[data-progress]", `${t(locale, `hud.progress.${style}`)} ${info.collected} / ${info.target}`);
  setText(hud, "[data-score]", String(info.score));
}

function meterCross(): string {
  return `<g class="cross">
      <path class="cross-shadow" d="M-13.2-17.4C-3.4-6.2 3.8 5.4 12.6 15.8"/>
      <path class="cross-shadow" d="M12.1-16.8C2.6-5.1-5.8 6.4-13.4 16.2"/>
      <path class="cross-body" d="M-12.6-16.8C-3-5.6 4.2 5.8 12.2 15.2"/>
      <path class="cross-body" d="M11.4-16.2C2.2-4.6-5.2 6.8-12.6 15.6"/>
      <path class="cross-shine" d="M-10.4-14.2C-3.6-5.2 3.2 4.6 9.6 12.4"/>
    </g>`;
}

function bananaSvg(className: string, crossed: boolean): string {
  return `<svg class="${className}" viewBox="-24 -28 50 52" aria-hidden="true">
    <path class="peel" d="M-16-10C-4-22 18-8 16 14C8 8-8 2-16-10Z"/>
    <path class="stem" d="M-18-11c-1.2-4.2 1.6-7.6 3.6-6.2 1.4 1.4.2 5.2-1.8 6.2z"/>
    <ellipse class="spot" cx="2" cy="1" rx="3.1" ry="2.2" transform="rotate(23 2 1)"/>
    <ellipse class="spot" cx="9" cy="8" rx="2.3" ry="1.7" transform="rotate(-17 9 8)"/>
    ${crossed ? meterCross() : ""}
  </svg>`;
}

function apeSvg(className: string, crossed: boolean): string {
  return `<svg class="${className}" viewBox="-24 -28 50 52" aria-hidden="true">
    <circle class="ape-head" cx="0" cy="2" r="13"/>
    <ellipse class="ape-pad" cx="-12" cy="6" rx="7" ry="9"/>
    <ellipse class="ape-pad" cx="12" cy="6" rx="7" ry="9"/>
    <ellipse class="ape-face" cx="0" cy="2" rx="6" ry="5.5"/>
    <ellipse class="ape-face" cx="0" cy="10" rx="7" ry="6"/>
    ${crossed ? meterCross() : ""}
  </svg>`;
}

function meterIcon(style: PlayStyle): string {
  if (style === "angrep") return apeSvg("rotten-icon ape gorilla", true);
  return bananaSvg("rotten-icon", true);
}

function lifeIcon(style: PlayStyle): string {
  if (style === "angrep") return apeSvg("life-icon rotten-icon orangutan", false);
  if (style === "forsvar") return bananaSvg("life-icon rotten-icon", false);
  return bananaSvg("life-icon rotten-icon ripe", false);
}

function paintLives(hud: HTMLElement, lives: number, style: PlayStyle): void {
  const node = hud.querySelector("[data-lives]");
  if (!node) return;
  const left = Math.max(0, Math.min(2, lives));
  node.innerHTML = Array.from({ length: 2 }, (_, i) =>
    `<i class="life-slot${i < left ? "" : " lost"}" aria-hidden="true">${lifeIcon(style)}</i>`,
  ).join("");
}

function paintRotten(hud: HTMLElement, caught: number, locale: Locale, style: PlayStyle = "sank"): void {
  const meter = hud.querySelector("[data-rotten]");
  if (!meter) return;
  const filled = Math.min(ROTTEN_LIMIT, Math.max(0, caught));
  const slots = Array.from({ length: ROTTEN_LIMIT }, (_, i) =>
    `<i class="rotten-slot${i < filled ? " on" : ""}" aria-hidden="true">${meterIcon(style)}</i>`,
  ).join("");
  meter.setAttribute("aria-label", t(locale, `hud.rottenCount.${style}`, { n: filled, max: ROTTEN_LIMIT }));
  meter.innerHTML = `<span class="rotten-label">${t(locale, `hud.rotten.${style}`)}</span><span class="rotten-slots">${slots}</span>`;
}

function setText(root: ParentNode, selector: string, value: string): void {
  const node = root.querySelector(selector);
  if (node) node.textContent = value;
}
