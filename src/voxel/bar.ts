import type { Pattern } from './patterns'

/** "FELIPE" bar boss, front view of the facade. Parts break off as it takes damage. */
const pal = {
  b: '#1d4d2e', // sign board (dark green)
  y: '#ffe14d', // sign letters
  g: '#2e8b57', // awning green
  w: '#f4f4f2',
  f: '#6b3b1e', // wood frame
  F: '#4a2812', // dark wood
  k: '#1a1416', // dark interior
  G: '#3fae4f', // green bottle
  a: '#d98a1e', // amber bottle
  r: '#b0283c', // red bottle / wine
  c: '#c9a46a', // facade stone
  C: '#a8854f', // stone shadow
  d: '#7a4a24', // door
  e: '#d8eef5', // door glass
  s: '#c9ccd2', // metal
}

// 3x5 pixel letters
const GLYPH: Record<string, string[]> = {
  F: ['yyy', 'y..', 'yy.', 'y..', 'y..'],
  E: ['yyy', 'y..', 'yy.', 'y..', 'yyy'],
  L: ['y..', 'y..', 'y..', 'y..', 'yyy'],
  I: ['yyy', '.y.', '.y.', '.y.', 'yyy'],
  P: ['yy.', 'y.y', 'yy.', 'y..', 'y..'],
}
/** One sign tile per letter (they fall off one by one). */
const letter = (ch: string): Pattern => ({
  palette: pal,
  rows: ['bbbbb', ...GLYPH[ch].map((r) => 'b' + r.replace(/\./g, 'b') + 'b'), 'bbbbb'],
})

const awning: Pattern = {
  palette: pal,
  rows: [
    'gwgwgwgwgwgwgwgwgwgwgwgwgwgwgwgwgwgw',
    'gwgwgwgwgwgwgwgwgwgwgwgwgwgwgwgwgwgw',
    'g.g.g.g.g.g.g.g.g.g.g.g.g.g.g.g.g.g.',
  ],
}

const windowWithBottles = (): Pattern => ({
  palette: pal,
  rows: [
    'fffffffff',
    'fkGkakrkf',
    'fkGkakrkf',
    'fGGaaarrf',
    'fsssssssf',
    'fkrkGkakf',
    'frrGGaaaf',
    'fffffffff',
  ],
})

const facade: Pattern = {
  palette: pal,
  rows: [
    'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
    'cccccccccccccccccccccccccccccccccccc',
    'ckkkkkkkkkcccccccccccccccckkkkkkkkkc',
    'ckkkkkkkkkcccccddddddccccckkkkkkkkkc',
    'ckkkkkkkkkCcccdeeeeeedcccCkkkkkkkkkc',
    'ckkkkkkkkkccccdeeeeeedccckkkkkkkkkkc',
    'ckkkkkkkkkccccdeeeeeedccckkkkkkkkkkc',
    'ckkkkkkkkkCcccddddddddcccCkkkkkkkkkc',
    'ckkkkkkkkkccccddddddsdccckkkkkkkkkkc',
    'ccccccccccccccddddddddcccccccccccccc',
    'cCcccCcccCccccddddddddccccCcccCcccCc',
    'ccccccccccccccddddddddcccccccccccccc',
    'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
  ],
}

export type BarPart = { name: string; pattern: Pattern; col: number; row: number; front?: boolean }

/** Whole-facade grid; parts are placed by their top-left cell. */
export const BAR_GRID = { w: 36, h: 23 }

/**
 * Parts in the order they break off: the sign letter by letter, the awning, the two windows.
 * The last one (the facade with the door) only goes when the boss is beaten.
 */
export const BAR_PARTS: BarPart[] = [
  ...'FELIPE'.split('').map((ch, i) => ({ name: `sign${i}`, pattern: letter(ch), col: 3 + i * 5, row: 0, front: true })),
  { name: 'awning', pattern: awning, col: 0, row: 7, front: true },
  { name: 'windowL', pattern: windowWithBottles(), col: 1, row: 11, front: true },
  { name: 'windowR', pattern: windowWithBottles(), col: 26, row: 11, front: true },
  { name: 'facade', pattern: facade, col: 0, row: 10 },
]
