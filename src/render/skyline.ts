/* The Dallas skyline — hand-placed procedural silhouettes on the far
   parallax layer. Six required landmarks, recognizable at a glance:
   Bank of America Plaza (green argon edges), Reunion Tower (lit ball),
   Fountain Place (angled prism), Chase Tower (keyhole arch), Omni
   (scrolling LED facade), Margaret Hunt Hill Bridge (Calatrava arch). */
import { ctx } from "../engine/canvas";
import { G } from "../engine/entity";
import { W } from "../balance";
import { LORE } from "../lore";

export interface SkyPalette {
  silhouette: string; silhouette2: string; window: string;
  argonPulse: boolean;
}
/* far layer is lighter (atmospheric haze), mid layer darker (closer) */
export const NIGHT: SkyPalette = { silhouette: "#2c1b52", silhouette2: "#170d2c", window: "#ffd23f", argonPulse: true };
export const DAWN: SkyPalette = { silhouette: "#54305e", silhouette2: "#2c1a34", window: "#ffc98a", argonPulse: true };

/* ---- Omni LED: pre-render message text into coarse dot grids ---- */
const ledCache = new Map<string, boolean[][]>();
function ledGrid(msg: string): boolean[][] {
  const hit = ledCache.get(msg);
  if (hit) return hit;
  const off = document.createElement("canvas");
  const rows = 9;
  off.width = msg.length * 7 + 4; off.height = rows;
  const octx = off.getContext("2d") as CanvasRenderingContext2D;
  octx.font = "bold 9px monospace";
  octx.textBaseline = "top";
  octx.fillStyle = "#fff";
  octx.fillText(msg, 1, -1);
  const data = octx.getImageData(0, 0, off.width, rows).data;
  const grid: boolean[][] = [];
  for (let y = 0; y < rows; y++) {
    const row: boolean[] = [];
    for (let x = 0; x < off.width; x++) row.push(data[(y * off.width + x) * 4 + 3] > 100);
    grid.push(row);
  }
  ledCache.set(msg, grid);
  return grid;
}

/**
 * @param horizonY  screen y of the skyline's base
 * @param pal       NIGHT or DAWN
 * @param paintSky  re-fills the sky (used to cut the Chase keyhole)
 * @param parallax  camera multiplier for the far layer
 */
export function drawSkyline(horizonY: number, pal: SkyPalette, paintSky: () => void, parallax = 0.2): void {
  const px0 = G.cam * parallax;
  const strip = 2000;                       // hand-placed layout width
  const ox = -((px0) % strip);

  for (const base of [ox, ox + strip]) {
    if (base > W || base + strip < 0) continue;
    drawStrip(base, horizonY, pal, paintSky);
  }

  // mid parallax layer: low anonymous blocks
  const mx = G.cam * 0.5;
  ctx.fillStyle = pal.silhouette2;
  for (let i = -1; i < 16; i++) {
    const bx = i * 240 - (mx % 240);
    const bh = 46 + ((i * i * 29) % 40);
    ctx.fillRect(bx, horizonY - bh + 26, 150, bh);
  }
}

function drawStrip(base: number, hy: number, pal: SkyPalette, paintSky: () => void): void {
  const t = G.tick;

  /* generic filler towers */
  ctx.fillStyle = pal.silhouette;
  const filler: [number, number, number][] = [
    [40, 90, 120], [520, 70, 150], [770, 80, 100], [1090, 76, 130], [1330, 66, 95]
  ];
  for (const [fx, fw, fh] of filler) {
    ctx.fillRect(base + fx, hy - fh, fw, fh);
    ctx.fillStyle = pal.window;
    for (let wy = hy - fh + 8; wy < hy - 10; wy += 16)
      for (let wx = base + fx + 6; wx < base + fx + fw - 6; wx += 14)
        if (((wx * wy) | 0) % 7 < 2) ctx.fillRect(wx, wy, 4, 6);
    ctx.fillStyle = pal.silhouette;
  }

  /* 1. Bank of America Plaza — tall slab, green argon edge-lighting */
  {
    const bx = base + 170, bw = 74, bh = 240;
    ctx.fillStyle = pal.silhouette;
    ctx.fillRect(bx, hy - bh, bw, bh);
    ctx.fillRect(bx + 12, hy - bh - 18, bw - 24, 18);
    // green-tinted office windows still burning late
    ctx.fillStyle = "rgba(120,255,170,0.35)";
    for (let wy = hy - bh + 10; wy < hy - 12; wy += 17)
      for (let wx = bx + 8; wx < bx + bw - 8; wx += 15)
        if (((wx * 3 + wy) | 0) % 6 < 2) ctx.fillRect(wx, wy, 4, 6);
    const pulse = pal.argonPulse ? 0.72 + Math.sin(t * 0.03) * 0.25 : 0.9;
    ctx.strokeStyle = `rgba(57,255,122,${pulse})`;
    ctx.lineWidth = 2;
    ctx.strokeRect(bx, hy - bh, bw, bh);
    ctx.strokeRect(bx + 12, hy - bh - 18, bw - 24, 18);
    ctx.beginPath();
    ctx.moveTo(bx, hy - bh); ctx.lineTo(bx + 12, hy - bh - 18);
    ctx.moveTo(bx + bw, hy - bh); ctx.lineTo(bx + bw - 12, hy - bh - 18);
    ctx.stroke();
  }

  /* 4½. Magnolia Building — the flying red Pegasus */
  {
    const gx = base + 1050, bw = 56, bh = 150;
    ctx.fillStyle = pal.silhouette;
    ctx.fillRect(gx - bw / 2, hy - bh, bw, bh);
    ctx.fillRect(gx - bw / 2 + 8, hy - bh - 10, bw - 16, 10);   // stepped crown
    ctx.fillStyle = pal.window;
    for (let wy = hy - bh + 10; wy < hy - 12; wy += 18)
      for (let wx = gx - bw / 2 + 6; wx < gx + bw / 2 - 6; wx += 12)
        if (((wx + wy * 3) | 0) % 5 < 2) ctx.fillRect(wx, wy, 3, 5);
    // rooftop derrick holding the sign
    const cy = hy - bh - 46;
    ctx.strokeStyle = "rgba(190,130,150,0.45)"; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(gx - 14, hy - bh - 10); ctx.lineTo(gx, cy + 14);
    ctx.lineTo(gx + 14, hy - bh - 10);
    ctx.stroke();
    // Pegasus in his neon ring — slowly turning, like the real one
    const pulse = 0.75 + Math.sin(t * 0.06) * 0.25;
    const flip = Math.floor(t / 140) % 2 === 0 ? 1 : -1;
    ctx.save();
    ctx.translate(gx, cy);
    ctx.strokeStyle = `rgba(255,43,66,${0.85 * pulse})`;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, 0, 22, 0, 7); ctx.stroke();
    ctx.scale(flip, 1);
    ctx.fillStyle = `rgba(255,64,84,${pulse})`;
    ctx.fillRect(-9, -3, 15, 6);                                   // body
    ctx.fillRect(3, -9, 4, 8);                                     // neck
    ctx.fillRect(5, -11, 8, 4);                                    // head
    ctx.beginPath();                                               // wing
    ctx.moveTo(-2, -3); ctx.lineTo(-13, -17); ctx.lineTo(3, -5);
    ctx.closePath(); ctx.fill();
    ctx.fillRect(-8, 3, 2, 6); ctx.fillRect(-3, 3, 2, 5);          // legs
    ctx.fillRect(3, 3, 2, 6);
    ctx.beginPath();                                               // tail
    ctx.moveTo(-9, -2); ctx.lineTo(-17, -7); ctx.lineTo(-9, 2);
    ctx.closePath(); ctx.fill();
    ctx.restore();
    // red glow halo
    const glow = ctx.createRadialGradient(gx, cy, 2, gx, cy, 36);
    glow.addColorStop(0, `rgba(255,40,60,${0.22 * pulse})`);
    glow.addColorStop(1, "rgba(255,40,60,0)");
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(gx, cy, 36, 0, 7); ctx.fill();
  }

  /* 2. Reunion Tower — thin shaft, geodesic ball with rotating dots */
  {
    const rx = base + 420;
    ctx.fillStyle = pal.silhouette;
    ctx.fillRect(rx - 4, hy - 150, 9, 150);
    ctx.beginPath(); ctx.arc(rx, hy - 160, 26, 0, 7); ctx.fill();
    ctx.strokeStyle = "rgba(57,213,255,0.35)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(rx, hy - 160, 26, 0, 7); ctx.stroke();
    ctx.fillStyle = "#39d5ff";
    for (let a = 0; a < 14; a++) {
      const ang = (a / 14) * 6.283 + t * 0.01;
      ctx.fillRect(rx + Math.cos(ang) * 20, hy - 160 + Math.sin(ang) * 20, 3, 3);
    }
  }

  /* 3. Fountain Place — angled glass prism, chisel top, specular streak */
  {
    const fx = base + 610, fh = 210;
    ctx.fillStyle = pal.silhouette;
    ctx.beginPath();
    ctx.moveTo(fx, hy);
    ctx.lineTo(fx, hy - fh * 0.55);
    ctx.lineTo(fx + 34, hy - fh);          // chisel peak
    ctx.lineTo(fx + 78, hy - fh * 0.72);
    ctx.lineTo(fx + 78, hy);
    ctx.closePath(); ctx.fill();
    const grad = ctx.createLinearGradient(fx, hy - fh, fx + 78, hy);
    grad.addColorStop(0.3, "rgba(120,200,255,0)");
    grad.addColorStop(0.5, "rgba(160,220,255,0.35)");
    grad.addColorStop(0.7, "rgba(120,200,255,0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(fx + 10, hy - fh * 0.6); ctx.lineTo(fx + 34, hy - fh);
    ctx.lineTo(fx + 52, hy - fh * 0.86); ctx.lineTo(fx + 24, hy - fh * 0.5);
    ctx.closePath(); ctx.fill();
  }

  /* 4. Chase Tower — rectangular tower, keyhole arch cut through the top */
  {
    const cx = base + 870, cw = 84, ch = 200;
    ctx.fillStyle = pal.silhouette;
    ctx.fillRect(cx, hy - ch, cw, ch);
    ctx.fillStyle = pal.window;
    for (let wy = hy - ch + 34; wy < hy - 10; wy += 15)
      for (let wx = cx + 7; wx < cx + cw - 7; wx += 13)
        if (((wx + wy) | 0) % 6 < 2) ctx.fillRect(wx, wy, 4, 5);
    // the keyhole: clip and re-paint the sky through it
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx + cw / 2, hy - ch + 20, 13, Math.PI, 0);
    ctx.rect(cx + cw / 2 - 13, hy - ch + 20, 26, 10);
    ctx.clip();
    paintSky();
    ctx.restore();
  }

  /* 5. Omni Dallas — curved-top block with scrolling LED facade */
  {
    const oxx = base + 1180, ow = 130, oh = 120;
    ctx.fillStyle = pal.silhouette;
    ctx.beginPath();
    ctx.moveTo(oxx, hy);
    ctx.lineTo(oxx, hy - oh + 26);
    ctx.quadraticCurveTo(oxx + ow * 0.5, hy - oh - 22, oxx + ow, hy - oh + 26);
    ctx.lineTo(oxx + ow, hy);
    ctx.closePath(); ctx.fill();
    // coarse LED dot matrix scrolling the lore messages
    const msg = LORE.omniMessages[Math.floor(t / 900) % LORE.omniMessages.length];
    const grid = ledGrid(msg);
    const gw = grid[0].length;
    const cols = 30, dot = 4;
    const scroll = Math.floor(t / 3) % (gw + cols);
    ctx.fillStyle = "#ff9d3c";
    for (let gy = 0; gy < grid.length; gy++) {
      for (let cx2 = 0; cx2 < cols; cx2++) {
        const gx = scroll - cols + cx2;
        if (gx >= 0 && gx < gw && grid[gy][gx]) {
          ctx.fillRect(oxx + 6 + cx2 * dot, hy - oh + 40 + gy * dot, dot - 1, dot - 1);
        }
      }
    }
  }

  /* 5½. Old Red Courthouse — red sandstone, corner turrets, clock tower */
  {
    const rx = base + 1600, rw = 110, rh = 74;
    ctx.fillStyle = "#5e2f38";
    ctx.fillRect(rx, hy - rh, rw, rh);
    for (const tx of [rx - 6, rx + rw - 10]) {              // corner turrets
      ctx.fillRect(tx, hy - rh - 14, 16, rh + 14);
      ctx.fillStyle = "#3a1c24";
      ctx.beginPath();
      ctx.moveTo(tx - 2, hy - rh - 14); ctx.lineTo(tx + 8, hy - rh - 32); ctx.lineTo(tx + 18, hy - rh - 14);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#5e2f38";
    }
    ctx.fillRect(rx + rw / 2 - 10, hy - rh - 30, 20, 30);   // clock tower
    ctx.fillStyle = "#3a1c24";
    ctx.beginPath();
    ctx.moveTo(rx + rw / 2 - 13, hy - rh - 30); ctx.lineTo(rx + rw / 2, hy - rh - 48); ctx.lineTo(rx + rw / 2 + 13, hy - rh - 30);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#f0e8d0";                              // the clock face
    ctx.beginPath(); ctx.arc(rx + rw / 2, hy - rh - 20, 5, 0, 7); ctx.fill();
    ctx.fillStyle = "#3a1c24"; ctx.fillRect(rx + rw / 2 - 1, hy - rh - 24, 2, 5);
    ctx.fillStyle = pal.window;                             // arched windows
    for (let wx = rx + 10; wx < rx + rw - 8; wx += 18) {
      ctx.fillRect(wx, hy - rh + 14, 5, 9);
      ctx.fillRect(wx, hy - rh + 38, 5, 9);
    }
  }

  /* 6. Margaret Hunt Hill Bridge — white Calatrava arch, low on the horizon */
  {
    const mx = base + 1500, mw = 300;
    ctx.strokeStyle = "rgba(235,240,248,0.9)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(mx, hy);
    ctx.quadraticCurveTo(mx + mw * 0.5, hy - 130, mx + mw, hy);
    ctx.stroke();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(235,240,248,0.45)";
    for (let i = 1; i < 10; i++) {
      const k = i / 10;
      const ax = mx + mw * k;
      const ay = hy - 130 * 4 * k * (1 - k) * 0.5 - 130 * 0.5 * 4 * k * (1 - k) * 0; // arch point
      const archY = hy - 260 * k * (1 - k) * 2;
      ctx.beginPath();
      ctx.moveTo(ax, archY);
      ctx.lineTo(mx + mw * 0.18 + mw * 0.64 * k, hy);
      ctx.stroke();
    }
    ctx.fillStyle = pal.silhouette2;
    ctx.fillRect(mx - 10, hy - 4, mw + 20, 4);
  }
}
