/* Boot, fixed-timestep loop, scene machine, stage flow. */
import { G, type Scene } from "./engine/entity";
import { W, H, FLOOR_TOP, FLOOR_BOT, ENEMY_AI, CHARS } from "./balance";
import { cvs, ctx } from "./engine/canvas";
import { initInput, tickInput, pressed, onFirstInteraction } from "./input";
import { unlockAudio, SFX, musicSet, musicTick, musicToggleMute, musicForStage } from "./audio";
import { startBridge, stepBridge, drawBridge, stepOutro, drawOutro } from "./render/panels";
import { initLimeRide, updateLimeRide, drawLimeHazards, limeRideDone } from "./actors/limeRide";
import { pick } from "./engine/util";
import { LORE } from "./lore";
import { STAGES } from "./stages";
import { makePlayer, updatePlayer, CHAR_KEYS } from "./actors/player";
import { updateEnemies, freezeAllEnemies } from "./actors/enemies";
import { updateProjectiles } from "./engine/projectiles";
import { updateWorldObjects } from "./engine/world";
import { updateWaves, stageCleared, spawnEnemy } from "./engine/spawner";
import { updateCamera } from "./engine/camera";
import { updateFx, drawFx, clearFx, floatText, setBanner } from "./render/fx";
import { drawBackdrop } from "./render/backdrop";
import {
  drawPlayerSprite, drawEnemySprite, drawCorpse, drawPickupSprite,
  drawProjectileSprite, drawCloudSprite, drawGooSprite, drawStreamSprite
} from "./render/sprites";
import { drawHUD } from "./render/hud";
import {
  drawTitle, drawSelect, drawHowTo, drawIntro, drawStageCard, drawResults,
  drawEnd, drawPauseOverlay
} from "./render/screens";
import { rnd } from "./engine/util";

initInput();
onFirstInteraction(unlockAudio);

/* pretty skyline behind the title screen */
G.stageIdx = 1;

function setScene(s: Scene): void {
  G.scene = s; G.sceneT = 0; G.selCooldown = 20;
}

function startStage(idx: number): void {
  G.stageIdx = idx;
  const p = G.player;
  if (p) {
    const c = CHARS[p.key];
    p.hp = c.hp; p.maxHp = c.hp;
    p.x = 120; p.y = (FLOOR_TOP + FLOOR_BOT) / 2;
    p.meter = Math.min(p.meter, 50);
    p.act = null; p.hurtT = 0; p.charging = false; p.grabbing = null;
    p.combo = 0; p.slowT = 0; p.dashT = 0;
  }
  G.cam = 0; G.enemies = []; G.projectiles = []; G.pickups = []; G.clouds = [];
  G.goos = []; G.streams = []; G.corpses = []; G.hazards = [];
  G.waveIdx = 0; G.gateX = null; G.bossBar = null;
  G.hitstop = 0; G.shake = 0; G.slowmoT = 0; G.clearT = 0;
  G.onAirDone = false; G.onAirT = 0;
  G.onAirLabel = pick(LORE.onAirVariants);
  G.pendingBridge = null; G.bridgeSeq = null; G.outroT = 0;
  G.kissCamT = 600; G.kissCamShowT = 0;
  G.chantT = 500; G.chantActiveT = 0;
  G.stats = { damage: 0, maxCombo: 0, startScore: G.score, died: G.stats.died && false };
  clearFx();
  const def = STAGES[idx];
  if (def.autoscroll) {
    initLimeRide();
  } else {
    // a welcome-mat pizza so players learn the pickup
    G.pickups.push({ kind: "pizza", x: 400, y: (FLOOR_TOP + FLOOR_BOT) / 2, t: 0 });
    // the finale gets a break-room cache before the boss
    if (idx === STAGES.length - 1) {
      G.pickups.push({ kind: "pizza", x: 2250, y: 420, t: 0 });
      G.pickups.push({ kind: "peptide", x: 2320, y: 470, t: 0 });
    }
  }
  musicSet(musicForStage(idx));
  setScene("play");
}

/* ================= UPDATE ================= */
function update(): void {
  G.tick++;
  G.sceneT++;
  if (G.selCooldown > 0) G.selCooldown--;
  if (G.shake > 0) G.shake *= 0.85;
  musicTick();
  updateFx(G.hitstop > 0 || G.scene === "pause");

  /* pause toggle */
  if (pressed("pause")) {
    if (G.scene === "play") { G.pausedFrom = G.scene; setScene("pause"); return; }
    if (G.scene === "pause") { setScene(G.pausedFrom); return; }
  }
  if (G.scene === "pause") return;

  if (G.hitstop > 0) { G.hitstop--; return; }

  switch (G.scene) {
    case "title":
      if (pressed("attack") && G.selCooldown === 0) { setScene("select"); SFX.punch(); }
      return;
    case "select":
      if (G.selCooldown > 0) return;
      if (pressed("left")) { G.selIdx = (G.selIdx + 2) % 3; G.selCooldown = 8; SFX.punch(); }
      else if (pressed("right")) { G.selIdx = (G.selIdx + 1) % 3; G.selCooldown = 8; SFX.punch(); }
      else if (pressed("attack")) {
        G.player = makePlayer(CHAR_KEYS[G.selIdx]);
        G.score = 0;
        G.stats = { damage: 0, maxCombo: 0, startScore: 0, died: false };
        G.introPanel = 0;
        setScene("howto"); SFX.sting();
      }
      return;
    case "howto":
      if (pressed("attack") && G.selCooldown === 0) { setScene("intro"); SFX.punch(); }
      return;
    case "intro":
      if (pressed("attack") && G.selCooldown === 0) {
        G.selCooldown = 12;
        if (G.introPanel >= 3) { G.stageIdx = 0; setScene("stagecard"); SFX.boss(); }
        else { G.introPanel++; SFX.punch(); }
      }
      return;
    case "stagecard":
      if (G.sceneT > 110 || (pressed("attack") && G.selCooldown === 0)) startStage(G.stageIdx);
      return;
    case "results":
      if (pressed("attack") && G.selCooldown === 0) {
        if (G.stageIdx >= STAGES.length - 1) {
          // the run is over: your host's ending, then the shared sign-off
          startBridge(`ending_${G.player ? G.player.key : "blake"}`, "win");
          SFX.win();
        } else if (STAGES[G.stageIdx].heliOutro) {
          // the owner's helicopter is waiting at center court
          G.outroT = 0;
          setScene("outro");
          musicSet("none");
        } else { G.stageIdx++; setScene("stagecard"); }
      }
      return;
    case "bridge":
      if (stepBridge(pressed("attack"))) {
        const dest = G.bridgeReturn;
        setScene(dest);
        if (dest === "win") { SFX.win(); G.selCooldown = 90; }
      }
      return;
    case "outro":
      if (stepOutro()) {
        G.stageIdx++;
        startBridge("shootdown", "stagecard");
      }
      return;
    case "win":
      if (pressed("attack") && G.selCooldown === 0) {
        G.player = null; G.stageIdx = 1; setScene("title"); musicSet("none");
        G.selCooldown = 60;   // and take a breath before starting a new run
      }
      return;
    case "lose":
      if (pressed("attack") && G.selCooldown === 0) {
        G.stats.died = true;
        const died = G.stats.died;
        setScene("stagecard");
        G.stats = { damage: 0, maxCombo: 0, startScore: G.score, died };
      }
      return;
    case "play":
      break;
  }

  /* ---------- PLAY ---------- */
  // slow-mo on the final blow: world updates at half rate
  if (G.slowmoT > 0) {
    G.slowmoT--;
    if (G.tick % 2 === 0) return;
  }

  const stage = STAGES[G.stageIdx];
  const p = G.player;

  if (stage.autoscroll) {
    updateLimeRide();
  } else {
    updateWaves();
  }

  // ON AIR gag (stage 1): sign snaps on, everyone freezes and looks
  if (stage.onAirX !== undefined && !G.onAirDone && p && p.x > stage.onAirX - 60 && G.enemies.length > 0) {
    G.onAirDone = true; G.onAirT = ENEMY_AI.freezeFrames;
    freezeAllEnemies(ENEMY_AI.freezeFrames, stage.onAirX);
    SFX.freeze();
    floatText(p.x, p.y - 110, LORE.onAirPop, "#ffd23f", 15, 70);
  }
  if (G.onAirT > 0) G.onAirT--;

  // KISS CAM (the AAC): the jumbotron freezes everyone mid-brawl
  if (stage.kissCam) {
    if (G.kissCamShowT > 0) G.kissCamShowT--;
    if (G.enemies.length > 0 && G.kissCamShowT === 0) {
      G.kissCamT--;
      if (G.kissCamT <= 0) {
        G.kissCamT = 950;
        G.kissCamShowT = 80;
        freezeAllEnemies(60, G.cam + W / 2);
        SFX.freeze();
        if (p) floatText(p.x, p.y - 110, pick(LORE.signage.jumbotron), "#e84878", 15, 70);
      }
    }
    // the crowd turns on the front office
    const patty = G.enemies.find(e => e.kind === "sonInLaw" && e.hp > 0);
    if (G.chantActiveT > 0) {
      G.chantActiveT--;
      if (G.chantActiveT % 60 === 0) {
        for (const gm of G.enemies) {
          if (gm.kind === "evilGm" && gm.hp > 0 && gm.state !== "air" && gm.state !== "down") {
            gm.state = "hurt"; gm.t = 30;   // flinches, drops his guard
          }
        }
      }
    } else if (patty) {
      G.chantT--;
      if (G.chantT <= 0) { G.chantT = 700; G.chantActiveT = 180; }
    }
  }

  updatePlayer();
  updateEnemies();
  updateProjectiles();
  updateWorldObjects();
  if (!stage.autoscroll) updateCamera();

  // the secret Angelo send-off queues here, once the dust settles
  if (G.pendingBridge && G.hitstop === 0 && G.slowmoT === 0) {
    const seq = G.pendingBridge;
    G.pendingBridge = null;
    startBridge(seq, "play");
    return;
  }

  // stage clear -> sting -> results
  if (G.clearT > 0) {
    G.clearT--;
    if (G.clearT === 0) { setScene("results"); G.selCooldown = 45; }
  } else if (stage.autoscroll && limeRideDone() && p && p.hp > 0) {
    G.clearT = 90;
    SFX.sting();
    setBanner(LORE.results.header, null, 100);
  } else if (!stage.autoscroll && stageCleared() && p && p.hp > 0) {
    G.clearT = 110;
    SFX.sting();
    setBanner(LORE.results.header, null, 100);
  }

  // defeat
  if (p && p.hp <= 0) {
    G.stats.died = true;
    musicSet("none");
    setScene("lose");
    G.selCooldown = 50;
    SFX.hurt();
  }
}

/* ================= DRAW ================= */
function drawRainTelegraph(): void {
  const m = G.enemies.find(e => e.kind === "matriarch" && e.rainStage === 1);
  if (!m) return;
  const pulse = 0.14 + (Math.sin(G.tick * 0.35) + 1) * 0.08;
  ctx.fillStyle = `rgba(255,60,60,${pulse})`;
  // danger everywhere except the safe gaps
  const gaps = m.rainGaps.map(gx => gx - G.cam);
  let x0 = 0;
  const spans: [number, number][] = [];
  const sorted = [...gaps].sort((a, b) => a - b);
  for (const gx of sorted) {
    spans.push([x0, Math.max(0, gx - ENEMY_AI.matGapW / 2)]);
    x0 = gx + ENEMY_AI.matGapW / 2;
  }
  spans.push([x0, W]);
  for (const [a, b] of spans) if (b > a) ctx.fillRect(a, FLOOR_TOP - 40, b - a, FLOOR_BOT - FLOOR_TOP + 60);
  ctx.fillStyle = `rgba(103,224,107,${0.10 + pulse * 0.4})`;
  for (const gx of sorted) ctx.fillRect(gx - ENEMY_AI.matGapW / 2, FLOOR_TOP - 40, ENEMY_AI.matGapW, FLOOR_BOT - FLOOR_TOP + 60);
}

function drawPlayfield(): void {
  drawRainTelegraph();
  if (STAGES[G.stageIdx].autoscroll) drawLimeHazards();
  G.goos.forEach(drawGooSprite);

  interface DrawItem { y: number; fn: () => void; }
  const items: DrawItem[] = [];
  G.corpses.forEach(c => items.push({ y: c.y, fn: () => drawCorpse(c) }));
  G.pickups.forEach(pk => items.push({ y: pk.y, fn: () => drawPickupSprite(pk) }));
  G.enemies.forEach(e => items.push({ y: e.y, fn: () => drawEnemySprite(e) }));
  const p = G.player;
  if (p) items.push({ y: p.y, fn: () => drawPlayerSprite(p) });
  items.sort((a, b) => a.y - b.y).forEach(d => d.fn());

  G.projectiles.forEach(drawProjectileSprite);
  G.streams.forEach(drawStreamSprite);
  G.clouds.forEach(drawCloudSprite);

  // GO arrow
  if (G.enemies.length === 0 && G.scene === "play" && !STAGES[G.stageIdx].autoscroll && p && p.x < STAGES[G.stageIdx].length - 500 && G.tick % 60 < 40) {
    ctx.fillStyle = "#ffd23f"; ctx.font = "bold 30px monospace"; ctx.textAlign = "right";
    ctx.fillText(LORE.ui.go, W - 30, 120);
  }
}

function draw(): void {
  ctx.save();
  if (G.shake > 0.4) ctx.translate(rnd(-G.shake, G.shake), rnd(-G.shake, G.shake));
  drawBackdrop();

  switch (G.scene) {
    case "title": drawTitle(); break;
    case "select": drawSelect(); break;
    case "howto": drawHowTo(); break;
    case "intro": drawIntro(); break;
    case "stagecard": drawStageCard(); break;
    case "bridge": drawBridge(); break;
    case "outro": {
      drawPlayfield();
      drawFx();
      drawOutro();
      break;
    }
    default: {
      drawPlayfield();
      drawFx();
      drawHUD();
      if (G.scene === "results") drawResults();
      if (G.scene === "win") drawEnd(LORE.win.big, LORE.win.small, "#67e06b");
      if (G.scene === "lose") drawEnd(LORE.lose.big, LORE.lose.small, "#ff4f79");
      if (G.scene === "pause") drawPauseOverlay();
    }
  }
  if (G.scene === "title" || G.scene === "select") drawFx();
  ctx.restore();
}

/* ================= LOOP (fixed 60hz) ================= */
const STEP = 1000 / 60;
let acc = 0, last = performance.now();

function loop(now: number): void {
  acc += Math.min(200, now - last);
  last = now;
  let steps = 0;
  while (acc >= STEP && steps < 5) {
    update();
    tickInput();
    acc -= STEP; steps++;
  }
  draw();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

/* mute toggle */
addEventListener("keydown", e => { if (e.key.toLowerCase() === "m") musicToggleMute(); });

/* dev hooks for poking at the game from the console */
if (import.meta.env.DEV) {
  interface DevWindow { DZ?: unknown; }
  (window as unknown as DevWindow).DZ = {
    G, startStage, setScene, makePlayer, spawnEnemy,
    step: (n: number): void => { for (let i = 0; i < n; i++) { update(); tickInput(); } draw(); }
  };
}
