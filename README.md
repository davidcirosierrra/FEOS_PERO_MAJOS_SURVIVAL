# Paranoid

8-bit 3D shooter PWA (React + TypeScript + three.js / react-three-fiber + Rapier physics).

- Tilt the phone to move the alien saucer, tap to fire, swipe up to open an umbrella that bounces the food away.
- Shuttles drop junk food on you; every hit makes the saucer fatter (heavier → slower, fires slower). 3 hits = 1 life, 3 lives.
- Hi-score in `localStorage`. No backend.

```bash
npm i
npm run dev      # desktop: ← → / A D move, click / Space fire, ↑ / W umbrella
npm run build
```

Icons: `node scripts/gen-icons.mjs`.
