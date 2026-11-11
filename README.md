# Feos pero majos survival

Fork of *Paranoid*: 8-bit 3D shooter PWA (React + TypeScript + react-three-fiber + Rapier), re-themed for
**Feos pero majos**: the band walks to the stage over Bilbao tiles while fans throw lighters, CDs and
wine glasses. Play as the pink pig, shooting pink forks with the fork-rifle.

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

1. Draw it in `scripts/sprites/<name>.py` (see `pig.py`) and register it in `scripts/sprites/emit.py`,
   or write the `Pattern`s by hand: a full-body sprite and a first-person rifle.
2. Add an entry to `ROSTER` in `src/characters/index.ts` (name, sprite, head box for the life icon,
   leg area for the walk cycle, rifle, voice, optional `stats`).

That is all: the character select (it grows arrows as soon as there are two), the HUD, the
first-person view and the screams read everything from the roster. The bass player is already there
with `enabled: false`.

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
