/* PROCESS SERVER — ranged grunt. Keeps distance, throws subpoenas. */
import { G, type Enemy } from "../../engine/entity";
import { ENEMY_AI, W } from "../../balance";
import { effSpeed, faceThePlayer, moveToward } from "./common";
import { SFX } from "../../audio";
import { sign, clamp } from "../../engine/util";

export function updateProcessServer(e: Enemy): void {
  const p = G.player;
  if (!p) return;
  if (e.state === "recover") { e.t--; if (e.t <= 0) e.state = "approach"; return; }

  const dx = faceThePlayer(e);
  const dist = Math.abs(dx);
  const sp = effSpeed(e);
  const onScreen = e.x > G.cam + 20 && e.x < G.cam + W - 20;
  if (!onScreen) moveToward(e, p.x, p.y, sp);   // never loiter outside the arena
  else if (dist < ENEMY_AI.serverKeepMin) {
    // backpedal — but never out of the arena where you can't reach him
    e.x = clamp(e.x - sign(dx) * sp, G.cam + 34, G.cam + W - 34);
    e.walk += 0.2;
  }
  else if (dist > ENEMY_AI.serverKeepMax) moveToward(e, p.x, p.y, sp);
  else if (Math.abs(p.y - e.y) > 8) moveToward(e, e.x, p.y, sp * 0.8);
  if (e.fireT > 0) e.fireT--;
  else if (dist >= ENEMY_AI.serverKeepMin - 30 && e.spawnGraceT <= 0 && onScreen) {
    e.fireT = ENEMY_AI.serverFireCd;
    e.swing = 12;
    SFX.paper();
    // thrown flat down the server's own lane — step out of the lane to dodge
    G.projectiles.push({
      type: "subpoena", x: e.x + e.face * 14, y: e.y, h: 34, vh: 0, g: 0,
      vx: e.face * ENEMY_AI.subpoenaVx, vy: 0,
      dmg: e.dmg, t: 0, from: "enemy", spin: 0, text: "", homing: 0
    });
    e.state = "recover"; e.t = 20;
  }
}
