import { backgroundFor, type Decor } from "./backgrounds";
import { GORILLA, type FallingItem } from "./entities";

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

export const APE_FUR = {
  gorilla: "#3b2416",
  gorillaLight: "#5a3824",
  orangutan: "#e67a22",
  orangutanLight: "#f6b15a",
} as const;

export const APE_BODY = { cx: 0, cy: 26, rx: 22, ry: 18 };

export function apeFaceFill(kind: "gorilla" | "orangutan"): string {
  return kind === "orangutan" ? "#3a2418" : "#f0c4a0";
}

const FUR = APE_FUR.gorilla;
const FUR_LIGHT = APE_FUR.gorillaLight;
const FACE = apeFaceFill("gorilla");
const EAR_IN = "#d49274";
const BASKET = "#e0b07a";
const BASKET_DARK = "#c4924c";
const BASKET_LINE = "#a87438";

function drawBasketBack(ctx: CanvasRenderingContext2D): void {
  const { x, y, w, h } = GORILLA.basket;
  const cx = x + w / 2;
  const rimY = y + 3;

  ctx.strokeStyle = BASKET;
  ctx.lineWidth = 3.2;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x + 10, rimY);
  ctx.quadraticCurveTo(cx, y - 8, x + w - 10, rimY);
  ctx.stroke();
  ctx.strokeStyle = "rgba(255, 236, 210, 0.55)";
  ctx.lineWidth = 1.2;
  ctx.stroke();

  ctx.fillStyle = BASKET_DARK;
  ctx.beginPath();
  ctx.moveTo(x + 3, rimY);
  ctx.quadraticCurveTo(cx, y + h + 6, x + w - 3, rimY);
  ctx.quadraticCurveTo(cx, y + 1, x + 3, rimY);
  ctx.fill();

  ctx.strokeStyle = BASKET_LINE;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.45;
  for (let i = 0; i < 3; i += 1) {
    const wy = rimY + 5 + i * 3.6;
    ctx.beginPath();
    ctx.moveTo(x + 8, wy);
    ctx.quadraticCurveTo(cx, wy + 3, x + w - 8, wy);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function drawBasketFront(ctx: CanvasRenderingContext2D): void {
  const { x, y, w, h } = GORILLA.basket;
  const cx = x + w / 2;
  const rimY = y + 3;

  ctx.fillStyle = BASKET;
  ctx.beginPath();
  ctx.moveTo(x + 3, rimY + 5);
  ctx.quadraticCurveTo(cx, y + h + 6, x + w - 3, rimY + 5);
  ctx.quadraticCurveTo(cx, y + h * 0.55, x + 3, rimY + 5);
  ctx.fill();

  ctx.strokeStyle = BASKET_LINE;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.5;
  for (let i = 0; i < 3; i += 1) {
    const wy = rimY + 7 + i * 3.2;
    ctx.beginPath();
    ctx.moveTo(x + 10, wy);
    ctx.quadraticCurveTo(cx, wy + 2.4, x + w - 10, wy);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  ctx.strokeStyle = BASKET_DARK;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(cx, rimY, w * 0.46, 3.4, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "#f3d2a4";
  ctx.beginPath();
  ctx.ellipse(cx, rimY, w * 0.42, 2.4, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawApeTorso(ctx: CanvasRenderingContext2D, fur: string, furLight: string): void {
  ctx.fillStyle = fur;
  ctx.beginPath();
  ctx.ellipse(-13, 46, 9, 5.5, 0, 0, Math.PI * 2);
  ctx.ellipse(13, 46, 9, 5.5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(APE_BODY.cx, APE_BODY.cy, APE_BODY.rx, APE_BODY.ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = furLight;
  ctx.beginPath();
  ctx.ellipse(0, 28, 12, 11, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = fur;
  ctx.lineWidth = 9;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-14, 16);
  ctx.quadraticCurveTo(-28, 10, -28, 14);
  ctx.moveTo(14, 16);
  ctx.quadraticCurveTo(28, 10, 28, 14);
  ctx.stroke();

  ctx.fillStyle = fur;
  ctx.beginPath();
  ctx.ellipse(0, 10, 11, 9, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawGorillaHead(ctx: CanvasRenderingContext2D, fur: string): void {
  const { cx, cy, r } = GORILLA.head;
  ctx.fillStyle = fur;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx, cy - r + 2, 7, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx - 17, cy - 2, 7, 0, Math.PI * 2);
  ctx.arc(cx + 17, cy - 2, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = EAR_IN;
  ctx.beginPath();
  ctx.arc(cx - 17, cy - 2, 3.6, 0, Math.PI * 2);
  ctx.arc(cx + 17, cy - 2, 3.6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = FACE;
  ctx.beginPath();
  ctx.ellipse(cx, cy + 3, 13, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(cx - 6, cy - 4, 4.4, 5, 0, 0, Math.PI * 2);
  ctx.ellipse(cx + 6, cy - 4, 4.4, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1a120c";
  ctx.beginPath();
  ctx.arc(cx - 5.4, cy - 3.4, 2.3, 0, Math.PI * 2);
  ctx.arc(cx + 6.6, cy - 3.4, 2.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(cx - 4.4, cy - 4.4, 0.8, 0, Math.PI * 2);
  ctx.arc(cx + 7.6, cy - 4.4, 0.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#5a3320";
  ctx.beginPath();
  ctx.ellipse(cx - 2.2, cy + 3, 1.5, 1.1, 0, 0, Math.PI * 2);
  ctx.ellipse(cx + 2.2, cy + 3, 1.5, 1.1, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#4a2818";
  ctx.beginPath();
  ctx.arc(cx, cy + 9, 6.5, 0.15, Math.PI - 0.15);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.moveTo(cx - 4.5, cy + 8.2);
  ctx.lineTo(cx + 4.5, cy + 8.2);
  ctx.lineTo(cx + 3.6, cy + 10.2);
  ctx.lineTo(cx - 3.6, cy + 10.2);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#e07a7a";
  ctx.beginPath();
  ctx.ellipse(cx, cy + 11.4, 2.6, 1.6, 0, 0, Math.PI);
  ctx.fill();
}

function drawGorillaBody(ctx: CanvasRenderingContext2D, fur: string = FUR, furLight: string = FUR_LIGHT): void {
  drawApeTorso(ctx, fur, furLight);
  drawGorillaHead(ctx, fur);
}

export function drawGorilla(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  facing: number,
  layer: "back" | "front" = "back",
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(facing < 0 ? -1 : 1, 1);
  if (layer === "back") {
    drawGorillaBody(ctx);
    drawBasketBack(ctx);
  } else {
    drawBasketFront(ctx);
    ctx.fillStyle = FUR;
    ctx.beginPath();
    ctx.arc(-27, 14, 6.5, 0, Math.PI * 2);
    ctx.arc(27, 14, 6.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawApeHands(ctx: CanvasRenderingContext2D, fur: string): void {
  ctx.fillStyle = fur;
  ctx.beginPath();
  ctx.arc(-27, 14, 6.5, 0, Math.PI * 2);
  ctx.arc(27, 14, 6.5, 0, Math.PI * 2);
  ctx.fill();
}

function drawOrangutanHead(ctx: CanvasRenderingContext2D): void {
  const { cx, cy, r } = GORILLA.head;
  const fur = APE_FUR.orangutan;
  const face = apeFaceFill("orangutan");

  ctx.fillStyle = fur;
  ctx.beginPath();
  ctx.ellipse(cx - 20, cy + 4, 13, 18, -0.35, 0, Math.PI * 2);
  ctx.ellipse(cx + 20, cy + 4, 13, 18, 0.35, 0, Math.PI * 2);
  ctx.ellipse(cx, cy - 14, 17, 13, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#c44e14";
  ctx.beginPath();
  ctx.ellipse(cx - 17, cy + 7, 12, 15, -0.12, 0, Math.PI * 2);
  ctx.ellipse(cx + 17, cy + 7, 12, 15, 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = APE_FUR.orangutanLight;
  ctx.beginPath();
  ctx.ellipse(cx - 16, cy + 7, 7.5, 10, -0.12, 0, Math.PI * 2);
  ctx.ellipse(cx + 16, cy + 7, 7.5, 10, 0.12, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = fur;
  ctx.beginPath();
  ctx.ellipse(cx, cy - 1, r - 1, r - 2, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = face;
  ctx.beginPath();
  ctx.ellipse(cx, cy - 1, 9.6, 8.4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx, cy + 11, 11, 9.2, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#f3e2c4";
  ctx.beginPath();
  ctx.ellipse(cx - 3.5, cy - 3, 2.7, 3.1, 0, 0, Math.PI * 2);
  ctx.ellipse(cx + 3.5, cy - 3, 2.7, 3.1, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1a1008";
  ctx.beginPath();
  ctx.arc(cx - 3.3, cy - 2.6, 1.55, 0, Math.PI * 2);
  ctx.arc(cx + 3.3, cy - 2.6, 1.55, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f7e7c8";
  ctx.beginPath();
  ctx.arc(cx - 2.7, cy - 3.3, 0.55, 0, Math.PI * 2);
  ctx.arc(cx + 3.9, cy - 3.3, 0.55, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#1a1008";
  ctx.beginPath();
  ctx.ellipse(cx - 2.1, cy + 8.2, 1.7, 1.3, 0, 0, Math.PI * 2);
  ctx.ellipse(cx + 2.1, cy + 8.2, 1.7, 1.3, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#1a1008";
  ctx.lineWidth = 1.7;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(cx - 5.2, cy + 14.2);
  ctx.quadraticCurveTo(cx, cy + 17.4, cx + 5.2, cy + 14.2);
  ctx.stroke();
}

export function drawApe(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  facing: number,
  kind: "gorilla" | "orangutan",
  scale = 1,
): void {
  const fur = kind === "orangutan" ? APE_FUR.orangutan : APE_FUR.gorilla;
  const light = kind === "orangutan" ? APE_FUR.orangutanLight : APE_FUR.gorillaLight;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale((facing < 0 ? -1 : 1) * scale, scale);
  drawApeTorso(ctx, fur, light);
  if (kind === "orangutan") drawOrangutanHead(ctx);
  else drawGorillaHead(ctx, fur);
  drawApeHands(ctx, fur);
  ctx.restore();
}

export function drawAttackGrove(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const trunks = [0.12, 0.3, 0.48, 0.66, 0.84];
  ctx.strokeStyle = "#5c3a1e";
  ctx.lineCap = "round";
  for (const t of trunks) {
    const x = width * t;
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(x, height * 0.62);
    ctx.quadraticCurveTo(x + 10, height * 0.4, x - 4, height * 0.18);
    ctx.stroke();
  }
  ctx.fillStyle = "#245c3b";
  const clumps = [
    [0.1, 0.26], [0.28, 0.22], [0.46, 0.28], [0.64, 0.2], [0.82, 0.27],
    [0.18, 0.38], [0.4, 0.42], [0.58, 0.36], [0.76, 0.4],
  ];
  for (const [tx, ty] of clumps) {
    ctx.beginPath();
    ctx.ellipse(width * tx, height * ty, 48, 28, -0.25, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "#2f7a4e";
  for (const [tx, ty] of clumps) {
    ctx.beginPath();
    ctx.ellipse(width * tx + 10, height * ty + 6, 32, 18, 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function drawAttackLeaves(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  ctx.fillStyle = "rgba(27, 67, 50, 0.72)";
  const leaves = [
    [0.16, 0.34], [0.34, 0.3], [0.52, 0.36], [0.7, 0.29], [0.88, 0.35],
  ];
  for (const [tx, ty] of leaves) {
    ctx.beginPath();
    ctx.ellipse(width * tx, height * ty, 36, 16, -0.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function drawCanopy(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const h = height * 0.2;
  ctx.fillStyle = "#1b4332";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(width, 0);
  ctx.lineTo(width, h * 0.45);
  ctx.quadraticCurveTo(width * 0.7, h * 1.05, width * 0.5, h * 0.55);
  ctx.quadraticCurveTo(width * 0.28, h * 1.1, 0, h * 0.5);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#2d6a4f";
  for (let i = 0; i < 7; i += 1) {
    const x = (width / 7) * i + width / 14;
    ctx.beginPath();
    ctx.ellipse(x, h * 0.35 + (i % 2) * 10, 34, 18, -0.3, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function drawTreeLine(ctx: CanvasRenderingContext2D, width: number, y: number): void {
  ctx.strokeStyle = "#6b4226";
  ctx.lineWidth = 10;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(16, y);
  ctx.quadraticCurveTo(width * 0.5, y - 18, width - 16, y + 4);
  ctx.stroke();
}
