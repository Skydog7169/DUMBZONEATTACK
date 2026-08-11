import { G } from "./entity";
import { W } from "../balance";
import { clamp } from "./util";
import { STAGES } from "../stages";

export function updateCamera(): void {
  const p = G.player;
  if (!p) return;
  const stage = STAGES[G.stageIdx];
  const fighting = G.enemies.length > 0;
  const camMax = G.gateX !== null && fighting ? G.gateX - W + 120 : stage.length - W;
  const target = clamp(p.x - W * 0.4, 0, Math.max(0, camMax));
  if (target > G.cam) G.cam += Math.min(3.5, target - G.cam);
}
