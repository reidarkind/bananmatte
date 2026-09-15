import { APE_FUR, apeFaceFill, drawBanana } from "../game/draw";
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

function drawHills(ctx: CanvasRenderingContext2D, w: number, h: number, colors: Scene, path: PathStyle): void {
  const horizon = h * 0.34;
  if (path === "sky") {
    ctx.fillStyle = "rgba(90, 140, 90, 0.22)";
    ctx.beginPath();
    ctx.moveTo(0, horizon);
    ctx.quadraticCurveTo(w * 0.28, horizon - 8, w * 0.5, horizon);
    ctx.quadraticCurveTo(w * 0.78, horizon - 6, w, horizon);
    ctx.lineTo(w, horizon + 5);
    ctx.lineTo(0, horizon + 5);
    ctx.fill();
    return;
  }
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
  if (path === "waves") {
    ctx.fillStyle = "#ffe8c2";
    ctx.beginPath();
    ctx.ellipse(w * 0.22, horizon + 10, 46, 6, 0, 0, Math.PI * 2);
    ctx.ellipse(w * 0.78, horizon + 12, 38, 5, 0, 0, Math.PI * 2);
    ctx.fill();
  }
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

function drawWaves(ctx: CanvasRenderingContext2D, w: number, h: number, s: number, colors: Scene): void {
  const horizon = h * 0.34;
  const water = ctx.createLinearGradient(0, horizon, 0, h);
  water.addColorStop(0, colors.groundDark);
  water.addColorStop(0.28, colors.ground);
  water.addColorStop(0.7, "#48cae4");
  water.addColorStop(1, "#0077b6");
  ctx.fillStyle = water;
  ctx.fillRect(0, horizon, w, h - horizon);

  const glitter = ctx.createLinearGradient(w * 0.62, horizon, w * 0.78, h * 0.62);
  glitter.addColorStop(0, "rgba(255,255,255,0.28)");
  glitter.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = glitter;
  ctx.beginPath();
  ctx.moveTo(w * 0.68, horizon);
  ctx.lineTo(w * 0.86, h * 0.58);
  ctx.lineTo(w * 0.74, h * 0.6);
  ctx.closePath();
  ctx.fill();

  for (let i = 0; i < 20; i += 1) {
    const dist = ((i * 1.55 - s * 0.62) % 24 + 24) % 24 + 0.55;
    const p = project(w, h, 0, dist);
    if (p.y < horizon + 3 || p.y > h + 8) continue;
    const near = Math.min(1, (p.y - horizon) / (h - horizon));
    const amp = 1.2 + near * 11;
    ctx.strokeStyle = `rgba(255,255,255,${0.1 + near * 0.42})`;
    ctx.lineWidth = 1 + near * 2.4;
    ctx.beginPath();
    for (let x = 0; x <= w; x += 10) {
      const y =
        p.y +
        Math.sin(x * 0.016 + s * 1.1 + i * 0.7) * amp +
        Math.sin(x * 0.04 + s * 0.6 + i) * amp * 0.28;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  ctx.fillStyle = "rgba(255,255,255,0.22)";
  for (let i = 0; i < 9; i += 1) {
    const x = ((i * 0.17 + s * 0.03) % 1) * w;
    const y = h * (0.55 + (i % 4) * 0.1);
    ctx.beginPath();
    ctx.ellipse(x, y, 18 + (i % 3) * 8, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawWake(ctx: CanvasRenderingContext2D, w: number, h: number, apeX: number, apeY: number, s: number): void {
  ctx.save();
  ctx.lineCap = "round";
  ctx.strokeStyle = "rgba(255,255,255,0.58)";
  ctx.lineWidth = 8;
  ctx.setLineDash([16, 12]);
  ctx.lineDashOffset = s * 48;
  ctx.beginPath();
  ctx.moveTo(apeX - 10, apeY + 38);
  ctx.quadraticCurveTo(apeX - 38, apeY + 88, apeX - 72, h + 12);
  ctx.moveTo(apeX + 10, apeY + 38);
  ctx.quadraticCurveTo(apeX + 38, apeY + 88, apeX + 72, h + 12);
  ctx.stroke();
  ctx.strokeStyle = "rgba(202, 240, 248, 0.42)";
  ctx.lineWidth = 14;
  ctx.setLineDash([10, 14]);
  ctx.lineDashOffset = s * 62;
  ctx.beginPath();
  ctx.moveTo(apeX, apeY + 44);
  ctx.lineTo(apeX, h + 10);
  ctx.stroke();
  ctx.setLineDash([]);
  for (let i = 0; i < 14; i += 1) {
    const t = (i / 14 + s * 0.28) % 1;
    const y = apeY + 42 + t * (h - apeY - 20);
    const spread = 10 + t * 58;
    const side = i % 2 === 0 ? -1 : 1;
    ctx.fillStyle = `rgba(255,255,255,${0.58 * (1 - t)})`;
    ctx.beginPath();
    ctx.ellipse(Math.max(8, Math.min(w - 8, apeX + side * spread + Math.sin(s * 6 + i) * 3)), y, 7 + t * 11, 3.5 + t * 3, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawSkyCourse(ctx: CanvasRenderingContext2D, w: number, h: number, s: number): void {
  const horizon = h * 0.34;
  const air = ctx.createLinearGradient(0, horizon, 0, h);
  air.addColorStop(0, "rgba(255,255,255,0.06)");
  air.addColorStop(1, "rgba(173, 216, 230, 0.38)");
  ctx.fillStyle = air;
  ctx.fillRect(0, horizon, w, h - horizon);

  for (let i = 0; i < 12; i += 1) {
    const dist = ((i * 3.1 - s * 0.68) % 30 + 30) % 30 + 1.6;
    const side = i % 2 === 0 ? -1.05 : 1.05;
    const p = project(w, h, side, dist);
    const size = Math.min(88, Math.max(12, p.scale * 0.15));
    ctx.fillStyle = "rgba(255,255,255,0.62)";
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, size * 0.72, size * 0.22, 0, 0, Math.PI * 2);
    ctx.ellipse(p.x + size * 0.28, p.y + 2, size * 0.42, size * 0.16, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawBalloon(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string): void {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.58, size * 0.3, size * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.28)";
  ctx.beginPath();
  ctx.ellipse(x - size * 0.1, y - size * 0.68, size * 0.08, size * 0.14, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#6b4226";
  ctx.lineWidth = Math.max(1, size * 0.03);
  ctx.beginPath();
  ctx.moveTo(x - size * 0.14, y - size * 0.24);
  ctx.lineTo(x - size * 0.08, y);
  ctx.moveTo(x + size * 0.14, y - size * 0.24);
  ctx.lineTo(x + size * 0.08, y);
  ctx.stroke();
  ctx.fillStyle = "#c97c28";
  roundRect(ctx, x - size * 0.1, y - size * 0.04, size * 0.2, size * 0.14, 2);
  ctx.fill();
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
  const balloons = ["#e63946", "#ffd60a", "#4cc9f0", "#f4a261"];
  for (let i = 0; i < 16; i += 1) {
    const dist = ((i * 3.6 - s * 0.9) % 26 + 26) % 26 + 1.4;
    const size = Math.min(120, Math.max(14, project(w, h, 0, dist).scale * 0.16));
    const left = project(w, h, -1.55, dist);
    const right = project(w, h, 1.55, dist);
    if (colors.air) {
      if (i % 3 === 0) {
        drawBalloon(ctx, left.x, left.y, size * 1.15, balloons[i % balloons.length]);
        drawBalloon(ctx, right.x, right.y - size * 0.2, size, balloons[(i + 1) % balloons.length]);
      } else {
        ctx.fillStyle = "rgba(255,255,255,0.78)";
        ctx.beginPath();
        ctx.ellipse(left.x, left.y - size * 0.4, size * 0.5, size * 0.2, 0, 0, Math.PI * 2);
        ctx.ellipse(right.x, right.y - size * 0.5, size * 0.45, size * 0.18, 0, 0, Math.PI * 2);
        ctx.fill();
      }
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

function drawWheel(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, hub = "#adb5bd"): void {
  ctx.fillStyle = "#212529";
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = hub;
  ctx.beginPath();
  ctx.arc(x, y, r * 0.42, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#868e96";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(x, y, r * 0.72, 0, Math.PI * 2);
  ctx.stroke();
}

function drawRearWheel(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, spin: number, thin = 0.36): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "#1a1a1a";
  ctx.beginPath();
  ctx.ellipse(0, 0, r * thin, r, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#343a40";
  ctx.beginPath();
  ctx.ellipse(0, 0, r * thin * 0.52, r * 0.58, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#868e96";
  ctx.lineWidth = Math.max(1.8, r * 0.18);
  ctx.setLineDash([Math.max(3, r * 0.32), Math.max(2, r * 0.16)]);
  ctx.lineDashOffset = -spin * r;
  ctx.beginPath();
  ctx.ellipse(0, 0, r * thin * 0.86, r * 0.86, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.strokeStyle = "#212529";
  ctx.lineWidth = Math.max(1.4, r * 0.1);
  ctx.beginPath();
  ctx.ellipse(0, 0, r * thin, r, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

export function bonusApePose(spin: number, spinLeft = 0): "rear" | "face" {
  return Math.abs(spin) > 0.5 || Math.abs(spinLeft) > 0.15 ? "face" : "rear";
}

export function chaseLayout(vehicle: BonusVehicle): { rearW: number; frontW: number; depth: number } {
  if (vehicle === "olabil") return { rearW: 96, frontW: 50, depth: 56 };
  if (vehicle === "bil") return { rearW: 90, frontW: 54, depth: 60 };
  if (vehicle === "vannscooter") return { rearW: 72, frontW: 34, depth: 66 };
  if (vehicle === "baat") return { rearW: 110, frontW: 10, depth: 88 };
  if (vehicle === "helikopter") return { rearW: 62, frontW: 46, depth: 68 };
  if (vehicle === "propellfly") return { rearW: 42, frontW: 26, depth: 80 };
  return { rearW: 48, frontW: 20, depth: 88 };
}

export type PathStyle = "road" | "waves" | "sky";

export function pathStyle(vehicle: BonusVehicle): PathStyle {
  const theme = worldTheme(vehicle);
  if (theme === "water") return "waves";
  if (theme === "air") return "sky";
  return "road";
}

export function vehicleCues(vehicle: BonusVehicle): readonly string[] {
  if (vehicle === "olabil") return ["crate", "tread", "axle", "rollbar"];
  if (vehicle === "bil") return ["taillights", "plate", "bumper", "convertible"];
  if (vehicle === "vannscooter") return ["handlebars", "seat", "nozzle", "sponsons"];
  if (vehicle === "baat") return ["outboard", "transom", "flag", "windshield"];
  if (vehicle === "helikopter") return ["rotor", "skids", "tailboom", "bubble", "cabin"];
  if (vehicle === "propellfly") return ["tailfin", "propeller", "biplane", "opencockpit"];
  return ["nozzles", "sweptwing", "tailfin", "canopy"];
}

export function jetWingLayout(): { nearW: number; farW: number } {
  return { nearW: 108, farW: 22 };
}

export function boatHullLayout(): { transomW: number; bowW: number; depth: number } {
  return { transomW: 110, bowW: 10, depth: 88 };
}

export function propellerOcclusion(vehicle: BonusVehicle): "behind-fuselage" | "none" {
  return vehicle === "propellfly" ? "behind-fuselage" : "none";
}

export function tailRotorFromBehind(): { place: "rear"; silhouette: "vertical" } {
  return { place: "rear", silhouette: "vertical" };
}

export function pilotSeat(vehicle: BonusVehicle): "inside" | "open" | "outside" {
  if (vehicle === "helikopter" || vehicle === "jetfly") return "inside";
  if (vehicle === "propellfly" || vehicle === "bil") return "open";
  return "outside";
}

export function cratePlankLayout(): readonly { t: number; width: number }[] {
  const { rearW, frontW } = chaseLayout("olabil");
  const inset = 10;
  return [0.14, 0.3, 0.46, 0.62, 0.78].map((t) => ({
    t,
    width: rearW + (frontW - rearW) * t - inset,
  }));
}

function chaseHull(
  ctx: CanvasRenderingContext2D,
  rearW: number,
  frontW: number,
  depth: number,
  yRear: number,
  fill: string,
  stroke?: string,
): void {
  ctx.beginPath();
  ctx.moveTo(-rearW / 2, yRear);
  ctx.lineTo(rearW / 2, yRear);
  ctx.lineTo(frontW / 2, yRear - depth);
  ctx.lineTo(-frontW / 2, yRear - depth);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 3;
    ctx.stroke();
  }
}

function drawRidingGorilla(ctx: CanvasRenderingContext2D, pose: "rear" | "face"): void {
  const fur = APE_FUR.gorilla;
  const light = APE_FUR.gorillaLight;
  const face = apeFaceFill("gorilla");
  ctx.fillStyle = fur;
  ctx.beginPath();
  ctx.ellipse(0, 16, 21, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = light;
  ctx.beginPath();
  ctx.ellipse(0, 14, 11, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = fur;
  ctx.beginPath();
  ctx.ellipse(-19, 5, 7, 14, 0.4, 0, Math.PI * 2);
  ctx.ellipse(19, 5, 7, 14, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-23, -8, 6.2, 0, Math.PI * 2);
  ctx.arc(23, -8, 6.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = fur;
  ctx.beginPath();
  ctx.arc(0, -10, 16.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(0, -22, 7, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-15, -11, 5.6, 0, Math.PI * 2);
  ctx.arc(15, -11, 5.6, 0, Math.PI * 2);
  ctx.fill();

  if (pose === "face") {
    ctx.fillStyle = face;
    ctx.beginPath();
    ctx.ellipse(0, -7, 11, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.ellipse(-5, -10, 3.8, 4.4, 0, 0, Math.PI * 2);
    ctx.ellipse(5, -10, 3.8, 4.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#1a120c";
    ctx.beginPath();
    ctx.arc(-4.6, -9.4, 2, 0, Math.PI * 2);
    ctx.arc(5.4, -9.4, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#4a2818";
    ctx.beginPath();
    ctx.arc(0, -2, 5.5, 0.2, Math.PI - 0.2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.fillRect(-3.8, -3.4, 7.6, 2.1);
    return;
  }

  ctx.fillStyle = light;
  ctx.beginPath();
  ctx.ellipse(0, -8, 8, 7, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawSeatedGorilla(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  pose: "rear" | "face",
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  drawRidingGorilla(ctx, pose);
  ctx.restore();
}

function drawOlabil(ctx: CanvasRenderingContext2D, pose: "rear" | "face", s: number): void {
  const { rearW, frontW, depth } = chaseLayout("olabil");
  const y = 36;
  const spin = s * 14;
  ctx.fillStyle = "rgba(27, 20, 12, 0.22)";
  ctx.beginPath();
  ctx.ellipse(0, y + 12, 52, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  drawRearWheel(ctx, -16, y - depth + 10, 8, spin, 0.28);
  drawRearWheel(ctx, 16, y - depth + 10, 8, spin, 0.28);
  ctx.strokeStyle = "#6c757d";
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-rearW / 2 + 8, y + 8);
  ctx.lineTo(rearW / 2 - 8, y + 8);
  ctx.stroke();
  ctx.strokeStyle = "#868e96";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-frontW / 2 + 8, y - depth + 10);
  ctx.lineTo(frontW / 2 - 8, y - depth + 10);
  ctx.stroke();
  chaseHull(ctx, rearW, frontW, depth, y, "#c9782a", "#6b3f12");
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(-rearW / 2, y);
  ctx.lineTo(rearW / 2, y);
  ctx.lineTo(frontW / 2, y - depth);
  ctx.lineTo(-frontW / 2, y - depth);
  ctx.closePath();
  ctx.clip();
  ctx.fillStyle = "rgba(107, 63, 18, 0.45)";
  for (const plank of cratePlankLayout()) {
    ctx.fillRect(-plank.width / 2, y - plank.t * depth, plank.width, 3);
  }
  ctx.fillStyle = "#6b3f12";
  ctx.fillRect(-6, y - 4, 12, 16);
  const doorW = rearW + (frontW - rearW) * 0.32 - 16;
  ctx.strokeStyle = "#6b3f12";
  ctx.lineWidth = 2;
  ctx.strokeRect(-doorW / 2, y - 22, doorW, 16);
  ctx.fillStyle = "#fff3b0";
  ctx.font = "900 16px Nunito, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("10", 0, y - 14);
  ctx.fillStyle = "#e9c46a";
  ctx.beginPath();
  ctx.moveTo(-18, y - 6);
  ctx.lineTo(18, y - 6);
  ctx.lineTo(12, y - 16);
  ctx.lineTo(-12, y - 16);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = "#6b4226";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-22, y - 4);
  ctx.lineTo(-16, y - 38);
  ctx.lineTo(16, y - 38);
  ctx.lineTo(22, y - 4);
  ctx.stroke();
  ctx.strokeStyle = "#c1121f";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-12, y - 6);
  ctx.lineTo(-frontW / 2 + 10, y - depth + 10);
  ctx.moveTo(12, y - 6);
  ctx.lineTo(frontW / 2 - 10, y - depth + 10);
  ctx.stroke();
  drawRearWheel(ctx, -40, y + 10, 16, spin);
  drawRearWheel(ctx, 40, y + 10, 16, spin);
  ctx.save();
  ctx.translate(0, y - 22);
  ctx.scale(0.88, 0.88);
  drawRidingGorilla(ctx, pose);
  ctx.restore();
}

function drawBil(ctx: CanvasRenderingContext2D, pose: "rear" | "face", s: number): void {
  const { rearW, frontW, depth } = chaseLayout("bil");
  const y = 38;
  const open = pilotSeat("bil") === "open";
  const rearH = rearW / 2;
  const frontH = frontW / 2;

  ctx.fillStyle = "rgba(27, 20, 12, 0.22)";
  ctx.beginPath();
  ctx.ellipse(0, y + 14, 50, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#adb5bd";
  ctx.beginPath();
  ctx.moveTo(-20, y - depth + 6);
  ctx.lineTo(20, y - depth + 6);
  ctx.lineTo(14, y - depth + 16);
  ctx.lineTo(-14, y - depth + 16);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#e63946";
  ctx.beginPath();
  ctx.moveTo(-rearH + 4, y + 8);
  ctx.quadraticCurveTo(-rearH - 2, y - 6, -frontH, y - depth);
  ctx.lineTo(frontH, y - depth);
  ctx.quadraticCurveTo(rearH + 2, y - 6, rearH - 4, y + 8);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#9d0208";
  ctx.lineWidth = 2.4;
  ctx.stroke();

  ctx.fillStyle = "#c1121f";
  ctx.beginPath();
  ctx.moveTo(-rearH + 10, y + 2);
  ctx.quadraticCurveTo(0, y + 8, rearH - 10, y + 2);
  ctx.quadraticCurveTo(rearH - 8, y + 14, 0, y + 16);
  ctx.quadraticCurveTo(-rearH + 8, y + 14, -rearH + 10, y + 2);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "#ffd60a";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-rearH + 8, y);
  ctx.quadraticCurveTo(-frontH + 4, y - depth * 0.55, -frontH + 2, y - depth + 8);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(rearH - 8, y);
  ctx.quadraticCurveTo(frontH - 4, y - depth * 0.55, frontH - 2, y - depth + 8);
  ctx.stroke();

  ctx.fillStyle = "rgba(144, 224, 239, 0.7)";
  ctx.beginPath();
  ctx.moveTo(-20, y - 20);
  ctx.lineTo(-14, y - 46);
  ctx.lineTo(14, y - 46);
  ctx.lineTo(20, y - 20);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#212529";
  ctx.lineWidth = 4;
  ctx.lineJoin = "round";
  ctx.stroke();

  ctx.fillStyle = "#3d2914";
  ctx.beginPath();
  ctx.moveTo(-24, y - 4);
  ctx.lineTo(24, y - 4);
  ctx.lineTo(16, y - 22);
  ctx.lineTo(-16, y - 22);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#6b3f12";
  roundRect(ctx, -14, y - 18, 28, 12, 4);
  ctx.fill();

  if (open) {
    drawSeatedGorilla(ctx, 0, y - 14, 0.7, pose);
  } else {
    drawSeatedGorilla(ctx, 0, y - 20, 0.86, pose);
  }

  ctx.fillStyle = "#212529";
  ctx.beginPath();
  ctx.ellipse(0, y + 8, 22, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#495057";
  ctx.beginPath();
  ctx.ellipse(0, y + 7, 16, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#6c757d";
  roundRect(ctx, -rearH + 8, y + 6, rearW - 16, 10, 4);
  ctx.fill();
  ctx.fillStyle = "#ff4d6d";
  ctx.beginPath();
  ctx.ellipse(-32, y + 2, 8, 6, 0, 0, Math.PI * 2);
  ctx.ellipse(32, y + 2, 8, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(-32, y + 4, 3, 2, 0, 0, Math.PI * 2);
  ctx.ellipse(32, y + 4, 3, 2, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffd60a";
  roundRect(ctx, -16, y + 8, 32, 11, 2);
  ctx.fill();
  ctx.fillStyle = "#1d3557";
  ctx.font = "900 8px Nunito, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("APE", 0, y + 13);

  ctx.fillStyle = "#adb5bd";
  ctx.beginPath();
  ctx.ellipse(-20, y + 16, 4, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#212529";
  ctx.fillRect(-24, y + 14, 8, 4);

  ctx.fillStyle = "#212529";
  ctx.beginPath();
  ctx.ellipse(-36, y - 16, 3.5, 6, 0.25, 0, Math.PI * 2);
  ctx.ellipse(36, y - 16, 3.5, 6, -0.25, 0, Math.PI * 2);
  ctx.fill();

  drawRearWheel(ctx, -34, y + 14, 13, s * 14);
  drawRearWheel(ctx, 34, y + 14, 13, s * 14);
}

function drawVannscooter(ctx: CanvasRenderingContext2D, pose: "rear" | "face"): void {
  const y = 40;
  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.beginPath();
  ctx.ellipse(0, y + 16, 58, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffb703";
  ctx.beginPath();
  ctx.ellipse(-30, y + 2, 16, 10, 0.1, 0, Math.PI * 2);
  ctx.ellipse(30, y + 2, 16, 10, -0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#e63946";
  ctx.beginPath();
  ctx.moveTo(-38, y + 8);
  ctx.quadraticCurveTo(-44, y - 8, -18, y - 52);
  ctx.quadraticCurveTo(0, y - 66, 18, y - 52);
  ctx.quadraticCurveTo(44, y - 8, 38, y + 8);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#9d0208";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = "#fff8e7";
  ctx.beginPath();
  ctx.moveTo(-18, y - 6);
  ctx.lineTo(18, y - 6);
  ctx.lineTo(10, y - 44);
  ctx.lineTo(-10, y - 44);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#212529";
  roundRect(ctx, -16, y - 22, 32, 22, 8);
  ctx.fill();
  ctx.fillStyle = "#343a40";
  roundRect(ctx, -10, y - 38, 20, 18, 6);
  ctx.fill();
  ctx.strokeStyle = "#adb5bd";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-12, y + 4);
  ctx.quadraticCurveTo(0, y + 12, 12, y + 4);
  ctx.stroke();
  ctx.strokeStyle = "#212529";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-22, y - 28);
  ctx.lineTo(-10, y - 50);
  ctx.lineTo(10, y - 50);
  ctx.lineTo(22, y - 28);
  ctx.stroke();
  ctx.fillStyle = "#ffd60a";
  ctx.beginPath();
  ctx.arc(-22, y - 28, 5, 0, Math.PI * 2);
  ctx.arc(22, y - 28, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#495057";
  ctx.beginPath();
  ctx.ellipse(0, y + 8, 9, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#212529";
  ctx.beginPath();
  ctx.ellipse(0, y + 8, 5, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.beginPath();
  ctx.ellipse(0, y + 18, 8, 10, 0, 0, Math.PI * 2);
  ctx.ellipse(-8, y + 22, 6, 8, 0, 0, Math.PI * 2);
  ctx.ellipse(8, y + 22, 6, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.save();
  ctx.translate(0, y - 18);
  ctx.scale(0.9, 0.9);
  drawRidingGorilla(ctx, pose);
  ctx.restore();
}

function drawBaat(ctx: CanvasRenderingContext2D, pose: "rear" | "face"): void {
  const { transomW, bowW, depth } = boatHullLayout();
  const y = 42;
  const transomY = y + 8;
  const bowY = y - depth;
  const chinY = transomY - depth * 0.3;
  const taperY = transomY - depth * 0.66;
  const rearH = transomW / 2 - 4;
  const chinH = rearH * 0.9;
  const taperH = 16;
  const right = transomW / 2;

  const traceDeck = (inset: number): void => {
    const r = rearH - inset;
    const c = chinH - inset;
    const t = Math.max(bowW, taperH - inset);
    ctx.moveTo(-r, transomY);
    ctx.bezierCurveTo(-r - 2, transomY - 8, -c, chinY + 6, -c, chinY);
    ctx.bezierCurveTo(-c, taperY + 14, -t, taperY, -6, bowY + 12);
    ctx.quadraticCurveTo(-2, bowY + 3, 0, bowY);
    ctx.quadraticCurveTo(2, bowY + 3, 6, bowY + 12);
    ctx.bezierCurveTo(t, taperY, c, taperY + 14, c, chinY);
    ctx.bezierCurveTo(c, chinY + 6, r + 2, transomY - 8, r, transomY);
    ctx.closePath();
  };

  ctx.fillStyle = "rgba(255,255,255,0.42)";
  ctx.beginPath();
  ctx.ellipse(0, y + 22, 72, 13, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#1d3557";
  ctx.beginPath();
  traceDeck(-5);
  ctx.fill();

  ctx.fillStyle = "#f8f9fa";
  ctx.beginPath();
  traceDeck(3);
  ctx.fill();

  ctx.strokeStyle = "#e63946";
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(-rearH + 2, transomY + 1);
  ctx.bezierCurveTo(-rearH, transomY - 8, -chinH, chinY + 6, -chinH + 1, chinY);
  ctx.bezierCurveTo(-chinH, taperY + 14, -taperH, taperY, -4, bowY + 10);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(rearH - 2, transomY + 1);
  ctx.bezierCurveTo(rearH, transomY - 8, chinH, chinY + 6, chinH - 1, chinY);
  ctx.bezierCurveTo(chinH, taperY + 14, taperH, taperY, 4, bowY + 10);
  ctx.stroke();

  ctx.fillStyle = "#e9ecef";
  ctx.beginPath();
  ctx.moveTo(-rearH + 10, transomY - 2);
  ctx.quadraticCurveTo(0, transomY + 4, rearH - 10, transomY - 2);
  ctx.quadraticCurveTo(rearH - 8, transomY + 16, 0, transomY + 18);
  ctx.quadraticCurveTo(-rearH + 8, transomY + 16, -rearH + 10, transomY - 2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#adb5bd";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = "#1d3557";
  ctx.beginPath();
  ctx.moveTo(-rearH + 22, transomY + 2);
  ctx.quadraticCurveTo(0, transomY + 8, rearH - 22, transomY + 2);
  ctx.lineTo(rearH - 24, transomY + 8);
  ctx.quadraticCurveTo(0, transomY + 14, -rearH + 24, transomY + 8);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "rgba(72, 202, 228, 0.92)";
  ctx.beginPath();
  ctx.moveTo(-38, transomY - 20);
  ctx.quadraticCurveTo(-22, chinY + 8, 0, chinY);
  ctx.quadraticCurveTo(22, chinY + 8, 38, transomY - 20);
  ctx.lineTo(30, transomY - 14);
  ctx.quadraticCurveTo(16, chinY + 16, 0, chinY + 12);
  ctx.quadraticCurveTo(-16, chinY + 16, -30, transomY - 14);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#1d3557";
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.fillStyle = "#212529";
  roundRect(ctx, -10, transomY - 4, 20, 22, 4);
  ctx.fill();
  ctx.fillStyle = "#343a40";
  roundRect(ctx, -8, transomY + 14, 16, 10, 2);
  ctx.fill();
  ctx.strokeStyle = "#adb5bd";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(0, transomY + 28, 10, 4, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-8, transomY + 28);
  ctx.lineTo(8, transomY + 28);
  ctx.moveTo(0, transomY + 24);
  ctx.lineTo(0, transomY + 32);
  ctx.stroke();

  ctx.fillStyle = "#e63946";
  ctx.fillRect(right - 18, transomY - 36, 3, 22);
  ctx.beginPath();
  ctx.moveTo(right - 15, transomY - 36);
  ctx.lineTo(right + 2, transomY - 28);
  ctx.lineTo(right - 15, transomY - 22);
  ctx.fill();

  ctx.save();
  ctx.translate(0, transomY - 28);
  ctx.scale(0.86, 0.86);
  drawRidingGorilla(ctx, pose);
  ctx.restore();
}

function drawHelikopter(ctx: CanvasRenderingContext2D, s: number, pose: "rear" | "face"): void {
  const y = 36;
  const tail = tailRotorFromBehind();
  const inside = pilotSeat("helikopter") === "inside";

  ctx.strokeStyle = "#343a40";
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-32, y + 24);
  ctx.lineTo(32, y + 24);
  ctx.moveTo(-24, y + 8);
  ctx.lineTo(-34, y + 26);
  ctx.moveTo(24, y + 8);
  ctx.lineTo(34, y + 26);
  ctx.stroke();
  ctx.strokeStyle = "#adb5bd";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-30, y + 24);
  ctx.lineTo(30, y + 24);
  ctx.stroke();

  ctx.fillStyle = "#e9a825";
  ctx.beginPath();
  ctx.ellipse(0, y + 10, 30, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#c2780a";
  ctx.beginPath();
  ctx.ellipse(0, y + 8, 18, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  if (inside) {
    drawSeatedGorilla(ctx, 0, y - 4, 0.66, pose);
  }

  ctx.fillStyle = "rgba(186, 230, 253, 0.28)";
  ctx.beginPath();
  ctx.ellipse(0, y - 10, 34, 30, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#ffd60a";
  ctx.lineWidth = 6;
  ctx.stroke();
  ctx.strokeStyle = "rgba(255,255,255,0.6)";
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.ellipse(-11, y - 18, 8, 11, -0.45, Math.PI * 1.05, Math.PI * 1.75);
  ctx.stroke();
  ctx.strokeStyle = "#c2780a";
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(-22, y + 2);
  ctx.quadraticCurveTo(0, y + 8, 22, y + 2);
  ctx.stroke();

  if (!inside) {
    drawSeatedGorilla(ctx, 0, y - 12, 0.84, pose);
  }

  ctx.save();
  ctx.translate(0, y - 38);
  ctx.rotate(s * 9);
  ctx.fillStyle = "rgba(73, 80, 87, 0.3)";
  ctx.beginPath();
  ctx.ellipse(0, 0, 82, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#212529";
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.moveTo(-82, 0);
  ctx.lineTo(82, 0);
  ctx.moveTo(0, -8);
  ctx.lineTo(0, 8);
  ctx.stroke();
  ctx.restore();
  ctx.fillStyle = "#adb5bd";
  ctx.beginPath();
  ctx.arc(0, y - 38, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#6c757d";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, y - 32);
  ctx.lineTo(0, y - 10);
  ctx.stroke();

  if (tail.place === "rear" && tail.silhouette === "vertical") {
    const x = 24;
    const boomY = y + 24;
    ctx.strokeStyle = "#6c757d";
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(12, y + 6);
    ctx.lineTo(x, boomY);
    ctx.stroke();
    const h = 16 + Math.abs(Math.sin(s * 28)) * 10;
    ctx.fillStyle = "rgba(33, 37, 41, 0.55)";
    ctx.beginPath();
    ctx.ellipse(x, boomY, 1.6, h, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#212529";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(x, boomY - h);
    ctx.lineTo(x, boomY + h);
    ctx.stroke();
    ctx.fillStyle = "#adb5bd";
    ctx.beginPath();
    ctx.arc(x, boomY, 3.2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawBiplaneWing(ctx: CanvasRenderingContext2D, y: number, halfW: number, thick: number, fill: string): void {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(-halfW, y);
  ctx.lineTo(halfW, y);
  ctx.lineTo(halfW - 12, y + thick);
  ctx.lineTo(-halfW + 12, y + thick);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#9d0208";
  ctx.lineWidth = 1.8;
  ctx.stroke();
}

function drawPropellfly(ctx: CanvasRenderingContext2D, s: number, pose: "rear" | "face"): void {
  const y = 40;
  const open = pilotSeat("propellfly") === "open";

  if (propellerOcclusion("propellfly") === "behind-fuselage") {
    ctx.save();
    ctx.translate(0, y - 62);
    ctx.rotate(s * 12);
    ctx.fillStyle = "rgba(73, 80, 87, 0.35)";
    ctx.beginPath();
    ctx.ellipse(0, 0, 15, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#212529";
    ctx.fillRect(-2, -17, 4, 34);
    ctx.fillRect(-17, -2, 34, 4);
    ctx.restore();
    ctx.fillStyle = "#adb5bd";
    ctx.beginPath();
    ctx.arc(0, y - 62, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  drawBiplaneWing(ctx, y - 28, 78, 12, "#e63946");
  ctx.strokeStyle = "#6c757d";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-18, y - 8);
  ctx.lineTo(-26, y - 28);
  ctx.moveTo(18, y - 8);
  ctx.lineTo(26, y - 28);
  ctx.moveTo(-12, y + 10);
  ctx.lineTo(-22, y - 16);
  ctx.moveTo(12, y + 10);
  ctx.lineTo(22, y - 16);
  ctx.stroke();
  drawBiplaneWing(ctx, y + 2, 70, 11, "#e63946");

  ctx.strokeStyle = "#6c757d";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-16, y + 8);
  ctx.lineTo(-22, y + 22);
  ctx.moveTo(16, y + 8);
  ctx.lineTo(22, y + 22);
  ctx.stroke();
  drawWheel(ctx, -22, y + 24, 7);
  drawWheel(ctx, 22, y + 24, 7);

  ctx.fillStyle = "#fff3b0";
  ctx.beginPath();
  ctx.moveTo(-16, y + 14);
  ctx.quadraticCurveTo(-22, y - 8, -9, y - 54);
  ctx.quadraticCurveTo(0, y - 66, 9, y - 54);
  ctx.quadraticCurveTo(22, y - 8, 16, y + 14);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = "#e63946";
  ctx.beginPath();
  ctx.moveTo(-4, y + 12);
  ctx.lineTo(4, y + 12);
  ctx.lineTo(9, y - 22);
  ctx.lineTo(-9, y - 22);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#fff3b0";
  ctx.beginPath();
  ctx.moveTo(-3, y + 12);
  ctx.lineTo(3, y + 12);
  ctx.lineTo(0, y + 28);
  ctx.closePath();
  ctx.fill();
  drawWheel(ctx, 0, y + 26, 4, "#e9ecef");

  ctx.fillStyle = "#212529";
  ctx.beginPath();
  ctx.ellipse(0, y - 6, 13, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#6b3f12";
  ctx.lineWidth = 4;
  ctx.stroke();

  if (open) {
    drawSeatedGorilla(ctx, 0, y - 8, 0.58, pose);
    ctx.strokeStyle = "#6b3f12";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.ellipse(0, y - 2, 15, 7, 0, 0.15, Math.PI - 0.15);
    ctx.stroke();
  } else {
    drawSeatedGorilla(ctx, 0, y - 14, 0.78, pose);
  }
}

function drawJetfly(ctx: CanvasRenderingContext2D, pose: "rear" | "face"): void {
  const { nearW, farW } = jetWingLayout();
  const y = 42;
  const inside = pilotSeat("jetfly") === "inside";

  ctx.fillStyle = "#5c6770";
  ctx.beginPath();
  ctx.moveTo(0, y - 56);
  ctx.lineTo(nearW / 2, y + 10);
  ctx.lineTo(farW / 2, y + 2);
  ctx.lineTo(-farW / 2, y + 2);
  ctx.lineTo(-nearW / 2, y + 10);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#373f47";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = "#ced4da";
  ctx.beginPath();
  ctx.moveTo(-15, y + 12);
  ctx.quadraticCurveTo(-18, y - 20, -8, y - 70);
  ctx.quadraticCurveTo(0, y - 78, 8, y - 70);
  ctx.quadraticCurveTo(18, y - 20, 15, y + 12);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#868e96";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = "#1d3557";
  ctx.beginPath();
  ctx.moveTo(-5, y + 12);
  ctx.lineTo(5, y + 12);
  ctx.lineTo(11, y - 22);
  ctx.lineTo(-11, y - 22);
  ctx.closePath();
  ctx.fill();

  const glow = ctx.createRadialGradient(-12, y + 14, 1, -12, y + 14, 12);
  glow.addColorStop(0, "#fff3b0");
  glow.addColorStop(0.45, "#ff6b35");
  glow.addColorStop(1, "#6c757d");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.ellipse(-12, y + 12, 10, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  const glow2 = ctx.createRadialGradient(12, y + 14, 1, 12, y + 14, 12);
  glow2.addColorStop(0, "#fff3b0");
  glow2.addColorStop(0.45, "#ff6b35");
  glow2.addColorStop(1, "#6c757d");
  ctx.fillStyle = glow2;
  ctx.beginPath();
  ctx.ellipse(12, y + 12, 10, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#212529";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(-12, y + 12, 10, 8, 0, 0, Math.PI * 2);
  ctx.ellipse(12, y + 12, 10, 8, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "#343a40";
  ctx.beginPath();
  ctx.ellipse(0, y - 8, 10, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  if (inside) {
    drawSeatedGorilla(ctx, 0, y - 10, 0.56, pose);
  } else {
    drawSeatedGorilla(ctx, 0, y - 16, 0.74, pose);
  }

  ctx.fillStyle = "rgba(72, 202, 228, 0.32)";
  ctx.beginPath();
  ctx.moveTo(-13, y + 4);
  ctx.quadraticCurveTo(-15, y - 26, 0, y - 52);
  ctx.quadraticCurveTo(15, y - 26, 13, y + 4);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#1d3557";
  ctx.lineWidth = 2.4;
  ctx.stroke();
  ctx.strokeStyle = "rgba(255,255,255,0.55)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-8, y - 8);
  ctx.quadraticCurveTo(-6, y - 28, 0, y - 40);
  ctx.stroke();
}

function drawVehicle(ctx: CanvasRenderingContext2D, vehicle: BonusVehicle, s: number, pose: "rear" | "face"): void {
  if (vehicle === "vannscooter") {
    drawVannscooter(ctx, pose);
    return;
  }
  if (vehicle === "baat") {
    drawBaat(ctx, pose);
    return;
  }
  if (vehicle === "helikopter") {
    drawHelikopter(ctx, s, pose);
    return;
  }
  if (vehicle === "jetfly") {
    drawJetfly(ctx, pose);
    return;
  }
  if (vehicle === "propellfly") {
    drawPropellfly(ctx, s, pose);
    return;
  }
  if (vehicle === "bil") {
    drawBil(ctx, pose, s);
    return;
  }
  drawOlabil(ctx, pose, s);
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
  const path = pathStyle(vehicle);
  const arrived = ride.phase === "bank";
  const glow = arrived ? Math.min(1, ride.hold / 1.4) : 0;
  const apeX = w / 2 + ride.x * w * 0.3;
  const apeY = h - 96;
  drawSky(ctx, w, h, ride.s, colors);
  drawHills(ctx, w, h, colors, path);
  if (path === "road") drawRoad(ctx, w, h, ride.s, colors);
  else if (path === "waves") {
    drawWaves(ctx, w, h, ride.s, colors);
    drawWake(ctx, w, h, apeX, apeY, ride.s);
  } else drawSkyCourse(ctx, w, h, ride.s);
  drawSides(ctx, w, h, ride.s, colors);
  drawBank(ctx, w, h, ride.track - ride.s, arrived, glow);

  const theme = worldTheme(vehicle);
  const ordered = [...ride.obstacles].sort((a, b) => b.s - a.s);
  for (const obs of ordered) drawObstacle(ctx, obs, ride.s, w, h, theme);

  const tilt = ride.phase === "crash" ? 0.55 : ride.spin;
  ctx.save();
  ctx.fillStyle = "rgba(27, 20, 12, 0.28)";
  ctx.beginPath();
  ctx.ellipse(apeX, apeY + 52, 58, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.translate(apeX, apeY + 18);
  ctx.rotate(tilt);
  ctx.scale(1.42, 1.42);
  ctx.translate(0, -14);
  drawVehicle(ctx, vehicle, ride.s, bonusApePose(ride.spin, ride.spinLeft));
  ctx.restore();
  drawDeposit(ctx, w, h, ride, apeX, apeY, extras.score ?? 0, extras.depositLabel ?? "Poeng i banken");
  drawCountdown(ctx, w, h, ride, goLabel);
}
