# DUMB ZONE: REVENGE OF THE CAT MAN — Narrative Briefing

*A handoff doc for brainstorming story, jokes, and new bits. Everything described
here is built and playable at **dumbzoneattack.vercel.app**.*

---

## What this is

A 4-stage side-scrolling beat 'em up (Turtles-in-Time style) about the Dumb Zone
crew fighting their way across Dallas after their old production director — THE
CAT MAN, the man who fired them — comes back to finish the job. He has colluded
with every villain in DFW. The hosts fight out of the Fox 4 studio, across
downtown, up a casino penthouse, and back to the rooftop where he waits.

Tone: affectionate arcade parody. Comic-book title cards, floating speech
bubbles mid-fight, joke rank labels, CRT scanlines. It's a bit first, a game
second.

## Ground rules for writing

1. **Every piece of show text lives in one file (`src/lore.ts`).** Names,
   catchphrases, boss lines, banners, signage, rank labels. Changing a joke is a
   one-line edit — no code. So brainstorm freely: any *text* idea ships
   instantly.
2. **No real people's full names.** Villains inspired by real people ship as
   parody handles (see cast). Nicknames and puns are fine — that's the house
   style. The hosts go by first names only.
3. **Short text wins.** Mid-fight speech floats for ~2 seconds. Banners are one
   line. Comic cards auto-shrink long text. Best joke length: 2–6 words for
   floaters, up to ~8 for banners.
4. Anything marked **LORE SLOT** below is placeholder text waiting for the real
   bit.

---

## The story as currently told

**4-panel comic intro** (captions + one balloon each):
1. "DOWNTOWN DALLAS. THE FOX 4 BUILDING. THE SHOW IS LIVE."
2. "THE STUDIO DOORS BURST OPEN." — *"did you hear that?"*
3. "THE MAN WHO FIRED THEM HAS COME BACK TO FINISH THE JOB." — *"I FIRED YOU
   ONCE. THIS TIME IT'S FOREVER."*
4. "AND HE DIDN'T COME ALONE. EVERY VILLAIN IN DFW RIDES WITH HIM." — *"take
   back the airwaves."*

**Ending:** slow-mo final hit, confetti of shredded contracts, dawn breaks.
"THE CAT MAN IS DEFEATED / the dumb zone is safe. see you tomorrow at 10."
Game-over screen: "FIRED... AGAIN / press attack to renegotiate."

All of this is LORE SLOT — the intro especially could use real show voice.

---

## The cast

### The hosts (playable — identical stats, the special IS the character)
| Host | Tag | Special | The bit |
|---|---|---|---|
| **BLAKE** | THE SLUGGER | **THE HOME RUN!** | Blond, mustache. Charges a bat swing (armored); full charge launches grunts off-screen — "GONE." popup + distant firework. |
| **JAKE** | THE SHARPSHOOTER | **THE 4 POINTER!** | Dark hair, stubble. A white stream fires from his waist, arcs across the screen, and pools around the target — traps 3 grunts in goo, slows bosses. Yes, it's that joke. |
| **DAN** | THE MAD CHEMIST | **TIN FISH BOMB!** | Bald, pale, gray beard. Lobs a tin of fish that detonates into a noxious green cloud — stuns everyone in the blast so they stand there gagging in it. Dan is immune; he thinks it smells great. |

Current hit lines (all LORE SLOT placeholders needing real catchphrases):
Blake "BOOM. / GET SOME! / HEAVY HANDS!", Jake "ACTUALLY... / WELL, IN FACT— /
TAKE THAT!", Dan "HA HA! / WOW! / UNBELIEVABLE!". Hurt lines similar quality.

### The bosses (in play order)
| Boss | Stage | Identity | Signature mechanic | Current lines |
|---|---|---|---|---|
| **THE SENIOR PARTNER** | 1 — Fox 4 | The station's house lawyer guarding the exit. Silver hair, pinstripes, gold tie. | 2-hit briefcase combo; 3-subpoena fan; at 50% HP "BILLABLE HOURS!" — speeds up, summons lawsuits | "OBJECTION! / SEE YOU IN COURT! / CEASE AND DESIST!" · dies: "this... is going on your invoice" *(all LORE SLOT)* |
| **ANGELO** | 2 — downtown street | The friend in need... constantly. He's out here. His grab drains your HP *and heals him*. Panics at 50%: faster, needier. | The mooch grab | "hey man... got a little more? / just one more thing, man / you said you'd help me out / I lost my card / how much money is left?" · dies: "alright man... I'll ask somebody else" |
| **PATTY D.** | 2 — end | The corporate heir who took over the franchise and traded away the superstar. Franchise-blue suit, fast duelist. | **THE TRADE** — when his shimmer is up, any hit you land gets eaten by a summoned **EVIL GM** patsy (shaved head, blue quarter-zip, credential lanyard) while Patty warps behind you. "TRADED!" card. | "IT'S A PROCESS! / TRUST THE VISION! / IN FIVE YEARS YOU'LL GET IT!" · dies: "this deal... will look great... eventually" |
| **MIRI ODDS-ELSON** | 3 — casino penthouse | The casino magnate bankrolling the whole operation. Long blond hair, bangs, big red-tinted glasses. | Lobbed exploding poker chips; Pit Boss summons ("the house comps you" — pizza drops with each wave); **HOUSE ALWAYS WINS!** screen-wide chip rain with telegraphed safe gaps | "THE HOUSE THANKS YOU. / CASH OUT, BOYS. / TABLE'S CLOSED." · dies: "consider... the comps... revoked" |
| **THE CAT MAN** | 4 — rooftop dawn | Former production director. Alt-metal guy gone corporate: cropped hair, goatee, rolled sleeves, faded tattoo band, loosened tie, orange cat on his shoulder at all times. | 3 phases: arcing cat throws → "COLLUSION!" (summons one goon from each earlier stage + pink-slip fans) → "PERFORMANCE REVIEW!" (homing cats, office-chair ram) | "YOU'RE FIRED! / CLEAN OUT YOUR DESK! / THAT'S A WRITE-UP!" · dies: "this... isn't in the budget..." |

### The grunts & hazards
- **LAWYER** — briefcase melee. **LAWSUIT** — flying "SUED" paper; telegraphs,
  then kamikaze-dives in a straight line. **PROCESS SERVER** — keeps distance,
  throws subpoenas flat down his lane. **CORPORATE SUIT** — briefcase-up
  front-blocker; broken by kicks, flanks, grabs. **PIT BOSS** — casino suit
  variant, gold tie, sunglasses. **CARD SHARP** — visor, 3-card fan thrower.
- **EVIL GM** — the patsy Patty D. trades in to eat your combos.
- **THE GROUP CHAT** — a hazard, not a person: a hovering buzzing phone that
  orbits you firing guilt-texts that *slow* you ("WHERE ARE YOU? / ??? / u up? /
  hello?? / pick up the phone" — LORE SLOT). Periodically stops to type ("...")
  — that's when you smash it. Death popup: "LEFT ON READ".

### Pickups
- **CANE ROSSO pizza** — heals. Flavor line: "wood-fired healing" *(LORE SLOT)*.
- **PEPTIDES** — fills the special meter. Flavor: "GAMEDAY MEN'S HEALTH".
  Specials require a FULL bar and drain it completely.

---

## The world (all built, all visible)

**Stage 1 — AMBUSH AT FOX 4** ("get out of the building"): fluorescent studio →
lobby → exit. Mid-stage gag: the **ON AIR sign** snaps on and every enemy
freezes and looks at it (free hits). Sign text is a lore string.

**Stage 2 — DOWNTOWN DALLAS** ("the long walk through downtown"): the showcase.
Skyline: Bank of America Plaza (green argon), Reunion Tower, Fountain Place,
Chase Tower keyhole, the Magnolia **red Pegasus**, Omni with a **scrolling LED
facade** (current loop: "THE DUMB ZONE / 10AM WEEKDAYS / GO HOME CAT MAN" —
LORE SLOT, add anything), Old Red Courthouse, Margaret Hunt Hill bridge. Street
level: the **Giant Eyeball** (its iris tracks you), the **Traveling Man** robot
waving, **Deep Ellum murals** (tagged "DEEP ELLUM" and "GOOD RECORDS" — both
LORE SLOTS), the Pioneer Plaza **cattle drive** bronzes.

**Stage 3 — THE CASINO PENTHOUSE** ("playing with house money"): elevator fight
on the ride up (floor counter ticking), then gold-and-velvet penthouse with
slot machines and chandeliers.

**Stage 4 — ROOFTOP FINALE** ("dawn of the dumb zone"): Fox 4 roof at sunrise,
broadcast mast, the skyline behind.

Wave banners currently: "HERE COME THE LAWYERS / YOU'VE BEEN SERVED / LEGAL
DEPARTMENT, ASSEMBLE / MIDDLE MANAGEMENT ARRIVES / GOING UP. / WELCOME TO THE
HIGH ROLLER FLOOR / THE FINAL SIGN-OFF / THE GROUP CHAT IS TYPING..."

**Rank labels** on the stage-clear card (S→F): "P1 / CO-HOST / PRODUCER /
INTERN / CALLER / SALES GUY" *(LORE SLOT)*.

---

## Every text surface available for jokes

| Surface | When it shows | Constraint |
|---|---|---|
| 4 intro panel captions + balloons | once, before stage 1 | ~50 chars caption, ~30 balloon |
| Stage titles + subtitles | title card between stages | title ~20 chars, sub one line |
| Wave banners | when a fight starts | one line, ~30 chars |
| Boss intro banner (name + subtitle) | boss spawn | two short lines |
| Boss attack lines | floating speech mid-fight | 2–6 words |
| Boss defeat lines | on the kill | one line |
| Host hit/hurt catchphrases | random pops mid-combat | 1–4 words |
| Comic special cards | on special cast (freezes the game) | 1–4 words, huge type |
| Boss phase pops (half-size cards) | phase transitions | 1–3 words |
| Group Chat text projectiles | fired at you | 1–4 words |
| Omni LED crawl | stage 2 background, loops | any number of short messages |
| Mural tags | stage 2 walls | 1–2 words each |
| Rank labels | stage results | 1–2 words per grade |
| Pickup names + flavor lines | on pickup | name + short line |
| Win/lose screens | run end | big line + small line |

---

## Open questions worth brainstorming

1. **Why is each villain colluding with the Cat Man?** Right now it's asserted,
   never explained. A one-line motivation per boss (delivered via their intro
   subtitle or attack lines) would tie the whole thing together.
2. **Real catchphrases for the hosts** — the current hit/hurt lines are generic
   placeholders. This is the highest-value swap in the game.
3. **Stage transition connective tissue** — the stage subtitles could carry a
   running story ("get out of the building" → ... → "dawn of the dumb zone").
4. **The intro panels** — same beats, real voice.
5. **More Group Chat texts, Omni LED messages, rank labels** — infinite
   appetite, zero implementation cost.
6. **New bits, costed:** pure text = free, ships same day. New signage/prop in
   a stage = cheap. A new grunt with a gimmick = a day-ish. A new boss,
   mechanic, or stage = real work, pitch it and we'll scope it.
7. **Angelo's arc** — he's the beloved one. Does he get a redemption beat in
   the ending? (Currently he just says "alright man... I'll ask somebody else.")
