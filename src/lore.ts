/* ============================================================
   DUMB ZONE: REVENGE OF THE CAT MAN — lore.ts
   ------------------------------------------------------------
   >>> THIS IS YOUR FILE. EDIT EVERYTHING HERE. <<<
   Every piece of show text in the game lives in this one file:
   names, catchphrases, boss lines, signage, rank labels, intro
   panels, LED messages, cutscene captions. Change a string,
   save, and the game hot-reloads. You never need to touch code.

   Anything marked  LORE SLOT  is a placeholder waiting for the
   real bit. Everything else is fair game too.

   THE CANON (one sentence): the Cat Man wants the Dumb Zone
   destroyed; he can't afford it; the Adelsons can, and want it
   too. The hosts were never fired — they quit, he sued, he
   lost, and getting the terminology wrong enrages him.
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
      hitLines: ["BARREL'D.", "GONE.", "OFF THE HANDS!"],
      hurtLines: ["ugh.", "c'mon man."],
      special: "THE HOME RUN!",
      specialPop: ["GONE.", "CRUSHED!"]
    },
    jake: {
      name: "JAKE", tag: "THE SHARPSHOOTER",
      // LORE SLOT: real Jake hit/hurt catchphrases
      hitLines: ["SOURCE: ME.", "FACT CHECKED.", "PER MY LAST POINT—"],
      hurtLines: ["oh no.", "rude.", "NOT VERY GOOD!"],
      special: "THE 4 POINTER!",
      specialPop: ["SPLAT!", "STUCK!"]
    },
    dan: {
      name: "DAN", tag: "THE MAD CHEMIST",
      // LORE SLOT: real Dan hit/hurt catchphrases
      hitLines: ["OH WOW.", "SMELLS GREAT.", "HA HA!"],
      hurtLines: ["ow ow ow", "MY BACK.", "SCARED STRAIGHT!"],
      special: "TIN FISH BOMB!",
      specialPop: ["FSSSH!", "smells great, actually"]
    }
  } satisfies Record<CharKey, CharLore>,

  /* ---------------- INTRO (4 comic panels) ---------------- */
  intro: [
    { caption: "THEY QUIT. HE SUED. HE LOST. HE NEVER LET IT GO.", balloon: "" },
    { caption: "BUT REVENGE IS EXPENSIVE. THE HOUSE HAD MONEY. AND A GRUDGE OF ITS OWN.", balloon: "they talk too much." },
    { caption: "DOWNTOWN DALLAS. FOX 4. THE SHOW IS LIVE.", balloon: "we're just two guys." },
    { caption: "THE DOORS BURST OPEN.", balloon: "consider this... a non-renewal." }
  ],
  introSkip: "ATTACK: NEXT",

  /* ---------------- STAGES (6) ---------------- */
  stages: [
    { title: "AMBUSH AT FOX 4", sub: "get out of the building" },
    { title: "DOWNTOWN DALLAS", sub: "the long walk" },
    { title: "THE AAC", sub: "hostile home court" },
    { title: "THE ESTATE", sub: "playing with house money" },
    { title: "THE LIME RIDE", sub: "last mile" },
    { title: "THE CUMULUS BUILDING", sub: "the final sign-off" }
  ],
  stageCardPrefix: "STAGE",

  /* ---------------- ENEMIES ---------------- */
  enemyNames: {
    lawyer: "LAWYER",
    lawsuit: "LAWSUIT",
    processServer: "PROCESS SERVER",
    suit: "CORPORATE SUIT",
    pitBoss: "PIT BOSS",
    cardSharp: "CARD SHARP",
    groupChat: "THE GROUP CHAT",
    evilGm: "EVIL GM",
    seniorPartner: "THE SENIOR PARTNER",
    angelo: "ANGELO",
    sonInLaw: "PATTY D.",
    matriarch: "MIRI ODDS-ELSON",
    catman: "THE CAT MAN"
  } satisfies Record<EnemyKind, string>,

  // LORE SLOT: Group Chat text-projectile messages
  groupChatLines: [
    "WHERE ARE YOU?", "???", "u up?", "hello??", "pick up the phone",
    "u seen this??", "big if true", "not a bit", "call me. important",
    "who's driving", "venmo me", "angelo asked for ur number", "did u eat",
    "hello???", "they QUIT actually"
  ],
  groupChatSmash: ["LEFT ON READ", "TYPING FOR 4 MIN. NOTHING."],

  /* ---------------- BOSSES ---------------- */
  seniorPartner: {
    // LORE SLOT: display name + lines for the Cat Man's house lawyer
    intro: "MINI-BOSS: THE SENIOR PARTNER",
    sub: "retained by the Cat Man. billing hourly.",
    enrage: "BILLABLE HOURS!",
    attackLines: ["OBJECTION!", "SEE YOU IN COURT!", "CEASE AND DESIST!"],
    defeatLine: "this... is going on your invoice"
  },

  angelo: {
    intro: "BOSS: ANGELO",
    sub: "he found Blake's church. he'll find him here.",
    grabLines: [
      "I lost my card AGAIN",
      "just a LITTLE more, man",
      "how much is LEFT?",
      "hey man... got a little more?",
      "you said you'd help me out"
    ],
    // used only when Blake is the active host
    blakeLines: [
      "I went to your CHURCH, Blake",
      "your congregation KNOWS you",
      "cutting me off? in THIS economy?"
    ],
    nonBlakeLine: "where's BLAKE?",
    enrage: "DESPERATE HOURS!",
    defeatLines: [
      "alright man... I'll ask somebody else",
      "fine... your PASTOR was nicer anyway",
      "tell Blake... I'll find him"          // breadcrumb: beat him AS Blake
    ],
    /* -------- THE RAIN CAME TO DALLAS (secret Blake-only defeat) -------- */
    secretDefeat: {
      panel1cap: "THE RAIN CAME TO DALLAS.",
      panel2bal: "is there... anything left... on the card...",
      panel3cap: "NOT ANYMORE.",
      panel4cap: "HE OWED HIM $40. HE OWED HIM NOTHING. HE OWED HIM EVERYTHING.",
      panel5bal: "...was that a NO?"
    }
  },

  sonInLaw: {
    // LORE SLOT: display name + defeat line for PATTY D.
    intro: "BOSS: PATTY D.",
    sub: "the family business is silence",
    tradePop: "TRADED!",
    phase2Pop: "YOU'RE THE PROBLEM, NICO!",
    attackLines: [
      "IT'S A PROCESS!", "TRUST THE VISION!", "IN FIVE YEARS YOU'LL GET IT!",
      "STOP TALKING ABOUT THE TRADE!",
      "IT'S MY RESPONSIBILITY TO ACT!",
      "DEFENSE WINS CHAMPIONSHIPS!"
    ],
    defeatLine: "this deal... will look great... eventually"
  },

  matriarch: {
    // LORE SLOT: display name + defeat line for the casino matriarch
    intro: "MAJOR BOSS: MIRI ODDS-ELSON",
    sub: "she heard what you said about her",
    rainPop: "HOUSE ALWAYS WINS!",
    attackLines: [
      "THE HOUSE THANKS YOU.", "CASH OUT, BOYS.", "TABLE'S CLOSED.",
      "THE SEGMENTS STOP TODAY.",
      "I OWN WORSE PEOPLE THAN YOU.",
      "MY LAWYERS ARE ALREADY HERE."
    ],
    defeatLine: "consider... the comps... revoked",
    defeatPop: "HE'S NOT PAID THROUGH FRIDAY.",   // her death defunds the Cat Man
    estateBanner: "PAID FOR BY FRIENDS OF MIRI"
  },

  catman: {
    intro: "FINAL BOSS: THE CAT MAN",
    sub: "he called it a clone. under oath.",
    attackLines: [
      "IT'S A CLONE!",
      "CEASE! AND! DESIST!",
      "NON-COMPETE THIS!",
      "I'LL TESTIFY AGAIN!",
      "YOU HIJACKED MY SOCIALS!",
      "A HUNDRED EMAILS!",
      "NOBODY FIRED YOU!",
      "WE SIMPLY DID NOT RENEW!",
      "YOU'RE FI— NOT RENEWED!",
      "5,000 SUBSCRIBERS? CUTE.",
      "CLEAN OUT YOUR DESK!",
      "THAT'S A WRITE-UP!"
    ],
    phase2Pop: "COLLUSION!",
    phase3Pop: "PERFORMANCE REVIEW!",
    chairPop: "OFFICE CHAIR!",
    injunctionPop: "INJUNCTION!",
    servedPop: "YOU'VE BEEN SERVED",
    defeatLine: "there's... a nuance in there..."
  },

  /* ---------------- BOSS ESCAPE MOVES ----------------
     LORE SLOT: the popup when each boss triggers their defensive move.
     Combo a boss too hard and they answer in character. */
  bossEscapes: {
    seniorPartner: "SIDEBAR!",         // briefcase guard, slides out, answers with a fan
    angelo: "NOT THE SHIRT!",          // sassy hop-back, then a lunging grab
    sonInLaw: "SLIPPED THE PICK!",     // ducks straight through you (phase 2 only)
    matriarch: "HOUSE RULES!",         // vanishes in a burst of chips, glides across the floor
    catman: "FILED AND SEALED!"        // paper shield, then scoots away on the chair
  },

  /* ---------------- CAMEO ---------------- */
  aubrey: {
    name: "AUBREY",
    line: "I don't miss."
  },
  bridge: {
    shootdown1: "NEXT STOP: CUMULUS.",
    shootdown2: "THE HOUSE OBJECTS."
  },

  /* ---------------- ENDINGS (per host) ---------------- */
  endings: {
    dan: {
      caption: "DAN SAVED THE SHOW. HIS REWARD: ABSOLUTELY NO ONE.",
      balloon: "...perfect."
    },
    blake: {
      caption: "BLAKE SAVED THE SHOW. THE LISTENER'S KID TURNED SIX.",
      balloon: "whose party is this?"
    },
    jake: {
      caption: "JAKE SAVED THE SHOW. THEN HE BEAT THE GOD SQUAD.",
      balloon: "SCOREBOARD."
    }
  } satisfies Record<CharKey, { caption: string; balloon: string }>,

  /* ---------------- SIGNAGE / SFX TEXT ---------------- */
  signage: {
    lawsuitPaper: "SUED",
    exit: "EXIT",
    building: "FOX 4",
    doorBurst: "WHAM!",
    mural: "DEEP ELLUM",
    mural2: "GOOD RECORDS",     // LORE SLOT: second mural — any Dallas deep cut
    cumulus: "CUMULUS",
    pothole: "CITY OF DALLAS",
    kissCam: "KISS CAM",
    // LORE SLOT: jumbotron strings during the AAC kiss-cam freeze
    jumbotron: ["MAKE SOME NOISE!", "1.8% CHANCE", "TRUST THE VISION"],
    chant: "FIRE NICO!",
    // LORE SLOT: Lime ride road signs
    roadSigns: ["SLOW: LAWYERS CROSSING", "CUMULUS: 2 MI", "YIELD TO PROCESS SERVERS"]
  },

  /* ---------------- STAGE EVENTS / BANNERS ---------------- */
  onAirVariants: ["ON AIR", "STILL ON AIR", "ON AIR (SOMEHOW)"],
  onAirPop: "quiet in the studio!",
  waveBanners: {
    lawyers: "HERE COME THE LAWYERS",
    served: "YOU'VE BEEN SERVED",
    legal: "LEGAL DEPARTMENT, ASSEMBLE",
    suits: "MIDDLE MANAGEMENT ARRIVES",
    security: "ARENA SECURITY IS TYPING...",
    estate: "FOLLOW THE MONEY.",
    highRoller: "WELCOME TO THE HIGH ROLLER FLOOR",
    rooftop: "THE FINAL SIGN-OFF",
    groupchat: "THE GROUP CHAT IS TYPING...",
    terms: "TERMS COULD NOT BE REACHED.",
    noFormat: "NO FORMAT AT ALL."
  },

  /* ---------------- PICKUPS ---------------- */
  pickups: {
    pizza: { name: "CANE ROSSO", flavor: "wood-fired healing" }, // LORE SLOT: pizza flavor line
    peptide: { name: "PEPTIDES", flavor: "GAMEDAY MEN'S HEALTH" }
  },

  /* ---------------- OMNI HOTEL LED ---------------- */
  // LORE SLOT: messages scrolling on the Omni facade in Stage 2
  omniMessages: [
    "THE DUMB ZONE", "10AM WEEKDAYS", "GO HOME CAT MAN",
    "NOW HIRING: PRODUCTION DIRECTOR", "TRAFFIC ON 75: BAD",
    "PEPTIDES — ASK YOUR GUY", "IN FIVE YEARS YOU'LL GET IT",
    "ANGELO IF YOU SEE THIS, CALL BLAKE", "MIRI '28: WHY NOT BOTH PARTIES"
  ],

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

  /* ---------------- RESULTS / RANKS ---------------- */
  // LORE SLOT: rank joke labels, S is best
  ranks: {
    S: "P1", A: "DAY ONE", B: "SUBSCRIBER", C: "FREE FEED",
    D: "SCANS BY WHILE DRIVING", F: "CAT MAN'S GUY"
  },
  results: {
    header: "STAGE CLEAR",
    score: "SCORE",
    maxCombo: "MAX COMBO",
    damage: "DAMAGE TAKEN",
    rank: "RANK",
    next: "PRESS ATTACK TO CONTINUE"
  },

  /* ---------------- END SCREENS ---------------- */
  win: { big: "THE CAT MAN IS DEFEATED", small: "the dumb zone is safe. see you tomorrow at 10." },
  lose: { big: "NOT RENEWED... AGAIN", small: "press attack to renegotiate." },
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
