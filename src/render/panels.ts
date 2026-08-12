/* Comic-bridge cutscene system: full-screen panel sequences with
   captions, balloons, and an optional rain treatment. Used by the
   Angelo secret defeat, the helicopter-shootdown bridge, and the
   per-character endings. Also home to the AAC helicopter outro. */
import { ctx } from "../engine/canvas";
import { G, type Scene } from "../engine/entity";
import { W, H } from "../balance";
import { LORE } from "../lore";
import { drawHumanoid, CHAR_PAL, px } from "./sprites";
import { confetti, floatText } from "./fx";
import { SFX } from "../audio";
import { clamp, rnd } from "../engine/util";

/* ---------------- panel plumbing ---------------- */
interface Panel {
  art: (x: number, y: number, w: number, h: number) => void;
  caption?: string;
  balloon?: string;
  rain?: boolean;
}

const PANEL_HOLD = 260;       // auto-advance frames

export function startBridge(seq: string, returnScene: Scene): void {
  G.bridgeSeq = seq;
  G.bridgeIdx = 0;
  G.bridgeT = 0;
  G.bridgeReturn = returnScene;
  G.scene = "bridge";
  G.sceneT = 0;
  G.selCooldown = 25;
}

/** advance timers; returns true when the sequence is finished */
export function stepBridge(advancePressed: boolean): boolean {
  const seq = getSeq(G.bridgeSeq ?? "");
  if (!seq) return true;
  G.bridgeT++;
  if ((advancePressed && G.selCooldown === 0 && G.bridgeT > 20) || G.bridgeT > PANEL_HOLD) {
    G.bridgeIdx++;
    G.bridgeT = 0;
    G.selCooldown = 12;
    SFX.punch();
    if (G.bridgeIdx >= seq.length) { G.bridgeSeq = null; return true; }
  }
  return false;
}

export function drawBridge(): void {
  const seq = getSeq(G.bridgeSeq ?? "");
  if (!seq || G.bridgeIdx >= seq.length) return;
  const p = seq[G.bridgeIdx];
  ctx.fillStyle = "#0b0618"; ctx.fillRect(0, 0, W, H);

  const bx = 170, by = 62, bw = 620, bh = 380;
  ctx.save();
  ctx.beginPath(); ctx.rect(bx, by, bw, bh); ctx.clip();
  p.art(bx, by, bw, bh);
  if (p.rain) drawRain(bx, by, bw, bh);
  ctx.restore();
  ctx.strokeStyle = "#fff"; ctx.lineWidth = 3;
  ctx.strokeRect(bx, by, bw, bh);

  // caption box (auto-shrink for the long ones)
  if (p.caption) {
    ctx.fillStyle = "#f4f0e2";
    ctx.fillRect(bx + 6, by + 6, bw - 12, 30);
    ctx.fillStyle = "#0a0512"; ctx.textAlign = "left";
    let fs = 14;
    ctx.font = `bold ${fs}px monospace`;
    while (ctx.measureText(p.caption).width > bw - 32 && fs > 9) {
      fs--; ctx.font = `bold ${fs}px monospace`;
    }
    ctx.fillText(p.caption, bx + 14, by + 26);
  }
  // dialogue balloon
  if (p.balloon) {
    const blw = Math.min(bw - 40, p.balloon.length * 9 + 30);
    ctx.fillStyle = "#fff";
    ctx.beginPath(); ctx.ellipse(bx + bw / 2, by + bh - 40, blw / 2, 24, 0, 0, 7); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(bx + bw / 2 - 10, by + bh - 22);
    ctx.lineTo(bx + bw / 2 - 2, by + bh - 6);
    ctx.lineTo(bx + bw / 2 + 8, by + bh - 22);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#0a0512"; ctx.font = "bold 13px monospace"; ctx.textAlign = "center";
    ctx.fillText(p.balloon, bx + bw / 2, by + bh - 36);
  }
  // advance hint
  if (G.tick % 60 < 40) {
    ctx.fillStyle = "#ffd23f"; ctx.font = "bold 13px monospace"; ctx.textAlign = "center";
    ctx.fillText(LORE.introSkip, W / 2, H - 14);
  }
}

/* rain treatment: blue-gray wash + streaks + puddle rings */
function drawRain(x: number, y: number, w: number, h: number): void {
  ctx.fillStyle = "rgba(40,60,90,0.30)";
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = "rgba(180,200,230,0.35)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 42; i++) {
    const rx = x + ((i * 97 + G.tick * 7) % w);
    const ry = y + ((i * 53 + G.tick * 13) % h);
    ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(rx - 3, ry + 14); ctx.stroke();
  }
}

/* ---------------- shared art bits ---------------- */
function nightStreet(x: number, y: number, w: number, h: number): void {
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, "#0e1626"); g.addColorStop(0.7, "#1a2438");
  ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = "#0a1020";
  for (let b = 0; b < 6; b++) ctx.fillRect(x + 10 + b * 105, y + 60 + (b * b * 13) % 40, 70, h);
  // neon + puddle reflections
  ctx.fillStyle = "#ff4f79"; ctx.fillRect(x + 92, y + 108, 46, 16);
  ctx.fillStyle = "#39d5ff"; ctx.fillRect(x + 388, y + 92, 60, 14);
  ctx.fillStyle = "#2a3448"; ctx.fillRect(x, y + h - 110, w, 110);
  ctx.globalAlpha = 0.35;
  ctx.fillStyle = "#ff4f79";
  ctx.beginPath(); ctx.ellipse(x + 115, y + h - 60, 34, 8, 0, 0, 7); ctx.fill();
  ctx.fillStyle = "#39d5ff";
  ctx.beginPath(); ctx.ellipse(x + 418, y + h - 44, 42, 9, 0, 0, 7); ctx.fill();
  ctx.globalAlpha = 1;
}

function angeloLying(cx: number, cy: number, eyesOpen: boolean): void {
  px(cx - 34, cy - 12, 64, 14, "#6b5a3a");                 // body
  px(cx + 30, cy - 16, 16, 14, "#d9a878");                 // head
  px(cx + 30, cy - 6, 16, 5, "#5a5a5a");                   // beard
  px(cx + 28, cy - 20, 20, 6, "#3a3226");                  // hat
  if (eyesOpen) {
    px(cx + 34, cy - 13, 3, 3, "#fff"); px(cx + 40, cy - 13, 3, 3, "#fff");
    px(cx + 35, cy - 12, 1, 1, "#111"); px(cx + 41, cy - 12, 1, 1, "#111");
  } else {
    px(cx + 34, cy - 12, 4, 1, "#3a2a1a"); px(cx + 40, cy - 12, 4, 1, "#3a2a1a");
  }
}

/* ---------------- sequences ---------------- */
const ANGELO_IN_WINDOW = true;   // ending easter egg detail — flip to hide

function getSeq(id: string): Panel[] | null {
  const S = LORE.angelo.secretDefeat;
  switch (id) {
    case "angeloRain": return [
      { rain: true, caption: S.panel1cap, art: (x, y, w, h) => {
        nightStreet(x, y, w, h);
        angeloLying(x + w / 2 + 10, y + h - 66, false);
        // Blake kneeling, cradling
        const pal = CHAR_PAL.blake;
        px(x + w / 2 - 56, y + h - 118, 26, 40, pal.shirt);       // hunched torso
        px(x + w / 2 - 52, y + h - 132, 18, 16, pal.skin);        // bowed head
        px(x + w / 2 - 52, y + h - 136, 18, 6, pal.hair);
        px(x + w / 2 - 58, y + h - 84, 34, 10, pal.pants);        // kneeling legs
        px(x + w / 2 - 34, y + h - 100, 26, 7, pal.skin);         // arm cradling
      }},
      { rain: true, balloon: S.panel2bal, art: (x, y, w, h) => {
        ctx.fillStyle = "#141c2c"; ctx.fillRect(x, y, w, h);
        // Angelo's face, serene, enormous
        px(x + w / 2 - 110, y + 70, 220, 190, "#d9a878");
        px(x + w / 2 - 120, y + 44, 240, 44, "#3a3226");          // hat brim
        px(x + w / 2 - 110, y + 210, 220, 44, "#5a5a5a");         // beard
        px(x + w / 2 - 64, y + 140, 44, 5, "#3a2a1a");            // fluttering eyes
        px(x + w / 2 + 24, y + 140, 44, 5, "#3a2a1a");
        px(x + w / 2 - 58, y + 132, 30, 3, "#3a2a1a");
        px(x + w / 2 + 30, y + 132, 30, 3, "#3a2a1a");
      }},
      { rain: true, caption: S.panel3cap, art: (x, y, w, h) => {
        ctx.fillStyle = "#d9a878"; ctx.fillRect(x, y, w, h);      // face fills frame
        px(x, y + h * 0.52, w, 10, "#3a2a1a");                    // the closed eye line
        // Blake's two fingers, closing them
        px(x + w / 2 - 30, y, 26, h * 0.55, "#e8b98c");
        px(x + w / 2 + 4, y, 26, h * 0.50, "#e8b98c");
        px(x + w / 2 - 30, y + h * 0.52, 26, 8, "#c99a6e");
        px(x + w / 2 + 4, y + h * 0.47, 26, 8, "#c99a6e");
      }},
      { rain: true, caption: S.panel4cap, art: (x, y, w, h) => {
        const g = ctx.createLinearGradient(0, y, 0, y + h);
        g.addColorStop(0, "#0a1220"); g.addColorStop(1, "#20304a");
        ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
        ctx.fillStyle = "#060a14";
        for (let b = 0; b < 7; b++) ctx.fillRect(x + 20 + b * 88, y + 90 + (b * b * 17) % 60, 56, h);
        // the walk away
        px(x + w / 2 - 12, y + h - 150, 26, 60, "#04070e");       // torso
        px(x + w / 2 - 8, y + h - 168, 18, 20, "#04070e");        // head
        px(x + w / 2 - 12, y + h - 92, 10, 50, "#04070e");        // legs mid-stride
        px(x + w / 2 + 6, y + h - 92, 10, 44, "#04070e");
      }},
      { balloon: S.panel5bal, art: (x, y, w, h) => {
        nightStreet(x, y, w, h);                                  // rain gone, palette back
        angeloLying(x + w / 2, y + h - 66, true);                 // eyes SNAP open
      }}
    ];

    case "shootdown": return [
      { caption: LORE.bridge.shootdown1, art: (x, y, w, h) => {
        const g = ctx.createLinearGradient(0, y, 0, y + h);
        g.addColorStop(0, "#150b2e"); g.addColorStop(1, "#31145a");
        ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
        ctx.fillStyle = "#1c0f36";
        for (let b = 0; b < 8; b++) ctx.fillRect(x + b * 80, y + h - 90 - (b * b * 23) % 70, 54, h);
        ctx.fillStyle = "#ffd23f";
        for (let d = 0; d < 26; d++) px(x + 14 + (d * 47) % (w - 20), y + h - 80 + (d * d * 7) % 60, 3, 4, "#ffd23f");
        drawHeli(x + w / 2, y + 120, G.tick, false);
      }},
      { caption: LORE.bridge.shootdown2, art: (x, y, w, h) => {
        ctx.fillStyle = "#0e0a1c"; ctx.fillRect(x, y, w, h);
        // a poker chip the size of a manhole cover, inbound
        const cx = x + w / 2, cy = y + h / 2 - 10;
        ctx.strokeStyle = "rgba(232,198,106,0.5)"; ctx.lineWidth = 5;
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          ctx.moveTo(cx - 40 + i * 26, y + h);
          ctx.lineTo(cx - 20 + i * 14, cy + 60);
          ctx.stroke();
        }
        ctx.fillStyle = "#e8c66a"; ctx.beginPath(); ctx.arc(cx, cy, 78, 0, 7); ctx.fill();
        ctx.fillStyle = "#a8862a"; ctx.beginPath(); ctx.arc(cx, cy, 52, 0, 7); ctx.fill();
        ctx.fillStyle = "#e8c66a"; ctx.beginPath(); ctx.arc(cx, cy, 30, 0, 7); ctx.fill();
        ctx.fillStyle = "#40121a";
        for (let a = 0; a < 8; a++) {
          const ang = (a / 8) * 6.283;
          px(cx + Math.cos(ang) * 64 - 4, cy + Math.sin(ang) * 64 - 4, 9, 9, "#40121a");
        }
      }}
    ];

    case "ending_dan": return [
      { caption: LORE.endings.dan.caption, balloon: LORE.endings.dan.balloon, art: (x, y, w, h) => {
        ctx.fillStyle = "#120e1a"; ctx.fillRect(x, y, w, h);
        // the den above the garage: one lamp, one man, peace
        ctx.fillStyle = "rgba(255,220,140,0.12)";
        ctx.beginPath(); ctx.moveTo(x + w / 2, y + 60); ctx.lineTo(x + w / 2 - 130, y + h); ctx.lineTo(x + w / 2 + 130, y + h); ctx.fill();
        px(x + w / 2 - 4, y + 60, 8, 40, "#3a3442");
        px(x + w / 2 - 26, y + 44, 52, 22, "#c9a86a");            // lampshade
        px(x + w / 2 - 90, y + h - 120, 84, 70, "#3a2e40");       // armchair
        px(x + w / 2 - 100, y + h - 130, 20, 80, "#3a2e40");
        px(x + w / 2 + 6, y + h - 130, 20, 80, "#3a2e40");
        drawHumanoid(x + w / 2 - 48, y + h - 66, {
          face: 1, walk: 0, swing: 0, hurt: false, ...CHAR_PAL.dan, w: 26, h: 52
        });
      }}
    ];

    case "ending_blake": return [
      { caption: LORE.endings.blake.caption, balloon: LORE.endings.blake.balloon, art: (x, y, w, h) => {
        ctx.fillStyle = "#f0e2c8"; ctx.fillRect(x, y, w, h);
        // streamers
        const cols = ["#ff4f79", "#39d5ff", "#67e06b", "#ffd23f"];
        for (let s = 0; s < 10; s++) {
          ctx.fillStyle = cols[s % 4];
          ctx.beginPath();
          ctx.moveTo(x + s * 66, y);
          ctx.lineTo(x + s * 66 + 20, y);
          ctx.lineTo(x + s * 66 + 4, y + 46);
          ctx.closePath(); ctx.fill();
        }
        // partygoers who do not know him
        drawHumanoid(x + 110, y + h - 60, { face: 1, walk: 0, swing: 0, hurt: false, skin: "#e0b090", shirt: "#c05a8a", pants: "#4a4433", hair: "#4a2c14", w: 24, h: 52 });
        drawHumanoid(x + 480, y + h - 60, { face: -1, walk: 0, swing: 0, hurt: false, skin: "#a06a44", shirt: "#3a7d5a", pants: "#33333b", hair: "#1c1208", w: 24, h: 52 });
        // Blake + the birthday kid on his shoulders
        drawHumanoid(x + w / 2, y + h - 56, { face: 1, walk: 0, swing: 0, hurt: false, ...CHAR_PAL.blake, w: 28, h: 58 });
        drawHumanoid(x + w / 2, y + h - 112, { face: 1, walk: 0, swing: 0, hurt: false, skin: "#e8c8a0", shirt: "#ff8c42", pants: "#4a5a8a", hair: "#5a3418", w: 15, h: 30 });
        px(x + w / 2 - 3, y + h - 148, 6, 10, "#ffd23f");         // party hat
        if (ANGELO_IN_WINDOW) {
          // through the window: a familiar silhouette, walking up the driveway
          px(x + w - 130, y + 66, 96, 84, "#8fb4d8");
          ctx.strokeStyle = "#7a6a52"; ctx.lineWidth = 5;
          ctx.strokeRect(x + w - 130, y + 66, 96, 84);
          px(x + w - 92, y + 96, 18, 40, "#3a3226");
          px(x + w - 88, y + 84, 12, 12, "#5a4a34");
          px(x + w - 92, y + 80, 18, 6, "#2c2620");                // the hat
        }
      }}
    ];

    case "ending_jake": return [
      { caption: LORE.endings.jake.caption, balloon: LORE.endings.jake.balloon, art: (x, y, w, h) => {
        ctx.fillStyle = "#2c6a3c"; ctx.fillRect(x, y, w, h);       // the field
        ctx.strokeStyle = "rgba(255,255,255,0.6)"; ctx.lineWidth = 3;
        for (let l = 0; l < 5; l++) {
          ctx.beginPath(); ctx.moveTo(x, y + 90 + l * 66); ctx.lineTo(x + w, y + 80 + l * 66); ctx.stroke();
        }
        // scoreboard
        px(x + 40, y + 50, 150, 66, "#1a1a22");
        ctx.fillStyle = "#ffd23f"; ctx.font = "bold 16px monospace"; ctx.textAlign = "center";
        ctx.fillText("42 — 0", x + 115, y + 90);
        // Jake, mid-touchdown, flag in hand
        drawHumanoid(x + w / 2 + 40, y + h - 70, { face: -1, walk: 0.5, swing: 8, hurt: false, ...CHAR_PAL.jake, w: 28, h: 58 });
        ctx.strokeStyle = "#8a8f98"; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(x + w / 2 + 8, y + h - 120); ctx.lineTo(x + w / 2 - 20, y + h - 190); ctx.stroke();
        ctx.fillStyle = "#ffd23f";
        ctx.beginPath();
        ctx.moveTo(x + w / 2 - 20, y + h - 190);
        ctx.lineTo(x + w / 2 - 64, y + h - 178);
        ctx.lineTo(x + w / 2 - 20, y + h - 166);
        ctx.closePath(); ctx.fill();
      }}
    ];
  }
  return null;
}

/* ---------------- the helicopter (shared sprite) ---------------- */
export function drawHeli(cx: number, cy: number, t: number, doorOpen: boolean): void {
  // rotor
  const spin = Math.sin(t * 0.9);
  ctx.strokeStyle = "rgba(200,210,220,0.8)"; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(cx - 70 * Math.abs(spin) - 10, cy - 34); ctx.lineTo(cx + 70 * Math.abs(spin) + 10, cy - 34); ctx.stroke();
  px(cx - 3, cy - 34, 6, 8, "#8a95a0");
  // body
  ctx.fillStyle = "#b9c4cc";
  ctx.beginPath(); ctx.ellipse(cx, cy, 52, 24, 0, 0, 7); ctx.fill();
  ctx.fillStyle = "#2a3440";                                   // canopy
  ctx.beginPath(); ctx.ellipse(cx + 28, cy - 6, 18, 12, 0, 0, 7); ctx.fill();
  // tail boom + star on the tail
  px(cx - 96, cy - 8, 52, 10, "#b9c4cc");
  ctx.fillStyle = "#8a95a0";
  ctx.beginPath(); ctx.moveTo(cx - 96, cy - 22); ctx.lineTo(cx - 84, cy - 3); ctx.lineTo(cx - 96, cy - 3); ctx.closePath(); ctx.fill();
  drawStar(cx - 76, cy - 3, 8, "#2b4fa0");
  // door + skids
  if (doorOpen) px(cx - 26, cy - 12, 26, 26, "#1c242e");
  px(cx - 44, cy + 26, 74, 4, "#6a7580");
  px(cx - 30, cy + 18, 4, 10, "#6a7580"); px(cx + 18, cy + 18, 4, 10, "#6a7580");
}

function drawStar(cx: number, cy: number, r: number, color: string): void {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const ang = (i / 10) * Math.PI * 2 - Math.PI / 2;
    const rad = i % 2 === 0 ? r : r * 0.45;
    const sx = cx + Math.cos(ang) * rad, sy = cy + Math.sin(ang) * rad;
    if (i === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
  }
  ctx.closePath(); ctx.fill();
}

/* ---------------- THE AAC OUTRO: the owner's helicopter ----------------
   Scripted beat after Patty D. falls. World is frozen; we animate over it.
   Returns true when finished. */
const OUTRO_LEN = 430;

export function stepOutro(): boolean {
  G.outroT++;
  const p = G.player;
  if (G.outroT === 10) SFX.win();
  if (G.outroT < 70 && G.outroT % 12 === 0) {
    confetti(G.cam + rnd(100, 860), rnd(120, 300), 14);
  }
  if (G.outroT === 200 && p) floatText(p.x, p.y - 120, LORE.aubrey.name, "#9ec7f0", 14, 60);
  // auto-walk aboard
  if (p && G.outroT > 250 && G.outroT < 330) {
    const hx = G.cam + W / 2;
    if (Math.abs(p.x - hx) > 6) { p.x += Math.sign(hx - p.x) * 2.4; p.walk += 0.25; p.face = (hx > p.x ? 1 : -1); }
  }
  if (p && G.outroT === 330) p.x = G.cam - 600;   // aboard — off camera
  return G.outroT >= OUTRO_LEN;
}

export function drawOutro(): void {
  const t = G.outroT;
  // helicopter path: descend to the court, hold, rise
  const hx = W / 2;
  let hy: number;
  if (t < 200) hy = -60 + (t / 200) * 360;
  else if (t < 330) hy = 300 + Math.sin(t * 0.08) * 3;
  else hy = 300 - ((t - 330) / 100) * 420;
  drawHeli(hx, hy, t, t >= 180 && t < 340);
  // AUBREY at the door
  if (t >= 200 && t < 330) {
    px(hx - 20, hy - 10, 14, 20, "#2c2c34");
    px(hx - 18, hy - 18, 10, 9, "#8a5a3c");
    if (t > 215) {
      const msg = LORE.aubrey.line;
      ctx.font = "bold 13px monospace"; ctx.textAlign = "center";
      const bw = msg.length * 8 + 22;
      ctx.fillStyle = "#fff";
      ctx.beginPath(); ctx.ellipse(hx - 12, hy - 44, bw / 2, 16, 0, 0, 7); ctx.fill();
      ctx.fillStyle = "#0a0512";
      ctx.fillText(msg, hx - 12, hy - 40);
    }
  }
  // rotor wash dust
  if (t > 120 && t < 340) {
    ctx.fillStyle = "rgba(200,200,210,0.15)";
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.ellipse(hx + rnd(-90, 90), 470 + rnd(-8, 8), rnd(10, 30), 5, 0, 0, 7);
      ctx.fill();
    }
  }
  // fade to black at the end
  if (t > 340) {
    ctx.fillStyle = `rgba(0,0,0,${clamp((t - 340) / 80, 0, 1)})`;
    ctx.fillRect(0, 0, W, H);
  }
}
