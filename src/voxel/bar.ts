import type { Pattern } from './patterns'
import * as G from './sprites.gen'

/**
 * "FELIPE" tavern boss, front view of a Basque-style frontage (painted green wood, stone, striped
 * awning, bottles and pintxos in the windows). Drawn in scripts/sprites/felipe.py.
 */
export type BarPart = { name: string; pattern: Pattern; col: number; row: number; front?: boolean }

/** Whole-facade grid; parts are placed by their top-left cell. */
export const BAR_GRID = { w: 44, h: 31 }

const SIGN = [G.FELIPE_SIGN0, G.FELIPE_SIGN1, G.FELIPE_SIGN2, G.FELIPE_SIGN3, G.FELIPE_SIGN4, G.FELIPE_SIGN5]

/**
 * Parts in the order they break off: the sign letter by letter, the awning, the two windows.
 * The last one (the frontage with the door) only goes when the boss is beaten.
 */
export const BAR_PARTS: BarPart[] = [
  ...SIGN.map((pattern, i) => ({ name: `sign${i}`, pattern, col: 2 + i * 6, row: 0, front: true })),
  { name: 'awning', pattern: G.FELIPE_AWNING, col: 0, row: 10, front: true },
  { name: 'windowL', pattern: G.FELIPE_WINDOWL, col: 1, row: 15, front: true },
  { name: 'windowR', pattern: G.FELIPE_WINDOWR, col: 28, row: 15, front: true },
  { name: 'facade', pattern: G.FELIPE_FACADE, col: 0, row: 14 },
]
