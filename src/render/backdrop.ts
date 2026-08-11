/* Per-stage backgrounds: Fox 4 interior, downtown night, casino
   penthouse (with elevator), rooftop dawn. */
import { ctx } from "../engine/canvas";
import { G } from "../engine/entity";
import { W, H, FLOOR_TOP } from "../balance";
import { drawSkyline, NIGHT, DAWN } from "./skyline";
import { LORE } from "../lore";
import { STAGES } from "../stages";

function paintSkyNight(): void {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#150b2e"); g.addColorStop(0.55, "#31145a"); g.addColorStop(0.75, "#5b2470");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
function paintSkyDawn(): void {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#2a1a4e"); g.addColorStop(0.4, "#8e3a6e"); g.addColorStop(0.62, "#e86a5a"); g.addColorStop(0.8, "#ffb46b");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}

function stars(): void {
  ctx.fillStyle = "#ffffff";
  for (let i = 0; i < 40; i++) {
    const sx = (i * 97 + ((i * i * 13) % 53)) % W, sy = (i * i * 31) % 200;
    if ((G.tick / 20 + i) % 7 < 6) ctx.fillRect(sx, sy, 2, 2);
  }
}

function street(floorA: string, floorB: string, lineC: string): void {
  ctx.fillStyle = floorA; ctx.fillRect(0, FLOOR_TOP - 40, W, H - FLOOR_TOP + 40);
  ctx.fillStyle = floorB; ctx.fillRect(0, FLOOR_TOP - 40, W, 14);
  ctx.strokeStyle = lineC; ctx.lineWidth = 2;
  for (let i = 0; i < 14; i++) {
    const lx = (i * 120 - G.cam % 120);
    ctx.beginPath(); ctx.moveTo(lx, FLOOR_TOP - 26); ctx.lineTo(lx - 60, H); ctx.stroke();
  }
}

export function drawBackdrop(): void {
  switch (STAGES[G.stageIdx].backdrop) {
    case 0: drawStudio(); break;
    case 1: drawDowntown(); break;
    case 2: drawPenthouse(); break;
    case 3: drawRooftop(); break;
  }
}

/* ---------------- Stage 1: Fox 4 interior ---------------- */
function drawStudio(): void {
  const stage = STAGES[G.stageIdx];
  // fluorescent green-white wall
  const g = ctx.createLinearGradient(0, 0, 0, FLOOR_TOP);
  g.addColorStop(0, "#dfeadb"); g.addColorStop(1, "#b9c9b4");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, FLOOR_TOP);
  // ceiling strip + fluorescent tubes
  ctx.fillStyle = "#9aa894"; ctx.fillRect(0, 0, W, 40);
  for (let i = 0; i < 8; i++) {
    const lx = i * 260 - (G.cam % 260);
    const flick = (G.tick + i * 13) % 180 > 4;
    ctx.fillStyle = flick ? "#f6ffe8" : "#c9d4bc";
    ctx.fillRect(lx, 34, 120, 10);
    ctx.fillStyle = "rgba(246,255,232,0.05)";
    ctx.beginPath(); ctx.moveTo(lx + 10, 44); ctx.lineTo(lx - 40, FLOOR_TOP); ctx.lineTo(lx + 160, FLOOR_TOP); ctx.fill();
  }
  // windows showing the purple night (city stays inside the panes)
  for (let i = 0; i < 6; i++) {
    const wx = i * 420 - (G.cam * 0.9 % 420) + 100;
    if (wx < -160 || wx > W) continue;
    ctx.save();
    ctx.beginPath(); ctx.rect(wx, 90, 150, 170); ctx.clip();
    ctx.fillStyle = "#2a1548"; ctx.fillRect(wx, 90, 150, 170);
    ctx.fillStyle = "#4a2a78";
    for (let b = 0; b < 4; b++) ctx.fillRect(wx + 12 + b * 36, 190 - (b * b * 11) % 50, 22, 70 + (b * 17) % 40);
    ctx.fillStyle = "#ffd23f";
    for (let d = 0; d < 12; d++) {
      const lx = wx + 16 + (d * 41) % 120, ly = 176 + (d * d * 23) % 70;
      if ((d + ((G.tick / 40) | 0)) % 5 < 4) ctx.fillRect(lx, ly, 2, 3);
    }
    ctx.restore();
    ctx.strokeStyle = "#7f8f7a"; ctx.lineWidth = 6; ctx.strokeRect(wx, 90, 150, 170);
    ctx.beginPath(); ctx.moveTo(wx + 75, 90); ctx.lineTo(wx + 75, 260); ctx.stroke();
  }
  // studio desks / gear props
  for (let i = 0; i < 5; i++) {
    const dx2 = i * 700 - (G.cam % 700) + 240;
    if (dx2 < -200 || dx2 > W) continue;
    ctx.fillStyle = "#5a4a3a"; ctx.fillRect(dx2, 260, 130, 56);
    ctx.fillStyle = "#333"; ctx.fillRect(dx2 + 18, 236, 30, 24);
    ctx.fillStyle = "#222"; ctx.fillRect(dx2 + 66, 244, 8, 18);
    ctx.fillStyle = "#888"; ctx.fillRect(dx2 + 62, 232, 16, 12);
  }
  // ON AIR sign (the gag)
  if (stage.onAirX !== undefined) {
    const sx = stage.onAirX - G.cam;
    if (sx > -120 && sx < W + 120) {
      const lit = G.onAirDone && G.onAirT > 0 ? G.tick % 8 < 5 : G.onAirDone;
      const preFlicker = !G.onAirDone && G.tick % 90 > 84;
      ctx.fillStyle = "#22201c"; ctx.fillRect(sx - 52, 58, 104, 36);
      ctx.fillStyle = lit || preFlicker ? "#ff2222" : "#4a1111";
      ctx.font = "bold 20px monospace"; ctx.textAlign = "center";
      ctx.fillText(LORE.onAir, sx, 84);
      if (lit) {
        ctx.fillStyle = "rgba(255,40,40,0.10)";
        ctx.beginPath(); ctx.moveTo(sx - 40, 94); ctx.lineTo(sx - 120, FLOOR_TOP); ctx.lineTo(sx + 120, FLOOR_TOP); ctx.fill();
      }
    }
  }
  // exit doors at the end
  const ex = STAGES[G.stageIdx].length - 200 - G.cam;
  if (ex < W + 200) {
    ctx.fillStyle = "#3c4a3c"; ctx.fillRect(ex, 120, 150, 230);
    ctx.fillStyle = "#7fd9a0"; ctx.fillRect(ex + 26, 140, 44, 190); ctx.fillRect(ex + 80, 140, 44, 190);
    ctx.fillStyle = "#163a26"; ctx.font = "bold 13px monospace"; ctx.textAlign = "center";
    ctx.fillText(LORE.signage.exit, ex + 75, 134);
  }
  street("#6a7264", "#7d8576", "#575e51");
}

/* ---------------- Stage 2: downtown night ---------------- */
function drawDowntown(): void {
  paintSkyNight();
  stars();
  // moon
  ctx.fillStyle = "#ffe9b0"; ctx.beginPath(); ctx.arc(W - 140, 70, 26, 0, 7); ctx.fill();
  ctx.fillStyle = "#150b2e"; ctx.beginPath(); ctx.arc(W - 130, 62, 22, 0, 7); ctx.fill();
  drawSkyline(310, NIGHT, paintSkyNight);
  street("#2a2a33", "#37374a", "#1d1d26");
  drawDowntownProps();
  lampPosts();
}

/* ---- street-level Dallas props (stage 2 sidewalk) ---- */
function drawDowntownProps(): void {
  drawEyeball(760);
  drawTravelingMan(1560);
  drawMural(1900, 240, 0);
  drawCattleDrive(2950);
  drawMural(3480, 200, 1);
}

/** the Giant Eyeball — it watches you fight */
function drawEyeball(wx: number): void {
  const sx = wx - G.cam;
  if (sx < -90 || sx > W + 90) return;
  ctx.fillStyle = "#274d2c";
  ctx.beginPath(); ctx.ellipse(sx, 334, 48, 10, 0, 0, 7); ctx.fill();
  ctx.fillStyle = "#f2efe8";
  ctx.beginPath(); ctx.arc(sx, 300, 30, 0, 7); ctx.fill();
  // veins
  ctx.strokeStyle = "rgba(192,57,43,0.5)"; ctx.lineWidth = 1.5;
  for (const a of [2.5, 3.6, 0.5, 5.7]) {
    ctx.beginPath();
    ctx.moveTo(sx + Math.cos(a) * 28, 300 + Math.sin(a) * 28);
    ctx.lineTo(sx + Math.cos(a + 0.35) * 16, 300 + Math.sin(a + 0.35) * 16);
    ctx.stroke();
  }
  // the iris tracks whoever is fighting nearby
  const p = G.player;
  const look = p ? Math.max(-5, Math.min(5, (p.x - wx) * 0.02)) : 0;
  ctx.fillStyle = "#2f6fd0"; ctx.beginPath(); ctx.arc(sx + look, 304, 13, 0, 7); ctx.fill();
  ctx.fillStyle = "#0d1a2e"; ctx.beginPath(); ctx.arc(sx + look, 304, 6, 0, 7); ctx.fill();
  ctx.fillStyle = "#fff"; ctx.fillRect(sx + look - 7, 294, 5, 5);
}

/** the Traveling Man — Deep Ellum's friendly robot, mid-wave */
function drawTravelingMan(wx: number): void {
  const sx = wx - G.cam;
  if (sx < -70 || sx > W + 70) return;
  const silver = "#aeb9c2", dark = "#7d8890";
  const wave = Math.sin(G.tick * 0.05);
  ctx.fillStyle = dark;
  ctx.fillRect(sx - 16, 328, 15, 6); ctx.fillRect(sx + 2, 328, 15, 6);   // feet
  ctx.fillStyle = silver;
  ctx.fillRect(sx - 12, 258, 9, 72); ctx.fillRect(sx + 4, 258, 9, 72);   // legs
  ctx.fillRect(sx - 16, 216, 33, 46);                                    // body
  ctx.fillRect(sx - 12, 210, 25, 8);
  ctx.fillRect(sx - 24, 222, 7, 34);                                     // resting arm
  ctx.save();                                                            // waving arm
  ctx.translate(sx + 16, 224);
  ctx.rotate(-1.0 + wave * 0.14);
  ctx.fillRect(0, -4, 30, 7);
  ctx.beginPath(); ctx.arc(33, 0, 6, 0, 7); ctx.fill();
  ctx.restore();
  ctx.fillRect(sx - 11, 182, 23, 26);                                    // head
  ctx.fillStyle = "#233842";
  ctx.fillRect(sx - 5, 190, 4, 6); ctx.fillRect(sx + 4, 190, 4, 6);      // eyes
  ctx.strokeStyle = "#233842"; ctx.lineWidth = 2;                        // the smile
  ctx.beginPath(); ctx.arc(sx + 1, 198, 6, 0.3, 2.8); ctx.stroke();
  ctx.fillStyle = dark; ctx.fillRect(sx, 172, 2, 10);                    // antenna
  ctx.fillStyle = (G.tick % 50 < 25) ? "#ffd23f" : "#8a6d1f";
  ctx.fillRect(sx - 2, 167, 6, 6);
}

/** Deep Ellum mural walls */
function drawMural(wx: number, wide: number, variant: number): void {
  const sx = wx - G.cam;
  if (sx + wide < -20 || sx > W + 20) return;
  // brick wall
  ctx.fillStyle = "#4a3128"; ctx.fillRect(sx, 248, wide, 84);
  ctx.fillStyle = "#3a251e";
  for (let y = 258; y < 330; y += 12) ctx.fillRect(sx, y, wide, 2);
  // the art
  if (variant === 0) {
    ctx.fillStyle = "#ffd23f";
    ctx.beginPath(); ctx.arc(sx + 52, 284, 20, 0, 7); ctx.fill();        // sun
    ctx.strokeStyle = "#ff4f79"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(sx + 52, 284, 27, 0, 7); ctx.stroke();
    ctx.strokeStyle = "#39d5ff"; ctx.lineWidth = 4;                      // zigzag
    ctx.beginPath();
    for (let i = 0; i <= 6; i++) ctx.lineTo(sx + 90 + i * 22, i % 2 === 0 ? 300 : 272);
    ctx.stroke();
    ctx.fillStyle = "#67e06b";                                           // blob
    ctx.beginPath(); ctx.ellipse(sx + wide - 46, 296, 22, 14, -0.4, 0, 7); ctx.fill();
    ctx.fillStyle = "#fff";
    for (let i = 0; i < 8; i++) ctx.fillRect(sx + 20 + (i * 53) % (wide - 40), 256 + (i * i * 13) % 24, 3, 3);
    muralText(sx + wide / 2, 326, LORE.signage.mural);
  } else {
    const bands = ["#ff4f79", "#ffd23f", "#67e06b", "#39d5ff", "#8e3bb5"];
    bands.forEach((c, i) => {                                            // rainbow rays
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.moveTo(sx + 30, 330);
      ctx.lineTo(sx + 40 + i * 34, 252); ctx.lineTo(sx + 62 + i * 34, 252);
      ctx.closePath(); ctx.fill();
    });
    ctx.fillStyle = "#fff";
    ctx.beginPath(); ctx.arc(sx + 30, 322, 10, 0, 7); ctx.fill();
    muralText(sx + wide / 2, 326, LORE.signage.mural2);
  }
}

function muralText(cx: number, y: number, msg: string): void {
  const colors = ["#ff4f79", "#ffd23f", "#39d5ff", "#67e06b"];
  ctx.font = "bold 15px monospace"; ctx.textAlign = "left";
  const w = msg.length * 9;
  for (let i = 0; i < msg.length; i++) {
    ctx.fillStyle = "#0a0512";
    ctx.fillText(msg[i], cx - w / 2 + i * 9 + 1, y + 1);
    ctx.fillStyle = colors[i % colors.length];
    ctx.fillText(msg[i], cx - w / 2 + i * 9, y);
  }
}

/** Pioneer Plaza cattle drive — bronze longhorns, mid-stampede, forever */
function drawCattleDrive(wx: number): void {
  for (let i = 0; i < 3; i++) {
    const sx = wx + i * 85 - G.cam;
    if (sx < -80 || sx > W + 80) continue;
    const bronze = "#5f452a", hi = "#7a5c38";
    ctx.fillStyle = "#3a3226";
    ctx.beginPath(); ctx.ellipse(sx - 6, 332, 42, 7, 0, 0, 7); ctx.fill();
    ctx.fillStyle = bronze;
    ctx.fillRect(sx - 20, 296, 46, 20);                                  // body
    ctx.fillStyle = hi; ctx.fillRect(sx - 20, 296, 46, 5);
    ctx.fillStyle = bronze;
    ctx.fillRect(sx - 18, 316, 5, 16); ctx.fillRect(sx - 6, 316, 5, 16); // legs
    ctx.fillRect(sx + 8, 316, 5, 16); ctx.fillRect(sx + 18, 316, 5, 16);
    ctx.fillRect(sx - 32, 290, 14, 13);                                  // head
    ctx.fillRect(sx - 30, 302, 8, 6);                                    // snout
    ctx.strokeStyle = "#d8c9a8"; ctx.lineWidth = 3;                      // the horns
    ctx.beginPath();
    ctx.moveTo(sx - 42, 286); ctx.quadraticCurveTo(sx - 36, 292, sx - 25, 291);
    ctx.moveTo(sx - 8, 286); ctx.quadraticCurveTo(sx - 14, 292, sx - 25, 291);
    ctx.stroke();
    ctx.strokeStyle = bronze; ctx.lineWidth = 2;                         // tail
    ctx.beginPath(); ctx.moveTo(sx + 26, 298); ctx.quadraticCurveTo(sx + 32, 306, sx + 30, 316); ctx.stroke();
  }
}

function lampPosts(): void {
  for (let i = 0; i < 9; i++) {
    const lx = i * 550 - G.cam;
    if (lx < -60 || lx > W + 60) continue;
    ctx.fillStyle = "#111"; ctx.fillRect(lx, 190, 8, 140);
    ctx.fillStyle = "#ffd23f"; ctx.fillRect(lx - 8, 182, 24, 12);
    ctx.fillStyle = "rgba(255,210,63,0.08)";
    ctx.beginPath(); ctx.moveTo(lx + 4, 194); ctx.lineTo(lx - 46, 340); ctx.lineTo(lx + 54, 340); ctx.fill();
  }
}

/* ---------------- Stage 3: elevator + penthouse ---------------- */
function drawPenthouse(): void {
  const stage = STAGES[G.stageIdx];
  const elevEnd = stage.elevatorEndX ?? 0;

  // gold-and-velvet wall
  const g = ctx.createLinearGradient(0, 0, 0, FLOOR_TOP);
  g.addColorStop(0, "#3a1626"); g.addColorStop(1, "#5a2438");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, FLOOR_TOP);

  // big windows with city lights far below
  for (let i = 0; i < 6; i++) {
    const wx = i * 460 - (G.cam * 0.9 % 460) + 60;
    if (wx < -220 || wx > W) continue;
    ctx.fillStyle = "#160a26"; ctx.fillRect(wx, 70, 200, 210);
    ctx.fillStyle = "#ffd23f";
    for (let d = 0; d < 40; d++) {
      const dx2 = (d * 53) % 190, dy = 150 + (d * d * 17) % 120;
      if ((d + ((G.tick / 30) | 0)) % 9 < 8) ctx.fillRect(wx + 5 + dx2, dy, 2, 2);
    }
    ctx.strokeStyle = "#d4af37"; ctx.lineWidth = 5; ctx.strokeRect(wx, 70, 200, 210);
  }
  // chandeliers + velvet drapes
  for (let i = 0; i < 5; i++) {
    const cx2 = i * 560 - (G.cam % 560) + 300;
    if (cx2 < -80 || cx2 > W + 80) continue;
    ctx.fillStyle = "#d4af37";
    ctx.fillRect(cx2 - 2, 0, 4, 34);
    ctx.beginPath(); ctx.ellipse(cx2, 46, 26, 12, 0, 0, 7); ctx.fill();
    ctx.fillStyle = "#ffe9a0";
    for (let b = -2; b <= 2; b++) ctx.fillRect(cx2 + b * 10 - 1, 52 + Math.abs(b) * 2, 3, 6);
  }
  // slot machines
  for (let i = 0; i < 6; i++) {
    const sx = i * 640 - (G.cam % 640) + 160;
    if (sx < -80 || sx > W + 80) continue;
    ctx.fillStyle = "#7a1f2b"; ctx.fillRect(sx, 240, 54, 80);
    ctx.fillStyle = "#111"; ctx.fillRect(sx + 8, 252, 38, 22);
    ctx.fillStyle = ["#ffd23f", "#ff4f79", "#39d5ff"][((G.tick / 20) | 0 + i) % 3];
    ctx.fillRect(sx + 12, 256, 8, 12); ctx.fillRect(sx + 24, 256, 8, 12); ctx.fillRect(sx + 36, 256, 8, 12);
    ctx.fillStyle = "#d4af37"; ctx.fillRect(sx + 50, 246, 5, 20);
  }
  street("#4a3040", "#5c3c50", "#38202e");

  // elevator interior overrides the start of the stage
  const ex = elevEnd - G.cam;
  if (ex > 0) {
    ctx.fillStyle = "#2c2c34"; ctx.fillRect(0, 0, ex, H);
    ctx.fillStyle = "#44444e";
    for (let lx = -((G.cam / 2) % 60); lx < ex; lx += 60) ctx.fillRect(lx, 0, 4, FLOOR_TOP);
    ctx.fillStyle = "#1c1c22"; ctx.fillRect(0, FLOOR_TOP - 40, ex, H - FLOOR_TOP + 40);
    // floor counter ticking up
    ctx.fillStyle = "#0a0a0c"; ctx.fillRect(Math.min(ex - 150, 60), 60, 120, 44);
    ctx.fillStyle = "#ff9d3c"; ctx.font = "bold 24px monospace"; ctx.textAlign = "center";
    const floor = Math.min(68, 12 + ((G.tick / 40) | 0) % 57);
    ctx.fillText(String(floor).padStart(2, "0"), Math.min(ex - 90, 120), 92);
    // door seam
    ctx.fillStyle = "#d4af37"; ctx.fillRect(ex - 6, 0, 6, H);
  }
}

/* ---------------- Stage 4: rooftop dawn ---------------- */
function drawRooftop(): void {
  paintSkyDawn();
  // rising sun
  const sun = ctx.createRadialGradient(W * 0.72, 300, 10, W * 0.72, 300, 130);
  sun.addColorStop(0, "rgba(255,220,150,0.95)"); sun.addColorStop(1, "rgba(255,180,107,0)");
  ctx.fillStyle = sun; ctx.beginPath(); ctx.arc(W * 0.72, 300, 130, 0, 7); ctx.fill();
  ctx.fillStyle = "#ffedc0"; ctx.beginPath(); ctx.arc(W * 0.72, 300, 34, 0, 7); ctx.fill();
  // the skyline from rooftop elevation
  drawSkyline(330, DAWN, paintSkyDawn);
  // roof deck
  ctx.fillStyle = "#33262e"; ctx.fillRect(0, FLOOR_TOP - 40, W, H - FLOOR_TOP + 40);
  ctx.fillStyle = "#453441"; ctx.fillRect(0, FLOOR_TOP - 40, W, 12);
  ctx.strokeStyle = "#241a20"; ctx.lineWidth = 2;
  for (let i = 0; i < 14; i++) {
    const lx = (i * 120 - G.cam % 120);
    ctx.beginPath(); ctx.moveTo(lx, FLOOR_TOP - 28); ctx.lineTo(lx - 60, H); ctx.stroke();
  }
  // AC units and vents
  for (let i = 0; i < 6; i++) {
    const ax = i * 620 - (G.cam % 620) + 90;
    if (ax < -80 || ax > W + 80) continue;
    ctx.fillStyle = "#5a5a64"; ctx.fillRect(ax, 276, 70, 44);
    ctx.fillStyle = "#3a3a42"; ctx.fillRect(ax + 8, 284, 54, 28);
    ctx.save(); ctx.translate(ax + 35, 298); ctx.rotate(G.tick * 0.2);
    ctx.fillStyle = "#777"; ctx.fillRect(-14, -2, 28, 4); ctx.fillRect(-2, -14, 4, 28);
    ctx.restore();
  }
  // broadcast mast at the arena end
  const stage = STAGES[G.stageIdx];
  const mx = stage.length - 240 - G.cam;
  if (mx < W + 100) {
    ctx.fillStyle = "#2a2a30"; ctx.fillRect(mx - 30, 240, 60, 110);
    ctx.strokeStyle = "#666"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(mx, 240); ctx.lineTo(mx, 30); ctx.stroke();
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(mx, 60); ctx.lineTo(mx - 70, 240); ctx.moveTo(mx, 60); ctx.lineTo(mx + 70, 240); ctx.stroke();
    ctx.fillStyle = (G.tick % 40 < 20) ? "#ff2222" : "#661111";
    ctx.fillRect(mx - 3, 26, 7, 7);
  }
}
