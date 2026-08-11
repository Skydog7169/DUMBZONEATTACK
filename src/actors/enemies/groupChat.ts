/* THE GROUP CHAT — a hovering, buzzing phone that orbits the player
   firing guilt-trip text projectiles that slow you down. It is an
   object, not a person: low HP, smashed like a pinata. It never
   hard-stuns — the texts only slow. */
import { G, type Enemy } from "../../engine/entity";
import { ENEMY_AI, W } from "../../balance";
import { moveToward } from "./common";
import { SFX } from "../../audio";
import { LORE } from "../../lore";
import { pick, clamp } from "../../engine/util";

export function updateGroupChat(e: Enemy): void {
  const p = G.player;
  if (!p) return;
  e.orbitA += 0.045;

  // "...is typing" — it stops, drops low, and is wide open. Smash it.
  if (e.windupKind === 1) {
    e.t--;
    e.h = 18 + Math.sin(G.tick * 0.3) * 2;
    if (e.t <= 0) e.windupKind = 0;
    return;
  }
  if (e.askT > 0) e.askT--;
  else if (e.spawnGraceT <= 0) { e.windupKind = 1; e.t = 80; e.askT = 260; return; }

  e.h = 42 + Math.sin(e.orbitA * 3) * 4;   // hover buzz
  const tx = p.x + Math.cos(e.orbitA) * ENEMY_AI.chatOrbitR;
  const ty = p.y + Math.sin(e.orbitA) * ENEMY_AI.chatOrbitR * 0.4;
  moveToward(e, tx, ty, e.speed);
  e.x = clamp(e.x, G.cam + 30, G.cam + W - 30);   // never orbits out of reach
  e.face = p.x < e.x ? -1 : 1;

  if (e.fireT > 0) e.fireT--;
  else if (e.spawnGraceT <= 0) {
    e.fireT = ENEMY_AI.chatFireCd;
    SFX.msg();
    const dx = p.x - e.x, dy = p.y - e.y;
    const d = Math.max(1, Math.hypot(dx, dy));
    G.projectiles.push({
      type: "textMsg", x: e.x, y: e.y, h: e.h, vh: 0, g: 0,
      vx: (dx / d) * ENEMY_AI.chatMsgVx, vy: (dy / d) * ENEMY_AI.chatMsgVx * 0.5,
      dmg: e.dmg, t: 0, from: "enemy", spin: 0,
      text: pick(LORE.groupChatLines), homing: 0
    });
  }
}
