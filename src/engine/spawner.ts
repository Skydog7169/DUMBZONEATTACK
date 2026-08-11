/* Enemy factory + wave gating. */
import { G, type Enemy } from "./entity";
import type { EnemyKind } from "../balance";
import { ENEMY, W, FLOOR_TOP, FLOOR_BOT } from "../balance";
import { rnd } from "./util";
import { setBanner } from "../render/fx";
import { SFX, musicSet } from "../audio";
import { LORE } from "../lore";
import { STAGES } from "../stages";

export function makeEnemy(kind: EnemyKind, x: number, y?: number): Enemy {
  const s = ENEMY[kind];
  return {
    kind,
    hp: s.hp, maxHp: s.hp, dmg: s.dmg,
    speed: s.speed * (kind === "lawyer" || kind === "lawsuit" ? rnd(0.85, 1.15) : 1),
    score: s.score,
    x, y: y ?? rnd(FLOOR_TOP + 10, FLOOR_BOT - 10),
    h: 0, vh: 0, vx: 0,
    face: -1,
    state: "approach", t: 0,
    walk: 0, swing: 0,
    atkT: rnd(30, 80),
    juggleHits: 0,
    trapT: 0, slowT: 0, slowMul: 1,
    inGas: false, gasTick: 0,
    flyDmg: 0, flyHit: [],
    phase: 1,
    askT: 120, throwT: 90, dashT: 0, windupKind: 0,
    tradeCd: 60,
    blockRecover: 0,
    orbitA: rnd(0, Math.PI * 2), fireT: rnd(40, 100),
    summonFlags: [false, false],
    summonCount: 0,
    rainT: 340, rainStage: 0, rainStageT: 0, rainGaps: [],
    diveVx: 0, diveVy: 0,
    spawnGraceT: 30
  };
}

const BOSS_INTROS: Partial<Record<EnemyKind, { intro: string; sub: string }>> = {
  seniorPartner: LORE.seniorPartner, angelo: LORE.angelo,
  sonInLaw: LORE.sonInLaw, matriarch: LORE.matriarch, catman: LORE.catman
};

export function spawnEnemy(kind: EnemyKind, x: number, y?: number): Enemy {
  const e = makeEnemy(kind, x, y);
  if (kind === "seniorPartner" || kind === "angelo" || kind === "sonInLaw" || kind === "matriarch" || kind === "catman") {
    e.y = (FLOOR_TOP + FLOOR_BOT) / 2;
    G.bossBar = { ref: e, label: LORE.enemyNames[kind] };
    const b = BOSS_INTROS[kind];
    if (b) setBanner(b.intro, b.sub, 150);
    SFX.boss();
    musicSet("boss");
  }
  G.enemies.push(e);
  return e;
}

/** Wave gating: when the player nears a wave trigger, lock the camera
    and pour enemies in from both edges. */
export function updateWaves(): void {
  const stage = STAGES[G.stageIdx];
  const p = G.player;
  if (!p) return;
  if (G.waveIdx < stage.waves.length) {
    const wv = stage.waves[G.waveIdx];
    if (G.gateX === null && p.x > wv.at - 380) {
      G.gateX = wv.at;
      let i = 0;
      wv.spawn.forEach(([kind, n]) => {
        for (let k = 0; k < n; k++) {
          const fromLeft = i % 3 === 2;
          const x = fromLeft ? G.cam - 50 - (i * 30) : G.cam + W + 60 + i * 70 + rnd(0, 50);
          spawnEnemy(kind, x);
          i++;
        }
      });
      if (wv.banner) setBanner(wv.banner, null, 110);
      G.waveIdx++;
    }
  }
  if (G.enemies.length === 0) G.gateX = null;
}

export function stageCleared(): boolean {
  const stage = STAGES[G.stageIdx];
  return G.waveIdx >= stage.waves.length && G.enemies.length === 0;
}
