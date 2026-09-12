import { backgroundFor, type Decor } from "./backgrounds";
import type { FallingItem } from "./entities";

export function drawBackground(ctx: CanvasRenderingContext2D, w: number, h: number, level: number): void {
  const bg = backgroundFor(level);
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, bg.sky[0]);
  sky.addColorStop(1, bg.sky[1]);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = bg.ground;
  ctx.beginPath();
  ctx.moveTo(0, h * 0.82);
  ctx.quadraticCurveTo(w * 0.5, h * 0.76, w, h * 0.82);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.fill();

  ctx.fillStyle = bg.extra;
  ctx.globalAlpha = 0.35;
  ctx.beginPath();
  ctx.arc(w * 0.82, h * 0.16, 46, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

export function drawDecor(ctx: CanvasRenderingContext2D, items: Decor[], t: number): void {
  for (const item of items) {
    const x = item.x + Math.sin(t / 400 + item.phase) * 8;
    const y = item.y;
    ctx.save();
    ctx.translate(x, y);
    if (item.kind === "leaf") {
      ctx.rotate(Math.sin(t / 300 + item.phase) * 0.4);
      ctx.fillStyle = "#40916c";
      ctx.beginPath();
      ctx.ellipse(0, 0, item.size, item.size * 0.45, 0.4, 0, Math.PI * 2);
      ctx.fill();
    } else if (item.kind === "bird") {
      ctx.strokeStyle = "#1d3557";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-item.size, 0);
      ctx.quadraticCurveTo(0, -8 - Math.sin(t / 120) * 4, item.size, 0);
      ctx.stroke();
    } else if (item.kind === "star") {
      ctx.fillStyle = "#fff3b0";
      ctx.beginPath();
      ctx.arc(0, 0, item.size * 0.25, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.strokeStyle = "rgba(255,255,255,0.7)";
      ctx.beginPath();
      ctx.arc(0, 0, item.size * 0.4, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }
}

export interface Point {
  x: number;
  y: number;
}

export function bananaCurves(): {
  stem: Point;
  tip: Point;
  outer: [Point, Point];
  inner: [Point, Point];
} {
  return {
    stem: { x: -16, y: -10 },
    tip: { x: 16, y: 14 },
    outer: [
      { x: -4, y: -22 },
      { x: 18, y: -8 },
    ],
    inner: [
      { x: 8, y: 8 },
      { x: -8, y: 2 },
    ],
  };
}

export function pointOnCubic(p0: Point, p1: Point, p2: Point, p3: Point, t: number): Point {
  const u = 1 - t;
  return {
    x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
    y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
  };
}

function bananaPath(ctx: CanvasRenderingContext2D): void {
  const c = bananaCurves();
  ctx.beginPath();
  ctx.moveTo(c.stem.x, c.stem.y);
  ctx.bezierCurveTo(c.outer[0].x, c.outer[0].y, c.outer[1].x, c.outer[1].y, c.tip.x, c.tip.y);
  ctx.bezierCurveTo(c.inner[0].x, c.inner[0].y, c.inner[1].x, c.inner[1].y, c.stem.x, c.stem.y);
  ctx.closePath();
}

function paintBananaBody(ctx: CanvasRenderingContext2D, rotten: boolean): void {
  const fill = ctx.createLinearGradient(-14, -20, 12, 16);
  if (rotten) {
    fill.addColorStop(0, "#8a7354");
    fill.addColorStop(0.5, "#6c584c");
    fill.addColorStop(1, "#4a3f32");
  } else {
    fill.addColorStop(0, "#fff1a3");
    fill.addColorStop(0.4, "#f4d35e");
    fill.addColorStop(1, "#d97706");
  }
  bananaPath(ctx);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = rotten ? "#3d3226" : "#c2780a";
  ctx.lineWidth = 1.6;
  ctx.stroke();

  const c = bananaCurves();
  ctx.strokeStyle = rotten ? "rgba(90, 80, 50, 0.45)" : "rgba(255, 248, 220, 0.7)";
  ctx.lineWidth = 2.4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(c.tip.x - 3, c.tip.y - 3);
  ctx.bezierCurveTo(c.inner[0].x - 1, c.inner[0].y - 3, c.inner[1].x, c.inner[1].y - 2, c.stem.x + 3, c.stem.y + 1);
  ctx.stroke();

  ctx.strokeStyle = rotten ? "rgba(40, 32, 24, 0.28)" : "rgba(180, 110, 20, 0.35)";
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(-10, -7);
  ctx.quadraticCurveTo(4, -3, 12, 8);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-8, -2);
  ctx.quadraticCurveTo(6, 1, 11, 11);
  ctx.stroke();

  ctx.save();
  ctx.translate(c.stem.x - 1, c.stem.y - 1);
  ctx.rotate(-0.95);
  ctx.fillStyle = rotten ? "#3f2f22" : "#6b4226";
  ctx.beginPath();
  ctx.moveTo(-2.2, 1);
  ctx.lineTo(-2.4, -7);
  ctx.quadraticCurveTo(0, -10.5, 2.4, -7);
  ctx.lineTo(2.2, 1);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = rotten ? "#2f261c" : "#7c4a1e";
  ctx.beginPath();
  ctx.ellipse(c.tip.x + 0.5, c.tip.y + 0.5, 2.4, 1.7, 0.7, 0, Math.PI * 2);
  ctx.fill();
}

function drawOneBanana(ctx: CanvasRenderingContext2D, rotten: boolean): void {
  paintBananaBody(ctx, rotten);
  if (!rotten) return;
  ctx.fillStyle = "#4d7c4a";
  ctx.beginPath();
  ctx.ellipse(2, 1, 3.1, 2.2, 0.4, 0, Math.PI * 2);
  ctx.ellipse(9, 8, 2.3, 1.7, -0.3, 0, Math.PI * 2);
  ctx.ellipse(-4, -2, 1.8, 1.3, 0.6, 0, Math.PI * 2);
  ctx.fill();
}

export function drawBanana(ctx: CanvasRenderingContext2D, item: FallingItem): void {
  ctx.save();
  ctx.translate(item.x + item.w / 2, item.y + item.h / 2);
  ctx.rotate(item.rot);
  ctx.scale(item.w / 40, item.h / 40);
  const bunch = item.kind === "banana" && item.value > 1 ? 3 : 1;
  for (let i = bunch - 1; i >= 0; i -= 1) {
    ctx.save();
    ctx.translate(i * 3.2 - (bunch - 1) * 1.4, i * 2.6);
    ctx.rotate(i * 0.22);
    drawOneBanana(ctx, item.kind === "rotten");
    ctx.restore();
  }
  if (item.kind === "banana" && item.value > 1) {
    ctx.fillStyle = "#1b4332";
    ctx.font = "bold 13px Nunito, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(item.value), 2, 1);
  }
  ctx.restore();
}

export function drawGorilla(ctx: CanvasRenderingContext2D, x: number, y: number, facing: number): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(facing < 0 ? -1 : 1, 1);

  ctx.fillStyle = "#6b4226";
  ctx.beginPath();
  ctx.ellipse(0, 18, 28, 22, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#8d5b32";
  ctx.beginPath();
  ctx.ellipse(0, -6, 20, 18, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#f6bd60";
  ctx.beginPath();
  ctx.ellipse(2, -2, 13, 11, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#1d3557";
  ctx.beginPath();
  ctx.arc(-4, -8, 3.2, 0, Math.PI * 2);
  ctx.arc(8, -8, 3.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#c9ada7";
  ctx.beginPath();
  ctx.ellipse(-22, 8, 10, 7, 0.3, 0, Math.PI * 2);
  ctx.ellipse(24, 10, 10, 7, -0.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#d4a373";
  ctx.beginPath();
  ctx.moveTo(-26, -4);
  ctx.quadraticCurveTo(0, -28, 26, -4);
  ctx.quadraticCurveTo(0, -10, -26, -4);
  ctx.fill();
  ctx.strokeStyle = "#9c6644";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.restore();
}
