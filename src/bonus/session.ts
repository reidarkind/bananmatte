import { t } from "../i18n";
import { answersMatch, planRound } from "../math/questions";
import { attachKeys, attachPointer } from "../game/input";
import { html, onClick } from "../screens/dom";
import { renderMath } from "../screens/math";
import type { Locale, Rng, Settings } from "../types";
import { drawBonusRide } from "./draw";
import { bonusVehicle } from "./milestones";
import { createRide, resolveBook, skipRide, startRide, stepRide, type RideState } from "./ride";

export function playBonusRide(
  host: HTMLElement,
  opts: {
    milestone: number;
    locale: Locale;
    settings: Settings;
    rng: Rng;
    score?: number;
    onDone: () => void;
  },
): () => void {
  const locale = opts.locale;
  const vehicle = bonusVehicle(opts.milestone);
  const layer = html`
    <div class="bonus-layer">
      <canvas class="bonus-stage" aria-label="${t(locale, "game.canvas")}"></canvas>
      <div class="bonus-bar">
        <p class="bonus-title">${t(locale, "bonus.title")} · ${t(locale, `bonus.lead.${vehicle}`)}</p>
        <button class="btn tiny" data-skip type="button">${t(locale, "bonus.skip")}</button>
      </div>
      <div class="bonus-intro">
        <section class="bonus-card">
          <h2>${t(locale, "bonus.headline")}</h2>
          <p class="lead">${t(locale, "bonus.how")}</p>
          <p>${t(locale, `bonus.lead.${vehicle}`)}</p>
          <ul>
            <li>${t(locale, "bonus.rule.banana")}</li>
            <li>${t(locale, "bonus.rule.crate")}</li>
            <li>${t(locale, "bonus.rule.book")}</li>
          </ul>
          <button class="btn primary" data-start type="button">${t(locale, "bonus.go")}</button>
        </section>
      </div>
      <div class="bonus-math"></div>
      <p class="bonus-toast" hidden></p>
    </div>
  `;
  host.append(layer);

  const canvas = layer.querySelector("canvas") as HTMLCanvasElement;
  const intro = layer.querySelector(".bonus-intro") as HTMLElement;
  const mathHost = layer.querySelector(".bonus-math") as HTMLElement;
  const toast = layer.querySelector(".bonus-toast") as HTMLElement;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    opts.onDone();
    return () => {};
  }

  let ride: RideState = createRide(opts.rng);
  let steer = 0;
  let running = true;
  let raf = 0;
  let last = performance.now();
  let finished = false;

  const finish = () => {
    if (finished) return;
    finished = true;
    running = false;
    cancelAnimationFrame(raf);
    layer.remove();
    opts.onDone();
  };

  const begin = () => {
    if (ride.phase !== "intro") return;
    ride = startRide(ride);
    intro.hidden = true;
    last = performance.now();
  };

  const resize = () => {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const showToast = (key: string) => {
    toast.hidden = false;
    toast.textContent = t(locale, key);
  };

  const askBook = () => {
    const plan = planRound(opts.settings, opts.rng);
    renderMath(mathHost, plan, (value) => {
      if (answersMatch(plan.answer, value)) {
        mathHost.replaceChildren();
        ride = resolveBook(ride, true);
        return;
      }
      mathHost.replaceChildren(html`
        <section class="overlay">
          <h2>${t(locale, "over.wrong")}</h2>
          <p class="fasit">${plan.explanation}</p>
          <button class="btn primary" data-got type="button">${t(locale, "over.gotIt")}</button>
        </section>
      `);
      onClick(mathHost, "[data-got]", () => {
        ride = resolveBook(ride, false);
        finish();
      });
    }, locale, { hideCatch: true });
  };

  const paint = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    drawBonusRide(ctx, w, h, ride, vehicle, t(locale, "bonus.go"), {
      score: opts.score ?? 0,
      depositLabel: t(locale, "bonus.deposit"),
    });
  };

  const tick = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (ride.phase === "countdown" || ride.phase === "drive") ride = stepRide(ride, dt, ride.phase === "drive" ? steer : 0);
    else if (ride.phase === "bank" || ride.phase === "crash") ride = stepRide(ride, dt, 0);
    if (ride.phase === "math" && mathHost.childElementCount === 0) askBook();
    if (ride.phase === "bank") showToast("bonus.bank");
    if (ride.phase === "crash") showToast("bonus.crash");
    if (ride.phase === "done") {
      finish();
      return;
    }
    paint();
    if (running) raf = requestAnimationFrame(tick);
  };

  resize();
  const pointerOff = attachPointer(canvas, (x) => {
    if (ride.phase !== "drive") return;
    const rect = canvas.getBoundingClientRect();
    ride = { ...ride, x: Math.max(-1, Math.min(1, ((x / rect.width) * 2 - 1))) };
  });
  const keysOff = attachKeys((dir) => {
    steer = dir;
  });
  const onKey = (event: KeyboardEvent) => {
    if (event.key === "Enter") begin();
  };
  window.addEventListener("resize", resize);
  window.addEventListener("keydown", onKey);
  onClick(layer, "[data-skip]", () => {
    ride = skipRide(ride);
    finish();
  });
  onClick(layer, "[data-start]", begin);
  raf = requestAnimationFrame(tick);

  return () => {
    running = false;
    cancelAnimationFrame(raf);
    pointerOff();
    keysOff();
    window.removeEventListener("resize", resize);
    window.removeEventListener("keydown", onKey);
    layer.remove();
  };
}
