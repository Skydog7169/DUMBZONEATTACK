/* STAGE 3 — THE CASINO PENTHOUSE
   Elevator ride up (one cramped wave inside), then gold-and-velvet
   arena. The Matriarch holds the far end. */
import type { StageDef } from "../engine/entity";
import { LORE } from "../lore";

export const stage3: StageDef = {
  length: 3800,
  backdrop: 2,
  music: 3,
  elevatorEndX: 760,
  waves: [
    { at: 380,  spawn: [["lawyer", 2]], banner: LORE.waveBanners.elevator },
    { at: 1150, spawn: [["pitBoss", 1], ["cardSharp", 2]], banner: LORE.waveBanners.penthouse },
    { at: 1850, spawn: [["pitBoss", 2], ["lawsuit", 2]], banner: null },
    { at: 2500, spawn: [["cardSharp", 2], ["pitBoss", 1], ["lawyer", 2]], banner: null },
    { at: 3250, spawn: [["matriarch", 1]], banner: null }
  ]
};
