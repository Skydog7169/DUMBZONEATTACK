/* STAGE 4 — ROOFTOP FINALE
   Fox 4 rooftop at dawn. Short approach, then the Cat Man by the mast. */
import type { StageDef } from "../engine/entity";
import { LORE } from "../lore";

export const stage4: StageDef = {
  length: 2600,
  backdrop: 3,
  music: 4,
  waves: [
    { at: 400,  spawn: [["lawyer", 2], ["lawsuit", 2]], banner: LORE.waveBanners.rooftop },
    { at: 1050, spawn: [["suit", 1], ["processServer", 1], ["cardSharp", 1]], banner: null },
    { at: 1800, spawn: [["catman", 1]], banner: null }
  ]
};
