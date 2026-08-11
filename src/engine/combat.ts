/* Damage resolution: blocking, the Son-in-Law's Trade, juggles,
   knockdowns, meter gain, player damage. */
import { G, type Enemy, type Facing } from "./entity";
import { COMBAT, METER, JUICE, ENEMY_AI } from "../balance";
import { floatText, spark, comicCard } from "../render/fx";
import { SFX } from "../audio";
import { LORE } from "../lore";
import { pick, rnd } from "./util";
import { makeEnemy } from "./spawner";

export interface HitOpts {
  dir: Facing;            // direction the target is pushed
  kb?: number;
  launch?: number;        // initial vertical velocity (pop airborne)
  knockdown?: boolean;
  heavy?: boolean;        // strong-class: breaks front block
  grab?: boolean;
  meter?: number;         // meter gained by the player on connect
  fling?: number;         // home-run style horizontal fling velocity
  countCombo?: boolean;
  silent?: boolean;
}

const BOSSES = new Set(["seniorPartner", "angelo", "sonInLaw", "matriarch", "catman"]);
export const isBoss = (e: Enemy): boolean => BOSSES.has(e.kind);

/** Returns true if the hit connected (false: blocked, traded, or immune). */
export function hitEnemy(e: Enemy, dmg: number, o: HitOpts): boolean {
  if (e.hp <= 0 || e.state === "down" || e.state === "grabbed") return false;

  // THE TRADE — the Son-in-Law swaps in a grunt to eat the hit.
  if (e.kind === "sonInLaw" && e.tradeCd === 0 && e.spawnGraceT <= 0) {
    e.tradeCd = ENEMY_AI.silTradeCd;
    const patsy = makeEnemy("lawyer", e.x, e.y);
    patsy.face = e.face;
    G.enemies.push(patsy);
    const p = G.player;
    if (p) {
      const side: Facing = p.x > e.x ? 1 : -1;
      e.x = p.x + side * ENEMY_AI.silTradeDist * -1; // warp behind the player
      e.face = (p.x > e.x ? 1 : -1);
    } else {
      e.x += o.dir * ENEMY_AI.silTradeDist;
    }
    comicCard(LORE.sonInLaw.tradePop, "#4a90d9", 0.5);
    SFX.trade();
    hitEnemy(patsy, dmg, { ...o, countCombo: o.countCombo });
    return false;
  }

  // Corporate front block (suits / pit bosses).
  if ((e.kind === "suit" || e.kind === "pitBoss") && e.state !== "air" && e.blockRecover === 0 && e.trapT <= 0 && e.state !== "frozen" && e.state !== "getup") {
    const attackerSide: Facing = o.dir === 1 ? -1 : 1;    // attack pushes right => attacker on left
    const facingAttacker = e.face === attackerSide;
    if (facingAttacker && !o.heavy && !o.grab && !o.fling) {
      SFX.block();
      spark(e.x + attackerSide * 14, e.y - 34, "#cfd6e4", 4, 2);
      floatText(e.x, e.y - 80, LORE.ui.blocked, "#cfd6e4", 14, 26);
      e.x += o.dir * 3;
      return false;
    }
    if (facingAttacker && o.heavy) {
      // guard break
      e.blockRecover = e.kind === "pitBoss" ? ENEMY_AI.pitBossBreakStun : ENEMY_AI.suitBreakStun;
      spark(e.x, e.y - 40, "#ffd23f", 10, 4);
    }
  }

  // damage multipliers
  let mult = 1;
  if (e.state === "air") mult *= COMBAT.airDmgMul;
  if (e.trapT > 0) mult *= COMBAT.trapDmgMul;
  const total = Math.max(1, Math.round(dmg * mult));
  e.hp -= total;

  // meter + combo bookkeeping
  const p = G.player;
  if (p && o.meter) {
    p.meter = Math.min(METER.max, p.meter + (e.state === "air" ? METER.juggle : o.meter));
  }
  if (p && o.countCombo !== false) {
    p.combo++; p.comboT = 90;
    if (p.combo > G.stats.maxCombo) G.stats.maxCombo = p.combo;
    if (p.combo > 1) floatText(p.x, p.y - 100, `${p.combo} ${LORE.ui.hits}`, "#ffd23f", 14, 40);
    if (Math.random() < 0.18) {
      const lines = LORE.chars[p.key].hitLines;
      floatText(p.x, p.y - 118, pick(lines), "#ffd23f", 15, 55);
    }
  }

  if (!o.silent) {
    floatText(e.x, e.y - e.h - 64, String(total), "#ff4f79", 14, 32);
    spark(e.x, e.y - e.h - 34, o.heavy ? "#ffd23f" : "#ff9d4f", o.heavy ? 10 : 5, o.heavy ? 4.5 : 3);
    if (o.heavy) SFX.heavy(); else SFX.hit();
  }

  G.hitstop = Math.max(G.hitstop, o.heavy || o.fling ? JUICE.hitstopStrong : JUICE.hitstopLight);
  if (o.heavy || o.fling) G.shake = Math.max(G.shake, JUICE.shakeStrong);

  // state response
  if (isBoss(e)) {
    // bosses: flinch but never launch or fall
    e.state = "hurt"; e.t = 8;
    e.x += o.dir * (o.kb ?? 6) * 0.4;
  } else if (o.fling) {
    e.state = "air"; e.h = Math.max(e.h, 2); e.vh = 4.5;
    e.vx = o.dir * o.fling;
    e.flyDmg = COMBAT.throwTransferDmg;
    e.flyHit = [];
    e.juggleHits = 0;
  } else if (o.launch) {
    e.state = "air"; e.h = Math.max(e.h, 1); e.vh = o.launch; e.vx = o.dir * 1.2;
    e.juggleHits = 0;
    SFX.launch();
  } else if (e.state === "air") {
    e.juggleHits++;
    e.vh = Math.max(e.vh, 2.2);       // small lift to keep the juggle alive
    e.vx = o.dir * 1.5;
  } else if (o.knockdown) {
    e.state = "air"; e.h = Math.max(e.h, 1); e.vh = 3; e.vx = o.dir * 2.4;
    e.juggleHits = COMBAT.juggleMax;  // can't be juggled out of a knockdown
  } else {
    e.state = "hurt"; e.t = 10;
    e.x += o.dir * (o.kb ?? 8);
  }
  return true;
}

export function hurtPlayer(dmg: number, opts?: { noStagger?: boolean }): void {
  const p = G.player;
  if (!p || p.hurtT > 0 || G.scene !== "play") return;
  const armored = p.armorT > 0;
  const total = armored ? Math.round(dmg * 0.7) : dmg;
  p.hp -= total;
  G.stats.damage += total;
  p.meter = Math.min(METER.max, p.meter + METER.hurt);
  floatText(p.x, p.y - 70, `-${total}`, "#ff4f79", 14, 40);
  SFX.hurt();
  G.shake = Math.max(G.shake, 5);
  if (!armored && !opts?.noStagger) {
    p.hurtT = COMBAT.hurtFrames;
    p.act = null; p.charging = false;
    if (p.grabbing) releaseGrab(p.grabbing);
    if (Math.random() < 0.35) {
      floatText(p.x, p.y - 97, pick(LORE.chars[p.key].hurtLines), "#ccc", 14, 55);
    }
  }
  if (p.hp <= 0) { p.hp = 0; }
}

export function releaseGrab(e: Enemy): void {
  const p = G.player;
  if (p) p.grabbing = null;
  if (e.state === "grabbed") { e.state = "hurt"; e.t = 8; e.x += rnd(-4, 4); }
}
