/**
 * "Feos pero majos" theme: the band walking to the stage through a crowd of fans.
 * All sprites are pixel patterns ('.' = empty).
 */
import type { MedalKind, Pattern } from './patterns'

export type CharacterId = 'bassist' | 'pig'

const FORK_GUN = '#2b3a8f' // navy, like the band's fork-rifle

/** Bass player: undercut, dark beard with grey, plaid flannel over grey tee, bass on the back, fork-rifle. */
const BASSIST: Pattern = {
  palette: {
    H: '#3a2a1e', // hair
    s: '#8c7866', // shaved sides
    f: '#e2b48c', // skin
    F: '#c99470', // nose / shadow
    e: '#2a1a10', // eyes
    B: '#3b2b20', // beard
    G: '#a59f96', // grey in the beard
    t: '#8e9196', // grey tee
    r: '#b8333c', // plaid red
    R: '#5c4a4a', // plaid dark
    w: '#c9b8a8', // plaid light
    j: '#3a4f7a', // jeans
    k: '#1c1c1c', // shoes
    m: '#2a1c10', // bass headstock
    p: '#d6d8dc', // tuning pegs
    n: '#8a5a2a', // bass neck
    b: '#a0302a', // bass body
    u: FORK_GUN,
  },
  rows: [
    '.....HHHHH..u.u',
    'pm..HHHHHHH.u.u',
    'mm.sHHHHHHHsuuu',
    '.n.sfffffffs.u.',
    '.n.sfefffefs.u.',
    '.n..fffFfff..u.',
    '.n..BfffffB..u.',
    '.n..BBBfBBB..u.',
    '.n..BBBBBBB.fu.',
    '.n..BBGBGBB.fu.',
    'rnrrtBGGBtrrru.',
    'RnrRtttttRrRru.',
    'rnwrtttttrwrfu.',
    'RrrRtttttRrRfu.',
    'bbrwtttttwrruu.',
    'bbRrtttttrRruu.',
    'b...jjjjjjjj...',
    '....jjjjjjjj...',
    '....jjj..jjj...',
    '....jjj..jjj...',
    '....kkk..kkk...',
  ],
}

/** Pink pig standing on two legs with the fork-rifle. */
const PIG: Pattern = {
  palette: {
    P: '#ff9ec8',
    D: '#e07aa8',
    S: '#ff7eb6',
    L: '#ffc4de',
    k: '#2a1020',
    h: '#7a3e5a',
    u: FORK_GUN,
  },
  rows: [
    '...D......D.u.u',
    '...DP....PD.u.u',
    '...PPPPPPPP.uuu',
    '...PkPPPPkP..u.',
    '...PPSSSSPP..u.',
    '...PPSkkSPP..u.',
    '...PPSSSSPP..u.',
    '....PPPPPP...u.',
    '...DPPPPPPD.Pu.',
    '..DPPLLLLPPDPu.',
    '..PPLLLLLLPPPu.',
    '.DPPLLLLLLPPPu.',
    'D.PPLLLLLLPP.u.',
    '...PPLLLLPP.uu.',
    '...PPPPPPPP.uu.',
    '....PP..PP.....',
    '....PP..PP.....',
    '....hh..hh.....',
  ],
}

const crop = (p: Pattern, r0: number, r1: number, c0: number, c1: number): Pattern => ({
  palette: p.palette,
  rows: p.rows.slice(r0, r1).map((r) => r.slice(c0, c1)),
})

export const CHARACTERS: Record<CharacterId, { name: string; pattern: Pattern; head: Pattern }> = {
  bassist: { name: 'BAXU-JOTZAILEA', pattern: BASSIST, head: crop(BASSIST, 0, 10, 3, 12) },
  pig: { name: 'TXERRIA', pattern: PIG, head: crop(PIG, 0, 8, 3, 11) },
}

/** Fans walking towards the band (front view). */
export const FANS: Pattern[] = [
  // metalhead
  {
    palette: { H: '#141414', f: '#e2b48c', e: '#2a1a10', k: '#1e1e22', w: '#e8e8e8', j: '#3a4f7a', K: '#111' },
    rows: [
      '...HHHHH...',
      '..HHHHHHH..',
      '..HfffffH..',
      '..HfefefH..',
      '..HfffffH..',
      '..HffeffH..',
      '..HHfffHH..',
      '.HHkkkkkHH.',
      '.kkkkwkkkk.',
      'fkkkwwwkkkf',
      'fkkkkwkkkkf',
      'f.kkkkkkk.f',
      '..jjjjjjj..',
      '..jjj.jjj..',
      '..jjj.jjj..',
      '..jj...jj..',
      '..KK...KK..',
    ],
  },
  // fan in a band tee
  {
    palette: { b: '#6b3a1e', f: '#f0c4a0', e: '#2a1a10', p: '#ff7eb6', v: '#9b4f9e', j: '#2f3f66', w: '#f4f4f2' },
    rows: [
      '...bbbbb...',
      '..bbbbbbbb.',
      '..bfffffbb.',
      '..bfefefb.b',
      '..bfffffb.b',
      '...ffpff..b',
      '....fff....',
      '..vvvvvvv..',
      '.vvvvpvvvv.',
      'fvvvpppvvvf',
      'f.vvvpvvv.f',
      'f.vvvvvvv.f',
      '..jjjjjjj..',
      '..jjj.jjj..',
      '..jjj.jjj..',
      '..jj...jj..',
      '..ww...ww..',
    ],
  },
  // tourist with a bum bag
  {
    palette: { f: '#e8b090', e: '#2a1a10', k: '#4a2e1c', y: '#ffd93d', o: '#2e6b3a', O: '#c9ccd2', E: '#d8c49a', w: '#f4f4f2', K: '#3a2a1e' },
    rows: [
      '...........',
      '...fffff...',
      '..fffffff..',
      '..ffefeff..',
      '..fffffff..',
      '..fkkkkkf..',
      '...fffff...',
      '..yyyyyyy..',
      '.yyyyyyyyy.',
      'fyyyyyyyyyf',
      'f.ooooooo.f',
      'f.yyoOoyy.f',
      '..EEEEEEE..',
      '..EEE.EEE..',
      '..fff.fff..',
      '..www.www..',
      '..KK...KK..',
    ],
  },
  // punk
  {
    palette: { g: '#39ff6a', f: '#e2b48c', e: '#2a1a10', k: '#1a1a1e', s: '#c9ccd2', r: '#d0283c', j: '#3a4f7a' },
    rows: [
      '.....g.....',
      '....ggg....',
      '....ggg....',
      '...fffff...',
      '...fefef...',
      '...fffff...',
      '...ffeff...',
      '.kkkrrrkkk.',
      'kkskrrrkskk',
      'kkkkrrrkkkk',
      'fkkkrrrkkkf',
      'f.kkkkkkk.f',
      '..jjjjjjj..',
      '..jjj.jjj..',
      '..jjj.jjj..',
      '..kk...kk..',
      '..kk...kk..',
    ],
  },
]

/** What fans throw at the band. `burger` is reserved for the bar boss. */
export const THROWN: Record<string, Pattern> = {
  lighter: {
    palette: { o: '#ff9a2e', y: '#ffe14d', s: '#c9ccd2', r: '#e0283c', w: '#ffffff' },
    rows: ['..o..', '.oyo.', '.oyo.', 'sssss', 'rrrrr', 'rwrrr', 'rrrrr', 'rrrrr'],
  },
  cd: {
    palette: { s: '#d6d8dc', c: '#7fe3f0', m: '#ff7eb6', y: '#ffe14d' },
    rows: ['..sss..', '.smscs.', 'scy.sms', 'sm...cs', 'scs.yms', '.smscs.', '..sss..'],
  },
  wine: {
    palette: { w: '#d8eef5', r: '#8a1030' },
    rows: ['w...w', 'wrrrw', 'wrrrw', '.wrw.', '..w..', '..w..', '..w..', '.www.'],
  },
  burger: {
    palette: { t: '#e8a24a', w: '#fff6d8', g: '#5be35b', b: '#7a3e1c', y: '#ffd93d' },
    rows: ['.ttttt.', 'ttwttwt', 'ggggggg', 'bbbbbbb', 'yyyyyyy', '.ttttt.'],
  },
}
export const FAN_THROWS = ['lighter', 'cd', 'wine']

/** Pink fork bullets. */
export const FORK: Pattern = {
  palette: { p: '#ff7eb6', w: '#ffd1e6' },
  rows: ['p.p.p', 'w.w.w', 'ppppp', '.ppp.', '..p..', '..p..', '..p..'],
}

/** Healing pick-up: a katxi of kalimotxo (wine + cola) with ice and a straw. */
export const KALIMOTXO: Pattern = {
  palette: { s: '#ff3d5a', w: '#f4f4f2', d: '#5a0f1c', i: '#e8f6ff' },
  rows: ['......s', '.....s.', 'wwwwsww', 'wdddsdw', 'wdiddiw', '.wdddw.', '.wdidw.', '.wdddw.', '..www..'],
}

/** Shot power-ups are guitar picks in the medal colours. */
export const PICK_COLORS: Record<MedalKind, { pick: string; edge: string }> = {
  red: { pick: '#ff3d5a', edge: '#9c1028' },
  blue: { pick: '#3da5ff', edge: '#174f9c' },
  yellow: { pick: '#ffe14d', edge: '#a8820c' },
}
const pick = (k: MedalKind): Pattern => ({
  palette: { g: PICK_COLORS[k].pick, b: PICK_COLORS[k].edge, w: '#ffffff' },
  rows: ['.bbbbb.', 'bgggggb', 'bwggggb', 'bwggggb', '.bgggb.', '..bgb..', '...b...'],
})
export const PICKS: Record<MedalKind, Pattern> = { red: pick('red'), blue: pick('blue'), yellow: pick('yellow') }

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
  return { palette: { T: '#c8873e', c: '#ffd45e', p: '#c0392b', g: '#3e9b3e' }, rows }
})()

/**
 * Procedural Bilbao floor tile (the classic grey hydraulic tile with a four-petal flower of
 * circles), drawn as chunky pixels on a canvas.
 */
export function bilbaoTileCanvas(px = 32) {
  const c = document.createElement('canvas')
  c.width = c.height = px
  const g = c.getContext('2d')!
  const base = '#8e9196'
  const light = '#a9acb2'
  const groove = '#6d7076'
  g.fillStyle = base
  g.fillRect(0, 0, px, px)
  const set = (x: number, y: number, col: string) => {
    g.fillStyle = col
    g.fillRect(((x % px) + px) % px, ((y % px) + px) % px, 1, 1)
  }
  const ring = (cx: number, cy: number, r: number, col: string) => {
    for (let a = 0; a < Math.PI * 2; a += 0.02) set(Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a) * r), col)
  }
  const h = px / 2
  // Petals: four circles around the centre, plus quarter circles at the corners (they join up
  // with the neighbouring tiles), and a small central dot ring.
  const pr = px * 0.22
  for (const [dx, dy] of [
    [0, -1],
    [1, 0],
    [0, 1],
    [-1, 0],
  ])
    ring(h + dx * pr, h + dy * pr, pr, groove)
  for (const [cx, cy] of [
    [0, 0],
    [px, 0],
    [0, px],
    [px, px],
  ])
    ring(cx, cy, pr, groove)
  ring(h, h, px * 0.07, light)
  // Tile joint
  for (let i = 0; i < px; i++) {
    set(i, 0, groove)
    set(0, i, groove)
  }
  return c
}
