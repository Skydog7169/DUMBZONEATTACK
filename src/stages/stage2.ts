/* STAGE 2 — DOWNTOWN DALLAS
   The skyline showcase. Suits, lawsuits, the Group Chat hazard,
   Angelo working his corner mid-stage, and the Son-in-Law duel at the end. */
import type { StageDef } from "../engine/entity";
import { LORE } from "../lore";

export const stage2: StageDef = {
  length: 4200,
  backdrop: 1,
  music: 2,
  waves: [
    { at: 450,  spawn: [["lawyer", 2], ["lawsuit", 2]], banner: LORE.waveBanners.served },
    { at: 1050, spawn: [["suit", 2]], banner: LORE.waveBanners.suits },
    { at: 1700, spawn: [["groupChat", 1], ["lawyer", 2]], banner: LORE.waveBanners.groupchat },
    { at: 2350, spawn: [["angelo", 1]], banner: null },
    { at: 3000, spawn: [["suit", 1], ["lawyer", 2], ["groupChat", 1]], banner: null },
    { at: 3700, spawn: [["sonInLaw", 1]], banner: null }
  ]
};
