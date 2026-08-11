/* LAWSUIT — kamikaze flying document. It drifts toward you, telegraphs
   with a hover-flash, then COMMITS to a straight dive. Step out of the
   line and it face-plants into the pavement. No mid-flight tracking. */
import { G, type Enemy } from "../../engine/entity";
import { hurtPlayer } from "../../engine/combat";
import { effSpeed, faceThePlayer } from "./common";
import { SFX } from "../../audio";
import { spark } from "../../render/fx";

export function updateLawsuit(e: Enemy): void {
  const p = G.player;
  if (!p) return;
  e.orbitA += 0.15;

  if (e.windupKind === 2) {
    // committed dive: straight line, no corrections
    e.x += e.diveVx;
    e.y += e.diveVy;
    e.t--;
    if (Math.abs(e.x - p.x) < 20 && Math.abs(e.y - p.y) < 20 && p.hurtT <= 0) {
      hurtPlayer(e.dmg);
      e.hp = 0;                 // paper-cut kamikaze
      SFX.paper();
      return;
    }
    if (e.t <= 0) {
      // missed — crumples on the pavement, no points for litter
      e.score = 0;
      e.hp = 0;
      spark(e.x, e.y, "#d8d4c4", 6, 2);
      SFX.paper();
    }
    return;
  }

  if (e.windupKind === 1) {
    // telegraph: hover in place, rattling
    e.t--;
    e.h = 30 + Math.sin(e.orbitA * 2) * 3;
    if (e.t <= 0) {
      e.windupKind = 2;
      const dx = p.x - e.x, dy = p.y - e.y;
      const d = Math.max(1, Math.hypot(dx, dy));
      const sp = effSpeed(e) * 3.4;
      e.diveVx = (dx / d) * sp;
      e.diveVy = (dy / d) * sp;
      e.t = 55;                 // dive lifetime before it crashes
      SFX.paper();
    }
    return;
  }

  // drift phase: floaty approach
  const dx = faceThePlayer(e);
  const dy = (p.y - 4) - e.y;
  e.x += Math.sign(dx) * effSpeed(e) * 0.6;
  e.y += Math.sign(dy) * 0.9 + Math.sin(e.orbitA) * 1.2;
  e.h = 26 + Math.sin(e.orbitA * 0.7) * 6;
  if (Math.abs(dx) < 170 && Math.abs(dy) < 70 && e.spawnGraceT <= 0) {
    e.windupKind = 1; e.t = 24;
  }
}
