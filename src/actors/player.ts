/* The host: movement, the three-button kit (light chain, launcher,
   raw strong, dash attack, back attack, grab/throw), meter, specials. */
import { G, type Player, type Enemy, type Facing, type PlayerAct } from "../engine/entity";
import type { CharKey } from "../balance";
import { CHARS, ACTS, COMBAT, METER, SPECIALS, JUICE, W, FLOOR_TOP, FLOOR_BOT } from "../balance";
import { held, pressed, released } from "../input";
import { hitEnemy, isBoss, releaseGrab } from "../engine/combat";
import { floatText, comicCard, spark } from "../render/fx";
import { SFX } from "../audio";
import { LORE } from "../lore";
import { clamp, pick } from "../engine/util";
import { STAGES } from "../stages";

export const CHAR_KEYS: CharKey[] = ["blake", "jake", "dan"];
export const CHAR_COLORS: Record<CharKey, string> = {
  blake: "#ffd23f", jake: "#39d5ff", dan: "#67e06b"
};

export function makePlayer(key: CharKey): Player {
  const c = CHARS[key];
  return {
    key, hp: c.hp, maxHp: c.hp,
    x: 120, y: (FLOOR_TOP + FLOOR_BOT) / 2, h: 0, vh: 0,
    face: 1, walk: 0,
    hurtT: 0, act: null,
    chainStep: 0, chainWindow: 0,
    bufAct: null, bufT: 0,
    meter: 0,
    dashT: 0, dashDir: 1, dashAtkCd: 0,
    lastTapDir: 1, lastTapT: -999,
    charging: false, chargeT: 0,
    grabbing: null, grabT: 0,
    slowT: 0, armorT: 0,
    combo: 0, comboT: 0
  };
}

function startAct(p: Player, kind: PlayerAct["kind"], charge = 0): void {
  const d = ACTS[kind];
  p.act = { kind, t: 0, dur: d.dur, hitAt: d.hitAt, hasHit: false, charge };
  p.bufAct = null;
  if (kind === "strong") p.armorT = d.hitAt;      // armor through startup
  if (kind !== "throwAct" && kind !== "special") SFX.punch();
}

function enemiesInBox(p: Player, dir: Facing, range: number, depth = 34): Enemy[] {
  return G.enemies.filter(e => {
    if (e.hp <= 0 || e.state === "grabbed" || e.state === "down") return false;
    const dx = (e.x - p.x) * dir;
    const depthTol = e.kind === "groupChat" ? depth + 14 : depth;  // it's a big floating phone
    return dx > -12 && dx < range && Math.abs(e.y - p.y) < depthTol && e.h < 70;
  });
}

function grabTarget(p: Player): Enemy | null {
  for (const e of G.enemies) {
    if (isBoss(e) || e.hp <= 0) continue;
    if (e.state === "air" || e.state === "down" || e.state === "grabbed") continue;
    if (Math.abs(e.x - p.x) < COMBAT.grabRangeX && Math.abs(e.y - p.y) < COMBAT.grabRangeY) return e;
  }
  return null;
}

/* ---- special payment: a FULL meter, drained completely ---- */
function paySpecial(p: Player): boolean {
  if (p.meter >= METER.max) { p.meter = 0; return true; }
  floatText(p.x, p.y - 96, LORE.ui.noMeter, "#39d5ff", 14, 40);
  SFX.block();
  return false;
}

function castCard(p: Player): void {
  comicCard(LORE.chars[p.key].special, CHAR_COLORS[p.key], 1);
  SFX.special();
  G.shake = Math.max(G.shake, JUICE.shakeSpecial);
}

/* ---- special effects, fired at the act's active frame ---- */
function nearestTargetAhead(p: Player): Enemy | null {
  const targets = G.enemies
    .filter(e => e.hp > 0 && (e.x - p.x) * p.face > -20 && e.x > G.cam - 40 && e.x < G.cam + 1000)
    .sort((a, b) => Math.abs(a.x - p.x) - Math.abs(b.x - p.x));
  return targets[0] ?? null;
}

function fireSpecial(p: Player): void {
  if (p.key === "dan") {
    // lobbed on target, like Jake's — the arc solves itself for the landing spot
    const t0 = nearestTargetAhead(p);
    const tx = t0 ? t0.x : p.x + p.face * 260;
    const ty = t0 ? t0.y : p.y;
    const flight = 41;   // frames until h0=44, vh=5.2, g=0.3 hits the floor
    G.projectiles.push({
      type: "tin", x: p.x + p.face * 10, y: p.y, h: 44, vh: 5.2, g: 0.3,
      vx: clamp((tx - p.x) / flight, -8, 8), vy: clamp((ty - p.y) / flight, -2.5, 2.5),
      dmg: SPECIALS.dan.tinDmg,
      t: 0, from: "player", spin: 0, text: "", homing: 0
    });
  } else if (p.key === "jake") {
    // the stream arcs from the waist and pools around the target
    const t0 = nearestTargetAhead(p);
    const tx = t0 ? t0.x : p.x + p.face * 280;
    const ty = t0 ? t0.y : p.y;
    G.streams.push({ x0: p.x, y0: p.y, tx, ty, t: 0, dur: 26 });
    SFX.goo();
  } else {
    homeRunSwing(p);
  }
}

function homeRunSwing(p: Player): void {
  const sp = SPECIALS.blake;
  const chargeFrac = clamp((p.act?.charge ?? 0) / sp.chargeMax, 0, 1);
  const full = chargeFrac >= 1;
  const dmg = Math.round(sp.baseDmg * (1 + chargeFrac));
  SFX.bat();
  G.shake = Math.max(G.shake, JUICE.shakeSpecial);
  const targets = enemiesInBox(p, p.face, sp.range, 42);
  targets.forEach(e => {
    if (isBoss(e)) {
      hitEnemy(e, Math.round(dmg * (full ? sp.bossMul : 1.5)) , { dir: p.face, heavy: true, kb: 26, meter: 0 });
      return;
    }
    if (full) {
      // GONE. — instant KO, body leaves the stadium
      e.hp = 0;
      e.state = "air"; e.h = Math.max(e.h, 4); e.vh = 8; e.vx = p.face * 18;
      e.flyDmg = sp.transferDmg; e.flyHit = [];
      floatText(e.x, e.y - 90, LORE.chars.blake.specialPop[0], "#ffd23f", 18, 70);
      spark(e.x, e.y - 40, "#ffd23f", 14, 6);
      SFX.firework();
      G.projectiles.push({
        type: "firework", x: p.x + p.face * 420, y: p.y, h: 240, vh: 0, g: 0,
        vx: 0, vy: 0, dmg: 0, t: -22, from: "player", spin: 0, text: "", homing: 0
      });
    } else {
      hitEnemy(e, dmg, { dir: p.face, heavy: true, fling: sp.flingVx * (0.6 + 0.5 * chargeFrac), meter: METER.strong });
      e.flyDmg = sp.transferDmg;
    }
  });
}

function danIsImmuneToGas(): boolean { return G.player?.key === "dan"; }

/* ---- Dan's tin detonation: gas cloud + concussive stun so they
        stand there gagging INSIDE the cloud (called from projectiles.ts) ---- */
export function danBomb(x: number, y: number): void {
  const sp = SPECIALS.dan;
  G.clouds.push({ x, y, r: sp.cloudR, life: sp.cloudLife });
  SFX.gas();
  spark(x, y - 20, "#67e06b", 12, 4);
  G.shake = Math.max(G.shake, 4);
  for (const e of G.enemies) {
    if (e.hp <= 0 || e.state === "grabbed") continue;
    if (Math.abs(e.x - x) < sp.cloudR && Math.abs(e.y - y) < sp.cloudR * 0.7) {
      // heavy so blocks don't stop fumes; then hold them in the cloud
      hitEnemy(e, sp.tinDmg, { dir: e.x >= x ? 1 : -1, kb: 4, heavy: true, meter: 0 });
      if (e.hp > 0 && e.state !== "air" && e.state !== "down") {
        e.state = "hurt";
        e.t = isBoss(e) ? 22 : sp.stun;
        e.inGas = true;   // already coughing — skip the separate entry stagger
        e.gasTick = 0;
      }
    }
  }
}

/* ---- goo splat resolution (called from projectiles.ts) ---- */
export function gooSplat(x: number, y: number): void {
  const sp = SPECIALS.jake;
  G.goos.push({ x, y, r: sp.gooR, life: sp.gooLife });
  SFX.goo();
  const near = G.enemies
    .filter(e => e.hp > 0 && Math.abs(e.x - x) < sp.gooR && Math.abs(e.y - y) < sp.gooR * 0.7)
    .sort((a, b) => Math.abs(a.x - x) - Math.abs(b.x - x));
  let trapped = 0;
  for (const e of near) {
    if (isBoss(e)) {
      e.slowT = sp.gooLife; e.slowMul = sp.bossSlowMul;
      floatText(e.x, e.y - 100, LORE.chars.jake.specialPop[1], "#39d5ff", 14, 50);
    } else if (trapped < sp.maxTrapped) {
      e.trapT = sp.gooLife;
      if (e.state === "air") { e.state = "approach"; e.h = 0; e.vh = 0; e.vx = 0; }
      trapped++;
      floatText(e.x, e.y - 84, LORE.chars.jake.specialPop[0], "#39d5ff", 14, 45);
    }
  }
}

/* ================= per-frame update ================= */
export function updatePlayer(): void {
  const p = G.player;
  if (!p) return;
  const c = CHARS[p.key];
  const stage = STAGES[G.stageIdx];

  // timers
  if (p.hurtT > 0) p.hurtT--;
  if (p.chainWindow > 0) p.chainWindow--; else if (!p.act) p.chainStep = 0;
  if (p.bufT > 0) { p.bufT--; if (p.bufT === 0) p.bufAct = null; }
  if (p.dashAtkCd > 0) p.dashAtkCd--;
  if (p.slowT > 0) p.slowT--;
  if (p.armorT > 0) p.armorT--;
  if (p.comboT > 0) p.comboT--; else p.combo = 0;

  // buffered inputs (6 frames per brief)
  if (pressed("attack")) { p.bufAct = "attack"; p.bufT = COMBAT.inputBuffer; }
  else if (pressed("strong")) { p.bufAct = "strong"; p.bufT = COMBAT.inputBuffer; }
  else if (pressed("special")) { p.bufAct = "special"; p.bufT = COMBAT.inputBuffer; }

  // double-tap dash detection
  for (const dir of [-1, 1] as Facing[]) {
    const k = dir === -1 ? "left" : "right";
    if (pressed(k)) {
      if (p.lastTapDir === dir && G.tick - p.lastTapT < COMBAT.dashTapWindow && p.dashT <= 0 && !p.act && p.hurtT <= 0 && !p.charging && !p.grabbing) {
        p.dashT = COMBAT.dashDur; p.dashDir = dir; p.face = dir; SFX.dash();
      }
      p.lastTapDir = dir; p.lastTapT = G.tick;
    }
  }

  /* ---- blake charge handling ---- */
  if (p.charging) {
    p.chargeT = Math.min(SPECIALS.blake.chargeMax, p.chargeT + 1);
    p.armorT = 2;
    if (p.chargeT === SPECIALS.blake.chargeMax) spark(p.x, p.y - 60, "#ffd23f", 1, 2);
    if (released("special") || p.chargeT >= SPECIALS.blake.chargeMax + 0) {
      if (released("special")) {
        p.charging = false;
        startAct(p, "special", p.chargeT);
      }
    }
    // fully charged auto-release after a beat so it can't be held forever
    if (p.charging && p.chargeT >= SPECIALS.blake.chargeMax && !held("special")) {
      p.charging = false;
      startAct(p, "special", p.chargeT);
    }
  }

  /* ---- consume buffered actions ---- */
  const canAct = !p.act && p.hurtT <= 0 && !p.charging && p.hp > 0;
  if (canAct && p.bufAct) {
    const b = p.bufAct;
    if (b === "special") {
      if (paySpecial(p)) {
        castCard(p);
        if (p.key === "blake") { p.charging = true; p.chargeT = 0; p.bufAct = null; }
        else startAct(p, "special");
      } else p.bufAct = null;
    } else if (p.grabbing) {
      if (b === "attack" || b === "strong") startAct(p, "throwAct");
    } else if (p.dashT > 0) {
      if (p.dashAtkCd === 0 && (b === "attack" || b === "strong")) {
        startAct(p, "dashAtk"); p.dashAtkCd = COMBAT.dashAtkCd; p.dashT = 0;
      } else p.bufAct = null;
    } else if (b === "attack") {
      const grabbed = grabTarget(p);
      const backTargets = enemiesInBox(p, (p.face * -1) as Facing, c.range * 0.8);
      const frontTargets = enemiesInBox(p, p.face, c.range);
      if (grabbed && p.chainStep === 0) {
        // point-blank grab
        p.grabbing = grabbed; p.grabT = COMBAT.grabHold;
        grabbed.state = "grabbed"; grabbed.t = COMBAT.grabHold;
        p.bufAct = null; SFX.grab();
      } else if (backTargets.length > 0 && frontTargets.length === 0 && p.chainStep === 0) {
        startAct(p, "backAtk");
      } else if (p.chainWindow > 0 && p.chainStep === 1) {
        startAct(p, "light2"); p.chainStep = 2;
      } else if (p.chainWindow > 0 && p.chainStep === 2) {
        startAct(p, "light3"); p.chainStep = 0;
      } else {
        startAct(p, "light1"); p.chainStep = 1;
      }
    } else if (b === "strong") {
      if (p.chainWindow > 0 && p.chainStep === 2) {
        startAct(p, "launcher"); p.chainStep = 0;
      } else {
        startAct(p, "strong");
      }
    }
  }

  /* ---- advance current action ---- */
  if (p.act) {
    const a = p.act;
    a.t++;
    if (!a.hasHit && a.t >= a.hitAt) {
      a.hasHit = true;
      doHit(p, a);
    }
    if (a.t >= a.dur) p.act = null;
  }

  /* ---- grab hold ---- */
  if (p.grabbing) {
    const e = p.grabbing;
    p.grabT--;
    if (e.hp <= 0 || p.grabT <= 0 || e.state !== "grabbed") {
      releaseGrab(e);
    } else {
      e.x = p.x + p.face * 24; e.y = p.y; e.face = (p.face * -1) as Facing;
      e.t = 10;
    }
  }

  /* ---- movement ---- */
  const speedMul = (p.slowT > 0 ? 0.6 : 1);
  if (p.dashT > 0) {
    p.dashT--;
    p.x += p.dashDir * c.speed * COMBAT.dashSpeedMul * speedMul;
    p.walk += 0.5;
  } else if (!p.act && p.hurtT <= 0 && !p.charging && p.hp > 0) {
    let mx = 0, my = 0;
    if (held("left")) { mx = -1; p.face = -1; }
    if (held("right")) { mx = 1; p.face = 1; }
    if (held("up")) my = -1;
    if (held("down")) my = 1;
    const grabSlow = p.grabbing ? 0.35 : 1;
    p.x += mx * c.speed * speedMul * grabSlow;
    p.y += my * c.speed * 0.8 * speedMul * grabSlow;
    if (mx || my) p.walk += 0.25;
  }

  p.x = clamp(p.x, G.cam + 20, Math.min(G.cam + W - 30, stage.length - 40));
  p.y = clamp(p.y, FLOOR_TOP, FLOOR_BOT);
}

function doHit(p: Player, a: PlayerAct): void {
  const c = CHARS[p.key];
  const d = ACTS[a.kind];

  if (a.kind === "special") { fireSpecial(p); return; }

  if (a.kind === "throwAct") {
    const e = p.grabbing;
    if (!e) return;
    let dir: Facing = p.face;
    if (held("left")) dir = -1; else if (held("right")) dir = 1;
    p.face = dir;
    e.state = "hurt";
    releaseGrab(e);
    hitEnemy(e, COMBAT.throwDmg, { dir, fling: COMBAT.throwFlyVx, meter: METER.strong, heavy: true });
    SFX.throwSfx();
    return;
  }

  const backwards = a.kind === "backAtk";
  const dir: Facing = backwards ? ((p.face * -1) as Facing) : p.face;
  const range = a.kind === "dashAtk" ? c.range * 1.1 : backwards ? c.range * 0.8 : c.range;
  const targets = enemiesInBox(p, dir, range);
  if (targets.length === 0) return;

  const base = a.kind === "strong" ? c.strong : c.light;
  const dmg = Math.round(base * d.dmgMul);
  const heavy = a.kind === "strong";
  const knockdown = a.kind === "light3" || a.kind === "dashAtk" || a.kind === "strong";
  const launch = a.kind === "launcher" ? d.launch : undefined;
  const meter = heavy || a.kind === "launcher" ? METER.strong : METER.light;

  let connected = false;
  targets.forEach(e => {
    // juggle cap: lights stop lifting after juggleMax air hits
    if (e.state === "air" && e.juggleHits >= COMBAT.juggleMax && !heavy && a.kind !== "launcher") return;
    const ok = hitEnemy(e, dmg, { dir, kb: d.kb, heavy, knockdown, launch, meter });
    connected = connected || ok;
  });
  if (connected && (a.kind === "light1" || a.kind === "light2")) {
    p.chainWindow = COMBAT.chainWindow;
  }
}

export { danIsImmuneToGas };
