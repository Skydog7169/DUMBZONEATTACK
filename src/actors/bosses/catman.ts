/* THE CAT MAN — final boss, three phases:
   P1: arcing cat throws + dash swipe.
   P2: COLLUSION — summons a grunt from each earlier stage; pink-slip fan.
   P3: slight-homing cats, chargeable office-chair ram, faster attacks. */
import { G, type Enemy } from "../../engine/entity";
import { ENEMY_AI, W } from "../../balance";
import { spawnEnemy } from "../../engine/spawner";
import { hurtPlayer } from "../../engine/combat";
import { effSpeed, faceThePlayer, moveToward } from "../enemies/common";
import { floatText, comicCard } from "../../render/fx";
import { SFX } from "../../audio";
import { LORE } from "../../lore";
import { pick, rnd } from "../../engine/util";

function collusionSummon(): void {
  // one grunt type from each earlier stage
  spawnEnemy("lawyer", G.cam + W + 40);
  spawnEnemy("suit", G.cam - 40);
  spawnEnemy("cardSharp", G.cam + W + 80);
  // more goons on the roof means somebody brought the catering
  G.pickups.push({ kind: "pizza", x: G.cam + W / 2 + 120, y: 440, t: 0 });
}

export function updateCatman(e: Enemy): void {
  const p = G.player;
  if (!p) return;

  const frac = e.hp / e.maxHp;
  if (e.phase === 1 && frac < 0.66) {
    e.phase = 2;
    comicCard(LORE.catman.phase2Pop, "#ff9dc0", 0.5);
    collusionSummon();
    e.askT = 600;
  }
  if (e.phase === 2 && frac < 0.33) {
    e.phase = 3;
    comicCard(LORE.catman.phase3Pop, "#ff4f79", 0.5);
    // final-phase rations: one special's worth of fuel and a slice
    G.pickups.push({ kind: "peptide", x: G.cam + W / 2 - 140, y: 460, t: 0 });
    G.pickups.push({ kind: "pizza", x: G.cam + W / 2 - 100, y: 420, t: 0 });
  }

  // P2+: periodic re-summon while his goons are thin — but even collusion
  // has a budget. After 3 extra waves the villains stop returning his calls.
  if (e.phase >= 2) {
    if (e.askT > 0) e.askT--;
    else if (G.enemies.length < 3 && e.summonCount < 3) {
      e.askT = 720; e.summonCount++; collusionSummon();
    }
  }

  /* ---- office chair ram (P3) ---- */
  if (e.windupKind === 2) {                    // winding up the chair
    e.t--;
    G.shake = Math.max(G.shake, 1.5);
    if (e.t <= 0) { e.windupKind = 3; e.t = 42; e.state = "approach"; SFX.boss(); }
    return;
  }
  if (e.windupKind === 3) {                    // ramming
    e.t--;
    e.x += e.face * ENEMY_AI.catChairVx;
    e.walk += 0.6;
    if (Math.abs(p.x - e.x) < 42 && Math.abs(p.y - e.y) < 26 && p.hurtT <= 0) {
      hurtPlayer(ENEMY_AI.catChairDmg);
      e.t = Math.min(e.t, 6);
    }
    if (e.t <= 0) { e.windupKind = 0; e.state = "recover"; e.t = 30; }
    return;
  }

  if (e.state === "windup") {                  // dash swipe
    e.t--;
    if (e.t <= 0) {
      const dx = Math.abs(p.x - e.x), dy = Math.abs(p.y - e.y);
      if (dx < ENEMY_AI.catReach + 6 && dy < 28) hurtPlayer(e.dmg + 4);
      e.state = "recover"; e.t = 34;
    }
    return;
  }
  if (e.state === "recover") { e.t--; if (e.t <= 0) e.state = "approach"; return; }

  const dx = faceThePlayer(e);
  const dist = Math.abs(dx), dy = Math.abs(p.y - e.y);
  const p3 = e.phase === 3;

  // chair ram cooldown (P3 only)
  if (p3) {
    if (e.dashT > 0) e.dashT--;
    else if (dist > 200 && e.spawnGraceT <= 0) {
      e.dashT = ENEMY_AI.catChairCd;
      e.windupKind = 2; e.t = ENEMY_AI.catChairWindup;
      comicCard(LORE.catman.chairPop, "#c9c9d4", 0.5);
      return;
    }
  }

  // cat throws (arcing; slight homing in P3) + pink slip fan in P2+
  if (e.throwT > 0) e.throwT--;
  else if (e.spawnGraceT <= 0) {
    e.throwT = (p3 ? ENEMY_AI.catP3ThrowCd : ENEMY_AI.catThrowCd) + rnd(0, 40);
    e.swing = 14;
    if (Math.random() < 0.5) floatText(e.x, e.y - 116, pick(LORE.catman.attackLines), "#ff9dc0", 15, 100);
    if (e.phase >= 2 && Math.random() < 0.45) {
      // pink-slip fan (3-slip spread)
      SFX.paper();
      for (const spread of [-1.2, 0, 1.2]) {
        G.projectiles.push({
          type: "pinkSlip", x: e.x + e.face * 16, y: e.y, h: 38, vh: 0, g: 0,
          vx: e.face * 5, vy: spread, dmg: e.dmg - 2, t: 0,
          from: "enemy", spin: 0.35, text: "", homing: 0
        });
      }
    } else {
      const flight = 44;
      G.projectiles.push({
        type: "cat", x: e.x + e.face * 20, y: e.y, h: 50, vh: 5.0, g: 0.26,
        vx: Math.max(-7, Math.min(7, (p.x - e.x) / flight)),
        vy: Math.max(-2, Math.min(2, (p.y - e.y) / flight)),
        dmg: e.dmg, t: 0, from: "enemy", spin: 0.3, text: "",
        homing: p3 ? 0.07 : 0
      });
    }
  }

  // movement + dash swipe
  if (dist > 74 || dy > 16) {
    moveToward(e, p.x, p.y, effSpeed(e));
  } else {
    if (e.atkT > 0) e.atkT--;
    else if (e.spawnGraceT <= 0) {
      e.state = "windup"; e.t = 13; e.swing = 16;
      e.atkT = p3 ? ENEMY_AI.catDashCd * 0.7 : ENEMY_AI.catDashCd;
    }
  }
}
