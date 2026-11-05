import type { Pattern } from './patterns'

/** Ice-cream truck boss, side view facing right (inspired by a retro pastel ice-cream van). */
const pal = {
  w: '#f4f4f2', // roof
  p: '#ff7eb6', // pink stripes
  b: '#8fd3e8', // light blue body
  B: '#5fb0c8', // body shadow
  k: '#24262b', // dark / tyres
  s: '#c9ccd2', // chrome
  g: '#d8eef5', // glass
  t: '#6b3b2a', // shop interior
  y: '#ffe14d',
  r: '#ff3d5a',
  o: '#ff9a2e',
  P: '#ff7eb6', // pink ice cream
  L: '#7fe3f0', // blue ice cream
  c: '#d9963b', // cone
  C: '#a8692a',
}

const rearBox: Pattern = {
  palette: pal,
  rows: [
    'wwwwwwwwwwwwwwwwwwwwww',
    'pppppppppppppppppppppp',
    'bbbbbbbbbbbbbbbbbbbbbb',
    'bkkkkkkkkkkkkkkbbbbbbb',
    'bkttytrtotttytkbbbbbbb',
    'bkttttttttttttkbbbbbbb',
    'bkrryyoorryyttkbbbbbbb',
    'bsssssssssssssssbbbbbb',
    'bbbbbbbbbbbbbbbbbbbbbb',
    'pppppppppppppppppppppp',
    'bbbbbbbbbbbbbbbbbbbbbb',
    'BBBkkkkkkBBBBBBBBBBBBB',
    '...kksskk.............',
    '....kkkk..............',
  ],
}

const cab: Pattern = {
  palette: pal,
  rows: [
    'wwwwwwwww.....',
    'pppppppppp....',
    'bbggggggggb...',
    'bbgggggggggb..',
    'bbggggggggggb.',
    'bbbbbbbbbbbbbb',
    'bbbbbbbbbbbbsy',
    'bbbbbbbbbbbsss',
    'bbbbbbbbbbbsss',
    'pppppppppppppp',
    'bbbbbbbbbbbbbs',
    'BBBBBBkkkkkkBs',
    '.......kksskk.',
    '........kkkk..',
  ],
}

const awning: Pattern = {
  palette: pal,
  rows: ['......pwpwpwpwpwpwpw', '...pwpwpwpwpwpwpwp..', 'pwpwpwpwpwpwpwpw....'],
}

const cone = (scoop: 'P' | 'L'): Pattern => ({
  palette: pal,
  rows: [`.${scoop}${scoop}${scoop}.`, `${scoop}${scoop}${scoop}${scoop}${scoop}`, `${scoop}w${scoop}${scoop}${scoop}`, 'ccccc', '.cCc.', '.cCc.', '..c..'],
})

export type TruckPart = { name: string; pattern: Pattern; col: number; row: number; front?: boolean }

/** Whole-truck grid; parts are placed by their top-left cell. */
export const TRUCK_GRID = { w: 40, h: 21 }

/**
 * Parts in the order they break off (the last one, the cab, is the core and only goes when the
 * boss dies).
 */
export const TRUCK_PARTS: TruckPart[] = [
  { name: 'cone1', pattern: cone('P'), col: 5, row: 0 },
  { name: 'cone4', pattern: cone('L'), col: 20, row: 0 },
  { name: 'cone2', pattern: cone('L'), col: 10, row: 0 },
  { name: 'cone5', pattern: cone('P'), col: 27, row: 0 },
  { name: 'cone3', pattern: cone('P'), col: 15, row: 0 },
  { name: 'awning', pattern: awning, col: 0, row: 9, front: true },
  { name: 'rear', pattern: rearBox, col: 4, row: 7 },
  { name: 'cab', pattern: cab, col: 26, row: 7 },
]

/** Large cookie thrown by the boss: can't be destroyed, only pushed around by lasers. */
export const COOKIE: Pattern = (() => {
  const n = 11
  const r = 5.3
  const chips = new Set(['2,4', '3,7', '5,2', '5,6', '6,8', '7,3', '8,6', '4,5'])
  const rows: string[] = []
  for (let y = 0; y < n; y++) {
    let row = ''
    for (let x = 0; x < n; x++) {
      const d = Math.hypot(x - 5, y - 5)
      row += d > r ? '.' : chips.has(`${y},${x}`) ? 'd' : d > r - 1.1 ? 'T' : 't'
    }
    rows.push(row)
  }
  return { palette: { t: '#e0aa6c', T: '#b97a3e', d: '#4a2a14' }, rows }
})()
