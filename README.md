# DUMB ZONE: REVENGE OF THE CAT MAN

A side-scrolling beat 'em up in the Turtles-in-Time tradition. Four stages,
three hosts, one former production director with a cat on his shoulder.

TypeScript + Vite + Canvas 2D. No frameworks, no assets — everything is
procedurally drawn and synthesized.

## Run it

```bash
npm install
npm run dev      # dev server at http://localhost:5173
npm run build    # type-check + static bundle in dist/ (runs from any static host)
```

## Controls

| Action | Keyboard | Touch |
|---|---|---|
| Move (8-way) | WASD / arrows | D-pad |
| ATTACK (light) | J or Z | A |
| STRONG (heavy) | K or X | B |
| SPECIAL | L or C | S |
| Dash | double-tap ← / → | double-tap d-pad |
| Pause | Esc / P | II button |
| Mute music | M | — |

**Combat:** A·A·A light chain (3rd hit knocks down) · A·A·**K** launcher →
juggle airborne enemies for +25% · raw K is an armored guard-breaker (the only
frontal answer to Corporate Suits) · attack during dash = sliding knockdown ·
attack with an enemy behind you = rear elbow · attack at point-blank = grab,
attack again to throw the body through his friends.

**Meter:** builds from hits given and taken, and from peptide pickups.
Specials need a FULL meter and drain it completely — no meter, no special.

**Pickups:** Cane Rosso pizza refills HP; peptide vials refill the special meter.

- **BLAKE — THE HOME RUN.** Hold Special to charge (armored), release to swing.
  Full charge sends grunts out of the stadium. GONE.
- **JAKE — THE 4 POINTER.** Full-screen goo shot; traps up to 3 grunts,
  slows bosses to half speed.
- **DAN — TIN FISH BOMB.** Auto-targeted lob. The blast stuns everyone caught
  in it so they stand there gagging inside the noxious green cloud: damage
  over time, halved attack rate. Dan thinks it smells great.

All three hosts share the same stats — pick your fighter by special.

## Editing the jokes

**Every show-specific string lives in [`src/lore.ts`](src/lore.ts)** — names,
catchphrases, boss lines, banners, rank labels, the Omni LED messages, the
intro panels. Edit, save, and the game hot-reloads. You never need to touch
game code. Anything marked `LORE SLOT` is a placeholder waiting for the real
bit.

Every tunable number (damage, HP, frame windows, cooldowns) lives in
[`src/balance.ts`](src/balance.ts).

## Layout

```
src/
  main.ts            boot, fixed 60hz loop, scene machine
  lore.ts            ALL show text (owner-editable)
  balance.ts         ALL numbers
  input.ts audio.ts  3-button input · synth SFX + chiptune player
  engine/            entity/state, combat resolution, spawner, camera,
                     projectiles, world objects
  actors/            player kit · enemies (lawyer, lawsuit, process server,
                     suit, pit boss, card sharp, group chat) · bosses
                     (angelo, son-in-law, matriarch, cat man)
  stages/            stage1..4 wave data
  render/            sprites, Dallas skyline, backdrops, fx (comic cards),
                     hud, screens
```
