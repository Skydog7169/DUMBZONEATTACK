/* THE SENIOR PARTNER — Stage 1 mini-boss. The Fox 4 house lawyer.
   Two-hit briefcase combo up close, a served-papers fan at range, and
   at 50% HP he starts billing hours: faster, and the lawsuits show up. */
import { G, type Enemy } from "../../engine/entity";
import { ENEMY_AI, W } from "../../balance";
import { hurtPlayer } from "../../engine/combat";
import { spawnEnemy } from "../../engine/spawner";
import { effSpeed, faceThePlayer, moveToward } from "../enemies/common";
import { floatText, comicCard } from "../../render/fx";
import { SFX } from "../../audio";
import { LORE } from "../../lore";
import { pick } from "../../engine/util";

export function updateSeniorPartner(e: Enemy): void {
  const p = G.player;
  if (!p) return;

  // 50% HP: the meter starts running
  if (e.phase === 1 && e.hp < e.maxHp * 0.5) {
    e.phase = 2;
    comicCard(LORE.seniorPartner.enrage, "#c9a227", 0.5);
    spawnEnemy("lawsuit", G.cam + W + 40);
    spawnEnemy("lawsuit", G.cam - 40);
  }
  const p2 = e.phase === 2;
  const speed = effSpeed(e) * (p2 ? ENEMY_AI.partnerP2SpeedMul : 1);

  if (e.askT > 0) e.askT--;
  else {
    e.askT = 300;
    floatText(e.x, e.y - 110, pick(LORE.seniorPartner.attackLines), "#e8d48a", 15, 100);
  }

  if (e.state === "windup") {
    e.t--;
    if (e.t <= 0) {
      const dx = Math.abs(p.x - e.x), dy = Math.abs(p.y - e.y);
      if (dx < ENEMY_AI.partnerReach + 6 && dy < 26) hurtPlayer(e.dmg);
      if (e.windupKind === 0) {
        // the follow-through swing
        e.windupKind = 1; e.t = 11; e.swing = 13;
      } else {
        e.state = "recover"; e.t = p2 ? 30 : 42; e.windupKind = 0;
      }
    }
    return;
  }
  if (e.state === "recover") { e.t--; if (e.t <= 0) e.state = "approach"; return; }

  const dx = faceThePlayer(e);
  const dist = Math.abs(dx), dy = Math.abs(p.y - e.y);
  if (e.atkT > 0) e.atkT--;

  // served-papers fan when the fight opens up
  const onScreen = e.x > G.cam + 20 && e.x < G.cam + W - 20;
  if (e.fireT > 0) e.fireT--;
  else if (dist > 150 && onScreen && e.spawnGraceT <= 0) {
    e.fireT = p2 ? ENEMY_AI.partnerFanCd * 0.7 : ENEMY_AI.partnerFanCd;
    e.swing = 12;
    SFX.paper();
    for (const spread of [-1.1, 0, 1.1]) {
      G.projectiles.push({
        type: "subpoena", x: e.x + e.face * 16, y: e.y, h: 34, vh: 0, g: 0,
        vx: e.face * 5, vy: spread, dmg: e.dmg - 2, t: 0,
        from: "enemy", spin: 0, text: "", homing: 0
      });
    }
    e.state = "recover"; e.t = 22;
    return;
  }

  if (dist > ENEMY_AI.partnerReach - 10 || dy > 12) {
    moveToward(e, p.x, p.y, speed);
  } else if (e.atkT <= 0 && e.spawnGraceT <= 0) {
    e.state = "windup"; e.t = 13; e.swing = 15; e.windupKind = 0;
    e.atkT = p2 ? ENEMY_AI.partnerSwingCd * 0.75 : ENEMY_AI.partnerSwingCd;
  }
}
