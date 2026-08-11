/* HUD: player plate (HP + special meter), score, boss bar. */
import { ctx } from "../engine/canvas";
import { G } from "../engine/entity";
import { W, H, METER } from "../balance";
import { LORE } from "../lore";
import { clamp } from "../engine/util";
import { px } from "./sprites";

export function drawHUD(): void {
  const p = G.player;
  if (!p) return;

  // player plate
  ctx.fillStyle = "rgba(0,0,0,0.5)"; ctx.fillRect(14, 12, 260, 62);
  ctx.fillStyle = "#ffd23f"; ctx.font = "bold 15px monospace"; ctx.textAlign = "left";
  ctx.fillText(LORE.chars[p.key].name, 24, 30);
  px(24, 36, 200, 12, "#40121a");
  px(24, 36, 200 * clamp(p.hp / p.maxHp, 0, 1), 12, p.hp / p.maxHp > 0.35 ? "#67e06b" : "#ff4f79");
  // special meter
  px(24, 52, 200, 7, "#0e2436");
  const mfrac = clamp(p.meter / METER.max, 0, 1);
  const full = p.meter >= METER.max;
  px(24, 52, 200 * mfrac, 7, full && G.tick % 20 < 10 ? "#b8f0ff" : "#39d5ff");
  ctx.fillStyle = full ? "#b8f0ff" : "#7a8a94"; ctx.font = "10px monospace";
  ctx.fillText(full ? LORE.ui.specialReady : LORE.ui.meter, 24, 70);

  // score + stage
  ctx.fillStyle = "#fff"; ctx.font = "bold 16px monospace"; ctx.textAlign = "right";
  ctx.fillText(`${LORE.ui.score} ${String(G.score).padStart(6, "0")}`, W - 20, 32);
  ctx.fillStyle = "#9a8ab0"; ctx.font = "11px monospace";
  ctx.fillText(`${LORE.stageCardPrefix} ${G.stageIdx + 1} — ${LORE.stages[G.stageIdx].title}`, W - 20, 50);

  // boss bar
  if (G.bossBar && G.bossBar.ref.hp > 0) {
    ctx.fillStyle = "rgba(0,0,0,0.5)"; ctx.fillRect(W / 2 - 220, H - 44, 440, 32);
    ctx.fillStyle = "#ff9dc0"; ctx.font = "bold 12px monospace"; ctx.textAlign = "center";
    ctx.fillText(G.bossBar.label, W / 2, H - 30);
    px(W / 2 - 200, H - 24, 400, 8, "#40121a");
    px(W / 2 - 200, H - 24, 400 * clamp(G.bossBar.ref.hp / G.bossBar.ref.maxHp, 0, 1), 8, "#ff4f79");
  }
}
