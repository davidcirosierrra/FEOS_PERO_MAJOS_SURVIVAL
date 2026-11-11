# Feos pero majos survival

Fork of *Paranoid*: 8-bit 3D shooter PWA (React + TypeScript + react-three-fiber + Rapier), re-themed for
**Feos pero majos**: the band walks to the stage over Bilbao tiles while fans throw lighters, CDs and
wine glasses. Play as the pink pig or as any of the band (pink football shirts, instruments that shoot
forks), each with its own power:

| Character | Power |
| --- | --- |
| TXERRIA (pig) | none: the classic |
| ABESLARIAK (two singers) | side by side, two lanes of forks; the jump becomes a scream that clears the screen |
| BATERIA (drums) | two sticks per shot, fires faster; the umbrella becomes a bass-drum kick |
| RASTA (guitar) | a fork that takes a fan down bounces on to the nearest one; fires slower |
| BAXISTA (bass) | 4 hits per life, forks go through fans; slow |
| GITARRISTA (guitar) | every 10 fans without getting hit, a solo: fan of 5 forks |
| KOMODINA (plays everything) | picks are instruments: one at a time, never lost when hit; nimble |

Top-down or first-person view, picked on the home screen (also in the in-game settings).

- Tilt to move, tap to fire, swipe up to jump (somersault, dodges everything, 10 s charge), swipe down
  for an umbrella that bounces stuff away.
- Every hit makes you fatter (wider, heavier, slower to fire); 3 hits = 1 life, 3 lives.
- Kalimotxo slims you down one step; guitar picks are shot power-ups (red pierce, blue double, yellow
  rapid), every 2 hits you lose the latest one.
- **A boss every 5 levels, six in total.** Each one moves and attacks differently, falls apart as you
  hit it, gets angry below a third of its health, and throws one heavy thing forks can only push:
  FELIPE TABERNA → FURGONETA → SEGURATA → BAFLE DORREA → MANAGERRA → **LA PAJA**.
- Beat the sixth and you win: the band reaches the stage, the instruments are waiting and the setlist
  says what they came to play.
- UI in Basque. Chiptune sound synthesised with Web Audio; settings, record and beaten bosses saved in
  `localStorage`.

```bash
npm i
npm run dev      # desktop: ← → / A D move, click / Space fire, ↑ / W jump, ↓ / S umbrella
npm run build
```

`?debug` in the URL exposes `window.__paranoid` (store, input, live threats) for poking at the game
from the console, e.g. `__paranoid.store.setState({ wave: 29, enemies: [] })` to jump to the last boss.

## Where things live

| What | Where |
| --- | --- |
| Game rules and state | `src/game/store.ts`, `src/game/config.ts` |
| Bosses (data: art, movement, attacks) | `src/bosses/index.ts`, run by `src/game/Boss.tsx` |
| Playable characters | `src/characters/index.ts` |
| Victory scene | `src/screens/Victory.tsx` |
| Pixel art sources | `scripts/sprites/*.py` → `src/voxel/*.gen.ts` |
| UI styling | `src/index.css` |

### Adding a character

1. Draw it: a band member is one line in `BAND` in `scripts/sprites/band.py` (hair, beard, glasses,
   build, instrument…); anything else goes in its own script (see `pig.py`) registered in
   `scripts/sprites/emit.py`. Or write the `Pattern`s by hand: a full-body sprite and a rifle.
2. Add an entry to `ROSTER` in `src/characters/index.ts` (name, sprite, optional `partner` for a duo,
   head box for the life icon, leg area for the walk cycle, rifle, voice, optional `power` and
   `stats`: thrust, fire cooldown, hits per life).

That is all: the character select, the HUD, the first-person view, the victory stage and the screams
read everything from the roster. A brand-new power needs its rule in `src/game/store.ts` (search for
`powerOf()`).

### Adding or changing a boss

Bosses are drawn whole in `scripts/sprites/bosses.py` and cut into parts that break off in order; then
described in `src/bosses/index.ts` (health, how it moves, what it throws and in which patterns).
`BOSSES.length` decides how many there are; the last one triggers the ending.

### Sprites

```bash
pip install pillow
python3 scripts/sprites/emit.py    # regenerates src/voxel/sprites.gen.ts and bosses.gen.ts
python3 scripts/sprites/bosses.py  # PNG previews next to the scripts (git-ignored)
```

Icons: `node scripts/gen-icons.mjs`.
