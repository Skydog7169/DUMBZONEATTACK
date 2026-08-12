/* STAGE 4 — THE ESTATE ("playing with house money")
   You crawl out of the helicopter wreckage on the lawn, fight through
   the casino-themed mansion, and cut the funding: MIRI ODDS-ELSON. */
import type { StageDef } from "../engine/entity";
import { LORE } from "../lore";

export const stage4: StageDef = {
  length: 3800,
  backdrop: 2,
  music: 3,
  interiorX: 760,
  waves: [
    { at: 380,  spawn: [["lawyer", 2]], banner: LORE.waveBanners.estate },
    { at: 1150, spawn: [["pitBoss", 1], ["cardSharp", 2]], banner: LORE.waveBanners.highRoller },
    { at: 1850, spawn: [["pitBoss", 2], ["lawsuit", 2]], banner: null },
    { at: 2500, spawn: [["cardSharp", 2], ["pitBoss", 1], ["lawyer", 2]], banner: null },
    { at: 3250, spawn: [["matriarch", 1]], banner: null }
  ]
};
