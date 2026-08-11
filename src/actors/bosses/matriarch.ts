/* THE MATRIARCH — Stage 3 major boss. Slow, high HP, projectile-heavy:
   lobbed exploding poker chips, Pit Boss summon waves, and the
   HOUSE ALWAYS WINS chip-rain with telegraphed safe gaps. */
import { G, type Enemy } from "../../engine/entity";
import { ENEMY_AI, W } from "../../balance";
import { spawnEnemy } from "../../engine/spawner";
import { effSpeed, faceThePlayer, moveToward } from "../enemies/common";
import { floatText, comicCard } from "../../render/fx";
import { SFX } from "../../audio";
import { LORE } from "../../lore";
import { pick, rnd, clamp, sign } from "../../engine/util";

export function updateMatriarch(e: Enemy): void {
  const p = G.player;
  if (!p) return;

  // summon waves at HP thresholds
  const frac = e.hp / e.maxHp;
  if (frac < 0.7 && !e.summonFlags[0]) {
    e.summonFlags[0] = true;
    spawnEnemy("pitBoss", G.cam + W + 40);
    spawnEnemy("cardSharp", G.cam - 40);
    floatText(e.x, e.y - 116, pick(LORE.matriarch.attackLines), "#e8c66a", 15, 100);
    G.pickups.push({ kind: "pizza", x: G.cam + W / 2, y: e.y, t: 0 });   // the house comps you
  }
  if (frac < 0.35 && !e.summonFlags[1]) {
    e.summonFlags[1] = true;
    spawnEnemy("pitBoss", G.cam + W + 40);
    spawnEnemy("lawsuit", G.cam - 40);
    G.pickups.push({ kind: "pizza", x: G.cam + W / 2, y: e.y, t: 0 });
  }

  /* ---- HOUSE ALWAYS WINS: chip rain ---- */
  if (e.rainStage === 1) {
    e.rainStageT--;
    if (e.rainStageT <= 0) { e.rainStage = 2; e.rainStageT = ENEMY_AI.matRainDur; }
    return; // she stands and savors the telegraph
  }
  if (e.rainStage === 2) {
    e.rainStageT--;
    if (e.rainStageT % 3 === 0) {
      // pick a column outside the safe gaps
      for (let tries = 0; tries < 8; tries++) {
        const x = G.cam + rnd(30, W - 30);
        if (e.rainGaps.every(gx => Math.abs(x - gx) > ENEMY_AI.matGapW / 2)) {
          G.projectiles.push({
            type: "chipRain", x, y: rnd(360, 505), h: 300, vh: 0, g: 0.22,
            vx: 0, vy: 0, dmg: ENEMY_AI.matRainChipDmg, t: 0,
            from: "enemy", spin: rnd(0, 6), text: "", homing: 0
          });
          break;
        }
      }
    }
    if (e.rainStageT <= 0) { e.rainStage = 0; e.rainT = ENEMY_AI.matRainCd; }
    return;
  }
  if (e.rainT > 0) e.rainT--;
  else if (e.spawnGraceT <= 0) {
    e.rainStage = 1; e.rainStageT = ENEMY_AI.matRainTelegraph;
    // two safe gaps, spread across the screen
    e.rainGaps = [G.cam + rnd(90, W * 0.42), G.cam + rnd(W * 0.58, W - 90)];
    comicCard(LORE.matriarch.rainPop, "#e8c66a", 0.5);
    SFX.boss();
    return;
  }

  if (e.state === "recover") { e.t--; if (e.t <= 0) e.state = "approach"; return; }

  const dx = faceThePlayer(e);
  const dist = Math.abs(dx);

  // she keeps her distance — but the house never leaves the floor
  if (dist < 170) { e.x = clamp(e.x - sign(dx) * effSpeed(e), G.cam + 46, G.cam + W - 46); e.walk += 0.15; }
  else if (Math.abs(p.y - e.y) > 24) moveToward(e, e.x, p.y, effSpeed(e) * 0.7);

  // lobbed exploding poker chip (only while on the floor, no off-screen sniping)
  const onScreen = e.x > G.cam + 20 && e.x < G.cam + W - 20;
  if (e.throwT > 0) e.throwT--;
  else if (e.spawnGraceT <= 0 && onScreen) {
    e.throwT = ENEMY_AI.matChipCd;
    e.swing = 14;
    SFX.chip();
    const flight = 48;
    G.projectiles.push({
      type: "chip", x: e.x + e.face * 16, y: e.y, h: 52, vh: 5.6, g: 0.28,
      vx: clamp((p.x - e.x) / flight, -7, 7), vy: clamp((p.y - e.y) / flight, -2, 2),
      dmg: ENEMY_AI.matChipDmg, t: 0, from: "enemy", spin: 0.3, text: "", homing: 0
    });
    e.state = "recover"; e.t = 26;
  }
}
