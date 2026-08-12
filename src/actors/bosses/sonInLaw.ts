/* THE SON-IN-LAW — Stage 2 mini-boss. Fast duelist in franchise blue.
   Signature: THE TRADE — when his trade is armed (he shimmers), any
   hit swaps him with a summoned grunt who eats the combo instead.
   The swap itself lives in combat.ts; here is his dueling kit. */
import { G, type Enemy } from "../../engine/entity";
import { ENEMY_AI, W } from "../../balance";
import { hurtPlayer } from "../../engine/combat";
import { effSpeed, faceThePlayer, moveToward } from "../enemies/common";
import { floatText, comicCard } from "../../render/fx";
import { LORE } from "../../lore";
import { pick, rnd, clamp } from "../../engine/util";

export function updateSonInLaw(e: Enemy): void {
  const p = G.player;
  if (!p) return;

  // 50% HP: he blames the guy who was taking his hits, fires him
  // mid-fight, and goes desperate — faster, but no more Trade shield.
  if (e.phase === 1 && e.hp < e.maxHp * 0.5) {
    e.phase = 2;
    comicCard(LORE.sonInLaw.phase2Pop, "#4a90d9", 0.5);
    for (const gm of G.enemies) {
      if (gm.kind === "evilGm" && gm.hp > 0) { gm.score = 0; gm.hp = 0; gm.state = "hurt"; }
    }
  }
  const p2 = e.phase === 2;

  if (e.state === "windup") {
    e.t--;
    if (e.t <= 0) {
      const dx = Math.abs(p.x - e.x), dy = Math.abs(p.y - e.y);
      if (dx < ENEMY_AI.silReach + 6 && dy < 26) hurtPlayer(e.dmg);
      if (e.windupKind === 0) {
        // quick second slash of the combo
        e.windupKind = 1; e.t = 9; e.swing = 12;
      } else {
        e.state = "recover"; e.t = 34; e.windupKind = 0;
      }
    }
    return;
  }
  if (e.state === "recover") { e.t--; if (e.t <= 0) e.state = "approach"; return; }

  const dx = faceThePlayer(e);
  const dist = Math.abs(dx), dy = Math.abs(p.y - e.y);
  if (e.atkT > 0) e.atkT--;

  // occasional taunt
  if (e.askT > 0) e.askT--;
  else { e.askT = 320; floatText(e.x, e.y - 108, pick(LORE.sonInLaw.attackLines), "#9ec7f0", 15, 100); }

  // backdash after his combo sometimes, to reset the duel (never out of the arena)
  if (e.dashT > 0) {
    e.dashT--;
    e.x = clamp(e.x - e.face * effSpeed(e) * 2.2, G.cam + 46, G.cam + W - 46);
    e.walk += 0.4;
    return;
  }

  if (dist > ENEMY_AI.silReach - 10 || dy > 12) {
    moveToward(e, p.x, p.y, effSpeed(e) * (p2 ? 1.25 : 1));
  } else if (e.atkT <= 0 && e.spawnGraceT <= 0) {
    e.state = "windup"; e.t = p2 ? 9 : 11; e.swing = 14; e.windupKind = 0;
    e.atkT = p2 ? ENEMY_AI.silSwingCd * 0.7 : ENEMY_AI.silSwingCd;
    if (Math.random() < 0.35) e.dashT = Math.floor(rnd(14, 24)); // queue a retreat after
  }
}
