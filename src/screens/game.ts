import { MODE_LABELS, type ModeId } from "../types";
import { html, onClick } from "./dom";

export function renderGameShell(
  root: HTMLElement,
  mode: ModeId,
  onQuit: () => void,
): { canvas: HTMLCanvasElement; overlay: HTMLElement; hud: HTMLElement } {
  root.replaceChildren(html`
    <section class="play">
      <header class="hud" id="hud"></header>
      <canvas id="stage" aria-label="Spillbrett"></canvas>
      <div id="overlay"></div>
    </section>
  `);
  const hud = root.querySelector("#hud") as HTMLElement;
  hud.replaceChildren(html`
    <div class="hud-row">
      <button class="back tiny" data-quit type="button">Avslutt</button>
      <span data-mode>${MODE_LABELS[mode]}</span>
      <span data-level>Nivå 1</span>
    </div>
    <div class="hud-row">
      <span data-lives></span>
      <span data-progress></span>
      <span data-score>0</span>
    </div>
  `);
  onClick(hud, "[data-quit]", onQuit);
  return {
    canvas: root.querySelector("#stage") as HTMLCanvasElement,
    overlay: root.querySelector("#overlay") as HTMLElement,
    hud,
  };
}

export function updateHud(
  hud: HTMLElement,
  info: { mode: ModeId; level: number; lives: number; collected: number; target: number; score: number },
): void {
  const lives = "🍌".repeat(info.lives) + "✕".repeat(Math.max(0, 2 - info.lives));
  hud.querySelector("[data-mode]")!.textContent = MODE_LABELS[info.mode];
  hud.querySelector("[data-level]")!.textContent = `Nivå ${info.level}`;
  hud.querySelector("[data-lives]")!.textContent = lives;
  hud.querySelector("[data-progress]")!.textContent = `${info.collected} / ${info.target}`;
  hud.querySelector("[data-score]")!.textContent = String(info.score);
}
