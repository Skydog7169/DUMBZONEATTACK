/* STAGE 3 — THE AAC ("hostile home court")
   Concourse -> players' tunnel -> center court. Kiss-cam freezes,
   the crowd chants against the front office, and PATTY D. defends
   home floor. Ends with the owner's helicopter pickup. */
import type { StageDef } from "../engine/entity";
import { LORE } from "../lore";

export const stage3: StageDef = {
  length: 3600,
  backdrop: 4,
  music: 3,
  kissCam: true,
  heliOutro: true,
  waves: [
    { at: 420,  spawn: [["suit", 2]], banner: LORE.waveBanners.security },
    { at: 1050, spawn: [["pitBoss", 1], ["lawyer", 2]], banner: null },
    { at: 1750, spawn: [["suit", 2], ["cardSharp", 1]], banner: null },
    { at: 2450, spawn: [["pitBoss", 2], ["lawsuit", 2]], banner: null },
    { at: 3150, spawn: [["sonInLaw", 1]], banner: null }
  ]
};
