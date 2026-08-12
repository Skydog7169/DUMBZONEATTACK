/* Procedural chunky pixel-people and object sprites. */
import { ctx } from "../engine/canvas";
import { G, type Enemy, type Player, type Projectile, type Pickup, type Corpse, type GasCloud, type GooBlob, type Stream, type Facing } from "../engine/entity";
import type { CharKey } from "../balance";
import { CHARS } from "../balance";
import { clamp } from "../engine/util";
import { LORE } from "../lore";
import { STAGES } from "../stages";

export function px(x: number, y: number, w: number, h: number, c: string): void {
  ctx.fillStyle = c;
  ctx.fillRect(Math.round(x), Math.round(y), w, h);
}
export function drawShadow(sx: number, sy: number, w: number): void {
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.beginPath(); ctx.ellipse(sx, sy + 4, w, 7, 0, 0, 7); ctx.fill();
}

/* visual palettes for the hosts (numbers live in balance.ts) */
export interface CharPal {
  skin: string; shirt: string; pants: string; hair: string;
  bald?: boolean; beard?: string; stubble?: string; mustache?: string;
}
export const CHAR_PAL: Record<CharKey, CharPal> = {
  blake: { skin: "#e8b98c", shirt: "#2e6f3e", pants: "#26364a", hair: "#d8b45a", mustache: "#b8933f" },
  jake:  { skin: "#e6b48a", shirt: "#3557a6", pants: "#2b2b31", hair: "#241a12", stubble: "#4a3b2e" },
  dan:   { skin: "#f2decb", shirt: "#8e3bb5", pants: "#3d3d46", hair: "#f2decb", bald: true, beard: "#a89a8a" }
};

export interface HumanoidOpts {
  face: Facing; walk: number; swing: number; hurt: boolean;
  skin: string; shirt: string; pants: string; hair: string;
  w: number; h: number;
  tie?: string; hat?: string; beard?: string; goatee?: string;
  brief?: boolean; visor?: string; rolled?: boolean; tattoo?: string;
  dress?: string; cat?: boolean; block?: boolean; cap?: string; bald?: boolean;
  stubble?: string; mustache?: string;
  longHair?: string;  // shoulder-length falls + bangs across the forehead
  glasses?: string;   // large tinted lenses instead of eyes
  kick?: number;   // frames of the heavy kick anim
  upper?: number;  // frames of the launcher uppercut anim
  shadowAt?: number; alpha?: number;
}

export function drawHumanoid(sx: number, sy: number, o: HumanoidOpts): void {
  const f = o.face, bob = Math.sin(o.walk || 0) * 2;
  const legSpread = Math.sin(o.walk || 0) * 5;
  drawShadow(sx, o.shadowAt ?? sy, o.w * 0.7);
  if (o.alpha !== undefined) ctx.globalAlpha = o.alpha;
  if (o.hurt && Math.floor(G.tick / 3) % 2 === 0) ctx.globalAlpha = 0.5;
  const h = o.h, w = o.w, top = sy - h + bob;

  // legs
  if (o.kick && o.kick > 0) {
    // heavy kick: standing leg planted, other leg out at hip height
    px(sx - f * w * 0.16, sy - h * 0.42, w * 0.26, h * 0.42, o.pants);
    const hipY = sy - h * 0.40;
    const legLen = w * 0.95;
    const lx = f === 1 ? sx + w * 0.06 : sx - w * 0.06 - legLen;
    px(lx, hipY, legLen, 7, o.pants);
    px(f === 1 ? lx + legLen : lx - 8, hipY - 1, 9, 9, "#22222a");   // the boot
  } else if (o.dress) {
    ctx.fillStyle = o.dress;
    ctx.beginPath();
    ctx.moveTo(sx - w * 0.5, sy);
    ctx.lineTo(sx - w * 0.28, top + h * 0.42);
    ctx.lineTo(sx + w * 0.28, top + h * 0.42);
    ctx.lineTo(sx + w * 0.5, sy);
    ctx.closePath(); ctx.fill();
  } else {
    px(sx - w * 0.3 + legSpread * 0.4, sy - h * 0.42, w * 0.26, h * 0.42, o.pants);
    px(sx + w * 0.06 - legSpread * 0.4, sy - h * 0.42, w * 0.26, h * 0.42, o.pants);
  }
  // torso
  px(sx - w * 0.42, top + h * 0.24, w * 0.84, h * 0.36, o.shirt);
  if (o.tie) px(sx - 2, top + h * 0.26, 4, h * 0.2, o.tie);

  // arms
  const armY = top + h * 0.28;
  const sleeveLen = o.rolled ? h * 0.13 : h * 0.26;
  if (o.kick && o.kick > 0) {
    // fists up while the leg does the talking
    px(sx - f * w * 0.5, armY + 2, w * 0.2, h * 0.16, o.shirt);
    px(sx + f * w * 0.22, armY - 2, w * 0.22, 7, o.shirt);
    px(sx + f * w * 0.42, armY - 3, 6, 6, o.skin);
  } else if (o.upper && o.upper > 0) {
    // launcher: arm rockets straight up
    px(sx - w * 0.52, armY, w * 0.2, h * 0.26, o.shirt);
    px(sx + f * w * 0.32, top - h * 0.12, w * 0.2, h * 0.4, o.shirt);
    px(sx + f * w * 0.32, top - h * 0.18, w * 0.2, h * 0.07, o.skin);
  } else if (o.block) {
    // briefcase raised in front — the corporate wall
    px(sx + f * w * 0.34, armY - 4, f * w * 0.3, 8, o.skin);
    px(sx + f * w * 0.52 - 9, armY - 16, 20, 16, "#5a3a1e");
    px(sx - w * 0.52, armY, w * 0.2, h * 0.26, o.shirt);
  } else if (o.swing > 0) {
    px(sx + f * w * 0.4, armY, f * w * 0.75, 7, o.rolled ? o.skin : o.shirt);
    px(sx + f * (w * 0.4 + w * 0.6), armY, f * w * 0.2, 7, o.skin);
    if (o.brief) px(sx + f * w * 1.05, armY - 6, 16, 12, "#5a3a1e");
  } else {
    px(sx - w * 0.52, armY, w * 0.2, sleeveLen, o.rolled ? o.shirt : o.shirt);
    px(sx + w * 0.34, armY, w * 0.2, sleeveLen, o.shirt);
    if (o.rolled) {
      // rolled sleeves: bare forearms + faded tattoo band
      px(sx - w * 0.52, armY + sleeveLen, w * 0.2, h * 0.13, o.skin);
      px(sx + w * 0.34, armY + sleeveLen, w * 0.2, h * 0.13, o.skin);
      if (o.tattoo) px(sx + w * 0.34, armY + sleeveLen + 2, w * 0.2, 3, o.tattoo);
    } else {
      px(sx - w * 0.52, armY + sleeveLen * 0.8, w * 0.2, h * 0.06, o.skin);
      px(sx + w * 0.34, armY + sleeveLen * 0.8, w * 0.2, h * 0.06, o.skin);
    }
    if (o.brief) px(sx + w * 0.3, armY + h * 0.2, 16, 12, "#5a3a1e");
  }

  // head
  px(sx - w * 0.3, top, w * 0.6, h * 0.24, o.skin);
  if (o.bald) {
    px(sx - w * 0.3, top - 2, w * 0.6, 4, o.skin);            // smooth dome
    px(sx - w * 0.08, top - 1, w * 0.16, 2, "#fff");          // the shine
  } else if (o.longHair) {
    px(sx - w * 0.3, top - 4, w * 0.6, 8, o.longHair);        // crown
    px(sx - w * 0.3, top + 3, w * 0.6, 4, o.longHair);        // bangs
    px(sx - w * 0.44, top - 2, w * 0.15, h * 0.36, o.longHair); // side falls
    px(sx + w * 0.29, top - 2, w * 0.15, h * 0.36, o.longHair);
  } else {
    px(sx - w * 0.3, top - 3, w * 0.6, 7, o.hair);
  }
  if (o.stubble) px(sx - w * 0.3, top + h * 0.17, w * 0.6, 4, o.stubble);
  if (o.beard) px(sx - w * 0.3, top + h * 0.15, w * 0.6, 6, o.beard);
  if (o.goatee) px(sx + f * 2 - 5, top + h * 0.16, 10, 7, o.goatee);
  if (o.mustache) px(sx + f * 3 - 6, top + 11, 12, 3, o.mustache);
  if (o.hat) { px(sx - w * 0.36, top - 8, w * 0.72, 8, o.hat); px(sx - w * 0.2, top - 14, w * 0.4, 7, o.hat); }
  if (o.cap) { px(sx - w * 0.32, top - 6, w * 0.64, 7, o.cap); px(sx + f * w * 0.2, top - 3, w * 0.28, 4, o.cap); }
  if (o.glasses) {
    // big tinted lenses with a thin bridge and a glint
    px(sx + f * 2 - 5, top + 7, 7, 6, o.glasses);
    px(sx + f * 9 - 4, top + 7, 7, 6, o.glasses);
    px(sx + f * 5 - 2, top + 8, 3, 2, o.glasses);
    px(sx + f * 3 - 4, top + 8, 2, 2, "#fff");
  } else if (o.visor) px(sx + f * 6 - 8, top + 6, 16, 5, o.visor);
  else {
    px(sx + f * 3 - 2, top + 7, 3, 3, "#111");
    px(sx + f * 9 - 2, top + 7, 3, 3, "#111");
  }

  // shoulder cat (the Cat Man is never alone)
  if (o.cat) {
    const cx = sx - f * (w * 0.45), cy = top - 4;
    px(cx - 6, cy, 14, 9, "#e59a3c");
    px(cx - 10, cy - 5, 7, 7, "#e59a3c");
    px(cx - 10, cy - 8, 3, 4, "#e59a3c"); px(cx - 5, cy - 8, 3, 4, "#e59a3c");
    px(cx - 9, cy - 3, 2, 2, "#7CFC00");
    px(cx + 8, cy - 2, 6, 3, "#c97f28");
  }
  ctx.globalAlpha = 1;
}

/* ---------------- player ---------------- */
export function drawPlayerSprite(p: Player): void {
  const sx = p.x - G.cam, sy = p.y - p.h;
  const c = CHARS[p.key], pal = CHAR_PAL[p.key];
  // the Lime, obviously
  if (STAGES[G.stageIdx]?.autoscroll) {
    drawShadow(sx, p.y, 20);
    px(sx - 22, sy - 4, 46, 5, "#3a3a42");                  // deck
    ctx.fillStyle = "#111";
    ctx.beginPath(); ctx.arc(sx - 22, sy + 2, 6, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(sx + 24, sy + 2, 6, 0, 7); ctx.fill();
    ctx.strokeStyle = "#5adb4a"; ctx.lineWidth = 4;         // lime-green stem
    ctx.beginPath(); ctx.moveTo(sx + 22, sy - 6); ctx.lineTo(sx + 30, sy - 52); ctx.stroke();
    px(sx + 22, sy - 56, 16, 5, "#5adb4a");
  }
  let swing = 0, kick = 0, upper = 0;
  if (p.act) {
    const anim = Math.max(0, p.act.hitAt + 8 - p.act.t);
    if (p.act.kind === "strong" || p.act.kind === "dashAtk") kick = anim;
    else if (p.act.kind === "launcher") upper = anim;
    else if (p.act.kind !== "special" && p.act.kind !== "throwAct") swing = anim;
  }
  drawHumanoid(sx, sy, {
    face: p.face, walk: p.walk, swing, kick, upper, hurt: p.hurtT > 0,
    ...pal, w: c.w, h: c.h, shadowAt: p.y
  });
  // blake winding up the bat
  if (p.charging) {
    const chg = p.chargeT / 45;
    ctx.save();
    ctx.translate(sx - p.face * 6, sy - c.h + 12);
    ctx.rotate(p.face * (-2.2 + Math.sin(G.tick * 0.3) * 0.05));
    px(0, -3, 34, 6, "#b98a4a");
    ctx.restore();
    if (chg >= 1 && G.tick % 8 < 4) px(sx - 2, sy - c.h - 14, 5, 5, "#ffd23f");
  }
  if (p.act && p.act.kind === "special" && p.key === "blake") {
    ctx.save();
    ctx.translate(sx + p.face * 8, sy - c.h + 26);
    ctx.rotate(p.face * (0.9 - clamp(p.act.t / p.act.dur, 0, 1) * 2.2));
    px(0, -3, 40, 7, "#b98a4a");
    ctx.restore();
  }
  // meter-full sparkle
  if (p.meter >= 100 && G.tick % 30 < 15) px(sx - 2, sy - c.h - 12, 4, 4, "#39d5ff");
  // slow debuff
  if (p.slowT > 0 && G.tick % 10 < 5) {
    ctx.font = "bold 14px monospace"; ctx.textAlign = "center";
    ctx.fillStyle = "#39d5ff"; ctx.fillText("...", sx, sy - c.h - 16);
  }
}

/* ---------------- enemies ---------------- */
function lying(e: Enemy, color: string): void {
  const sx = e.x - G.cam;
  drawShadow(sx, e.y, 22);
  px(sx - 24, e.y - 12, 48, 10, color);
  px(sx + (e.face > 0 ? 20 : -30), e.y - 14, 10, 10, "#e0b090");
}

export function drawEnemySprite(e: Enemy): void {
  const sx = e.x - G.cam, sy = e.y - e.h;
  const hurt = e.state === "hurt";

  if (e.state === "down" || (e.state === "getup" && e.t > 10)) {
    const bodyColor =
      e.kind === "catman" ? "#efefe8" :
      e.kind === "angelo" ? "#6b5a3a" :
      e.kind === "seniorPartner" ? "#1e2a4a" :
      e.kind === "sonInLaw" ? "#2b4fa0" :
      e.kind === "matriarch" ? "#6a2a5a" :
      e.kind === "suit" ? "#5a6270" :
      e.kind === "evilGm" ? "#1d3f8f" :
      e.kind === "pitBoss" ? "#7a1f2b" : "#23283b";
    lying(e, bodyColor);
    return;
  }

  switch (e.kind) {
    case "lawyer":
      drawHumanoid(sx, sy, {
        face: e.face, walk: e.walk, swing: e.swing, hurt, brief: true,
        skin: "#e0b090", shirt: "#23283b", pants: "#181c2b", hair: "#333",
        tie: "#c02040", w: 26, h: 58, shadowAt: e.y
      });
      break;
    case "evilGm":
      // the front-office hatchet man: shaved head, franchise-blue quarter-zip
      drawHumanoid(sx, sy, {
        face: e.face, walk: e.walk, swing: e.swing, hurt,
        skin: "#8a5a3c", shirt: "#1d3f8f", pants: "#22262e", hair: "#8a5a3c",
        bald: true, goatee: "#241408", w: 27, h: 60, shadowAt: e.y
      });
      // credential lanyard — he IS allowed in the building
      px(sx - 1, sy - 44, 3, 8, "#d8d8e0");
      px(sx - 3, sy - 36, 7, 9, "#f0f0f4");
      break;
    case "lawsuit": {
      const diving = e.windupKind === 2;
      const telegraphing = e.windupKind === 1 && G.tick % 6 < 3;
      ctx.save(); ctx.translate(sx, sy - 30);
      ctx.rotate(diving ? Math.atan2(e.diveVy, e.diveVx) + 1.57 : Math.sin(e.orbitA) * (e.windupKind === 1 ? 0.55 : 0.3));
      px(-14, -18, 28, 36, hurt || telegraphing ? "#ffd0d0" : "#f4f0e2");
      ctx.fillStyle = "#a33"; ctx.font = "bold 9px monospace"; ctx.textAlign = "center";
      ctx.fillText(LORE.signage.lawsuitPaper, 0, -6);
      ctx.fillStyle = "#555";
      for (let i = 0; i < 4; i++) ctx.fillRect(-10, 2 + i * 4, 20, 2);
      ctx.restore();
      drawShadow(sx, e.y, 12);
      break;
    }
    case "processServer":
      drawHumanoid(sx, sy, {
        face: e.face, walk: e.walk, swing: e.swing, hurt,
        skin: "#dfae85", shirt: "#c9b280", pants: "#4a4438", hair: "#2c2018",
        cap: "#8a7a55", w: 26, h: 58, shadowAt: e.y
      });
      // envelope in hand
      if (e.swing === 0) px(sx + e.face * 12, sy - 26, 12, 8, "#f4f0e2");
      break;
    case "suit":
    case "pitBoss": {
      const isPit = e.kind === "pitBoss";
      const blocking = e.blockRecover === 0 && e.state !== "windup" && e.state !== "recover" && !hurt;
      drawHumanoid(sx, sy, {
        face: e.face, walk: e.walk, swing: e.swing, hurt, block: blocking,
        skin: "#e2b28e", shirt: isPit ? "#7a1f2b" : "#5a6270",
        pants: isPit ? "#1c1c22" : "#3c414c", hair: isPit ? "#1a1a1a" : "#555",
        tie: isPit ? "#d4af37" : "#2b2f3a", visor: isPit ? "#111" : undefined,
        w: 32, h: 62, shadowAt: e.y
      });
      if (e.blockRecover > 0 && G.tick % 6 < 3) {
        ctx.font = "bold 14px monospace"; ctx.textAlign = "center";
        ctx.fillStyle = "#ffd23f"; ctx.fillText("*", sx, sy - 74);
      }
      break;
    }
    case "cardSharp":
      drawHumanoid(sx, sy, {
        face: e.face, walk: e.walk, swing: e.swing, hurt,
        skin: "#e6bb92", shirt: "#f0ead8", pants: "#2c2c33", hair: "#7a4a20",
        visor: "#2e7d4f", tie: "#233", w: 25, h: 57, shadowAt: e.y
      });
      if (e.swing === 0) px(sx + e.face * 12, sy - 28, 10, 7, "#fff");
      break;
    case "groupChat": {
      // a phone. an object. smash it.
      const buzz = Math.sin(e.orbitA * 9) * 2;
      drawShadow(sx, e.y, 12);
      ctx.save(); ctx.translate(sx + buzz, sy - e.h - 20); ctx.rotate(Math.sin(e.orbitA * 5) * 0.12);
      px(-11, -20, 22, 40, hurt ? "#ff9d9d" : "#1c1c24");
      px(-9, -17, 18, 30, "#39d5ff");
      px(-7, -14, 14, 3, "#fff"); px(-7, -9, 10, 3, "#fff"); px(-7, -4, 12, 3, "#fff");
      px(-2, 16, 5, 2, "#666");
      ctx.restore();
      if (e.windupKind === 1) {
        // "...is typing" — the vulnerable window
        px(sx - 16, sy - e.h - 52, 32, 16, "#fff");
        px(sx - 3, sy - e.h - 37, 6, 5, "#fff");
        ctx.fillStyle = "#233842"; ctx.font = "bold 14px monospace"; ctx.textAlign = "center";
        const dots = ".".repeat(1 + (Math.floor(G.tick / 15) % 3));
        ctx.fillText(dots, sx, sy - e.h - 40);
      } else if (G.tick % 20 < 10) {
        ctx.font = "bold 14px monospace"; ctx.textAlign = "center";
        ctx.fillStyle = "#39d5ff"; ctx.fillText("!!!", sx + buzz, sy - e.h - 46);
      }
      break;
    }
    case "seniorPartner":
      // silver hair, pinstripe navy, gold tie, briefcase — the closer
      drawHumanoid(sx, sy, {
        face: e.face, walk: e.walk, swing: e.swing, hurt, brief: true,
        skin: "#e2b494", shirt: "#1e2a4a", pants: "#16203a", hair: "#c8c8cc",
        tie: "#c9a227", w: 32, h: 64, shadowAt: e.y
      });
      // pinstripes + pocket square
      if (e.state !== "hurt") {
        px(sx - 8, sy - 44, 1, 20, "#3a4a6e"); px(sx + 6, sy - 44, 1, 20, "#3a4a6e");
        px(sx + e.face * 8 - 2, sy - 42, 5, 3, "#f0ead8");
      }
      break;
    case "angelo": {
      // the going-out shirt has seen better days; the posture is immaculate
      drawHumanoid(sx, sy, {
        face: e.face, walk: e.walk, swing: e.swing, hurt,
        skin: "#d9a878", shirt: "#7a4460", pants: "#4a4033", hair: "#4a4a4a",
        beard: "#5a5a5a", hat: "#3a3226", w: 34, h: 66, shadowAt: e.y
      });
      // shirt pattern + the one earring
      px(sx - 8, sy - 44, 3, 16, "#9a5a80");
      px(sx + 5, sy - 42, 3, 14, "#9a5a80");
      px(sx - e.face * 11, sy - 55, 2, 4, "#ffd23f");
      break;
    }
    case "sonInLaw":
      // trade armed = blue shimmer telegraph
      if (e.tradeCd === 0) {
        ctx.globalAlpha = 0.35 + Math.sin(G.tick * 0.3) * 0.2;
        ctx.fillStyle = "#4a90d9";
        ctx.beginPath(); ctx.ellipse(sx, sy - 32, 28, 42, 0, 0, 7); ctx.fill();
        ctx.globalAlpha = 1;
      }
      drawHumanoid(sx, sy, {
        face: e.face, walk: e.walk, swing: e.swing, hurt,
        skin: "#e8bd96", shirt: "#2b4fa0", pants: "#20304f", hair: "#4d3418",
        tie: "#a8c5e8", w: 28, h: 62, shadowAt: e.y
      });
      break;
    case "matriarch":
      // long blond hair, bangs, big red-tinted glasses
      drawHumanoid(sx, sy, {
        face: e.face, walk: e.walk, swing: e.swing, hurt,
        skin: "#e5c2a2", shirt: "#6a2a5a", pants: "#4a1e40", hair: "#e8c86a",
        longHair: "#e8c86a", glasses: "#e04858",
        dress: "#4a1e40", w: 30, h: 60, shadowAt: e.y
      });
      // gold necklace
      px(sx - 5, sy - 44, 10, 3, "#d4af37");
      if (G.tick % 40 < 6) px(sx + 8, sy - 46, 3, 3, "#fff");
      break;
    case "catman":
      drawHumanoid(sx, sy, {
        face: e.face, walk: e.walk, swing: e.swing, hurt,
        skin: "#e5c0a0", shirt: "#efefe8", pants: "#23262e", hair: "#241c14",
        tie: "#7a1f2b", goatee: "#3a2b1f", rolled: true, tattoo: "#7a8a96",
        cat: true, w: 32, h: 68, shadowAt: e.y
      });
      // office chair during the ram
      if (e.windupKind === 2 || e.windupKind === 3) {
        px(sx + e.face * 26 - 10, sy - 40, 20, 26, "#2c2c34");
        px(sx + e.face * 26 - 12, sy - 16, 24, 4, "#44444e");
        px(sx + e.face * 26 - 2, sy - 12, 4, 10, "#44444e");
      }
      break;
  }

  // status markers
  if (e.trapT > 0) {
    ctx.globalAlpha = 0.75;
    ctx.fillStyle = "#f4f6ff";
    ctx.beginPath(); ctx.ellipse(sx, e.y - 12, 20, 12, 0, 0, 7); ctx.fill();
    px(sx - 14, e.y - 30, 6, 18, "#f4f6ff");
    px(sx + 8, e.y - 34, 6, 22, "#f4f6ff");
    ctx.globalAlpha = 1;
  }
  if (e.state === "frozen" && G.tick % 12 < 8) {
    ctx.font = "bold 15px monospace"; ctx.textAlign = "center";
    ctx.fillStyle = "#ffd23f"; ctx.fillText("!", sx, sy - (e.kind === "angelo" ? 80 : 70));
  }
  drawHpPip(e);
}

function drawHpPip(e: Enemy): void {
  if (e.hp >= e.maxHp || e.hp <= 0) return;
  if (G.bossBar && G.bossBar.ref === e) return; // bosses have the big bar
  const sx = e.x - G.cam, sy = e.y - e.h - (e.kind === "groupChat" ? 74 : 72);
  px(sx - 16, sy, 32, 4, "#40121a");
  px(sx - 16, sy, 32 * clamp(e.hp / e.maxHp, 0, 1), 4, "#ff4f79");
}

/* ---------------- world objects ---------------- */
export function drawCorpse(c: Corpse): void {
  const sx = c.x - G.cam;
  ctx.globalAlpha = clamp(c.t / 60, 0, 1);
  if (c.kind === "lawsuit") px(sx - 14, c.y - 6, 28, 6, "#d8d4c4");
  else {
    const col =
      c.kind === "catman" ? "#efefe8" :
      c.kind === "angelo" ? "#6b5a3a" :
      c.kind === "seniorPartner" ? "#1e2a4a" :
      c.kind === "sonInLaw" ? "#2b4fa0" :
      c.kind === "matriarch" ? "#6a2a5a" :
      c.kind === "pitBoss" ? "#7a1f2b" :
      c.kind === "evilGm" ? "#1d3f8f" :
      c.kind === "suit" ? "#5a6270" : "#23283b";
    px(sx - 24, c.y - 12, 48, 10, col);
    px(sx + (c.face > 0 ? 20 : -30), c.y - 14, 10, 10, "#e0b090");
  }
  ctx.globalAlpha = 1;
}

export function drawPickupSprite(pk: Pickup): void {
  const sx = pk.x - G.cam, sy = pk.y - 18 + Math.sin(pk.t * 0.1) * 4;
  drawShadow(sx, pk.y, pk.kind === "pizza" ? 12 : 9);
  if (pk.kind === "pizza") {
    // Cane Rosso pie: leopard-charred crust, sauce, mozzarella, basil
    ctx.fillStyle = "#d8a24e"; ctx.beginPath(); ctx.ellipse(sx, sy - 6, 13, 10, 0, 0, 7); ctx.fill();
    ctx.fillStyle = "#3a2a1a";
    px(sx - 10, sy - 12, 2, 2, "#3a2a1a"); px(sx + 8, sy - 9, 2, 2, "#3a2a1a"); px(sx - 2, sy + 1, 2, 2, "#3a2a1a");
    ctx.fillStyle = "#b33327"; ctx.beginPath(); ctx.ellipse(sx, sy - 6, 9, 7, 0, 0, 7); ctx.fill();
    ctx.fillStyle = "#f0e2c0";
    px(sx - 5, sy - 9, 4, 3, "#f0e2c0"); px(sx + 1, sy - 6, 4, 3, "#f0e2c0"); px(sx - 2, sy - 3, 3, 3, "#f0e2c0");
    px(sx + 3, sy - 10, 2, 2, "#3f7d3a"); px(sx - 6, sy - 4, 2, 2, "#3f7d3a");
    if (G.tick % 24 < 12) px(sx + 9, sy - 14, 3, 3, "#fff");
  } else {
    // peptide vial (now fuels the special meter)
    px(sx - 5, sy - 14, 10, 18, "#cfe8ff");
    px(sx - 5, sy - 2, 10, 6, "#39d5ff");
    px(sx - 3, sy - 18, 6, 4, "#8a8f98");
    if (G.tick % 20 < 10) px(sx + 6, sy - 16, 3, 3, "#fff");
  }
}

export function drawProjectileSprite(pr: Projectile): void {
  const sx = pr.x - G.cam, sy = pr.y - pr.h;
  switch (pr.type) {
    case "cat":
      ctx.save(); ctx.translate(sx, sy); ctx.rotate(pr.spin);
      px(-9, -5, 18, 10, "#e59a3c");
      px(-13, -8, 7, 7, "#e59a3c");
      px(-13, -11, 3, 4, "#e59a3c"); px(-8, -11, 3, 4, "#e59a3c");
      px(9, -3, 7, 3, "#c97f28");
      px(-12, -7, 2, 2, "#111");
      ctx.restore();
      drawShadow(sx, pr.y, 8);
      break;
    case "pinkSlip":
      // CEASE & DESIST notice: heavy envelope, red wax seal
      ctx.save(); ctx.translate(sx, sy); ctx.rotate(Math.sin(pr.spin) * 0.5);
      px(-11, -8, 22, 16, "#f0ead8");
      ctx.strokeStyle = "#b8ae96"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(-11, -8); ctx.lineTo(0, 2); ctx.lineTo(11, -8); ctx.stroke();
      ctx.fillStyle = "#a02030";
      ctx.beginPath(); ctx.arc(0, 2, 4, 0, 7); ctx.fill();
      ctx.restore();
      break;
    case "subpoena":
      ctx.save(); ctx.translate(sx, sy); ctx.rotate(Math.sin(pr.spin) * 0.4);
      px(-9, -12, 18, 24, "#f4f0e2");
      px(-6, -8, 12, 2, "#888"); px(-6, -4, 12, 2, "#888"); px(-6, 0, 8, 2, "#888");
      px(-6, 5, 10, 4, "#a33");
      ctx.restore();
      break;
    case "card":
      ctx.save(); ctx.translate(sx, sy); ctx.rotate(pr.spin * 2);
      px(-4, -6, 9, 12, "#fff");
      px(-2, -3, 5, 6, "#c02040");
      ctx.restore();
      break;
    case "chip":
    case "chipRain":
      ctx.save(); ctx.translate(sx, sy); ctx.rotate(pr.spin);
      ctx.fillStyle = "#e8c66a"; ctx.beginPath(); ctx.ellipse(0, 0, 9, 9, 0, 0, 7); ctx.fill();
      ctx.fillStyle = "#a8862a"; ctx.beginPath(); ctx.ellipse(0, 0, 5, 5, 0, 0, 7); ctx.fill();
      ctx.restore();
      drawShadow(sx, pr.y, 6);
      break;
    case "textMsg": {
      ctx.font = "bold 14px monospace"; ctx.textAlign = "center";
      const w = ctx.measureText(pr.text).width + 12;
      px(sx - w / 2, sy - 12, w, 20, "#39d5ff");
      px(sx - 3, sy + 8, 6, 5, "#39d5ff");
      ctx.fillStyle = "#062737";
      ctx.fillText(pr.text, sx, sy + 3);
      break;
    }
    case "tin":
      ctx.save(); ctx.translate(sx, sy); ctx.rotate(pr.spin);
      px(-8, -5, 16, 10, "#b8bec6");
      px(-8, -5, 16, 3, "#d7dde4");
      px(-4, -2, 8, 4, "#c93");
      ctx.restore();
      break;
    case "goo":
      ctx.fillStyle = "#f4f6ff";
      ctx.beginPath(); ctx.ellipse(sx, sy, 10, 7, 0, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.ellipse(sx - 8, sy + 2, 4, 3, 0, 0, 7); ctx.fill();
      break;
    case "firework":
      break;
    case "chair":
      break;
  }
}

export function drawCloudSprite(c: GasCloud): void {
  const sx = c.x - G.cam;
  const a = clamp(c.life / 40, 0, 1) * 0.5;
  ctx.globalAlpha = a;
  ctx.fillStyle = "#57c05b";
  for (let i = 0; i < 6; i++) {
    const ang = (i / 6) * Math.PI * 2 + G.tick * 0.01;
    const ox = Math.cos(ang) * c.r * 0.45, oy = Math.sin(ang) * c.r * 0.25;
    const rr = c.r * 0.42 + Math.sin(G.tick * 0.05 + i) * 6;
    ctx.beginPath(); ctx.ellipse(sx + ox, c.y - 26 + oy, rr, rr * 0.6, 0, 0, 7); ctx.fill();
  }
  ctx.globalAlpha = a * 0.7;
  ctx.fillStyle = "#8fe093";
  ctx.beginPath(); ctx.ellipse(sx, c.y - 30, c.r * 0.4, c.r * 0.25, 0, 0, 7); ctx.fill();
  ctx.globalAlpha = 1;
}

/** Jake's 4 Pointer mid-flight: a proud white arc from waist height,
    pooling where it lands. */
export function drawStreamSprite(s: Stream): void {
  const k = s.t / s.dur;
  const x0 = s.x0 - G.cam, y0 = s.y0 - 26;      // waist height
  const x1 = s.tx - G.cam, y1 = s.ty;
  const peak = Math.min(y0, y1) - 64;
  const pt = (u: number): [number, number] => {
    const mx = (x0 + x1) / 2;
    const a = (1 - u) * (1 - u), b = 2 * u * (1 - u), c = u * u;
    return [a * x0 + b * mx + c * x1, a * y0 + b * peak + c * y1];
  };
  ctx.fillStyle = "#f4f6ff";
  const head = Math.min(1, k * 1.15);
  for (let i = 0; i <= 10; i++) {
    const u = head - i * 0.05;
    if (u < 0) break;
    const [px2, py2] = pt(u);
    const r = i === 0 ? 5 : 4 - i * 0.3;
    ctx.globalAlpha = i === 0 ? 0.95 : Math.max(0.15, 0.8 - i * 0.08);
    ctx.beginPath(); ctx.ellipse(px2, py2 + Math.sin((G.tick + i * 3) * 0.5) * 1.2, Math.max(1.5, r), Math.max(1.5, r * 0.8), 0, 0, 7); ctx.fill();
  }
  // the pool starts forming as the stream arrives
  if (head >= 0.96) {
    ctx.globalAlpha = 0.7;
    ctx.beginPath(); ctx.ellipse(x1, y1, 14 + k * 10, 6 + k * 4, 0, 0, 7); ctx.fill();
  }
  ctx.globalAlpha = 1;
}

export function drawGooSprite(b: GooBlob): void {
  const sx = b.x - G.cam;
  const a = clamp(b.life / 30, 0, 1) * 0.8;
  ctx.globalAlpha = a;
  ctx.fillStyle = "#f4f6ff";
  ctx.beginPath(); ctx.ellipse(sx, b.y, b.r * 0.7, b.r * 0.3, 0, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.ellipse(sx - b.r * 0.4, b.y + 4, b.r * 0.25, b.r * 0.12, 0, 0, 7); ctx.fill();
  ctx.globalAlpha = 1;
}
