/* Non-gameplay screens: title, character select, 4-panel comic intro,
   stage title cards, results card, win/lose, pause overlay. */
import { ctx } from "../engine/canvas";
import { G } from "../engine/entity";
import { W, H, CHARS, rankFor } from "../balance";
import type { CharKey } from "../balance";
import { LORE } from "../lore";
import { isTouch } from "../input";
import { drawHumanoid, CHAR_PAL, px } from "./sprites";
import { CHAR_KEYS } from "../actors/player";

export function drawTitle(): void {
  ctx.textAlign = "center";
  ctx.fillStyle = "#ffd23f"; ctx.font = "bold 72px monospace";
  ctx.fillText(LORE.title, W / 2, 190);
  ctx.fillStyle = "#ff4f79"; ctx.font = "bold 28px monospace";
  ctx.fillText(LORE.subtitle, W / 2, 236);
  ctx.fillStyle = "#39d5ff"; ctx.font = "13px monospace";
  ctx.fillText(LORE.tagline, W / 2, 268);
  if (G.tick % 60 < 40) {
    ctx.fillStyle = "#fff"; ctx.font = "bold 18px monospace";
    ctx.fillText(LORE.pressStart, W / 2, 380);
  }
  ctx.fillStyle = "#888"; ctx.font = "11px monospace";
  ctx.fillText(isTouch ? LORE.ui.controlsTouch : LORE.ui.controlsKeyboard, W / 2, 414);
}

export function drawSelect(): void {
  ctx.textAlign = "center";
  ctx.fillStyle = "#fff"; ctx.font = "bold 26px monospace";
  ctx.fillText(LORE.ui.chooseHost, W / 2, 90);
  CHAR_KEYS.forEach((k: CharKey, i: number) => {
    const c = CHARS[k], lore = LORE.chars[k], pal = CHAR_PAL[k];
    const bx = W / 2 + (i - 1) * 260;
    const on = i === G.selIdx;
    ctx.fillStyle = on ? "rgba(255,210,63,0.14)" : "rgba(0,0,0,0.35)";
    ctx.fillRect(bx - 105, 150, 210, 270);
    if (on) { ctx.strokeStyle = "#ffd23f"; ctx.lineWidth = 3; ctx.strokeRect(bx - 105, 150, 210, 270); }
    drawHumanoid(bx, 330, {
      face: 1, walk: on ? G.tick * 0.15 : 0, swing: 0, hurt: false,
      ...pal, w: c.w + 6, h: c.h + 8
    });
    ctx.fillStyle = on ? "#ffd23f" : "#ccc"; ctx.font = "bold 18px monospace";
    ctx.fillText(lore.name, bx, 368);
    ctx.fillStyle = "#39d5ff"; ctx.font = "10px monospace";
    ctx.fillText(lore.tag, bx, 386);
    // same stats across the board — the special is the choice
    ctx.fillStyle = "#8a7ba8"; ctx.font = "10px monospace";
    ctx.fillText(LORE.ui.specialTag, bx, 402);
    ctx.fillStyle = on ? "#fff" : "#aaa"; ctx.font = "bold 12px monospace";
    ctx.fillText(lore.special, bx, 416);
  });
  if (G.tick % 60 < 40) {
    ctx.fillStyle = "#fff"; ctx.font = "14px monospace";
    ctx.fillText(LORE.ui.choose, W / 2, 470);
  }
}

/* ---- 4-panel comic intro: procedurally drawn static panels ---- */
export function drawIntro(): void {
  ctx.fillStyle = "#0b0618"; ctx.fillRect(0, 0, W, H);
  const positions = [
    { x: 60, y: 40 }, { x: 500, y: 40 }, { x: 60, y: 290 }, { x: 500, y: 290 }
  ];
  for (let i = 0; i <= G.introPanel && i < 4; i++) {
    drawPanel(i, positions[i].x, positions[i].y, 400, 210);
  }
  if (G.tick % 60 < 40) {
    ctx.fillStyle = "#ffd23f"; ctx.font = "bold 13px monospace"; ctx.textAlign = "center";
    ctx.fillText(LORE.introSkip, W / 2, H - 14);
  }
}

function drawPanel(i: number, x: number, y: number, w: number, h: number): void {
  const panel = LORE.intro[i];
  ctx.save();
  ctx.strokeStyle = "#fff"; ctx.lineWidth = 3;
  ctx.strokeRect(x, y, w, h);
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();

  if (i === 0) {
    // downtown at showtime
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, "#150b2e"); g.addColorStop(1, "#5b2470");
    ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = "#1c0f36";
    for (let b = 0; b < 6; b++) ctx.fillRect(x + 20 + b * 66, y + 60 + (b * b * 17) % 40, 44, h);
    ctx.fillStyle = "#ffd23f";
    for (let d = 0; d < 30; d++) ctx.fillRect(x + 26 + (d * 37) % 360, y + 80 + (d * d * 13) % 100, 4, 5);
    ctx.fillStyle = "#3b1d1d"; ctx.fillRect(x + 140, y + 110, 130, 100);
    ctx.fillStyle = "#ff4f79"; ctx.font = "bold 12px monospace"; ctx.textAlign = "center";
    ctx.fillText(LORE.signage.building, x + 205, y + 132);
  } else if (i === 1) {
    // the door bursts open
    ctx.fillStyle = "#b9c9b4"; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = "#22201c"; ctx.fillRect(x + w / 2 - 50, y + 40, 100, h);
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.moveTo(x + w / 2, y + 40);
    for (let a = 0; a < 12; a++) {
      const ang = (a / 12) * Math.PI * 2;
      const r = a % 2 === 0 ? 90 : 40;
      ctx.lineTo(x + w / 2 + Math.cos(ang) * r, y + 110 + Math.sin(ang) * r * 0.7);
    }
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#0a0512"; ctx.font = "bold 26px monospace"; ctx.textAlign = "center";
    ctx.fillText(LORE.signage.doorBurst, x + w / 2, y + 118);
  } else if (i === 2) {
    // the cat man silhouette
    ctx.fillStyle = "#31145a"; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = "#0a0512";
    px(x + w / 2 - 20, y + 60, 40, 90, "#0a0512");
    px(x + w / 2 - 14, y + 36, 28, 26, "#0a0512");
    // glowing cat eyes on his shoulder
    px(x + w / 2 + 22, y + 52, 12, 10, "#0a0512");
    ctx.fillStyle = "#7CFC00";
    ctx.fillRect(x + w / 2 + 24, y + 55, 3, 3); ctx.fillRect(x + w / 2 + 29, y + 55, 3, 3);
  } else {
    // dawn, the crew ready
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, "#8e3a6e"); g.addColorStop(1, "#ffb46b");
    ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
    const keys: CharKey[] = ["blake", "jake", "dan"];
    keys.forEach((k, j) => {
      const pal = CHAR_PAL[k];
      drawHumanoid(x + 120 + j * 80, y + 175, { face: 1, walk: 0, swing: 0, hurt: false, ...pal, w: 26, h: 56 });
    });
  }

  // caption box
  ctx.fillStyle = "#f4f0e2";
  ctx.fillRect(x + 4, y + 4, w - 8, 24);
  ctx.fillStyle = "#0a0512"; ctx.font = "bold 11px monospace"; ctx.textAlign = "left";
  ctx.fillText(panel.caption, x + 10, y + 20);
  // dialogue balloon
  if (panel.balloon) {
    const bw = Math.min(w - 20, panel.balloon.length * 8 + 24);
    ctx.fillStyle = "#fff";
    ctx.beginPath(); ctx.ellipse(x + w / 2, y + h - 30, bw / 2, 18, 0, 0, 7); ctx.fill();
    ctx.fillStyle = "#0a0512"; ctx.font = "bold 11px monospace"; ctx.textAlign = "center";
    ctx.fillText(panel.balloon, x + w / 2, y + h - 26);
  }
  ctx.restore();
}

/* ---- HOW TO PLAY: overlay in the end-screen style ---- */
function keycap(x: number, y: number, label: string, round: boolean): number {
  const w = round ? 34 : Math.max(34, label.length * 10 + 16);
  ctx.fillStyle = "#1a1424";
  ctx.strokeStyle = "#8a7ba8"; ctx.lineWidth = 2;
  if (round) {
    ctx.beginPath(); ctx.arc(x + 17, y + 15, 16, 0, 7); ctx.fill(); ctx.stroke();
  } else {
    ctx.fillRect(x, y, w, 30); ctx.strokeRect(x, y, w, 30);
  }
  ctx.fillStyle = "#fff"; ctx.font = "bold 14px monospace"; ctx.textAlign = "center";
  ctx.fillText(label, x + w / 2, y + 20);
  return w;
}

export function drawHowTo(): void {
  ctx.fillStyle = "rgba(0,0,0,0.78)"; ctx.fillRect(0, 0, W, H);
  const T = LORE.howto;
  const kb = !isTouch;
  ctx.textAlign = "center";
  ctx.fillStyle = "#ffd23f"; ctx.font = "bold 40px monospace";
  ctx.fillText(T.title, W / 2, 76);

  interface Row { keys: string[]; round: boolean; label: string; detail: string; }
  const rows: Row[] = [
    { keys: kb ? ["W", "A", "S", "D"] : ["D-PAD"], round: false, label: T.move, detail: T.moveDetail },
    { keys: kb ? ["J"] : ["A"], round: !kb, label: T.attack, detail: T.attackDetail },
    { keys: kb ? ["K"] : ["B"], round: !kb, label: T.strong, detail: T.strongDetail },
    { keys: kb ? ["L"] : ["S"], round: !kb, label: T.special, detail: T.specialDetail },
    { keys: ["◀◀", "▶▶"], round: false, label: T.dash, detail: T.dashDetail },
    { keys: kb ? ["J"] : ["A"], round: !kb, label: T.grab, detail: T.grabDetail }
  ];
  rows.forEach((r, i) => {
    const col = i < 3 ? 0 : 1;
    const x0 = 80 + col * 450, y0 = 122 + (i % 3) * 92;
    let kx = x0;
    r.keys.forEach(k => { kx += keycap(kx, y0, k, r.round) + 6; });
    ctx.textAlign = "left";
    ctx.fillStyle = "#ffd23f"; ctx.font = "bold 18px monospace";
    ctx.fillText(r.label, kx + 10, y0 + 21);
    ctx.fillStyle = "#b9aecb"; ctx.font = "13px monospace";
    ctx.fillText(r.detail, x0, y0 + 52);
  });

  // live demo: your host decking a lawyer, forever
  const key = (G.player ? G.player.key : "blake");
  const pal = CHAR_PAL[key];
  const cyc = G.tick % 60;
  const swing = cyc > 40 && cyc < 52 ? 52 - cyc : 0;
  const hit = cyc >= 46 && cyc < 54;
  drawHumanoid(W / 2 - 40, 470, { face: 1, walk: 0, swing, hurt: false, ...pal, w: 28, h: 58 });
  drawHumanoid(W / 2 + 42 + (hit ? (cyc - 46) * 2 : 0), 470, {
    face: -1, walk: 0, swing: 0, hurt: hit, brief: true,
    skin: "#e0b090", shirt: "#23283b", pants: "#181c2b", hair: "#333", tie: "#c02040", w: 26, h: 56
  });
  if (hit) {
    ctx.fillStyle = "#ffd23f";
    for (let s = 0; s < 5; s++) {
      const a = (s / 5) * 6.28 + cyc;
      ctx.fillRect(W / 2 + 20 + Math.cos(a) * 12, 430 + Math.sin(a) * 10, 3, 3);
    }
  }

  if (G.tick % 60 < 40) {
    ctx.textAlign = "center";
    ctx.fillStyle = "#fff"; ctx.font = "bold 15px monospace";
    ctx.fillText(T.continue, W / 2, 522);
  }
}

export function drawStageCard(): void {
  ctx.fillStyle = "#0b0618"; ctx.fillRect(0, 0, W, H);
  const s = LORE.stages[G.stageIdx];
  ctx.textAlign = "center";
  ctx.fillStyle = "#39d5ff"; ctx.font = "bold 20px monospace";
  ctx.fillText(`${LORE.stageCardPrefix} ${G.stageIdx + 1}`, W / 2, 220);
  ctx.fillStyle = "#ffd23f"; ctx.font = "bold 44px monospace";
  ctx.fillText(s.title, W / 2, 272);
  ctx.fillStyle = "#aaa"; ctx.font = "15px monospace";
  ctx.fillText(s.sub, W / 2, 304);
}

export function drawResults(): void {
  ctx.fillStyle = "rgba(0,0,0,0.78)"; ctx.fillRect(0, 0, W, H);
  const R = LORE.results;
  const p = G.player;
  const stageScore = G.score - G.stats.startScore;
  const damageFrac = p ? G.stats.damage / p.maxHp : 1;
  const rank = rankFor(damageFrac, G.stats.maxCombo, G.stats.died);
  ctx.textAlign = "center";
  ctx.fillStyle = "#67e06b"; ctx.font = "bold 40px monospace";
  ctx.fillText(R.header, W / 2, 150);
  ctx.font = "bold 18px monospace"; ctx.fillStyle = "#fff";
  ctx.textAlign = "left";
  const lx = W / 2 - 160, rx = W / 2 + 160;
  const row = (label: string, val: string, y: number): void => {
    ctx.textAlign = "left"; ctx.fillStyle = "#9a8ab0"; ctx.fillText(label, lx, y);
    ctx.textAlign = "right"; ctx.fillStyle = "#fff"; ctx.fillText(val, rx, y);
  };
  row(R.score, String(stageScore), 210);
  row(R.maxCombo, String(G.stats.maxCombo), 244);
  row(R.damage, String(Math.round(G.stats.damage)), 278);
  // rank letter with joke label
  ctx.textAlign = "center";
  ctx.fillStyle = rank === "S" ? "#ffd23f" : rank === "F" ? "#ff4f79" : "#39d5ff";
  ctx.font = "bold 84px monospace";
  ctx.fillText(rank, W / 2, 386);
  ctx.font = "bold 16px monospace";
  ctx.fillText(`"${LORE.ranks[rank]}"`, W / 2, 414);
  if (G.tick % 60 < 40 && G.selCooldown === 0) {
    ctx.fillStyle = "#fff"; ctx.font = "14px monospace";
    ctx.fillText(R.next, W / 2, 470);
  }
}

export function drawEnd(big: string, small: string, color: string): void {
  ctx.fillStyle = "rgba(0,0,0,0.72)"; ctx.fillRect(0, 0, W, H);
  ctx.textAlign = "center";
  ctx.fillStyle = color; ctx.font = "bold 44px monospace";
  ctx.fillText(big, W / 2, 230);
  ctx.fillStyle = "#ddd"; ctx.font = "15px monospace";
  ctx.fillText(small, W / 2, 268);
  ctx.fillStyle = "#fff"; ctx.font = "bold 18px monospace";
  ctx.fillText(`${LORE.finalScore}: ${G.score}`, W / 2, 320);
  if (G.tick % 60 < 40 && G.selCooldown === 0) {
    ctx.fillStyle = "#ffd23f"; ctx.font = "14px monospace";
    ctx.fillText(LORE.playAgain, W / 2, 370);
  }
}

export function drawPauseOverlay(): void {
  ctx.fillStyle = "rgba(0,0,0,0.6)"; ctx.fillRect(0, 0, W, H);
  ctx.textAlign = "center";
  ctx.fillStyle = "#ffd23f"; ctx.font = "bold 40px monospace";
  ctx.fillText(LORE.ui.paused, W / 2, H / 2 - 10);
  ctx.fillStyle = "#aaa"; ctx.font = "14px monospace";
  ctx.fillText(LORE.ui.pauseHint, W / 2, H / 2 + 24);
}
