/* STAGE 5 — THE LIME RIDE ("last mile")
   Auto-scrolling scooter run to the Cumulus building. No waves — the
   road itself is the enemy (hazards scripted in actors/limeRide.ts). */
import type { StageDef } from "../engine/entity";

export const stage5: StageDef = {
  length: 5200,
  backdrop: 5,
  music: 2,
  autoscroll: true,
  waves: []
};
