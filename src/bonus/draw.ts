import { drawBanana, drawGorilla } from "../game/draw";
import type { FallingItem } from "../game/entities";
import { worldTheme, type BonusVehicle } from "./milestones";
import { countdownMark, depositCoinT, depositShown, type RideObstacle, type RideState } from "./ride";

interface Scene {
  sky: [string, string];
  ground: string;
  groundDark: string;
  road: string;
  roadEdge: string;
  line: string;
  hill: string;
  hillFar: string;
  sun: string;
  air: boolean;
  water: boolean;
}

function project(w: number, h: number, worldX: number, distance: number): { x: number; y: number; scale: number } {
  const z = Math.max(0.45, distance);
  const scale = (h * 0.9) / z;
  return {
    x: w / 2 + worldX * scale * 0.52,
    y: h * 0.34 + scale * 0.62,
    scale,
  };
}

function scenery(vehicle: BonusVehicle): Scene {
  if (vehicle === "vannscooter") {
    return {
      sky: ["#56cfe1", "#caf0f8"],
      ground: "#0077b6",
      groundDark: "#023e8a",
      road: "#48cae4",
      roadEdge: "#90e0ef",
      line: "#ffffff",
      hill: "#0096c7",
      hillFar: "#48cae4",
      sun: "#ffe66d",
      air: false,
      water: true,
    };
  }
  if (vehicle === "baat") {
    return {
      sky: ["#4ea8de", "#caf0f8"],
      ground: "#1d6a7a",
      groundDark: "#15505c",
      road: "#2a9d8f",
      roadEdge: "#bde0fe",
      line: "#e9f5f3",
      hill: "#2a6f7a",
      hillFar: "#468faf",
      sun: "#ffe66d",
      air: false,
      water: true,
    };
  }
  if (vehicle === "helikopter") {
    return {
      sky: ["#48cae4", "#caf0f8"],
      ground: "#8ecae6",
      groundDark: "#6096ba",
      road: "#90e0ef",
      roadEdge: "#fff",
      line: "#ffffff",
      hill: "#7eb8d4",
      hillFar: "#9ec9dc",
      sun: "#fff3b0",
      air: true,
      water: false,
    };
  }
  if (vehicle === "propellfly" || vehicle === "jetfly") {
    return {
      sky: vehicle === "jetfly" ? ["#01497c", "#89c2d9"] : ["#4cc9f0", "#caf0f8"],
      ground: "#8ecae6",
      groundDark: "#468faf",
      road: "#ade8f4",
      roadEdge: "#fff",
      line: "#ffffff",
      hill: "#7eb8d4",
      hillFar: "#9ec9dc",
      sun: "#fff3b0",
      air: true,
      water: false,
    };
  }
  if (vehicle === "bil") {
    return {
      sky: ["#7eb8d4", "#eef4f8"],
      ground: "#40916c",
      groundDark: "#2d6a4f",
      road: "#495057",
      roadEdge: "#f8f9fa",
      line: "#ffd60a",
      hill: "#52b788",
      hillFar: "#74c69d",
      sun: "#ffe66d",
      air: false,
      water: false,
    };
  }
  return {
    sky: ["#74c0fc", "#d8f3dc"],
    ground: "#52b788",
    groundDark: "#2d6a4f",
    road: "#d4a373",
    roadEdge: "#fff3b0",
    line: "#fff8e7",
    hill: "#40916c",
    hillFar: "#74c69d",
    sun: "#ffe66d",
    air: false,
    water: false,
  };
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

function drawSky(ctx: CanvasRenderingContext2D, w: number, h: number, s: number, colors: Scene): void {
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, colors.sky[0]);
  sky.addColorStop(1, colors.sky[1]);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  const sunX = w * 0.82;
  const sunY = h * 0.14;
  const glow = ctx.createRadialGradient(sunX, sunY, 4, sunX, sunY, 54);
  glow.addColorStop(0, colors.sun);
  glow.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(sunX, sunY, 54, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = colors.sun;
  ctx.beginPath();
  ctx.arc(sunX, sunY, 18, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,0.78)";
  for (let i = 0; i < 5; i += 1) {
    const cx = ((i * 0.28 + s * 0.012) % 1.3) * w - w * 0.12;
    const cy = h * (0.1 + (i % 3) * 0.045);
    ctx.beginPath();
    ctx.ellipse(cx, cy, 38, 16, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 22, cy + 4, 28, 13, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawHills(ctx: CanvasRenderingContext2D, w: number, h: number, colors: Scene): void {
  const horizon = h * 0.34;
  ctx.fillStyle = colors.hillFar;
  ctx.beginPath();
  ctx.moveTo(0, horizon);
  ctx.quadraticCurveTo(w * 0.22, horizon - h * 0.1, w * 0.48, horizon);
  ctx.quadraticCurveTo(w * 0.72, horizon - h * 0.07, w, horizon);
  ctx.lineTo(w, horizon + 2);
  ctx.lineTo(0, horizon + 2);
  ctx.fill();
  ctx.fillStyle = colors.hill;
  ctx.beginPath();
  ctx.moveTo(0, horizon + 2);
  ctx.quadraticCurveTo(w * 0.3, horizon - h * 0.05, w * 0.62, horizon + 4);
  ctx.quadraticCurveTo(w * 0.84, horizon - h * 0.03, w, horizon + 6);
  ctx.lineTo(w, horizon + 18);
  ctx.lineTo(0, horizon + 18);
  ctx.fill();
}

function drawRoad(ctx: CanvasRenderingContext2D, w: number, h: number, s: number, colors: Scene): void {
  const horizon = h * 0.34;
  const ground = ctx.createLinearGradient(0, horizon, 0, h);
  ground.addColorStop(0, colors.ground);
  ground.addColorStop(1, colors.groundDark);
  ctx.fillStyle = ground;
  ctx.fillRect(0, horizon, w, h - horizon);

  ctx.fillStyle = colors.road;
  ctx.beginPath();
  ctx.moveTo(w * 0.5 - 22, horizon);
  ctx.lineTo(w * 0.5 + 22, horizon);
  ctx.lineTo(w * 0.96, h);
  ctx.lineTo(w * 0.04, h);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = colors.roadEdge;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(w * 0.5 - 20, horizon);
  ctx.lineTo(w * 0.07, h);
  ctx.moveTo(w * 0.5 + 20, horizon);
  ctx.lineTo(w * 0.93, h);
  ctx.stroke();

  ctx.strokeStyle = colors.line;
  ctx.lineWidth = 5;
  ctx.setLineDash([22, 18]);
  ctx.lineDashOffset = -s * 34;
  ctx.beginPath();
  ctx.moveTo(w / 2, horizon);
  ctx.lineTo(w / 2, h);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawTree(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  ctx.fillStyle = "#6b4226";
  ctx.fillRect(x - size * 0.08, y - size * 0.15, size * 0.16, size * 0.45);
  ctx.fillStyle = "#2d6a4f";
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.28, size * 0.34, size * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#40916c";
  ctx.beginPath();
  ctx.ellipse(x - size * 0.08, y - size * 0.34, size * 0.22, size * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawReed(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  ctx.strokeStyle = "#95d5b2";
  ctx.lineWidth = Math.max(2, size * 0.06);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + size * 0.12, y - size * 0.3, x, y - size * 0.55);
  ctx.stroke();
  ctx.fillStyle = "#d8f3dc";
  ctx.beginPath();
  ctx.ellipse(x + 2, y - size * 0.55, size * 0.1, size * 0.18, 0.4, 0, Math.PI * 2);
  ctx.fill();
}

function drawSides(ctx: CanvasRenderingContext2D, w: number, h: number, s: number, colors: Scene): void {
  for (let i = 0; i < 16; i += 1) {
    const dist = ((i * 3.6 - s * 0.9) % 26 + 26) % 26 + 1.4;
    const size = Math.min(120, Math.max(14, project(w, h, 0, dist).scale * 0.16));
    const left = project(w, h, -1.55, dist);
    const right = project(w, h, 1.55, dist);
    if (colors.air) {
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.beginPath();
      ctx.ellipse(left.x, left.y - size * 0.4, size * 0.5, size * 0.2, 0, 0, Math.PI * 2);
      ctx.ellipse(right.x, right.y - size * 0.5, size * 0.45, size * 0.18, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (colors.water) {
      drawReed(ctx, left.x, left.y, size);
      drawReed(ctx, right.x, right.y, size);
    } else {
      drawTree(ctx, left.x, left.y, size);
      drawTree(ctx, right.x, right.y, size);
    }
  }
}

function dummyBanana(size: number, rot: number): FallingItem {
  return {
    id: 0,
    kind: "banana",
    value: 1,
    x: -size / 2,
    y: -size / 2,
    w: size,
    h: size,
    vy: 0,
    rot,
    spin: 0,
  };
}

function drawCrate(ctx: CanvasRenderingContext2D, size: number): void {
  const x = -size * 0.58;
  const y = -size * 0.5;
  const w = size * 1.16;
  const h = size;
  const wood = ctx.createLinearGradient(x, y, x + w, y + h);
  wood.addColorStop(0, "#e09f3e");
  wood.addColorStop(0.5, "#c97c28");
  wood.addColorStop(1, "#9c6644");
  ctx.fillStyle = wood;
  roundRect(ctx, x, y, w, h, 6);
  ctx.fill();
  ctx.strokeStyle = "#6b3f12";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = "rgba(107, 63, 18, 0.28)";
  ctx.fillRect(x + 6, y + h * 0.28, w - 12, 5);
  ctx.fillRect(x + 6, y + h * 0.58, w - 12, 5);
  ctx.strokeStyle = "#6b3f12";
  ctx.strokeRect(x + 8, y + 8, w - 16, h - 16);
  ctx.save();
  ctx.translate(0, size * 0.04);
  ctx.scale(size / 70, size / 70);
  drawBanana(ctx, dummyBanana(28, -0.5));
  ctx.restore();
}

function drawBook(ctx: CanvasRenderingContext2D, size: number): void {
  ctx.save();
  ctx.translate(-size * 0.06, 0);
  ctx.fillStyle = "#1d3557";
  roundRect(ctx, -size * 0.42, -size * 0.58, size * 0.92, size * 1.12, 5);
  ctx.fill();
  ctx.fillStyle = "#f8f1e3";
  roundRect(ctx, -size * 0.32, -size * 0.5, size * 0.78, size * 1.02, 3);
  ctx.fill();
  ctx.fillStyle = "#e63946";
  ctx.fillRect(-size * 0.42, -size * 0.58, size * 0.12, size * 1.12);
  ctx.fillStyle = "#1d3557";
  ctx.font = `bold ${Math.max(12, size * 0.28)}px Nunito, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("3+?", size * 0.08, 0);
  ctx.restore();
}

function drawSeaBanana(ctx: CanvasRenderingContext2D, size: number): void {
  drawBanana(ctx, dummyBanana(size, -0.45));
  ctx.fillStyle = "rgba(224, 108, 45, 0.42)";
  ctx.beginPath();
  ctx.ellipse(2, 2, size * 0.28, size * 0.16, -0.5, 0, Math.PI * 2);
  ctx.fill();
}

function drawFlyingBanana(ctx: CanvasRenderingContext2D, size: number): void {
  ctx.fillStyle = "#fff8e7";
  ctx.beginPath();
  ctx.ellipse(-size * 0.28, -size * 0.08, size * 0.22, size * 0.08, -0.4, 0, Math.PI * 2);
  ctx.ellipse(size * 0.3, 0, size * 0.22, size * 0.08, 0.4, 0, Math.PI * 2);
  ctx.fill();
  drawBanana(ctx, dummyBanana(size, -0.85));
}

function drawBuoy(ctx: CanvasRenderingContext2D, size: number): void {
  ctx.fillStyle = "#e63946";
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.42, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff8e7";
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.28, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#e63946";
  ctx.fillRect(-size * 0.06, -size * 0.62, size * 0.12, size * 0.28);
  ctx.save();
  ctx.scale(size / 70, size / 70);
  drawBanana(ctx, dummyBanana(22, -0.4));
  ctx.restore();
}

function drawDiver(ctx: CanvasRenderingContext2D, size: number): void {
  ctx.fillStyle = "#1d3557";
  ctx.beginPath();
  ctx.ellipse(0, size * 0.12, size * 0.22, size * 0.34, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#90e0ef";
  ctx.beginPath();
  ctx.arc(0, -size * 0.22, size * 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#1d3557";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = "#1d3557";
  ctx.font = `bold ${Math.max(11, size * 0.28)}px Nunito, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("?", 0, -size * 0.2);
  ctx.fillStyle = "#f4d35e";
  ctx.fillRect(-size * 0.18, size * 0.38, size * 0.14, size * 0.08);
  ctx.fillRect(size * 0.04, size * 0.38, size * 0.14, size * 0.08);
}

function drawCrow(ctx: CanvasRenderingContext2D, size: number): void {
  ctx.fillStyle = "#212529";
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.32, size * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(size * 0.22, -size * 0.08, size * 0.14, size * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f4d35e";
  ctx.beginPath();
  ctx.moveTo(size * 0.32, -size * 0.06);
  ctx.lineTo(size * 0.5, 0);
  ctx.lineTo(size * 0.32, size * 0.04);
  ctx.fill();
  ctx.fillStyle = "#212529";
  ctx.beginPath();
  ctx.moveTo(-size * 0.1, -size * 0.06);
  ctx.quadraticCurveTo(-size * 0.4, -size * 0.28, -size * 0.05, size * 0.02);
  ctx.fill();
  ctx.save();
  ctx.translate(size * 0.38, size * 0.12);
  ctx.scale(size / 90, size / 90);
  drawBanana(ctx, dummyBanana(20, 0.4));
  ctx.restore();
}

function drawCloud(ctx: CanvasRenderingContext2D, size: number): void {
  ctx.fillStyle = "#fff8e7";
  ctx.beginPath();
  ctx.ellipse(-size * 0.18, 0, size * 0.28, size * 0.2, 0, 0, Math.PI * 2);
  ctx.ellipse(size * 0.16, 0, size * 0.3, size * 0.22, 0, 0, Math.PI * 2);
  ctx.ellipse(0, -size * 0.14, size * 0.24, size * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1d3557";
  ctx.font = `bold ${Math.max(11, size * 0.26)}px Nunito, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("3+?", 0, 0);
}

function drawObstacle(
  ctx: CanvasRenderingContext2D,
  obs: RideObstacle,
  playerS: number,
  w: number,
  h: number,
  theme: ReturnType<typeof worldTheme>,
): void {
  const dist = obs.s - playerS;
  if (dist < 0.28 || dist > 28 || obs.resolved) return;
  const p = project(w, h, obs.x, dist);
  ctx.save();
  ctx.translate(p.x, p.y);
  const size = Math.min(150, Math.max(18, p.scale * 0.2));
  if (obs.kind === "banana") {
    if (theme === "water") drawSeaBanana(ctx, size);
    else if (theme === "air") drawFlyingBanana(ctx, size);
    else drawBanana(ctx, dummyBanana(size, -0.55));
  } else if (obs.kind === "crate") {
    if (theme === "water") drawBuoy(ctx, size);
    else if (theme === "air") drawCrow(ctx, size);
    else drawCrate(ctx, size);
  } else if (theme === "water") {
    drawDiver(ctx, size);
  } else if (theme === "air") {
    drawCloud(ctx, size);
  } else {
    drawBook(ctx, size);
  }
  ctx.restore();
}

function drawWheel(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void {
  ctx.fillStyle = "#212529";
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#adb5bd";
  ctx.beginPath();
  ctx.arc(x, y, r * 0.42, 0, Math.PI * 2);
  ctx.fill();
}

function drawVehicle(ctx: CanvasRenderingContext2D, vehicle: BonusVehicle, s: number): void {
  if (vehicle === "vannscooter") {
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.beginPath();
    ctx.ellipse(8, 34, 58, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#e63946";
    ctx.beginPath();
    ctx.moveTo(-46, 10);
    ctx.lineTo(52, 6);
    ctx.lineTo(44, 26);
    ctx.lineTo(-38, 26);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#1d3557";
    roundRect(ctx, -8, -8, 22, 20, 5);
    ctx.fill();
    ctx.strokeStyle = "#212529";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(4, -8);
    ctx.lineTo(-10, -22);
    ctx.lineTo(18, -22);
    ctx.stroke();
    return;
  }
  if (vehicle === "baat") {
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.beginPath();
    ctx.ellipse(0, 36, 70, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#bc6c25";
    ctx.beginPath();
    ctx.moveTo(-62, 8);
    ctx.lineTo(68, 10);
    ctx.lineTo(40, 34);
    ctx.lineTo(-42, 34);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#fff3b0";
    roundRect(ctx, -18, -10, 36, 22, 6);
    ctx.fill();
    ctx.fillStyle = "#e63946";
    ctx.fillRect(48, -18, 4, 28);
    ctx.beginPath();
    ctx.moveTo(52, -18);
    ctx.lineTo(72, -8);
    ctx.lineTo(52, 0);
    ctx.fill();
    return;
  }
  if (vehicle === "helikopter") {
    ctx.strokeStyle = "#495057";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-8, -22);
    ctx.lineTo(70, 8);
    ctx.stroke();
    ctx.save();
    ctx.translate(-2, -26);
    ctx.rotate(s * 8);
    ctx.strokeStyle = "#6c757d";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-54, 0);
    ctx.lineTo(54, 0);
    ctx.moveTo(0, -8);
    ctx.lineTo(0, 8);
    ctx.stroke();
    ctx.restore();
    ctx.fillStyle = "#ced4da";
    roundRect(ctx, -36, -8, 64, 30, 12);
    ctx.fill();
    ctx.fillStyle = "#4cc9f0";
    ctx.beginPath();
    ctx.ellipse(-6, 2, 16, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#343a40";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-28, 22);
    ctx.lineTo(-40, 34);
    ctx.moveTo(16, 22);
    ctx.lineTo(28, 34);
    ctx.stroke();
    return;
  }
  if (vehicle === "jetfly") {
    ctx.fillStyle = "#adb5bd";
    ctx.beginPath();
    ctx.moveTo(-70, 16);
    ctx.lineTo(8, 4);
    ctx.lineTo(78, 10);
    ctx.lineTo(10, 20);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#ced4da";
    ctx.beginPath();
    ctx.moveTo(-36, 4);
    ctx.lineTo(62, -2);
    ctx.lineTo(68, 10);
    ctx.lineTo(-28, 18);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#4cc9f0";
    ctx.fillRect(18, -2, 16, 10);
    ctx.fillStyle = "#6c757d";
    ctx.fillRect(-8, 16, 16, 8);
    ctx.fillRect(22, 16, 16, 8);
    return;
  }
  if (vehicle === "propellfly") {
    const span = 62;
    ctx.fillStyle = "#adb5bd";
    ctx.beginPath();
    ctx.moveTo(-span, 12);
    ctx.lineTo(span, 12);
    ctx.lineTo(span - 10, 22);
    ctx.lineTo(-span + 10, 22);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#dee2e6";
    roundRect(ctx, -30, -10, 78, 28, 10);
    ctx.fill();
    ctx.fillStyle = "#4cc9f0";
    ctx.fillRect(-8, -4, 14, 12);
    ctx.fillRect(10, -4, 10, 12);
    ctx.fillStyle = "#6c757d";
    ctx.save();
    ctx.translate(-32, 4);
    ctx.rotate(s * 10);
    ctx.fillRect(-3, -16, 6, 32);
    ctx.restore();
    return;
  }
  if (vehicle === "bil") {
    ctx.fillStyle = "#e63946";
    roundRect(ctx, -52, -6, 104, 32, 10);
    ctx.fill();
    ctx.fillStyle = "#1d3557";
    roundRect(ctx, -24, -26, 48, 24, 8);
    ctx.fill();
    ctx.fillStyle = "#90e0ef";
    roundRect(ctx, -18, -20, 36, 14, 5);
    ctx.fill();
    ctx.fillStyle = "#fff3b0";
    ctx.beginPath();
    ctx.arc(-40, 2, 5, 0, Math.PI * 2);
    ctx.arc(44, 2, 5, 0, Math.PI * 2);
    ctx.fill();
    drawWheel(ctx, -32, 26, 11);
    drawWheel(ctx, 30, 26, 11);
    return;
  }
  ctx.fillStyle = "#c9782a";
  roundRect(ctx, -46, 0, 92, 26, 6);
  ctx.fill();
  ctx.strokeStyle = "#6b3f12";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = "#fff3b0";
  ctx.fillRect(-18, 6, 36, 8);
  ctx.strokeStyle = "#6b4226";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-20, 2);
  ctx.lineTo(-8, -16);
  ctx.lineTo(8, -16);
  ctx.lineTo(20, 2);
  ctx.stroke();
  drawWheel(ctx, -28, 28, 10);
  drawWheel(ctx, 28, 28, 10);
}

function bankAnchor(w: number, h: number, dist: number, arrived: boolean): { x: number; y: number; scale: number } {
  const visual = arrived ? 1.22 : 1.35 + Math.max(0, dist) * 0.38;
  return project(w, h, 0, visual);
}

function drawBank(ctx: CanvasRenderingContext2D, w: number, h: number, dist: number, arrived: boolean, glow = 0): void {
  if (dist > 10 && !arrived) return;
  const bank = bankAnchor(w, h, dist, arrived);
  const unit = bank.scale;
  const x = bank.x;
  const y = bank.y;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "rgba(27, 20, 12, 0.22)";
  ctx.beginPath();
  ctx.ellipse(0, unit * 0.08, unit * 0.62, unit * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#d4a373";
  ctx.beginPath();
  ctx.moveTo(-unit * 0.55, -unit * 0.02);
  ctx.lineTo(unit * 0.55, -unit * 0.02);
  ctx.lineTo(unit * 0.42, unit * 0.1);
  ctx.lineTo(-unit * 0.42, unit * 0.1);
  ctx.closePath();
  ctx.fill();

  const body = ctx.createLinearGradient(-unit * 0.4, -unit * 0.7, unit * 0.4, unit * 0.05);
  body.addColorStop(0, "#fff3b0");
  body.addColorStop(0.55, "#f4d35e");
  body.addColorStop(1, "#e09f3e");
  ctx.fillStyle = body;
  roundRect(ctx, -unit * 0.46, -unit * 0.62, unit * 0.92, unit * 0.62, 6);
  ctx.fill();
  ctx.strokeStyle = "#9c6644";
  ctx.lineWidth = Math.max(2, unit * 0.015);
  ctx.stroke();

  ctx.fillStyle = "#c1121f";
  ctx.beginPath();
  ctx.moveTo(-unit * 0.52, -unit * 0.58);
  ctx.lineTo(0, -unit * 0.86);
  ctx.lineTo(unit * 0.52, -unit * 0.58);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#fff8e7";
  ctx.font = `bold ${Math.max(13, unit * 0.11)}px Nunito, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("BANK", 0, -unit * 0.66);

  ctx.fillStyle = "#fff8e7";
  for (const col of [-0.28, -0.1, 0.1, 0.28]) {
    roundRect(ctx, unit * col - unit * 0.045, -unit * 0.52, unit * 0.09, unit * 0.38, 4);
    ctx.fill();
  }

  ctx.fillStyle = "#6b4226";
  roundRect(ctx, -unit * 0.09, -unit * 0.28, unit * 0.18, unit * 0.26, 8);
  ctx.fill();
  ctx.fillStyle = "#f4d35e";
  ctx.beginPath();
  ctx.arc(0, -unit * 0.36, unit * 0.07, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#c2780a";
  ctx.font = `bold ${Math.max(10, unit * 0.07)}px Nunito, sans-serif`;
  ctx.fillText("B", 0, -unit * 0.36);

  ctx.fillStyle = "#90e0ef";
  roundRect(ctx, -unit * 0.36, -unit * 0.42, unit * 0.12, unit * 0.12, 3);
  ctx.fill();
  roundRect(ctx, unit * 0.24, -unit * 0.42, unit * 0.12, unit * 0.12, 3);
  ctx.fill();

  ctx.fillStyle = "#e63946";
  ctx.fillRect(unit * 0.34, -unit * 0.84, unit * 0.025, unit * 0.2);
  ctx.beginPath();
  ctx.moveTo(unit * 0.365, -unit * 0.84);
  ctx.lineTo(unit * 0.5, -unit * 0.78);
  ctx.lineTo(unit * 0.365, -unit * 0.72);
  ctx.fill();

  if (glow > 0) {
    ctx.fillStyle = `rgba(255, 243, 176, ${0.18 + glow * 0.35})`;
    ctx.beginPath();
    ctx.ellipse(0, -unit * 0.18, unit * 0.16 + glow * 8, unit * 0.2 + glow * 6, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function quadPoint(a: { x: number; y: number }, b: { x: number; y: number }, c: { x: number; y: number }, t: number): { x: number; y: number } {
  const u = 1 - t;
  return {
    x: u * u * a.x + 2 * u * t * b.x + t * t * c.x,
    y: u * u * a.y + 2 * u * t * b.y + t * t * c.y,
  };
}

function drawDeposit(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  ride: RideState,
  apeX: number,
  apeY: number,
  score: number,
  label: string,
): void {
  if (ride.phase !== "bank") return;
  const door = bankAnchor(w, h, 0, true);
  const from = { x: apeX, y: apeY };
  const to = { x: door.x, y: door.y - door.scale * 0.18 };
  let piled = 0;
  for (let i = 0; i < 7; i += 1) {
    const t = depositCoinT(ride.hold, i);
    if (t <= 0) continue;
    if (t >= 1) {
      piled += 1;
      continue;
    }
    const mid = {
      x: (from.x + to.x) / 2 + (i - 3) * 22,
      y: Math.min(from.y, to.y) - 110 - i * 6,
    };
    const p = quadPoint(from, mid, to, t);
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.globalAlpha = 1 - t * 0.15;
    drawBanana(ctx, dummyBanana(36, -0.4 + i * 0.08));
    ctx.restore();
  }
  for (let i = 0; i < piled; i += 1) {
    ctx.save();
    ctx.translate(to.x + (i % 3) * 10 - 10, to.y + 10 + Math.floor(i / 3) * 8);
    ctx.scale(0.7, 0.7);
    drawBanana(ctx, dummyBanana(28, -0.3));
    ctx.restore();
  }

  const shown = depositShown(ride.hold, score);
  const pop = 1 + Math.min(0.08, shown / Math.max(1, score) * 0.08);
  ctx.save();
  ctx.translate(w / 2, h * 0.16);
  ctx.scale(pop, pop);
  ctx.fillStyle = "rgba(27, 20, 12, 0.18)";
  roundRect(ctx, -86, 6, 172, 78, 18);
  ctx.fill();
  ctx.fillStyle = "#fff8e7";
  roundRect(ctx, -90, 0, 180, 78, 18);
  ctx.fill();
  ctx.strokeStyle = "#c2780a";
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.fillStyle = "#1b4332";
  ctx.font = "800 16px Nunito, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, 0, 22);
  ctx.fillStyle = "#c2780a";
  ctx.font = "900 34px Nunito, sans-serif";
  ctx.fillText(String(shown), 0, 52);
  ctx.restore();
}

function drawCountdown(ctx: CanvasRenderingContext2D, w: number, h: number, ride: RideState, goLabel: string): void {
  if (ride.phase !== "countdown") return;
  const mark = countdownMark(ride.hold);
  if (mark === null) return;
  const beat = ride.hold % 1;
  const pop = 1 + (1 - beat) * 0.22;
  const label = mark === "go" ? goLabel : String(mark);
  ctx.save();
  ctx.translate(w / 2, h * 0.38);
  ctx.scale(pop, pop);
  ctx.fillStyle = "rgba(27, 20, 12, 0.28)";
  ctx.beginPath();
  ctx.arc(0, 8, 58, 0, Math.PI * 2);
  ctx.fill();
  const disc = ctx.createRadialGradient(-12, -14, 8, 0, 0, 56);
  disc.addColorStop(0, "#fff3b0");
  disc.addColorStop(1, "#f4d35e");
  ctx.fillStyle = disc;
  ctx.beginPath();
  ctx.arc(0, 0, 54, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#c2780a";
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.fillStyle = "#1b4332";
  ctx.font = `900 ${mark === "go" ? 28 : 52}px Nunito, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, 0, 2);
  ctx.restore();
}

export function drawBonusRide(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  ride: RideState,
  vehicle: BonusVehicle,
  goLabel = "Start!",
  extras: { score?: number; depositLabel?: string } = {},
): void {
  const colors = scenery(vehicle);
  const arrived = ride.phase === "bank";
  const glow = arrived ? Math.min(1, ride.hold / 1.4) : 0;
  drawSky(ctx, w, h, ride.s, colors);
  drawHills(ctx, w, h, colors);
  drawRoad(ctx, w, h, ride.s, colors);
  drawSides(ctx, w, h, ride.s, colors);
  drawBank(ctx, w, h, ride.track - ride.s, arrived, glow);

  const theme = worldTheme(vehicle);
  const ordered = [...ride.obstacles].sort((a, b) => b.s - a.s);
  for (const obs of ordered) drawObstacle(ctx, obs, ride.s, w, h, theme);

  const apeX = w / 2 + ride.x * w * 0.3;
  const apeY = h - 96;
  const tilt = ride.phase === "crash" ? 0.55 : ride.spin;
  ctx.save();
  ctx.fillStyle = "rgba(27, 20, 12, 0.28)";
  ctx.beginPath();
  ctx.ellipse(apeX, apeY + 52, 58, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.translate(apeX, apeY + 18);
  ctx.rotate(tilt);
  ctx.scale(1.28, 1.28);
  ctx.translate(0, -14);
  drawVehicle(ctx, vehicle, ride.s);
  drawGorilla(ctx, 0, 0, 1, "back");
  ctx.restore();
  drawDeposit(ctx, w, h, ride, apeX, apeY, extras.score ?? 0, extras.depositLabel ?? "Poeng i banken");
  drawCountdown(ctx, w, h, ride, goLabel);
}
