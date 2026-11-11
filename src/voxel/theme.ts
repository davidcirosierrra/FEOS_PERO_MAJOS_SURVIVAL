/**
 * "Feos pero majos" theme: the band walking to the stage through a crowd of fans.
 * All sprites are pixel patterns ('.' = empty).
 */
import { BOSS_SHOTS } from './bosses.gen'
import { outlined, type Legs, type MedalKind, type Pattern } from './patterns'
import * as G from './sprites.gen'

/** Fans walking towards the band (front view). */
export const FANS: Pattern[] = [G.FAN_METAL, G.FAN_BANDTEE, G.FAN_TOURIST, G.FAN_PUNK]
/** All fans share the same build. */
export const FAN_LEGS: Legs = { rows: 7, from: 4, split: 9, to: 14 }

/** Everything that can be thrown at the band: by fans (`FAN_THROWS`) and by the bosses. */
export const THROWN: Record<string, Pattern> = { lighter: G.LIGHTER, cd: G.CD, wine: G.WINE, burger: G.BURGER, ...BOSS_SHOTS }
export const FAN_THROWS = ['lighter', 'cd', 'wine']

/** Pink fork bullets. */
export const FORK: Pattern = {
  palette: { p: '#ff7eb6', w: '#ffd1e6' },
  rows: ['p.p.p', 'w.w.w', 'ppppp', '.ppp.', '..p..', '..p..', '..p..'],
}

/** Healing pick-up: a katxi of kalimotxo (wine + cola) with ice and a straw. */
export const KALIMOTXO: Pattern = G.KALIMOTXO

/** Shot power-ups are guitar picks in the medal colours. */
export const PICK_COLORS: Record<MedalKind, { pick: string; edge: string }> = {
  red: { pick: '#ff3d5a', edge: '#9c1028' },
  blue: { pick: '#3da5ff', edge: '#174f9c' },
  yellow: { pick: '#ffe14d', edge: '#a8820c' },
}
export const PICKS: Record<MedalKind, Pattern> = { red: G.PICK_RED, blue: G.PICK_BLUE, yellow: G.PICK_YELLOW }

/** Bar boss throws these big indestructible pizzas (lasers only push them). */
export const PIZZA: Pattern = (() => {
  const n = 11
  const r = 5.3
  const pepperoni = new Set(['2,4', '3,7', '5,2', '5,6', '7,3', '7,8', '8,5'])
  const basil = new Set(['4,4', '6,8', '3,5'])
  const rows: string[] = []
  for (let y = 0; y < n; y++) {
    let row = ''
    for (let x = 0; x < n; x++) {
      const d = Math.hypot(x - 5, y - 5)
      const k = `${y},${x}`
      row += d > r ? '.' : d > r - 1.1 ? 'T' : pepperoni.has(k) ? 'p' : basil.has(k) ? 'g' : 'c'
    }
    rows.push(row)
  }
  return outlined({ palette: { T: '#c8873e', c: '#ffd45e', p: '#c0392b', g: '#3e9b3e' }, rows })
})()
