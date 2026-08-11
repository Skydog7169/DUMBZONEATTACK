/* CARD SHARP — Stage 3 ranged variant. Throws a 3-card fan. */
import { G, type Enemy } from "../../engine/entity";
import { ENEMY_AI, W } from "../../balance";
import { effSpeed, faceThePlayer, moveToward } from "./common";
import { SFX } from "../../audio";
import { sign, clamp } from "../../engine/util";

export function updateCardSharp(e: Enemy): void {
  const p = G.player;
  if (!p) return;
  if (e.state === "recover") { e.t--; if (e.t <= 0) e.state = "approach"; return; }

  const dx = faceThePlayer(e);
  const dist = Math.abs(dx);
  const sp = effSpeed(e);
  const onScreen = e.x > G.cam + 20 && e.x < G.cam + W - 20;
  if (!onScreen) moveToward(e, p.x, p.y, sp);   // never loiter outside the arena
  else if (dist < ENEMY_AI.serverKeepMin - 20) {
    // backpedal — but stay in the arena
    e.x = clamp(e.x - sign(dx) * sp, G.cam + 34, G.cam + W - 34);
    e.walk += 0.2;
  }
  else if (dist > ENEMY_AI.serverKeepMax) moveToward(e, p.x, p.y, sp);
  else if (Math.abs(p.y - e.y) > 10) moveToward(e, e.x, p.y, sp * 0.8);
  if (e.fireT > 0) e.fireT--;
  else if (e.spawnGraceT <= 0 && onScreen) {
    e.fireT = ENEMY_AI.sharpFireCd;
    e.swing = 12;
    SFX.paper();
    for (const spread of [-ENEMY_AI.cardSpread, 0, ENEMY_AI.cardSpread]) {
      G.projectiles.push({
        type: "card", x: e.x + e.face * 14, y: e.y, h: 36, vh: 0, g: 0,
        vx: e.face * ENEMY_AI.cardVx, vy: spread,
        dmg: e.dmg, t: 0, from: "enemy", spin: 0.4, text: "", homing: 0
      });
    }
    e.state = "recover"; e.t = 24;
  }
}
