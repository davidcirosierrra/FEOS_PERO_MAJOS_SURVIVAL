# Feos pero majos survival

Fork of *Paranoid*: 8-bit 3D shooter PWA (React + TypeScript + react-three-fiber + Rapier), re-themed for
**Feos pero majos**: the band walks to the stage over Bilbao tiles while fans throw lighters, CDs and
wine glasses. Play as the bass player or the pink pig, shooting pink forks with the fork-rifle.

- Tilt to move, tap to fire, swipe up to jump (somersault, dodges everything, 10 s charge), swipe down
  for an umbrella that bounces stuff away.
- Every hit makes you fatter (wider, heavier, slower to fire); 3 hits = 1 life, 3 lives.
- Kalimotxo slims you down one step; guitar picks are shot power-ups (red pierce, blue double, yellow
  rapid), every 2 hits you lose the latest one.
- Every 10 levels: the **FELIPE** bar boss, which falls apart as you hit it and throws burgers and
  indestructible pizzas that forks can only push.
- UI in Basque. Chiptune sound synthesised with Web Audio; settings saved in `localStorage`.

```bash
npm i
npm run dev      # desktop: ← → / A D move, click / Space fire, ↑ / W jump, ↓ / S umbrella
npm run build
```

Icons: `node scripts/gen-icons.mjs`.
