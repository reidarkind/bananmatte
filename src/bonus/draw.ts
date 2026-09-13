import { drawGorilla } from "../game/draw";
import type { BonusVehicle } from "./milestones";
import type { RideObstacle, RideState } from "./ride";

function project(w: number, h: number, worldX: number, distance: number): { x: number; y: number; scale: number } {
  const z = Math.max(0.45, distance);
  const scale = (h * 0.82) / z;
  return {
    x: w / 2 + worldX * scale * 0.55,
    y: h * 0.36 + scale * 0.72,
    scale,
  };
}

function scenery(vehicle: BonusVehicle): { sky: [string, string]; ground: string; road: string; line: string } {
  if (vehicle === "baat") return { sky: ["#7ec8e3", "#c8e7f0"], ground: "#1d6a7a", road: "#2a9d8f", line: "#e9f5f3" };
  if (vehicle === "helikopter" || vehicle === "lite-fly" || vehicle === "stort-fly") {
    return { sky: ["#4cc9f0", "#bde0fe"], ground: "#8ecae6", road: "#90e0ef", line: "#fff" };
  }
  if (vehicle === "bil") return { sky: ["#89c2d9", "#e9ecef"], ground: "#40916c", road: "#495057", line: "#ffd60a" };
  return { sky: ["#74c0fc", "#d8f3dc"], ground: "#52b788", road: "#d4a373", line: "#fff3b0" };
}

function drawRoad(ctx: CanvasRenderingContext2D, w: number, h: number, s: number, colors: ReturnType<typeof scenery>): void {
  const horizon = h * 0.36;
  ctx.fillStyle = colors.ground;
  ctx.fillRect(0, horizon, w, h - horizon);
  ctx.fillStyle = colors.road;
  ctx.beginPath();
  ctx.moveTo(w * 0.5 - 18, horizon);
  ctx.lineTo(w * 0.5 + 18, horizon);
  ctx.lineTo(w * 0.92, h);
  ctx.lineTo(w * 0.08, h);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = colors.line;
  ctx.lineWidth = 4;
  ctx.setLineDash([18, 22]);
  ctx.lineDashOffset = -s * 28;
  ctx.beginPath();
  ctx.moveTo(w / 2, horizon);
  ctx.lineTo(w / 2, h);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawObstacle(ctx: CanvasRenderingContext2D, obs: RideObstacle, playerS: number, w: number, h: number): void {
  const dist = obs.s - playerS;
  if (dist < 0.35 || dist > 26 || obs.resolved) return;
  const p = project(w, h, obs.x, dist);
  ctx.save();
  ctx.translate(p.x, p.y);
  const size = Math.min(86, Math.max(10, p.scale * 0.12));
  if (obs.kind === "banana") {
    ctx.fillStyle = "#f4d35e";
    ctx.strokeStyle = "#c2780a";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.7, size * 0.38, -0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (obs.kind === "crate") {
    ctx.fillStyle = "#c97c28";
    ctx.strokeStyle = "#6b3f12";
    ctx.lineWidth = 2;
    ctx.fillRect(-size * 0.55, -size * 0.45, size * 1.1, size * 0.9);
    ctx.strokeRect(-size * 0.55, -size * 0.45, size * 1.1, size * 0.9);
    ctx.beginPath();
    ctx.moveTo(-size * 0.55, -size * 0.05);
    ctx.lineTo(size * 0.55, -size * 0.05);
    ctx.stroke();
  } else {
    ctx.fillStyle = "#f8f1e3";
    ctx.strokeStyle = "#3d405b";
    ctx.lineWidth = 2;
    ctx.fillRect(-size * 0.4, -size * 0.55, size * 0.8, size * 1.05);
    ctx.strokeRect(-size * 0.4, -size * 0.55, size * 0.8, size * 1.05);
    ctx.fillStyle = "#1d3557";
    ctx.font = `${Math.max(10, size * 0.45)}px sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText("3+?", 0, size * 0.1);
  }
  ctx.restore();
}

function drawVehicle(ctx: CanvasRenderingContext2D, vehicle: BonusVehicle, x: number, y: number): void {
  ctx.save();
  ctx.translate(x, y + 28);
  if (vehicle === "baat") {
    ctx.fillStyle = "#bc6c25";
    ctx.beginPath();
    ctx.moveTo(-48, 8);
    ctx.lineTo(52, 8);
    ctx.lineTo(28, 28);
    ctx.lineTo(-32, 28);
    ctx.closePath();
    ctx.fill();
  } else if (vehicle === "helikopter") {
    ctx.fillStyle = "#6c757d";
    ctx.fillRect(-40, -8, 80, 10);
    ctx.fillStyle = "#adb5bd";
    ctx.fillRect(-28, 0, 56, 22);
  } else if (vehicle === "lite-fly" || vehicle === "stort-fly") {
    const span = vehicle === "stort-fly" ? 70 : 48;
    ctx.fillStyle = "#ced4da";
    ctx.fillRect(-span, 6, span * 2, 10);
    ctx.fillStyle = "#adb5bd";
    ctx.fillRect(-22, -6, 56, 22);
  } else if (vehicle === "bil") {
    ctx.fillStyle = "#e63946";
    ctx.fillRect(-40, 0, 80, 24);
    ctx.fillStyle = "#1d3557";
    ctx.fillRect(-22, -14, 44, 18);
  } else {
    ctx.fillStyle = "#c9782a";
    ctx.fillRect(-36, 4, 72, 22);
    ctx.strokeStyle = "#6b3f12";
    ctx.strokeRect(-36, 4, 72, 22);
    ctx.fillStyle = "#6b4226";
    ctx.beginPath();
    ctx.arc(-26, 28, 8, 0, Math.PI * 2);
    ctx.arc(26, 28, 8, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function drawBonusRide(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  ride: RideState,
  vehicle: BonusVehicle,
): void {
  const colors = scenery(vehicle);
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, colors.sky[0]);
  sky.addColorStop(1, colors.sky[1]);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);
  drawRoad(ctx, w, h, ride.s, colors);

  const bankDist = ride.track - ride.s;
  if (bankDist < 24) {
    const bank = project(w, h, 0, Math.max(0.8, bankDist));
    ctx.fillStyle = "#f4d35e";
    ctx.fillRect(bank.x - bank.scale * 0.18, bank.y - bank.scale * 0.28, bank.scale * 0.36, bank.scale * 0.28);
    ctx.fillStyle = "#1d3557";
    ctx.font = `${Math.max(11, bank.scale * 0.08)}px sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText("BANK", bank.x, bank.y - bank.scale * 0.12);
  }

  const ordered = [...ride.obstacles].sort((a, b) => b.s - a.s);
  for (const obs of ordered) drawObstacle(ctx, obs, ride.s, w, h);

  const apeX = w / 2 + ride.x * w * 0.28;
  const apeY = h - 78;
  drawVehicle(ctx, vehicle, apeX, apeY);
  drawGorilla(ctx, apeX, apeY, 1, "back");
}
