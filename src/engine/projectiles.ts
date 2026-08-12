/* Projectile flight + collisions: cats, pink slips, subpoenas, cards,
   poker chips, chip rain, group-chat texts, Dan's tin, Jake's goo. */
import { G } from "./entity";
import { W, ENEMY_AI, SPECIALS } from "../balance";
import { hurtPlayer } from "./combat";
import { gooSplat, danBomb } from "../actors/player";
import { floatText, spark } from "../render/fx";
import { LORE } from "../lore";
import { SFX } from "../audio";
import { clamp } from "./util";

export function updateProjectiles(): void {
  const p = G.player;
  for (const pr of G.projectiles) {
    pr.t++;
    if (pr.t < 0) continue;               // delayed fx (fireworks)

    if (pr.type === "firework") {
      if (pr.t === 1) { spark(pr.x, pr.y - pr.h, "#ffd23f", 20, 5); spark(pr.x, pr.y - pr.h, "#ff4f79", 14, 4); }
      if (pr.t > 20) pr.dead = true;
      continue;
    }

    // homing cats (Cat Man P3) steer toward the player mid-flight
    if (pr.homing > 0 && p) {
      pr.vx += clamp(p.x - pr.x, -1, 1) * pr.homing;
      pr.vx = clamp(pr.vx, -6.5, 6.5);
    }

    pr.x += pr.vx;
    pr.y += pr.vy;
    pr.h += pr.vh;
    pr.vh -= pr.g;
    pr.spin += 0.3;

    /* ground impact for arcing types */
    if (pr.h <= 0 && (pr.type === "tin" || pr.type === "chip" || pr.type === "chipRain" || pr.type === "cat")) {
      if (pr.type === "tin") {
        danBomb(pr.x, pr.y);
      } else if (pr.type === "chip" || pr.type === "chipRain") {
        SFX.boom();
        const r = pr.type === "chip" ? ENEMY_AI.matChipR : 34;
        spark(pr.x, pr.y, "#e8c66a", 10, 4);
        if (p && p.hurtT <= 0 && Math.abs(p.x - pr.x) < r && (pr.type === "chipRain" || Math.abs(p.y - pr.y) < r * 0.7)) {
          hurtPlayer(pr.dmg);
        }
      } else if (pr.type === "cat") {
        spark(pr.x, pr.y, "#e59a3c", 5, 2);   // the cat lands on its feet and leaves
      }
      pr.dead = true;
      continue;
    }

    /* direct hits — cards are small and honest about it */
    const hitW = pr.type === "card" ? 13 : 24;
    const hitD = pr.type === "card" ? 13 : 22;
    if (pr.from === "enemy" && p && p.hurtT <= 0 && G.scene === "play") {
      if (Math.abs(pr.x - p.x) < hitW && Math.abs(pr.y - p.y) < hitD && pr.h < 62) {
        if (pr.type === "textMsg") {
          // the group chat slows you down but never hard-stuns
          p.slowT = ENEMY_AI.chatSlowT;
          hurtPlayer(pr.dmg, { noStagger: true });
          floatText(p.x, p.y - 96, pr.text, "#39d5ff", 14, 55);
        } else {
          hurtPlayer(pr.dmg);
          if (pr.type === "pinkSlip") floatText(p.x, p.y - 96, LORE.catman.servedPop, "#ff9dc0", 14, 50);
        }
        pr.dead = true;
        continue;
      }
    }
    if (pr.from === "player" && pr.type === "goo") {
      const victim = G.enemies.find(e =>
        e.hp > 0 && e.state !== "down" && Math.abs(e.x - pr.x) < 26 && Math.abs(e.y - pr.y) < 26);
      if (victim || Math.abs(pr.vx) * pr.t > W || pr.x < G.cam - 40 || pr.x > G.cam + W + 40) {
        gooSplat(pr.x, pr.y);
        pr.dead = true;
        continue;
      }
    }

    if (pr.x < G.cam - 80 || pr.x > G.cam + W + 80 || pr.t > 500 || pr.h > 400) pr.dead = true;
  }
  G.projectiles = G.projectiles.filter(pr => !pr.dead);
}
