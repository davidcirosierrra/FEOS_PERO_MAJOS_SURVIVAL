/**
 * Pixel-art patterns extruded into voxels.
 * Each row is a string; '.' (or space) means empty, any other char is looked up in the palette.
 */
export type Pattern = {
  rows: string[]
  palette: Record<string, string>
}

/** Grey flying-saucer palette (2D sprites: lives, PLAY button). */
const saucerPalette = {
  d: '#cfd8de', // glass dome
  w: '#ffffff', // dome highlight
  h: '#a9b0b7', // upper hull
  m: '#7f868d', // rim
  n: '#5c6268', // lower hull
  y: '#f4f7f9', // lights
  k: '#3a3e43', // dark
}

/** Side-view saucer sprite (used for HUD lives). */
export const ALIEN_ICON: Pattern = {
  palette: saucerPalette,
  rows: ['....ddd....', '...dwddd...', '.hhhhhhhhh.', 'mymmymmymmy', '.nnnnnnnnn.', '...kkkkk...'],
}

/**
 * 3D saucer built as a voxel "lathe": one horizontal disc per row, top to bottom.
 * `lights` rows alternate two colours around the rim; `dents` scatters dark voxels (damage).
 */
export type LatheRow = { r: number; color: string; lights?: [string, string]; dents?: number }

const C = { dome: '#dde6ec', domeHi: '#ffffff', hull: '#b9c0c7', rim: '#666c72', low: '#4a4f55', dark: '#2a2d31', light: '#ffffff', dent: '#2b2e32', burn: '#6b4a3a' }

/** Player saucer per damage stage: wider and thicker after every hit. */
export const SAUCER_STAGES: LatheRow[][] = [
  [
    { r: 1.6, color: C.domeHi },
    { r: 2.6, color: C.dome },
    { r: 3.1, color: C.dome },
    { r: 5.2, color: C.hull },
    { r: 7.2, color: C.rim, lights: [C.light, C.rim] },
    { r: 6.2, color: C.low },
    { r: 3.6, color: C.dark },
  ],
  [
    { r: 1.6, color: C.domeHi },
    { r: 2.8, color: C.dome },
    { r: 3.4, color: C.dome },
    { r: 5.8, color: C.hull, dents: 0.027 },
    { r: 7.6, color: C.hull, dents: 0.020 },
    { r: 8.4, color: C.rim, lights: [C.light, C.rim] },
    { r: 7.4, color: C.low, dents: 0.033 },
    { r: 5.2, color: C.low },
    { r: 3.6, color: C.dark },
  ],
  [
    { r: 1.8, color: C.domeHi },
    { r: 3.0, color: C.dome },
    { r: 3.8, color: C.dome },
    { r: 6.4, color: C.hull, dents: 0.040 },
    { r: 8.2, color: C.hull, dents: 0.050 },
    { r: 9.4, color: C.rim, lights: [C.light, C.burn] },
    { r: 9.0, color: C.rim, dents: 0.060 },
    { r: 8.0, color: C.low, dents: 0.050 },
    { r: 6.2, color: C.low, dents: 0.033 },
    { r: 4.0, color: C.dark },
  ],
]

export const SAUCER_DENT = C.dent

/** NASA-style orbiter seen from above, nose pointing down (towards the player). */
export const SHUTTLE: Pattern = {
  palette: {
    w: '#f4f4f2', // white tiles
    l: '#c9ccd2', // payload bay seam
    k: '#1c1c22', // black heat tiles (nose, leading edges)
    s: '#9ea3ad', // OMS pods
    g: '#55585f', // engine bells
    o: '#ff9a2e', // exhaust
    y: '#ffe14d',
  },
  rows: [
    '.....y.y.y.....',
    '.....o.o.o.....',
    '.....ggggg.....',
    '....swwwwws....',
    'kwwwwwwlwwwwwwk',
    'kwwwwwwlwwwwwwk',
    '.kwwwwwlwwwwwk.',
    '..kwwwwlwwwwk..',
    '...kwwwlwwwk...',
    '....kwwlwwk....',
    '.....kwlwk.....',
    '.....kwlwk.....',
    '.....wwlww.....',
    '.....wwlww.....',
    '.....wwlww.....',
    '.....wwwww.....',
    '......www......',
    '......kwk......',
    '......kkk......',
    '.......k.......',
  ],
}

/** Vertical tail fin (columns = height above the fuselage, rows = along the body, rear first). */
export const SHUTTLE_FIN: Pattern = {
  palette: { w: '#f4f4f2', k: '#1c1c22' },
  rows: ['wwwwk', 'wwwk.', 'wwk..', 'wk...'],
}

/** Junk food the shuttles throw at you. */
export const FOOD: Record<string, Pattern> = {
  /** Thrown by the ice-cream truck boss (same footprint as the burger). */
  cone: {
    palette: { P: '#ff7eb6', w: '#ffffff', c: '#d9963b', C: '#a8692a' },
    rows: ['.PPPPP.', 'PPwPPPP', '.ccccc.', '..cCc..', '..cCc..', '...c...'],
  },
  donut: {
    palette: { p: '#ff6fb5', s: '#7df9ff', t: '#ffe14d', d: '#c4733b' },
    rows: [
      '..ppp..',
      '.pspptp',
      'pp...sp',
      'dp...pd',
      'pt...pp',
      '.ppspp.',
      '..ddd..',
    ],
  },
  soda: {
    palette: { l: '#c9ccd6', r: '#ff2e4c', w: '#ffffff' },
    rows: ['.lll.', 'rrrrr', 'rwwrr', 'rrwwr', 'rrrrr', 'rwwrr', 'rrrrr', '.lll.'],
  },
  fries: {
    palette: { y: '#ffd93d', r: '#ff2e4c', w: '#ffffff' },
    rows: ['.y.y.y', 'y.yy.y', 'yyyyyy', 'rryrrr', 'rwrrwr', '.rrrr.', '.rrrr.'],
  },
  burger: {
    palette: { t: '#e8a24a', w: '#fff6d8', g: '#5be35b', b: '#7a3e1c', y: '#ffd93d' },
    rows: ['.ttttt.', 'ttwttwt', 'ggggggg', 'bbbbbbb', 'yyyyyyy', '.ttttt.'],
  },
}

/** What regular shuttles throw (the boss has its own: `cone`). */
export const FOOD_KINDS = ['donut', 'soda', 'fries', 'burger']

export const LASER: Pattern = {
  palette: { g: '#b6ff3d', w: '#ffffff' },
  rows: ['w', 'g', 'g'],
}

export function patternSize(p: Pattern) {
  return { w: Math.max(...p.rows.map((r) => r.length)), h: p.rows.length }
}

/** 8-bit umbrella (side view) opened above the saucer. */
export const UMBRELLA: Pattern = {
  palette: { r: '#ff2e4c', w: '#ffffff', k: '#9aa0a8' },
  rows: [
    '.......rwr.......',
    '.....rrwwwrr.....',
    '...rrrwwwwwrrr...',
    '.rrrrwwwwwwwrrrr.',
    'rrrrrwwwwwwwrrrrr',
    'r.r.r.r.k.r.r.r.r',
    '........k........',
    '........k........',
    '.......kk........',
  ],
}

/** Power-up: restores one hull point. */
export const BANANA: Pattern = {
  palette: { y: '#ffe14d', Y: '#e0a800', b: '#6b4a1c' },
  rows: [
    '..........bb',
    '.........yy.',
    '........yyy.',
    '.......yyyY.',
    'byy..yyyyY..',
    '.yyyyyyyY...',
    '..YYYYY.....',
  ],
}

export type MedalKind = 'red' | 'blue' | 'yellow'
export const MEDAL_KINDS: MedalKind[] = ['red', 'blue', 'yellow']

/** Disc colour, ribbon (darker) and glow per medal. */
export const MEDAL_COLORS: Record<MedalKind, { disc: string; ribbon: string; glow: string }> = {
  red: { disc: '#ff3d5a', ribbon: '#9c1028', glow: '255,61,90' },
  blue: { disc: '#3da5ff', ribbon: '#174f9c', glow: '61,165,255' },
  yellow: { disc: '#ffe14d', ribbon: '#a8820c', glow: '255,225,77' },
}

const medal = (k: MedalKind): Pattern => ({
  palette: { b: MEDAL_COLORS[k].ribbon, g: MEDAL_COLORS[k].disc, w: '#ffffff' },
  rows: ['bb...bb', '.bb.bb.', '..bbb..', '..ggg..', '.gwggg.', '.gwggg.', '.ggggg.', '..ggg..'],
})

/** Shot power-up medals. */
export const MEDALS: Record<MedalKind, Pattern> = { red: medal('red'), blue: medal('blue'), yellow: medal('yellow') }

const grayCache = new WeakMap<Pattern, Pattern>()
/** Same pattern in greyscale (used for harmless, shot-down food). */
export function grayPattern(p: Pattern): Pattern {
  const hit = grayCache.get(p)
  if (hit) return hit
  const palette: Record<string, string> = {}
  for (const [k, hex] of Object.entries(p.palette)) {
    const n = parseInt(hex.slice(1), 16)
    const l = Math.round(0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255))
    const g = l.toString(16).padStart(2, '0')
    palette[k] = `#${g}${g}${g}`
  }
  const gray = { rows: p.rows, palette }
  grayCache.set(p, gray)
  return gray
}

/** Pads a pattern by 1 and draws a dark 1px outline around it (readability on the busy floor). */
export function outlined(p: Pattern, color = '#160c18'): Pattern {
  const w = Math.max(...p.rows.map((r) => r.length)) + 2
  const grid = [Array(w).fill('.'), ...p.rows.map((r) => ['.', ...r.padEnd(w - 2, '.'), '.']), Array(w).fill('.')]
  const filled = (x: number, y: number) => grid[y]?.[x] !== undefined && grid[y][x] !== '.' && grid[y][x] !== '~'
  const out = grid.map((row, y) => row.map((c, x) => (c === '.' && (filled(x + 1, y) || filled(x - 1, y) || filled(x, y + 1) || filled(x, y - 1)) ? '~' : c)))
  return { palette: { ...p.palette, '~': color }, rows: out.map((r) => r.join('')) }
}

/** Where a character's legs are in its sprite: the bottom `rows`, columns [from, split) and [split, to). */
export type Legs = { rows: number; from: number; split: number; to: number }

const walkCache = new WeakMap<Pattern, [Pattern, Pattern]>()
/**
 * Two-frame walk cycle derived from a standing sprite: each frame lifts one leg by a pixel.
 * Cheap, but enough to make everybody look like they are actually walking.
 */
export function walkFrames(p: Pattern, legs: Legs): [Pattern, Pattern] {
  const hit = walkCache.get(p)
  if (hit) return hit
  const h = p.rows.length
  const w = Math.max(...p.rows.map((r) => r.length))
  const lift = (x0: number, x1: number): Pattern => {
    const grid = p.rows.map((r) => [...r.padEnd(w, '.')])
    for (let y = h - legs.rows; y < h; y++) for (let x = x0; x < x1; x++) grid[y][x] = y + 1 < h ? p.rows[y + 1][x] ?? '.' : '.'
    return { palette: p.palette, rows: grid.map((r) => r.join('')) }
  }
  const frames: [Pattern, Pattern] = [lift(legs.from, legs.split), lift(legs.split, legs.to)]
  walkCache.set(p, frames)
  return frames
}

const rasterCache = new WeakMap<Pattern, string>()
/** Pattern → PNG data URL (1 px per cell; palette colours may carry alpha). For DOM pixel art. */
export function patternDataURL(p: Pattern): string {
  const hit = rasterCache.get(p)
  if (hit) return hit
  const { w, h } = patternSize(p)
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const g = c.getContext('2d')!
  const img = g.createImageData(w, h)
  p.rows.forEach((row, y) =>
    [...row].forEach((ch, x) => {
      const hex = p.palette[ch]
      if (!hex) return
      const n = (i: number) => parseInt(hex.slice(i, i + 2), 16)
      img.data.set([n(1), n(3), n(5), hex.length > 7 ? n(7) : 255], (y * w + x) * 4)
    }),
  )
  g.putImageData(img, 0, 0)
  const url = c.toDataURL()
  rasterCache.set(p, url)
  return url
}
