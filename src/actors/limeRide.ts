/* THE LIME RIDE — auto-scrolling scooter run. The road is the enemy:
   potholes, opening Uber doors, the DART crossing, flying cease &
   desist paper, the Group Chat in pursuit, and Angelo on the sidewalk
   with his hand out. */
import { ctx } from "../engine/canvas";
import { G, type Hazard } from "../engine/entity";
import { W, H, FLOOR_TOP, FLOOR_BOT } from "../balance";
import { hurtPlayer } from "../engine/combat";
import { spawnEnemy } from "../engine/spawner";
import { floatText } from "../render/fx";
import { SFX } from "../audio";
import { LORE } from "../lore";
import { px } from "../render/sprites";
import { pick, rnd, clamp } from "../engine/util";

export const SCROLL_SPEED = 2.6;

const DART_X = 2600;           // the rail crossing
const PHONE_X = 3300;          // the group chat catches up here
let phoneSpawned = false;
let paperT = 0;
let dartState = 0;             // 0 idle, 1 warning, 2 train
let dartT = 0;

export function initLimeRide(): void {
  const hz: Hazard[] = [];
  // potholes, staggered across lanes
  const potholeXs = [700, 1150, 1600, 1980, 2350, 3050, 3550, 3980, 4420, 4800];
  potholeXs.forEach((x, i) => {
    hz.push({ type: "pothole", x, y: 385 + (i * 53) % 115, t: 0, flag: false, variant: i });
  });
  // parked cars with ambush doors (top edge or bottom edge of the road)
  const carXs = [950, 1800, 2850, 3750, 4550];
  carXs.forEach((x, i) => {
    hz.push({ type: "car", x, y: i % 2 === 0 ? 372 : 496, t: 0, flag: false, variant: i });
  });
  // Angelo, working the sidewalk
  [1400, 4200].forEach((x, i) => {
    hz.push({ type: "angelo", x, y: 362, t: 0, flag: false, variant: i });
  });
  G.hazards = hz;
  phoneSpawned = false;
  paperT = 160;
  dartState = 0; dartT = 0;
}

export function updateLimeRide(): void {
  const p = G.player;
  if (!p) return;

  // the road moves whether you like it or not
  G.cam += SCROLL_SPEED;
  p.x = clamp(p.x, G.cam + 60, G.cam + W - 80);

  // flying cease & desist paper
  if (paperT > 0) paperT--;
  else {
    paperT = 130 + rnd(0, 80);
    G.projectiles.push({
      type: "subpoena", x: G.cam + W + 40, y: rnd(FLOOR_TOP + 10, FLOOR_BOT - 10),
      h: 34, vh: 0, g: 0, vx: -(SCROLL_SPEED + 2.4), vy: 0,
      dmg: 8, t: 0, from: "enemy", spin: 0, text: "", homing: 0
    });
  }

  // the group chat gives chase
  if (!phoneSpawned && G.cam > PHONE_X - W) {
    phoneSpawned = true;
    spawnEnemy("groupChat", G.cam + W + 60);
  }

  // DART crossing: warning bells, then the train takes the upper lanes
  const dartScreen = DART_X - G.cam;
  if (dartState === 0 && dartScreen < W + 300 && dartScreen > -100) {
    dartState = 1; dartT = 110;
  } else if (dartState === 1) {
    dartT--;
    if (dartT % 30 === 0) SFX.msg();
    if (dartT <= 0) { dartState = 2; dartT = 130; SFX.boss(); }
  } else if (dartState === 2) {
    dartT--;
    // the train owns everything above mid-road
    if (p.y < 430 && p.hurtT <= 0 && dartScreen > -220 && dartScreen < W + 60) {
      hurtPlayer(14);
    }
    if (dartT <= 0) dartState = 3;
  }

  for (const hz of G.hazards) {
    const dx = p.x - hz.x, dy = p.y - hz.y;
    switch (hz.type) {
      case "pothole":
        if (!hz.flag && Math.abs(dx) < 26 && Math.abs(dy) < 16) {
          hz.flag = true;
          hurtPlayer(8);
          SFX.boom();
        }
        if (hz.flag && Math.abs(dx) > 80) hz.flag = false;   // it can get you again on replay-by-knockback
        break;
      case "car":
        if (!hz.flag && dx > -130 && dx < -60) { hz.flag = true; hz.t = 1; SFX.block(); }
        if (hz.t > 0 && hz.t < 40) hz.t++;
        if (hz.t > 6 && hz.t < 34 && Math.abs(p.x - (hz.x + 34)) < 26 && Math.abs(dy) < 22 && p.hurtT <= 0) {
          hurtPlayer(10);
        }
        break;
      case "angelo":
        if (Math.abs(dx) < 44 && dy > -30 && dy < 40) {
          if (G.tick % 6 === 0 && p.hp > 1) {
            p.hp -= 1;
            if (!hz.flag) {
              hz.flag = true;
              floatText(hz.x, hz.y - 60, pick(LORE.angelo.grabLines), "#fff", 14, 70);
            }
          }
        } else hz.flag = false;
        break;
      case "dart": case "sign": break;
    }
  }
}

/** stage-specific drawing layered over the road backdrop */
export function drawLimeHazards(): void {
  const p = G.player;
  for (const hz of G.hazards) {
    const sx = hz.x - G.cam;
    if (sx < -160 || sx > W + 160) continue;
    if (hz.type === "pothole") {
      ctx.fillStyle = "#101014";
      ctx.beginPath(); ctx.ellipse(sx, hz.y, 26, 11, 0, 0, 7); ctx.fill();
      ctx.strokeStyle = "#3a3a44"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(sx, hz.y, 26, 11, 0, 0, 7); ctx.stroke();
      if (hz.variant === 2) {
        ctx.fillStyle = "#8a8a94"; ctx.font = "bold 9px monospace"; ctx.textAlign = "center";
        ctx.fillText(LORE.signage.pothole, sx, hz.y - 16);
      }
    } else if (hz.type === "car") {
      // parked rideshare, door ready
      px(sx - 54, hz.y - 34, 108, 30, "#2e2e3a");
      px(sx - 44, hz.y - 46, 78, 16, "#3a3a48");
      px(sx - 46, hz.y - 40, 20, 10, "#8ac4e8"); px(sx + 8, hz.y - 40, 20, 10, "#8ac4e8");
      ctx.fillStyle = "#111"; ctx.beginPath(); ctx.arc(sx - 34, hz.y - 2, 9, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.arc(sx + 34, hz.y - 2, 9, 0, 7); ctx.fill();
      const doorT = clamp(hz.t / 34, 0, 1);
      if (doorT > 0) {
        ctx.save(); ctx.translate(sx + 22, hz.y - 30);
        ctx.rotate(doorT * 1.2 * (hz.y < 430 ? 1 : -1));
        px(0, 0, 30, 26, "#2e2e3a");
        px(4, 4, 14, 8, "#8ac4e8");
        ctx.restore();
      }
    } else if (hz.type === "angelo") {
      // on the sidewalk, immaculate posture, hand out over the road
      px(sx - 12, hz.y - 58, 24, 34, "#7a4460");
      px(sx - 8, hz.y - 74, 16, 16, "#d9a878");
      px(sx - 8, hz.y - 78, 16, 6, "#3a3226");
      px(sx - 8, hz.y - 62, 16, 5, "#5a5a5a");
      const reach = Math.sin(G.tick * 0.05) * 4;
      px(sx + 8, hz.y - 48 + reach, 26, 6, "#d9a878");
      if (p && Math.abs(p.x - hz.x) < 44) px(sx + 30, hz.y - 52 + reach, 6, 6, "#d9a878");
    }
  }
  // DART crossing furniture + the train itself
  const dsx = DART_X - G.cam;
  if (dsx > -300 && dsx < W + 300) {
    px(dsx - 4, 250, 8, 100, "#3a3a40");
    px(dsx - 30, 250, 60, 14, "#e8e8e8");
    ctx.fillStyle = "#c02030"; ctx.font = "bold 10px monospace"; ctx.textAlign = "center";
    ctx.fillText("DART", dsx, 261);
    const blink = dartState === 1 && G.tick % 20 < 10;
    ctx.fillStyle = blink ? "#ff3030" : "#4a1010";
    ctx.beginPath(); ctx.arc(dsx - 12, 276, 6, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(dsx + 12, 276, 6, 0, 7); ctx.fill();
  }
  if (dartState === 2) {
    // the train, briefly owning the upper road
    const trainX = dsx + 300 - (130 - dartT) * 14;
    for (let carN = 0; carN < 3; carN++) {
      const cx2 = trainX + carN * 190;
      if (cx2 < -200 || cx2 > W + 200) continue;
      px(cx2, 360, 180, 54, "#e8c832");
      px(cx2, 360, 180, 12, "#c8c8d0");
      for (let wn = 0; wn < 4; wn++) px(cx2 + 14 + wn * 42, 374, 28, 18, "#2a3a4a");
      px(cx2 + 8, 416, 20, 8, "#222"); px(cx2 + 150, 416, 20, 8, "#222");
    }
  }
}

export function limeRideDone(): boolean {
  const stage = 5200;
  return G.cam >= stage - W - 10;
}
