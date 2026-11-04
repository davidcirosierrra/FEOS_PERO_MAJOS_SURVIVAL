# Paranoid

8-bit 3D shooter PWA (React + TypeScript + three.js / react-three-fiber + Rapier physics).

- Tilt the phone to move the alien saucer, tap to fire.
- Shuttles drop junk food on you; every hit makes the saucer fatter (heavier → slower, fires slower). 3 hits = 1 life, 3 lives.
- Hi-score in `localStorage`. No backend.

```bash
npm i
npm run dev      # desktop: ← → / A D to move, click or Space to fire
npm run build
```

Icons: `node scripts/gen-icons.mjs`.
