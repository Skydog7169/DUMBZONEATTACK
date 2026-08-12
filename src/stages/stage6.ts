/* STAGE 6 — THE CUMULUS BUILDING ("the final sign-off")
   Lobby -> cubicle farm -> the PD's studio floor, where the Cat Man
   waits. Ending on enemy turf. */
import type { StageDef } from "../engine/entity";
import { LORE } from "../lore";

export const stage6: StageDef = {
  length: 3600,
  backdrop: 6,
  music: 4,
  waves: [
    { at: 420,  spawn: [["lawyer", 2], ["lawsuit", 2]], banner: LORE.waveBanners.noFormat },
    { at: 1050, spawn: [["suit", 1], ["processServer", 1], ["cardSharp", 1]], banner: null },
    { at: 1750, spawn: [["lawyer", 2], ["suit", 1], ["lawsuit", 2]], banner: null },
    { at: 2450, spawn: [["processServer", 2], ["pitBoss", 1]], banner: LORE.waveBanners.terms },
    { at: 3100, spawn: [["catman", 1]], banner: null }
  ]
};
