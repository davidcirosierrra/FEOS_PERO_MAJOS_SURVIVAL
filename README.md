# Paranoid

8-bit 3D shooter PWA (React + TypeScript + three.js / react-three-fiber + Rapier physics).

- Tilt the phone to move the alien saucer, tap to fire, swipe up for a loop jump (dodges everything, 10 s charge), swipe down for an umbrella that bounces the food away. A glowing banana falls every 15–22 s: catch it to repair one hull point. Shot medals fall faster than food: red = piercing laser (knocks food down and deflects upwards), blue = double laser, yellow = double fire rate; they stack, and every 2 hits you lose the latest one. Every 10 levels: ice-cream truck boss with a health bar; it sheds parts (smaller target) as it takes damage, throws cones and indestructible cookies that lasers can only push away.
- Shuttles drop junk food on you; every hit makes the saucer fatter (heavier → slower, fires slower). 3 hits = 1 life, 3 lives.
- Hi-score in `localStorage`. No backend.

```bash
npm i
npm run dev      # desktop: ← → / A D move, click / Space fire, ↑ / W loop jump, ↓ / S umbrella
npm run build
```

Icons: `node scripts/gen-icons.mjs`.
