/* Shared enemy pipeline: debuffs (gas / goo / slow), airborne physics
   with flying-body damage transfer, knockdown/getup, the ON AIR freeze,
   AI dispatch, and death resolution (score, corpses, drops, boss lines). */
import { G, type Enemy } from "../../engine/entity";
import { COMBAT, SPECIALS, PIZZA_DROP_CHANCE, PEPTIDE_DROP_CHANCE, W, FLOOR_TOP, FLOOR_BOT } from "../../balance";
import { hitEnemy, isBoss } from "../../engine/combat";
import { floatText, spark, confetti } from "../../render/fx";
import { SFX, musicSet } from "../../audio";
import { LORE } from "../../lore";
import { clamp, rnd } from "../../engine/util";
import { updateLawyer } from "./lawyer";
import { updateLawsuit } from "./lawsuit";
import { updateProcessServer } from "./processServer";
import { updateSuit } from "./suit";
import { updateCardSharp } from "./cardSharp";
import { updateGroupChat } from "./groupChat";
import { updateSeniorPartner } from "../bosses/seniorPartner";
import { updateAngelo } from "../bosses/angelo";
import { updateSonInLaw } from "../bosses/sonInLaw";
import { updateMatriarch } from "../bosses/matriarch";
import { updateCatman } from "../bosses/catman";
import { STAGES } from "../../stages";

function dispatch(e: Enemy): void {
  switch (e.kind) {
    case "lawyer": updateLawyer(e); break;
    case "lawsuit": updateLawsuit(e); break;
    case "processServer": updateProcessServer(e); break;
    case "suit": case "pitBoss": updateSuit(e); break;
    case "cardSharp": updateCardSharp(e); break;
    case "groupChat": updateGroupChat(e); break;
    case "seniorPartner": updateSeniorPartner(e); break;
    case "angelo": updateAngelo(e); break;
    case "sonInLaw": updateSonInLaw(e); break;
    case "matriarch": updateMatriarch(e); break;
    case "catman": updateCatman(e); break;
  }
}

export function updateEnemies(): void {
  const p = G.player;
  for (const e of G.enemies) {
    if (e.hp <= 0 && e.state !== "air") continue;
    if (e.spawnGraceT > 0) e.spawnGraceT--;
    if (e.slowT > 0) e.slowT--;
    if (e.tradeCd > 0) e.tradeCd--;
    if (e.swing > 0) e.swing--;

    /* gas cloud: DoT, cough-stagger on entry, halved attack rate
       (attack cadence halving is done by re-incrementing timers
       every other frame while inside). */
    const inGas = G.clouds.some(c => Math.abs(e.x - c.x) < c.r && Math.abs(e.y - c.y) < c.r * 0.7);
    if (inGas && !e.inGas && e.state !== "air" && e.state !== "down" && e.state !== "grabbed") {
      e.state = "hurt"; e.t = SPECIALS.dan.cough;   // cough-stagger on entry
      spark(e.x, e.y - 40, "#67e06b", 4, 2);
    }
    e.inGas = inGas;
    if (inGas) {
      e.gasTick++;
      if (e.gasTick % SPECIALS.dan.dotEvery === 0) {
        e.hp -= SPECIALS.dan.dotDmg;
        floatText(e.x, e.y - e.h - 60, String(SPECIALS.dan.dotDmg), "#67e06b", 14, 24);
      }
      if (G.tick % 2 === 0) {
        // halve attack rate: give back half the timer decrements
        if (e.atkT > 0) e.atkT++;
        if (e.fireT > 0) e.fireT++;
        if (e.throwT > 0) e.throwT++;
      }
    } else e.gasTick = 0;

    /* arena clamp for every grounded state (hurt/frozen included, so
       knockback can't shove anyone out of reach) */
    if (e.state !== "air") {
      const stage = STAGES[G.stageIdx];
      e.x = clamp(e.x, Math.max(-40, G.cam - 90), Math.min(stage.length + 40, G.cam + W + 130));
    }

    /* goo trap: cannot move or attack */
    if (e.trapT > 0) {
      e.trapT--;
      if (e.state === "windup" || e.state === "recover") { e.state = "approach"; }
      e.x = clamp(e.x, G.cam - 80, G.cam + W + 120);
      continue;
    }

    /* airborne physics + flying-body damage transfer */
    if (e.state === "air") {
      e.x += e.vx;
      e.h += e.vh;
      e.vh -= COMBAT.gravity;
      e.vx *= 0.985;
      if (e.flyDmg > 0 && Math.abs(e.vx) > 3) {
        for (const other of G.enemies) {
          if (other === e || other.hp <= 0 || other.state === "air" || e.flyHit.includes(other)) continue;
          if (Math.abs(other.x - e.x) < 32 && Math.abs(other.y - e.y) < 26) {
            e.flyHit.push(other);
            hitEnemy(other, e.flyDmg, { dir: (e.vx > 0 ? 1 : -1), knockdown: true, kb: 10, meter: 2, countCombo: true });
          }
        }
      }
      if (e.h <= 0 && e.vh < 0) {
        if (e.vh < -5.5 && e.flyDmg === 0) {
          e.vh = 2.4; e.h = 0;                     // knockdown bounce
          spark(e.x, e.y, "#888", 4, 2);
        } else {
          e.h = 0; e.vh = 0; e.vx = 0; e.flyDmg = 0;
          if (e.hp > 0) { e.state = "down"; e.t = COMBAT.downFrames; }
          spark(e.x, e.y, "#666", 5, 2.5);
        }
      }
      continue;
    }

    if (e.state === "down") { e.t--; if (e.t <= 0) { e.state = "getup"; e.t = COMBAT.getupFrames; } continue; }
    if (e.state === "getup") { e.t--; if (e.t <= 0) e.state = "approach"; continue; }
    if (e.state === "hurt") { e.t--; if (e.t <= 0) e.state = "approach"; continue; }
    if (e.state === "frozen") { e.t--; if (e.t <= 0) e.state = "approach"; continue; }
    if (e.state === "grabbed") continue;

    if (e.hp <= 0) continue;
    dispatch(e);

    const stage = STAGES[G.stageIdx];
    e.x = clamp(e.x, Math.max(-40, G.cam - 90), Math.min(stage.length + 40, G.cam + W + 130));
    if (e.kind !== "lawsuit" && e.kind !== "groupChat") e.y = clamp(e.y, FLOOR_TOP, FLOOR_BOT);
    else e.y = clamp(e.y, FLOOR_TOP - 20, FLOOR_BOT);
  }

  /* ---- deaths ---- */
  G.enemies = G.enemies.filter(e => {
    if (e.hp > 0) return true;
    // flying corpses keep sailing (home run / throws) until they land or exit
    const flying = e.state === "air" && e.h > 0 && e.x > G.cam - 100 && e.x < G.cam + W + 100;
    if (flying) return true;
    finishEnemy(e);
    return false;
  });
}

function finishEnemy(e: Enemy): void {
  G.score += e.score;
  SFX.ko();
  floatText(e.x, e.y - 70, `+${e.score}`, "#67e06b", 14, 45);

  if (e.kind === "groupChat") {
    // smashed like an object, not a person
    SFX.smash();
    spark(e.x, e.y - e.h - 20, "#39d5ff", 16, 5);
    spark(e.x, e.y - e.h - 20, "#fff", 10, 4);
    floatText(e.x, e.y - 96, LORE.groupChatSmash, "#39d5ff", 15, 70);
    return; // no corpse — it shattered
  }

  G.corpses.push({ x: e.x, y: e.y, kind: e.kind, t: 60, face: e.face });

  if (e.kind === "seniorPartner") {
    floatText(e.x, e.y - 100, LORE.seniorPartner.defeatLine, "#fff", 15, 130);
    G.pickups.push({ kind: "pizza", x: e.x, y: e.y, t: 0 });
    G.bossBar = null;
    musicSet(`stage${G.stageIdx + 1}` as "stage1");
  } else if (e.kind === "angelo") {
    floatText(e.x, e.y - 100, LORE.angelo.defeatLine, "#fff", 15, 130);
    G.pickups.push({ kind: "pizza", x: e.x - 22, y: e.y, t: 0 });
    G.pickups.push({ kind: "peptide", x: e.x + 26, y: e.y, t: 0 });
    G.bossBar = null;
    musicSet(`stage${G.stageIdx + 1}` as "stage1");
  } else if (e.kind === "sonInLaw") {
    floatText(e.x, e.y - 100, LORE.sonInLaw.defeatLine, "#fff", 15, 130);
    G.bossBar = null;
    musicSet(`stage${G.stageIdx + 1}` as "stage1");
  } else if (e.kind === "matriarch") {
    floatText(e.x, e.y - 100, LORE.matriarch.defeatLine, "#fff", 15, 130);
    G.bossBar = null;
    musicSet(`stage${G.stageIdx + 1}` as "stage1");
  } else if (e.kind === "catman") {
    // slow-mo final hit, flash, confetti of shredded contracts, dawn breaks
    floatText(e.x, e.y - 100, LORE.catman.defeatLine, "#fff", 15, 160);
    G.bossBar = null;
    G.slowmoT = 120;
    G.shake = 8;
    confetti(e.x, e.y - 60, 80);
    confetti(G.cam + W / 2, 200, 60);
    SFX.win();
    musicSet("none");
  } else {
    const roll = Math.random();
    if (roll < PIZZA_DROP_CHANCE) G.pickups.push({ kind: "pizza", x: e.x, y: e.y, t: 0 });
    else if (roll < PIZZA_DROP_CHANCE + PEPTIDE_DROP_CHANCE) G.pickups.push({ kind: "peptide", x: e.x, y: e.y, t: 0 });
  }
}

/** ON AIR gag: everyone freezes and looks at the sign. */
export function freezeAllEnemies(frames: number, signX: number): void {
  for (const e of G.enemies) {
    if (e.hp <= 0 || e.state === "air" || e.state === "down" || e.state === "grabbed") continue;
    e.state = "frozen"; e.t = frames;
    e.face = signX > e.x ? 1 : -1;
  }
}
