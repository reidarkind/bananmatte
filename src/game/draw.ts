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

export function drawBanana(ctx: CanvasRenderingContext2D, item: FallingItem): void {
  ctx.save();
  ctx.translate(item.x + item.w / 2, item.y + item.h / 2);
  ctx.rotate(item.rot);
  ctx.scale(item.w / 36, item.h / 36);
  if (item.kind === "rotten") {
    ctx.fillStyle = "#6c584c";
    ctx.beginPath();
    ctx.ellipse(0, 4, 16, 11, 0.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#3d405b";
    ctx.fillRect(-2, -16, 4, 8);
    ctx.fillStyle = "#588157";
    ctx.beginPath();
    ctx.arc(6, 2, 3, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = "#f4d35e";
    ctx.beginPath();
    ctx.ellipse(0, 4, 16, 11, 0.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#e09f3e";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "#6b4226";
    ctx.fillRect(-2, -16, 4, 8);
    if (item.value > 1) {
      ctx.fillStyle = "#1b4332";
      ctx.font = "bold 14px Nunito, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(item.value), 0, 6);
    }
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
