/* LAWYER — melee grunt. Approach, briefcase swing. */
import { G, type Enemy } from "../../engine/entity";
import { ENEMY_AI } from "../../balance";
import { hurtPlayer } from "../../engine/combat";
import { effSpeed, faceThePlayer, moveToward } from "./common";

export function updateLawyer(e: Enemy): void {
  const p = G.player;
  if (!p) return;
  if (e.state === "windup") {
    e.t--;
    if (e.t <= 0) {
      const dx = Math.abs(p.x - e.x), dy = Math.abs(p.y - e.y);
      if (dx < ENEMY_AI.lawyerReach + 6 && dy < 24) hurtPlayer(e.dmg);
      e.state = "recover"; e.t = ENEMY_AI.lawyerRecover;
    }
    return;
  }
  if (e.state === "recover") { e.t--; if (e.t <= 0) e.state = "approach"; return; }

  const dx = faceThePlayer(e);
  const dist = Math.abs(dx), dy = Math.abs(p.y - e.y);
  if (e.atkT > 0) e.atkT--;
  if (dist > ENEMY_AI.lawyerReach - 6 || dy > 14) {
    moveToward(e, p.x - Math.sign(dx) * (ENEMY_AI.lawyerReach - 12), p.y, effSpeed(e));
  } else if (e.atkT <= 0 && e.spawnGraceT <= 0) {
    e.state = "windup"; e.t = ENEMY_AI.lawyerWindup; e.swing = 14; e.atkT = 50;
  }
}
