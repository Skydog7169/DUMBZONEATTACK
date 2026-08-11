/* ============================================================
   DUMB ZONE: REVENGE OF THE CAT MAN — lore.ts
   ------------------------------------------------------------
   >>> THIS IS YOUR FILE. EDIT EVERYTHING HERE. <<<
   Every piece of show text in the game lives in this one file:
   names, catchphrases, boss lines, signage, rank labels, intro
   panels, LED messages. Change a string, save, and the game
   hot-reloads. You never need to touch game code.

   Anything marked  LORE SLOT  is a placeholder waiting for the
   real bit. Everything else is fair game too.
   ============================================================ */

import type { CharKey, EnemyKind } from "./balance";

export interface CharLore {
  name: string;
  tag: string;
  hitLines: string[];   // random chance to pop when landing hits
  hurtLines: string[];  // random chance to pop when taking hits
  special: string;      // comic title card text when special fires
  specialPop: string[]; // small popups tied to the special's effects
}

export const LORE = {
  title: "DUMB ZONE",
  subtitle: "REVENGE OF THE CAT MAN",
  tagline: "a beat 'em up of questionable necessity",
  pressStart: "PRESS ATTACK TO START",

  /* ---------------- THE HOSTS ---------------- */
  chars: {
    blake: {
      name: "BLAKE", tag: "THE SLUGGER",
      // LORE SLOT: real Blake hit/hurt catchphrases
      hitLines: ["BOOM.", "GET SOME!", "HEAVY HANDS!"],
      hurtLines: ["ugh.", "c'mon man."],
      special: "THE HOME RUN!",
      specialPop: ["GONE.", "CRUSHED!"]
    },
    jake: {
      name: "JAKE", tag: "THE SHARPSHOOTER",
      // LORE SLOT: real Jake hit/hurt catchphrases
      hitLines: ["ACTUALLY...", "WELL, IN FACT—", "TAKE THAT!"],
      hurtLines: ["oh no.", "rude."],
      special: "THE 4 POINTER!",
      specialPop: ["SPLAT!", "STUCK!"]
    },
    dan: {
      name: "DAN", tag: "THE MAD CHEMIST",
      // LORE SLOT: real Dan hit/hurt catchphrases
      hitLines: ["HA HA!", "WOW!", "UNBELIEVABLE!"],
      hurtLines: ["ow ow ow", "my back!"],
      special: "TIN FISH BOMB!",
      specialPop: ["FSSSH!", "smells great, actually"]
    }
  } satisfies Record<CharKey, CharLore>,

  /* ---------------- INTRO (4 comic panels) ----------------
     LORE SLOT: intro card text. One entry per panel:
     caption on top, optional dialogue balloon below. */
  intro: [
    { caption: "DOWNTOWN DALLAS. THE FOX 4 BUILDING. THE SHOW IS LIVE.", balloon: "" },
    { caption: "THE STUDIO DOORS BURST OPEN.", balloon: "did you hear that?" },
    { caption: "THE MAN WHO FIRED THEM HAS COME BACK TO FINISH THE JOB.", balloon: "I FIRED YOU ONCE. THIS TIME IT'S FOREVER." },
    { caption: "AND HE DIDN'T COME ALONE. EVERY VILLAIN IN DFW RIDES WITH HIM.", balloon: "take back the airwaves." }
  ],
  introSkip: "ATTACK: NEXT",

  /* ---------------- STAGES ---------------- */
  stages: [
    // LORE SLOT: stage subtitles
    { title: "AMBUSH AT FOX 4", sub: "get out of the building" },
    { title: "DOWNTOWN DALLAS", sub: "the long walk through downtown" },
    { title: "THE CASINO PENTHOUSE", sub: "playing with house money" },
    { title: "ROOFTOP FINALE", sub: "dawn of the dumb zone" }
  ],
  stageCardPrefix: "STAGE",

  /* ---------------- ENEMIES ----------------
     LORE SLOT: rename any archetype grunt here. */
  enemyNames: {
    lawyer: "LAWYER",
    lawsuit: "LAWSUIT",
    processServer: "PROCESS SERVER",
    suit: "CORPORATE SUIT",
    pitBoss: "PIT BOSS",
    cardSharp: "CARD SHARP",
    groupChat: "THE GROUP CHAT",
    angelo: "ANGELO",
    sonInLaw: "THE SON-IN-LAW",
    matriarch: "THE MATRIARCH",
    catman: "THE CAT MAN"
  } satisfies Record<EnemyKind, string>,

  // LORE SLOT: Group Chat text-projectile messages
  groupChatLines: ["WHERE ARE YOU?", "???", "u up?", "hello??", "pick up the phone"],
  groupChatSmash: "LEFT ON READ",

  /* ---------------- BOSSES ---------------- */
  angelo: {
    intro: "MINI-BOSS: ANGELO",
    sub: "a friend in need... constantly",
    grabLines: [
      "hey man... got a little more?",
      "just one more thing, man",
      "you said you'd help me out",
      "I lost my card",
      "how much money is left?"
    ],
    enrage: "ANGELO NEEDS MORE",
    defeatLine: "alright man... I'll ask somebody else"
  },

  sonInLaw: {
    // LORE SLOT: display name + defeat line for THE SON-IN-LAW
    // (parody archetype: the corporate heir who took over the local
    //  franchise and traded away the superstar)
    intro: "MINI-BOSS: THE SON-IN-LAW",
    sub: "he had to make the trade",
    tradePop: "TRADED!",
    attackLines: ["IT'S A PROCESS!", "TRUST THE VISION!", "IN FIVE YEARS YOU'LL GET IT!"],
    defeatLine: "this deal... will look great... eventually"
  },

  matriarch: {
    // LORE SLOT: display name + defeat line for THE MATRIARCH
    // (parody archetype: the casino magnate bankrolling all of this)
    intro: "MAJOR BOSS: THE MATRIARCH",
    sub: "the bank behind the villains",
    rainPop: "HOUSE ALWAYS WINS!",
    attackLines: ["THE HOUSE THANKS YOU.", "CASH OUT, BOYS.", "TABLE'S CLOSED."],
    defeatLine: "consider... the comps... revoked"
  },

  catman: {
    intro: "FINAL BOSS: THE CAT MAN",
    sub: "former production director",
    attackLines: ["YOU'RE FIRED!", "CLEAN OUT YOUR DESK!", "THAT'S A WRITE-UP!"],
    phase2Pop: "COLLUSION!",
    phase3Pop: "PERFORMANCE REVIEW!",
    chairPop: "OFFICE CHAIR!",
    defeatLine: "this... isn't in the budget..."
  },

  /* ---------------- SIGNAGE / SFX TEXT ---------------- */
  signage: {
    lawsuitPaper: "SUED",      // printed on the flying lawsuit
    exit: "EXIT",              // stage 1 lobby doors
    building: "FOX 4",         // intro panel building
    doorBurst: "WHAM!",        // intro panel 2 sound effect
    mural: "DEEP ELLUM",       // painted on the stage 2 mural wall
    mural2: "GOOD RECORDS"     // LORE SLOT: second mural — any Dallas deep cut
  },

  /* ---------------- STAGE EVENTS / BANNERS ---------------- */
  onAir: "ON AIR",
  onAirPop: "quiet in the studio!",
  waveBanners: {
    lawyers: "HERE COME THE LAWYERS",
    served: "YOU'VE BEEN SERVED",
    legal: "LEGAL DEPARTMENT, ASSEMBLE",
    suits: "MIDDLE MANAGEMENT ARRIVES",
    elevator: "GOING UP.",
    penthouse: "WELCOME TO THE HIGH ROLLER FLOOR",
    rooftop: "THE FINAL SIGN-OFF",
    groupchat: "THE GROUP CHAT IS TYPING..."
  },

  /* ---------------- PICKUPS ---------------- */
  pickups: {
    // pizza refills HP
    pizza: { name: "CANE ROSSO", flavor: "wood-fired healing" }, // LORE SLOT: pizza flavor line
    // peptides refill the special meter
    peptide: { name: "PEPTIDES", flavor: "GAMEDAY MEN'S HEALTH" }
  },

  /* ---------------- OMNI HOTEL LED ----------------
     LORE SLOT: messages scrolling on the Omni facade in Stage 2. */
  omniMessages: ["THE DUMB ZONE", "10AM WEEKDAYS", "GO HOME CAT MAN"],

  /* ---------------- RESULTS / RANKS ----------------
     LORE SLOT: rank joke labels, S is best. */
  ranks: {
    S: "P1", A: "CO-HOST", B: "PRODUCER", C: "INTERN", D: "CALLER", F: "SALES GUY"
  },
  results: {
    header: "STAGE CLEAR",
    score: "SCORE",
    maxCombo: "MAX COMBO",
    damage: "DAMAGE TAKEN",
    rank: "RANK",
    next: "PRESS ATTACK TO CONTINUE"
  },

  /* ---------------- HOW TO PLAY ---------------- */
  howto: {
    title: "HOW TO PLAY",
    move: "MOVE",
    moveDetail: "8 directions — the street has depth",
    attack: "ATTACK",
    attackDetail: "chain it: A·A·A — the third hit floors them",
    strong: "STRONG",
    strongDetail: "the big kick — armored, breaks blocks. after A·A it LAUNCHES",
    special: "SPECIAL",
    specialDetail: "needs a FULL meter — peptides top it up fast",
    dash: "DASH",
    dashDetail: "double-tap. attack mid-dash to slide tackle",
    grab: "GRAB",
    grabDetail: "attack at point-blank. attack again to throw",
    continue: "PRESS ATTACK TO START THE SHOW"
  },

  /* ---------------- END SCREENS ---------------- */
  win: { big: "THE CAT MAN IS DEFEATED", small: "the dumb zone is safe. see you tomorrow at 10." },
  lose: { big: "FIRED... AGAIN", small: "press attack to renegotiate" },
  finalScore: "FINAL SCORE",
  playAgain: "PRESS ATTACK TO PLAY AGAIN",

  /* ---------------- UI / HUD ---------------- */
  ui: {
    chooseHost: "CHOOSE YOUR HOST",
    choose: "◀ ▶ TO CHOOSE — ATTACK TO CONFIRM",
    hp: "HP", pwr: "PWR",
    score: "SCORE",
    specialReady: "SPECIAL READY",
    meter: "METER",
    go: "GO ▶▶",
    paused: "PAUSED",
    pauseHint: "ESC / P TO RESUME",
    controlsKeyboard: "MOVE: WASD/ARROWS   ATTACK: J   STRONG: K   SPECIAL: L   DASH: DOUBLE-TAP",
    controlsTouch: "MOVE: D-PAD   ATTACK: A   STRONG: B   SPECIAL: S   DASH: DOUBLE-TAP",
    blocked: "BLOCKED!",
    hits: "HITS!",
    noMeter: "need more peptides!",
    specialTag: "SPECIAL"
  }
};
