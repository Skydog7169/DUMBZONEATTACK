/* STAGE 1 — AMBUSH AT FOX 4
   Interior: studio -> hallway -> lobby -> out the front doors.
   ON AIR gag fires at onAirX. Angelo waits near the exit. */
import type { StageDef } from "../engine/entity";
import { LORE } from "../lore";

export const stage1: StageDef = {
  length: 3400,
  backdrop: 0,
  music: 1,
  onAirX: 1500,
  waves: [
    { at: 480,  spawn: [["lawyer", 2]], banner: LORE.waveBanners.lawyers },
    { at: 1000, spawn: [["lawyer", 1], ["processServer", 2]], banner: LORE.waveBanners.served },
    { at: 1650, spawn: [["lawyer", 2], ["processServer", 1]], banner: null },
    { at: 2250, spawn: [["lawyer", 2], ["processServer", 2]], banner: LORE.waveBanners.legal },
    { at: 2950, spawn: [["angelo", 1]], banner: null }
  ]
};
