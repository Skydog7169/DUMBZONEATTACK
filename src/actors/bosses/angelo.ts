/* ANGELO — Stage 1 mini-boss. A friend in need... constantly.
   The grab drains your HP and heals him. At 50% HP he panics:
   faster, grabbier, needier. */
import { G, type Enemy } from "../../engine/entity";
import { ENEMY_AI } from "../../balance";
import { hurtPlayer } from "../../engine/combat";
import { effSpeed, faceThePlayer, moveToward } from "../enemies/common";
import { floatText, comicCard } from "../../render/fx";
import { LORE } from "../../lore";
import { pick } from "../../engine/util";

export function updateAngelo(e: Enemy): void {
  const p = G.player;
  if (!p) return;

  // 50% HP phase: moves faster, asks more often
  if (e.phase === 1 && e.hp < e.maxHp * 0.5) {
    e.phase = 2;
    comicCard(LORE.angelo.enrage, "#8e6d3a", 0.5);
  }
  const p2 = e.phase === 2;
  const speed = effSpeed(e) * (p2 ? ENEMY_AI.angeloP2SpeedMul : 1);

  if (e.askT > 0) e.askT--;
  else {
    e.askT = p2 ? ENEMY_AI.angeloP2AskCd : ENEMY_AI.angeloAskCd;
    floatText(e.x, e.y - 108, pick(LORE.angelo.grabLines), "#fff", 15, 120);
  }

  if (e.state === "windup") {
    e.t--;
    if (e.t <= 0) {
      const dx = Math.abs(p.x - e.x), dy = Math.abs(p.y - e.y);
      if (dx < ENEMY_AI.angeloReach + 4 && dy < 26 && p.hurtT <= 0) {
        // the grab: drains you, heals him — he always needs a little more
        hurtPlayer(e.dmg);
        e.hp = Math.min(e.maxHp, e.hp + ENEMY_AI.angeloHeal);
        floatText(e.x, e.y - 84, `+${ENEMY_AI.angeloHeal}`, "#67e06b", 14, 40);
      }
      e.state = "recover"; e.t = p2 ? 30 : 44;
    }
    return;
  }
  if (e.state === "recover") { e.t--; if (e.t <= 0) e.state = "approach"; return; }

  const dx = faceThePlayer(e);
  const dist = Math.abs(dx), dy = Math.abs(p.y - e.y);
  if (e.atkT > 0) e.atkT--;
  if (dist > ENEMY_AI.angeloReach - 8 || dy > 12) {
    moveToward(e, p.x, p.y, speed);
  } else if (e.atkT <= 0 && e.spawnGraceT <= 0) {
    e.state = "windup"; e.t = 16; e.swing = 18;
    e.atkT = p2 ? ENEMY_AI.angeloP2GrabCd : ENEMY_AI.angeloGrabCd;
  }
}
