/* Core entity types + the single mutable game state (G). */
import type { CharKey, EnemyKind } from "../balance";

export type Facing = -1 | 1;

export type EnemyState =
  | "approach"   // AI decides movement / attacks
  | "windup"     // committed to an attack, t counts down
  | "recover"    // post-attack cooldown
  | "hurt"
  | "air"        // launched / flying
  | "down"
  | "getup"
  | "grabbed"    // held by the player
  | "frozen";    // ON AIR gag

export interface Enemy {
  kind: EnemyKind;
  hp: number; maxHp: number;
  dmg: number; speed: number; score: number;
  x: number; y: number;        // y = depth lane (also ground screen y)
  h: number; vh: number;       // height above floor + vertical velocity
  vx: number;                  // horizontal velocity while airborne
  face: Facing;
  state: EnemyState;
  t: number;                   // frames left in current state
  walk: number; swing: number;
  atkT: number;                // cooldown until next attack attempt
  juggleHits: number;
  // debuffs
  trapT: number;               // goo trap (grunts)
  slowT: number; slowMul: number;
  inGas: boolean; gasTick: number;
  // flying-body damage transfer
  flyDmg: number;
  flyHit: Enemy[];
  // boss / variant scratch fields
  phase: number;
  askT: number; throwT: number; dashT: number; windupKind: number;
  tradeCd: number;
  blockRecover: number;        // suits: frames unable to block after a break
  orbitA: number; fireT: number;
  summonFlags: boolean[];
  summonCount: number;
  rainT: number; rainStage: number; rainStageT: number; rainGaps: number[];
  diveVx: number; diveVy: number;  // lawsuit committed-dive vector
  spawnGraceT: number;         // brief walk-in period, no attacks
}

/** Jake's 4 Pointer: the stream in flight from waist to pool point. */
export interface Stream { x0: number; y0: number; tx: number; ty: number; t: number; dur: number; done?: boolean; }

export interface PlayerAct {
  kind: "light1" | "light2" | "light3" | "launcher" | "strong" | "dashAtk" | "backAtk" | "throwAct" | "special";
  t: number; dur: number; hitAt: number; hasHit: boolean;
  charge: number;              // blake special charge captured at release
}

export interface Player {
  key: CharKey;
  hp: number; maxHp: number;
  x: number; y: number; h: number; vh: number;
  face: Facing;
  walk: number;
  hurtT: number;
  act: PlayerAct | null;
  chainStep: number;           // 0,1,2 progress through the light chain
  chainWindow: number;
  bufAct: "attack" | "strong" | "special" | null;
  bufT: number;
  meter: number;
  dashT: number; dashDir: Facing; dashAtkCd: number;
  lastTapDir: Facing; lastTapT: number;
  charging: boolean; chargeT: number;
  grabbing: Enemy | null; grabT: number;
  slowT: number;
  armorT: number;
  attackLockT: number;         // Cat Man's INJUNCTION: attacks on hold, movement fine
  combo: number; comboT: number;
}

export type ProjType =
  | "cat" | "pinkSlip" | "subpoena" | "card" | "chip" | "chipRain"
  | "textMsg" | "tin" | "goo" | "firework" | "chair";

export interface Projectile {
  type: ProjType;
  x: number; y: number;        // y = depth lane
  h: number; vh: number; g: number;
  vx: number; vy: number;      // vy moves the depth lane
  dmg: number; t: number;
  from: "enemy" | "player";
  spin: number;
  text: string;
  homing: number;              // 0 = none; else steering strength
  dead?: boolean;
}

export interface GasCloud { x: number; y: number; r: number; life: number; }
export interface GooBlob { x: number; y: number; r: number; life: number; }
export type PickupKind = "pizza" | "peptide";
export interface Pickup { kind: PickupKind; x: number; y: number; t: number; dead?: boolean; }
export interface Corpse { x: number; y: number; kind: EnemyKind; t: number; face: Facing; }

export interface Wave {
  at: number;                  // world x that triggers the gate
  spawn: [EnemyKind, number][];
  banner?: string | null;
}

export interface StageDef {
  length: number;
  waves: Wave[];
  backdrop: 0 | 1 | 2 | 3 | 4 | 5 | 6;  // fox4 | downtown | estate | (unused) | aac | lime | cumulus
  music: number;
  onAirX?: number;             // stage 1 gag trigger
  interiorX?: number;          // estate: lawn/interior boundary
  kissCam?: boolean;           // AAC jumbotron freeze gag
  autoscroll?: boolean;        // the Lime ride
  heliOutro?: boolean;         // AAC: helicopter pickup after the boss
}

/* Lime-ride road hazards */
export type HazardType = "pothole" | "car" | "dart" | "angelo" | "sign";
export interface Hazard {
  type: HazardType;
  x: number; y: number;
  t: number;                   // per-hazard anim/trigger timer
  flag: boolean;               // one-shot state (door opened / damage dealt)
  variant: number;             // sign index / art seed
}

export type Scene =
  | "title" | "select" | "howto" | "intro" | "stagecard" | "play"
  | "results" | "win" | "lose" | "pause" | "bridge" | "outro";

export interface StageStats { damage: number; maxCombo: number; startScore: number; died: boolean; }

export interface GameState {
  scene: Scene;
  pausedFrom: Scene;
  sceneT: number;              // frames in current scene
  tick: number;
  selIdx: number;
  stageIdx: number;
  player: Player | null;
  cam: number;
  enemies: Enemy[];
  projectiles: Projectile[];
  pickups: Pickup[];
  clouds: GasCloud[];
  goos: GooBlob[];
  streams: Stream[];
  corpses: Corpse[];
  score: number;
  waveIdx: number;
  gateX: number | null;
  bossBar: { ref: Enemy; label: string } | null;
  hitstop: number;
  shake: number;
  introPanel: number;
  stats: StageStats;
  onAirDone: boolean; onAirT: number;
  onAirLabel: string;          // which ON AIR variant this run got
  slowmoT: number;
  clearT: number;              // countdown after stage cleared before results
  selCooldown: number;
  /* comic-bridge cutscenes */
  bridgeSeq: string | null;    // active panel sequence id
  bridgeIdx: number; bridgeT: number;
  bridgeReturn: Scene;         // where to go when the sequence ends
  pendingBridge: string | null;
  /* scripted outro (the helicopter) */
  outroT: number;
  /* AAC events */
  kissCamT: number; kissCamShowT: number;
  chantT: number; chantActiveT: number;
  /* Lime ride */
  hazards: Hazard[];
}

export const G: GameState = {
  scene: "title",
  pausedFrom: "play",
  sceneT: 0,
  tick: 0,
  selIdx: 1,
  stageIdx: 0,
  player: null,
  cam: 0,
  enemies: [],
  projectiles: [],
  pickups: [],
  clouds: [],
  goos: [],
  streams: [],
  corpses: [],
  score: 0,
  waveIdx: 0,
  gateX: null,
  bossBar: null,
  hitstop: 0,
  shake: 0,
  introPanel: 0,
  stats: { damage: 0, maxCombo: 0, startScore: 0, died: false },
  onAirDone: false, onAirT: 0,
  onAirLabel: "ON AIR",
  slowmoT: 0,
  clearT: 0,
  selCooldown: 0,
  bridgeSeq: null,
  bridgeIdx: 0, bridgeT: 0,
  bridgeReturn: "play",
  pendingBridge: null,
  outroT: 0,
  kissCamT: 600, kissCamShowT: 0,
  chantT: 500, chantActiveT: 0,
  hazards: []
};
