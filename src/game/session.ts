import { nextBananaValue } from "../math/banana-values";
import type { Settings } from "../types";
import { sfx } from "./audio";
import { createDecor, type Decor } from "./backgrounds";
import { intersects } from "./collision";
import { drawBackground, drawBanana, drawDecor, drawGorilla } from "./draw";
import { attachKeys, attachPointer } from "./input";
import { bananaInBasketPose, basketRect, spawnFalling, type FallingItem } from "./entities";
import { applyCatchEvent, createPlayState, fallSpeed, spawnRotten, type FallingKind, type PlayState } from "./rules";

export interface HudSnapshot {
  lives: number;
  score: number;
  collected: number;
  target: number;
  level: number;
}

export interface PlaySession {
  start: () => void;
  stop: () => void;
  beginRound: (target: number, level: number, score: number) => void;
  getState: () => PlayState;
}

export function createPlaySession(opts: {
  canvas: HTMLCanvasElement;
  settings: Settings;
  rng: () => number;
  onHud: (hud: HudSnapshot) => void;
  onRoundComplete: (state: PlayState) => void;
  onGameOver: (state: PlayState) => void;
}): PlaySession {
  const ctx = opts.canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D mangler");

  let running = false;
  let raf = 0;
  let last = 0;
  let width = 360;
  let height = 640;
  let gorillaX = 180;
  let keyDir: -1 | 0 | 1 = 0;
  let items: FallingItem[] = [];
  let inBasket: { kind: FallingKind; value: number; rot: number; age: number }[] = [];
  let decor: Decor[] = [];
  let spawnAcc = 0;
  let state = createPlayState(1);
  let level = 1;
  let paused = true;

  const resize = () => {
    const dpr = window.devicePixelRatio || 1;
    const rect = opts.canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    opts.canvas.width = Math.floor(rect.width * dpr);
    opts.canvas.height = Math.floor(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const emitHud = () => {
    try {
      opts.onHud({
        lives: state.lives,
        score: state.score,
        collected: state.collected,
        target: state.target,
        level,
      });
    } catch {
      // HUD-feil skal ikke stoppe spilløkken
    }
  };

  const apply = (next: PlayState, sound: "catch" | "miss" | "rotten" | null) => {
    state = next;
    emitHud();
    if (sound) sfx[sound](opts.settings.sound);
    if (state.ended) {
      paused = true;
      items = [];
      opts.onGameOver(state);
    } else if (state.roundComplete) {
      paused = true;
      items = [];
      opts.onRoundComplete(state);
    }
  };

  const tick = (now: number) => {
    if (!running) return;
    try {
      if (height < 80) resize();
      const dt = Math.min(0.04, (now - last) / 1000 || 0.016);
      last = now;
      const speed = fallSpeed(level);

      if (!paused && !state.ended && !state.roundComplete) {
        gorillaX += keyDir * 280 * dt;
        gorillaX = Math.max(36, Math.min(width - 36, gorillaX));
        const basket = basketRect(gorillaX, height - 58);

        spawnAcc += dt;
        const interval = Math.max(0.55, 1.35 - level * 0.06);
        if (spawnAcc >= interval && items.length < 5) {
          spawnAcc = 0;
          const remaining = Math.max(1, state.target - state.collected);
          const rotten = spawnRotten(level, opts.rng);
          items.push(
            spawnFalling(
              rotten ? "rotten" : "banana",
              rotten ? 1 : nextBananaValue(opts.settings.maxN, remaining, opts.rng),
              width,
              speed,
              opts.rng,
            ),
          );
        }

        const kept: FallingItem[] = [];
        for (const item of items) {
          item.y += item.vy * dt;
          item.rot += item.spin * dt;
          const box = { x: item.x, y: item.y, w: item.w, h: item.h };
          if (intersects(box, basket)) {
            inBasket.push({ kind: item.kind, value: item.value, rot: item.rot, age: 0 });
            apply(
              applyCatchEvent(state, { type: "caught", kind: item.kind, value: item.value }),
              item.kind === "rotten" ? "rotten" : "catch",
            );
            if (state.ended || state.roundComplete) break;
            continue;
          }
          if (item.y > height) {
            apply(applyCatchEvent(state, { type: "missed", kind: item.kind, value: item.value }), item.kind === "banana" ? "miss" : null);
            if (state.ended || state.roundComplete) break;
            continue;
          }
          kept.push(item);
        }
        items = kept;

        for (const d of decor) {
          d.y += d.vy * dt * 0.35;
          d.x += d.vx * dt * 0.2;
          if (d.y > height) d.y = -20;
          if (d.x < -20) d.x = width + 10;
          if (d.x > width + 20) d.x = -10;
        }
      }

      for (const caught of inBasket) caught.age += dt;
      inBasket = inBasket.filter((caught) => caught.age < 0.55);

      const gorillaY = height - 58;
      drawBackground(ctx, width, height, level);
      drawDecor(ctx, decor, now);
      drawGorilla(ctx, gorillaX, gorillaY, keyDir || 1, "back");
      for (const item of items) drawBanana(ctx, item);
      inBasket.forEach((caught, slot) => {
        const pose = bananaInBasketPose(gorillaX, gorillaY, slot);
        drawBanana(ctx, {
          id: -1 - slot,
          kind: caught.kind,
          value: caught.value,
          x: pose.x,
          y: pose.y,
          w: pose.w,
          h: pose.h,
          vy: 0,
          rot: caught.rot * 0.15,
          spin: 0,
        });
      });
      drawGorilla(ctx, gorillaX, gorillaY, keyDir || 1, "front");
    } finally {
      if (running) raf = requestAnimationFrame(tick);
    }
  };

  const pointerOff = attachPointer(opts.canvas, (x) => {
    gorillaX = Math.max(36, Math.min(width - 36, x));
  });
  const keysOff = attachKeys((dir) => {
    keyDir = dir;
  });
  window.addEventListener("resize", resize);

  return {
    start() {
      resize();
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    },
    stop() {
      running = false;
      cancelAnimationFrame(raf);
      pointerOff();
      keysOff();
      window.removeEventListener("resize", resize);
    },
    beginRound(target, nextLevel, score) {
      level = nextLevel;
      state = createPlayState(target, score);
      items = [];
      inBasket = [];
      spawnAcc = 0.4;
      decor = createDecor(level, width, height, opts.rng);
      paused = false;
      emitHud();
    },
    getState() {
      return state;
    },
  };
}
