/* Clouds, goo blobs, pickups, corpses — the slow-moving world objects. */
import { G } from "./entity";
import { PIZZA_HEAL, PEPTIDE_METER, METER } from "../balance";
import { floatText } from "../render/fx";
import { SFX } from "../audio";
import { LORE } from "../lore";
import { isBoss } from "./combat";
import { gooSplat } from "../actors/player";

export function updateWorldObjects(): void {
  const p = G.player;

  G.clouds.forEach(c => c.life--);
  G.clouds = G.clouds.filter(c => c.life > 0);

  // Jake's stream in flight: when it lands, the pool forms
  G.streams.forEach(s => {
    s.t++;
    if (s.t >= s.dur) { s.done = true; gooSplat(s.tx, s.ty); }
  });
  G.streams = G.streams.filter(s => !s.done);

  G.goos.forEach(b => {
    b.life--;
    // the pool keeps trapping grunts who wander into it
    if (b.life > 40) {
      for (const e of G.enemies) {
        if (e.hp <= 0 || isBoss(e) || e.trapT > 0) continue;
        if (e.state === "air" || e.state === "down" || e.state === "grabbed") continue;
        if (Math.abs(e.x - b.x) < b.r * 0.7 && Math.abs(e.y - b.y) < b.r * 0.45) {
          e.trapT = Math.min(b.life, 110);
          floatText(e.x, e.y - 84, LORE.chars.jake.specialPop[0], "#39d5ff", 14, 40);
        }
      }
    }
  });
  G.goos = G.goos.filter(b => b.life > 0);

  G.pickups.forEach(pk => {
    pk.t++;
    if (p && p.hp > 0 && Math.abs(pk.x - p.x) < 26 && Math.abs(pk.y - p.y) < 26) {
      pk.dead = true;
      SFX.pickup();
      if (pk.kind === "pizza") {
        p.hp = Math.min(p.maxHp, p.hp + PIZZA_HEAL);
        floatText(p.x, p.y - 95, `${LORE.pickups.pizza.name}!`, "#ff8c5a", 14, 55);
        floatText(p.x, p.y - 78, LORE.pickups.pizza.flavor, "#ffc4a0", 14, 60);
      } else {
        p.meter = Math.min(METER.max, p.meter + PEPTIDE_METER);
        floatText(p.x, p.y - 95, `${LORE.pickups.peptide.name}!`, "#39d5ff", 14, 55);
        floatText(p.x, p.y - 78, LORE.pickups.peptide.flavor, "#9bd8e8", 14, 60);
      }
    }
  });
  G.pickups = G.pickups.filter(pk => !pk.dead);

  G.corpses.forEach(c => c.t--);
  G.corpses = G.corpses.filter(c => c.t > 0);
}
