/* Floating text, hitsparks, comic-book special title cards, banners,
   confetti. All screen-space juice lives here. */
import { ctx } from "../engine/canvas";
import { G } from "../engine/entity";
import { W, H, JUICE } from "../balance";
import { rnd, clamp } from "../engine/util";

/* ---------------- floating text ---------------- */
interface Floater { x: number; y: number; txt: string; color: string; size: number; life: number; maxLife: number; vy: number; }
let floaters: Floater[] = [];

/** x is WORLD x; drawn relative to camera. Min size enforced at 14px per brief. */
export function floatText(x: number, y: number, txt: string, color = "#fff", size = 14, life = 50): void {
  floaters.push({
    x: x + rnd(-4, 4), y: y + rnd(-2, 2), txt, color,
    size: Math.max(14, size), life, maxLife: life, vy: -0.7
  });
}

/* ---------------- hitsparks / particles ---------------- */
interface Particle { x: number; y: number; vx: number; vy: number; g: number; life: number; color: string; size: number; }
let particles: Particle[] = [];

export function spark(x: number, y: number, color = "#ffd23f", n = 6, power = 3): void {
  for (let i = 0; i < n; i++) {
    const a = rnd(0, Math.PI * 2), s = rnd(0.5, power);
    particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 1, g: 0.12, life: rnd(12, 26), color, size: rnd(2, 4) });
  }
}
export function confetti(x: number, y: number, n = 40): void {
  const colors = ["#ffd23f", "#ff4f79", "#39d5ff", "#67e06b", "#fff"];
  for (let i = 0; i < n; i++) {
    particles.push({
      x: x + rnd(-30, 30), y: y + rnd(-40, 0),
      vx: rnd(-2, 2), vy: rnd(-5, -1), g: 0.08,
      life: rnd(50, 120), color: colors[i % colors.length], size: rnd(3, 5)
    });
  }
}

/* ---------------- comic special title cards ---------------- */
interface ComicCard { text: string; color: string; scale: number; t: number; }
let cards: ComicCard[] = [];
const CARD_IN = 6, CARD_HOLD = 35, CARD_OUT = 10;

/** Full-screen starburst card (scale 1) or half-size boss-phase card (scale 0.5).
    Full cards pause the whole fight while the title lands; the move fires
    the moment the world unfreezes. Boss phase pops freeze briefly. */
export function comicCard(text: string, color: string, scale = 1): void {
  cards.push({ text, color, scale, t: 0 });
  G.hitstop = Math.max(G.hitstop, scale >= 1 ? JUICE.comicFreeze : 16);
}

/* ---------------- banner ---------------- */
let banner: { big: string; small: string | null } | null = null;
let bannerT = 0;
export function setBanner(big: string, small: string | null = null, t = 120): void {
  banner = { big, small }; bannerT = t;
}

export function clearFx(): void { floaters = []; particles = []; cards = []; banner = null; bannerT = 0; }

/* ---------------- update ----------------
   Cards keep animating during hitstop (the freeze IS the card moment),
   so updateFx is called every frame from the main loop. */
export function updateFx(worldFrozen: boolean): void {
  cards = cards.filter(c => { c.t++; return c.t < CARD_IN + CARD_HOLD + CARD_OUT; });
  if (worldFrozen) return;
  floaters.forEach(f => { f.life--; f.y += f.vy; });
  floaters = floaters.filter(f => f.life > 0);
  particles.forEach(p => { p.life--; p.x += p.vx; p.y += p.vy; p.vy += p.g; });
  particles = particles.filter(p => p.life > 0);
  if (bannerT > 0) bannerT--;
}

/* ---------------- draw ---------------- */
export function drawFx(): void {
  // particles (world space)
  particles.forEach(p => {
    ctx.globalAlpha = clamp(p.life / 15, 0, 1);
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - G.cam, p.y, p.size, p.size);
  });
  ctx.globalAlpha = 1;

  // floaters: min 14px with 1px dark outline (readability spec)
  floaters.forEach(f => {
    ctx.globalAlpha = clamp(f.life / 20, 0, 1);
    ctx.font = `bold ${f.size}px monospace`;
    ctx.textAlign = "center";
    const sx = f.x - G.cam, sy = f.y;
    ctx.fillStyle = "#0a0512";
    ctx.fillText(f.txt, sx - 1, sy); ctx.fillText(f.txt, sx + 1, sy);
    ctx.fillText(f.txt, sx, sy - 1); ctx.fillText(f.txt, sx, sy + 1);
    ctx.fillStyle = f.color;
    ctx.fillText(f.txt, sx, sy);
    ctx.globalAlpha = 1;
  });

  // banner
  if (bannerT > 0 && banner) {
    ctx.fillStyle = "rgba(0,0,0,0.55)"; ctx.fillRect(0, 200, W, 80);
    ctx.fillStyle = "#ffd23f"; ctx.font = "bold 30px monospace"; ctx.textAlign = "center";
    ctx.fillText(banner.big, W / 2, 240);
    if (banner.small) { ctx.fillStyle = "#ddd"; ctx.font = "14px monospace"; ctx.fillText(banner.small, W / 2, 264); }
  }

  cards.forEach(drawCard);
}

function drawCard(c: ComicCard): void {
  const { t } = c;
  let scl: number, alpha = 1;
  if (t < CARD_IN) {
    const k = t / CARD_IN;              // 1.25 -> 0.97 -> 1.0 overshoot
    scl = 1.25 - 0.28 * k + 0.03 * Math.sin(k * Math.PI);
  } else if (t < CARD_IN + CARD_HOLD) {
    scl = 1 + Math.sin((t - CARD_IN) * 0.25) * 0.008;
  } else {
    const k = (t - CARD_IN - CARD_HOLD) / CARD_OUT;
    scl = 1 + k * 0.35; alpha = 1 - k;
  }
  const size = c.scale;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(W / 2, H / 2 - (size < 1 ? 90 : 0));
  ctx.scale(scl * size, scl * size);
  ctx.rotate(-0.05);

  // jagged starburst polygon
  const R = 300, r = 200, spikes = 14;
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const ang = (i / (spikes * 2)) * Math.PI * 2 + 0.13;
    const rad = (i % 2 === 0 ? R : r) * (1 + 0.06 * Math.sin(i * 3.7));
    const px = Math.cos(ang) * rad * 1.35, py = Math.sin(ang) * rad * 0.55;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = c.color; ctx.fill();
  ctx.lineWidth = 6; ctx.strokeStyle = "#0a0512"; ctx.stroke();

  // halftone dots
  ctx.save(); ctx.clip();
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  for (let dy = -140; dy <= 140; dy += 18)
    for (let dx = -380; dx <= 380; dx += 18)
      { ctx.beginPath(); ctx.arc(dx + (dy % 36 === 0 ? 9 : 0), dy, 3.5, 0, 7); ctx.fill(); }
  ctx.restore();

  // slanted display text with hard drop shadow
  ctx.rotate(-0.04);
  const fs = Math.min(64, 620 / Math.max(1, c.text.length) * 1.6);
  ctx.font = `italic 900 ${fs}px monospace`;
  ctx.textAlign = "center";
  ctx.fillStyle = "#0a0512"; ctx.fillText(c.text, 6, fs * 0.38 + 6);
  ctx.fillStyle = "#fff"; ctx.fillText(c.text, 0, fs * 0.38);
  ctx.restore();
}
