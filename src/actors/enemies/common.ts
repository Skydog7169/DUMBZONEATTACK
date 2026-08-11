import { G, type Enemy } from "../../engine/entity";
import { sign } from "../../engine/util";

/** speed after goo-slow (bosses) / debuffs */
export function effSpeed(e: Enemy): number {
  return e.speed * (e.slowT > 0 ? e.slowMul : 1);
}

export function faceThePlayer(e: Enemy): number {
  const p = G.player;
  if (!p) return 0;
  const dx = p.x - e.x;
  e.face = dx < 0 ? -1 : 1;
  return dx;
}

export function moveToward(e: Enemy, tx: number, ty: number, sp: number): void {
  const dx = tx - e.x, dy = ty - e.y;
  if (Math.abs(dx) > 2) e.x += sign(dx) * sp;
  if (Math.abs(dy) > 2) e.y += sign(dy) * sp * 0.7;
  e.walk += 0.2;
}
