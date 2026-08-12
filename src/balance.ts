/* ============================================================
   balance.ts — every tunable number in the game.
   Damage, HP, speeds, frame windows, cooldowns, meter rates.
   ============================================================ */

export type CharKey = "blake" | "jake" | "dan";

export type EnemyKind =
  | "lawyer" | "lawsuit" | "processServer" | "suit" | "pitBoss"
  | "cardSharp" | "groupChat" | "evilGm"
  | "seniorPartner" | "angelo" | "sonInLaw" | "matriarch" | "catman";

/* ---- canvas / world ---- */
export const W = 960, H = 540;
export const FLOOR_TOP = 350, FLOOR_BOT = 512;

/* ---- hosts ---- */
export interface CharStats {
  hp: number; speed: number;
  light: number;   // light-chain base damage
  strong: number;  // raw strong damage
  range: number;   // melee reach in px
  w: number; h: number;
}
/* All three hosts share the same stats — pick your fighter by special. */
export const CHARS: Record<CharKey, CharStats> = {
  blake: { hp: 120, speed: 3.0, light: 12, strong: 24, range: 60, w: 30, h: 62 },
  jake:  { hp: 120, speed: 3.0, light: 12, strong: 24, range: 60, w: 26, h: 60 },
  dan:   { hp: 120, speed: 3.0, light: 12, strong: 24, range: 60, w: 26, h: 58 }
};

/* ---- combat frame data ---- */
export interface ActData { dur: number; hitAt: number; dmgMul: number; kb: number; launch?: number; }
export const ACTS: Record<string, ActData> = {
  light1:  { dur: 15, hitAt: 5,  dmgMul: 1.0, kb: 6 },
  light2:  { dur: 15, hitAt: 5,  dmgMul: 1.0, kb: 6 },
  light3:  { dur: 22, hitAt: 7,  dmgMul: 1.4, kb: 16 },          // cross, knockdown
  launcher:{ dur: 26, hitAt: 9,  dmgMul: 1.2, kb: 4, launch: 7.4 },
  strong:  { dur: 34, hitAt: 18, dmgMul: 1.0, kb: 20 },          // armor during startup, guard-break
  dashAtk: { dur: 18, hitAt: 4,  dmgMul: 1.3, kb: 18 },          // knockdown
  backAtk: { dur: 13, hitAt: 4,  dmgMul: 0.8, kb: 12 },
  throwAct:{ dur: 20, hitAt: 8,  dmgMul: 0,   kb: 0 },
  special: { dur: 26, hitAt: 10, dmgMul: 0,   kb: 0 }
};

export const COMBAT = {
  chainWindow: 24,      // frames after a hit connects to accept the next chain input
  inputBuffer: 6,       // frames every attack input is buffered
  airDmgMul: 1.25,      // bonus vs airborne
  trapDmgMul: 1.5,      // bonus vs goo-trapped
  juggleMax: 2,         // light hits allowed on an airborne enemy
  gravity: 0.35,
  dashTapWindow: 16,    // double-tap window (frames)
  dashDur: 14,
  dashSpeedMul: 3.0,
  dashAtkCd: 60,
  grabRangeX: 22, grabRangeY: 16, grabHold: 90,
  throwDmg: 18, throwFlyVx: 9, throwTransferDmg: 14,
  hurtFrames: 26,
  getupFrames: 20,
  downFrames: 45
};

/* ---- special meter ---- */
export const METER = {
  max: 100,
  light: 3, strong: 5, juggle: 8, hurt: 10
  // specials require a FULL meter and drain it completely — no exceptions
};

/* ---- character specials ---- */
export const SPECIALS = {
  dan:   { cloudLife: 150, cloudR: 120, dotDmg: 4, dotEvery: 30, cough: 20, tinDmg: 10, stun: 55 },
  jake:  { gooLife: 150, gooR: 90, maxTrapped: 3, bossSlowMul: 0.5, projVx: 15, hitDmg: 8 },
  blake: { chargeMax: 45, baseDmg: 30, flingVx: 12, bossMul: 2.5, range: 92, transferDmg: 16 }
};

/* ---- enemies ---- */
export interface EnemyStats { hp: number; dmg: number; speed: number; score: number; }
export const ENEMY: Record<EnemyKind, EnemyStats> = {
  lawyer:        { hp: 34,  dmg: 14, speed: 1.5, score: 100 },
  lawsuit:       { hp: 12,  dmg: 9,  speed: 3.1, score: 150 },
  processServer: { hp: 26,  dmg: 10, speed: 1.7, score: 200 },
  suit:          { hp: 64,  dmg: 12, speed: 1.1, score: 300 },
  pitBoss:       { hp: 80,  dmg: 12, speed: 1.2, score: 350 },
  cardSharp:     { hp: 28,  dmg: 6,  speed: 1.8, score: 250 },
  groupChat:     { hp: 10,  dmg: 2,  speed: 2.6, score: 400 },
  evilGm:        { hp: 40,  dmg: 12, speed: 1.7, score: 250 },
  seniorPartner: { hp: 260, dmg: 11, speed: 1.4, score: 1500 },
  angelo:        { hp: 280, dmg: 12, speed: 1.25, score: 1500 },
  sonInLaw:      { hp: 320, dmg: 13, speed: 2.6, score: 2500 },
  matriarch:     { hp: 290, dmg: 10, speed: 0.8, score: 3500 },
  catman:        { hp: 430, dmg: 12, speed: 1.6, score: 5000 }
};

export const ENEMY_AI = {
  lawyerWindup: 12, lawyerRecover: 40, lawyerReach: 50,
  serverKeepMin: 150, serverKeepMax: 260, serverFireCd: 110, subpoenaVx: 5,
  suitWindup: 14, suitRecover: 46, suitBreakStun: 90,
  pitBossBreakStun: 40,
  sharpFireCd: 195, cardVx: 5.5, cardSpread: 1.6,
  chatOrbitR: 105, chatFireCd: 110, chatSlowT: 60, chatSlowMul: 0.6, chatMsgVx: 4.5,
  partnerReach: 62, partnerSwingCd: 64, partnerFanCd: 180, partnerP2SpeedMul: 1.3,
  angeloGrabCd: 110, angeloReach: 60, angeloHeal: 10, angeloAskCd: 240,
  angeloP2SpeedMul: 1.5, angeloP2GrabCd: 80, angeloP2AskCd: 140,
  silSwingCd: 55, silReach: 62, silTradeCd: 300, silTradeDist: 150,
  matChipCd: 155, matChipDmg: 10, matChipR: 48,
  matRainCd: 640, matRainTelegraph: 45, matRainDur: 150, matRainChipDmg: 10, matGapW: 130,
  catThrowCd: 110, catDashCd: 90, catReach: 78,
  catP3ThrowCd: 82, catChairWindup: 30, catChairCd: 280, catChairVx: 9, catChairDmg: 16,
  freezeFrames: 40   // ON AIR gag
};

/* ---- pickups ---- */
export const PIZZA_HEAL = 40;          // Cane Rosso: HP
export const PEPTIDE_METER = 40;       // peptides: special meter
export const PIZZA_DROP_CHANCE = 0.22;
export const PEPTIDE_DROP_CHANCE = 0.12;

/* ---- juice ---- */
export const JUICE = {
  hitstopLight: 2, hitstopStrong: 4, hitstopSpecial: 8,
  comicFreeze: 42,   // full special cards pause the fight while the title lands
  shakeStrong: 5, shakeSpecial: 8, shakeBossSlam: 7
};

/* ---- ranks: thresholds on (damage taken / max hp) and max combo ---- */
export function rankFor(damageFrac: number, maxCombo: number, died: boolean): "S"|"A"|"B"|"C"|"D"|"F" {
  if (died) return "F";
  let pts = 0;
  if (damageFrac < 0.35) pts += 2; else if (damageFrac < 0.9) pts += 1;
  if (maxCombo >= 12) pts += 2; else if (maxCombo >= 6) pts += 1;
  return (["D", "C", "B", "A", "S"] as const)[pts];
}
