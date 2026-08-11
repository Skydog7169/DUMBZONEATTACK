/* CORPORATE SUIT / PIT BOSS — front-blocking tanks.
   Blocked from the front unless hit by strongs, flanks, launchers,
   grabs (handled in combat.ts). Pit Boss recovers his block faster. */
import { G, type Enemy } from "../../engine/entity";
import { ENEMY_AI } from "../../balance";
import { hurtPlayer } from "../../engine/combat";
import { effSpeed, faceThePlayer, moveToward } from "./common";

export function updateSuit(e: Enemy): void {
  const p = G.player;
  if (!p) return;
  if (e.blockRecover > 0) e.blockRecover--;
  if (e.state === "windup") {
    e.t--;
    if (e.t <= 0) {
      const dx = Math.abs(p.x - e.x), dy = Math.abs(p.y - e.y);
      if (dx < 56 && dy < 24) hurtPlayer(e.dmg);
      e.state = "recover"; e.t = ENEMY_AI.suitRecover;
    }
    return;
  }
  if (e.state === "recover") { e.t--; if (e.t <= 0) e.state = "approach"; return; }

  const dx = faceThePlayer(e);
  const dist = Math.abs(dx), dy = Math.abs(p.y - e.y);
  if (e.atkT > 0) e.atkT--;
  if (dist > 48 || dy > 14) {
    moveToward(e, p.x - Math.sign(dx) * 40, p.y, effSpeed(e));
  } else if (e.atkT <= 0 && e.spawnGraceT <= 0) {
    e.state = "windup"; e.t = ENEMY_AI.suitWindup; e.swing = 16; e.atkT = 60;
  }
}
