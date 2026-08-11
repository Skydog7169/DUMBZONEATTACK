/* Boot, fixed-timestep loop, scene machine, stage flow. */
import { G, type Scene } from "./engine/entity";
import { W, H, FLOOR_TOP, FLOOR_BOT, ENEMY_AI, CHARS } from "./balance";
import { cvs, ctx } from "./engine/canvas";
import { initInput, tickInput, pressed, onFirstInteraction } from "./input";
import { unlockAudio, SFX, musicSet, musicTick, musicToggleMute } from "./audio";
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
  G.goos = []; G.streams = []; G.corpses = [];
  G.waveIdx = 0; G.gateX = null; G.bossBar = null;
  G.hitstop = 0; G.shake = 0; G.slowmoT = 0; G.clearT = 0;
  G.onAirDone = false; G.onAirT = 0;
  G.stats = { damage: 0, maxCombo: 0, startScore: G.score, died: G.stats.died && false };
  clearFx();
  // a welcome-mat pizza so players learn the pickup
  G.pickups.push({ kind: "pizza", x: 400, y: (FLOOR_TOP + FLOOR_BOT) / 2, t: 0 });
  musicSet(`stage${idx + 1}` as "stage1");
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
        if (G.stageIdx >= STAGES.length - 1) { setScene("win"); SFX.win(); }
        else { G.stageIdx++; setScene("stagecard"); }
      }
      return;
    case "win":
      if (pressed("attack") && G.selCooldown === 0) {
        G.player = null; G.stageIdx = 1; setScene("title"); musicSet("none");
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

  updateWaves();

  // ON AIR gag (stage 1): sign snaps on, everyone freezes and looks
  const stage = STAGES[G.stageIdx];
  const p = G.player;
  if (stage.onAirX !== undefined && !G.onAirDone && p && p.x > stage.onAirX - 60 && G.enemies.length > 0) {
    G.onAirDone = true; G.onAirT = ENEMY_AI.freezeFrames;
    freezeAllEnemies(ENEMY_AI.freezeFrames, stage.onAirX);
    SFX.freeze();
    floatText(p.x, p.y - 110, LORE.onAirPop, "#ffd23f", 15, 70);
  }
  if (G.onAirT > 0) G.onAirT--;

  updatePlayer();
  updateEnemies();
  updateProjectiles();
  updateWorldObjects();
  updateCamera();

  // stage clear -> sting -> results
  if (G.clearT > 0) {
    G.clearT--;
    if (G.clearT === 0) setScene("results");
  } else if (stageCleared() && p && p.hp > 0) {
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
  if (G.enemies.length === 0 && G.scene === "play" && p && p.x < STAGES[G.stageIdx].length - 500 && G.tick % 60 < 40) {
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
