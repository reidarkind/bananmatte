import { nextBananaValue } from "../math/banana-values";
import type { Settings } from "../types";
import { sfx } from "./audio";
import {
  createAttackWorld,
  maybeSpawnTarget,
  stepShots,
  stepTargets,
  throwAt,
  type AttackWorld,
} from "./attack";
import { createDecor, type Decor } from "./backgrounds";
import { intersects } from "./collision";
import { drawApe, drawAttackGrove, drawAttackLeaves, drawBackground, drawBanana, drawCanopy, drawDecor, drawGorilla, drawTreeLine } from "./draw";
import { attachKeys, attachPointer, attachTap } from "./input";
import { bananaInBasketPose, basketRect, gorillaRect, spawnFalling, type FallingItem } from "./entities";
import { attackHitEvent, attackLeaveEvent, attackMissEvent, defendEscapeEvent, defendHitEvent } from "./play-map";
import { apeCountForValue, defendSpawnInterval, resolvePlayStyle, type PlayStyle } from "./play-style";
import { applyCatchEvent, createPlayState, fallSpeed, spawnRotten, type FallingKind, type PlayState } from "./rules";

export interface HudSnapshot {
  lives: number;
  score: number;
  collected: number;
  target: number;
  level: number;
  rottenCaught: number;
  playStyle: PlayStyle;
}

export interface PlaySession {
  start: () => void;
  stop: () => void;
  beginRound: (target: number, level: number, score: number) => void;
  getState: () => PlayState;
  getPlayStyle: () => PlayStyle;
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
  let style: PlayStyle = "sank";
  let previousStyle: PlayStyle | undefined;
  let attack: AttackWorld = createAttackWorld();
  let throwerFacing = 1;

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
        rottenCaught: state.rottenCaught,
        playStyle: style,
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
      attack = createAttackWorld();
      opts.onGameOver(state);
    } else if (state.roundComplete) {
      paused = true;
      items = [];
      attack = createAttackWorld();
      opts.onRoundComplete(state);
    }
  };

  const applyEvent = (event: ReturnType<typeof attackMissEvent> | null, sound: "catch" | "miss" | "rotten" | null) => {
    if (!event) return;
    apply(applyCatchEvent(state, event), sound);
  };

  const tickSankOrDefend = (dt: number, defend: boolean) => {
    gorillaX += keyDir * 280 * dt;
    gorillaX = Math.max(36, Math.min(width - 36, gorillaX));
    const body = gorillaRect(gorillaX, height - 58);
    const basket = basketRect(gorillaX, height - 58);
    const speed = fallSpeed(level);

    spawnAcc += dt;
    const interval = defend ? defendSpawnInterval(level) : Math.max(0.55, 1.35 - level * 0.06);
    if (spawnAcc >= interval && items.length < 5) {
      spawnAcc = 0;
      const remaining = Math.max(1, state.target - state.collected);
      if (defend) {
        const ripe = spawnRotten(level, opts.rng);
        const value = nextBananaValue(opts.settings.maxN, remaining, opts.rng);
        items.push(spawnFalling(ripe ? "banana" : "rotten", value, width, speed, opts.rng));
      } else {
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
    }

    const kept: FallingItem[] = [];
    for (const item of items) {
      item.y += item.vy * dt;
      item.rot += item.spin * dt;
      const box = { x: item.x, y: item.y, w: item.w, h: item.h };
      if (intersects(box, defend ? body : basket)) {
        if (!defend) inBasket.push({ kind: item.kind, value: item.value, rot: item.rot, age: 0 });
        if (defend) {
          const event = defendHitEvent(item.kind, item.value);
          apply(
            applyCatchEvent(state, event),
            event.type === "missed" ? "miss" : event.kind === "rotten" ? "rotten" : "catch",
          );
        } else {
          apply(
            applyCatchEvent(state, { type: "caught", kind: item.kind, value: item.value }),
            item.kind === "rotten" ? "rotten" : "catch",
          );
        }
        if (state.ended || state.roundComplete) break;
        continue;
      }
      if (item.y > height) {
        if (defend) {
          const event = defendEscapeEvent(item.kind, item.value);
          apply(
            applyCatchEvent(state, event),
            event.kind === "rotten" ? "rotten" : "catch",
          );
        } else {
          apply(applyCatchEvent(state, { type: "missed", kind: item.kind, value: item.value }), item.kind === "banana" ? "miss" : null);
        }
        if (state.ended || state.roundComplete) break;
        continue;
      }
      kept.push(item);
    }
    items = kept;
  };

  const tickAttack = (dt: number) => {
    maybeSpawnTarget(attack, width, Math.max(1, state.target - state.collected), opts.settings.maxN, level, dt, opts.rng, height);
    const { hits } = stepShots(attack, dt, width, height);
    for (const hit of hits) {
      const event = attackHitEvent(hit.target.kind, hit.target.value);
      applyEvent(event, hit.target.kind === "gorilla" ? "rotten" : "catch");
      if (state.ended || state.roundComplete) return;
    }
    for (const left of stepTargets(attack, dt)) {
      applyEvent(attackLeaveEvent(left.kind), left.kind === "orangutan" ? "miss" : null);
      if (state.ended || state.roundComplete) return;
    }
  };

  const drawWorld = (now: number) => {
    const gorillaY = height - 58;
    drawBackground(ctx, width, height, level);
    drawDecor(ctx, decor, now);

    if (style === "angrep") {
      drawAttackGrove(ctx, width, height);
      for (const target of attack.targets) {
        const count = target.kind === "gorilla" ? 1 : apeCountForValue(target.value);
        const scale = target.kind === "gorilla" ? 0.72 : 0.58;
        for (let i = 0; i < count; i += 1) {
          drawApe(ctx, target.x + target.w / 2 + (i - (count - 1) / 2) * 20, target.y + target.h * 0.7, 1, target.kind, scale);
        }
      }
      drawAttackLeaves(ctx, width, height);
      for (const shot of attack.shots) {
        drawBanana(ctx, {
          id: -8,
          kind: "banana",
          value: 1,
          x: shot.x,
          y: shot.y,
          w: shot.w,
          h: shot.h,
          vy: 0,
          rot: shot.rot,
          spin: 0,
        });
      }
      drawApe(ctx, gorillaX, gorillaY, throwerFacing, "orangutan");
      return;
    }

    if (style === "forsvar") {
      drawTreeLine(ctx, width, 78);
      drawApe(ctx, width * 0.22, 58, 1, "orangutan", 0.55);
      drawApe(ctx, width * 0.5, 48, -1, "orangutan", 0.58);
      drawApe(ctx, width * 0.78, 62, 1, "orangutan", 0.52);
      drawCanopy(ctx, width, height);
      drawGorilla(ctx, gorillaX, gorillaY, keyDir || 1, "back");
      for (const item of items) drawBanana(ctx, item);
      drawGorilla(ctx, gorillaX, gorillaY, keyDir || 1, "front");
      return;
    }

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
  };

  const tick = (now: number) => {
    if (!running) return;
    try {
      if (height < 80) resize();
      const dt = Math.min(0.04, (now - last) / 1000 || 0.016);
      last = now;

      if (!paused && !state.ended && !state.roundComplete) {
        if (style === "angrep") tickAttack(dt);
        else tickSankOrDefend(dt, style === "forsvar");

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
      drawWorld(now);
    } finally {
      if (running) raf = requestAnimationFrame(tick);
    }
  };

  const pointerOff = attachPointer(opts.canvas, (x) => {
    if (style === "angrep") return;
    gorillaX = Math.max(36, Math.min(width - 36, x));
  });
  const tapOff = attachTap(opts.canvas, (x, y) => {
    if (style !== "angrep" || paused || state.ended || state.roundComplete) return;
    throwerFacing = x >= gorillaX ? 1 : -1;
    throwAt(attack, gorillaX, height - 70, x, y, level);
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
      tapOff();
      keysOff();
      window.removeEventListener("resize", resize);
    },
    beginRound(target, nextLevel, score) {
      level = nextLevel;
      style = resolvePlayStyle(opts.settings.playStyle, opts.rng, previousStyle);
      previousStyle = style;
      state = createPlayState(target, score, state.rottenCaught);
      items = [];
      inBasket = [];
      spawnAcc = 0.4;
      attack = createAttackWorld();
      gorillaX = width / 2;
      decor = createDecor(level, width, height, opts.rng);
      paused = false;
      emitHud();
    },
    getState() {
      return state;
    },
    getPlayStyle() {
      return style;
    },
  };
}
