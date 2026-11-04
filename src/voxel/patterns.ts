/**
 * Pixel-art patterns extruded into voxels.
 * Each row is a string; '.' (or space) means empty, any other char is looked up in the palette.
 */
export type Pattern = {
  rows: string[]
  palette: Record<string, string>
}

const alienPalette = {
  c: '#5ef6ff', // dome
  w: '#ffffff', // dome highlight
  g: '#39ff6a', // hull
  G: '#169c3c', // hull shadow
  y: '#fff35c', // lights
  o: '#ff8a3d', // dents / burns
  r: '#ff3d5a', // damage
}

/** Player ship, one pattern per damage stage (gets fatter with each hit). */
export const ALIEN_STAGES: Pattern[] = [
  {
    palette: alienPalette,
    rows: [
      '...ccccc...',
      '..cwccccc..',
      '.ggggggggg.',
      'gGgGgGgGgGg',
      '.ggggggggg.',
      '..y..y..y..',
    ],
  },
  {
    palette: alienPalette,
    rows: [
      '....ccccc....',
      '...cwccccc...',
      '.ggggggggggg.',
      'ggGggGggGggGg',
      'ggggoggggoggg',
      '.ggggggggggg.',
      '..y..y..y..y.',
    ],
  },
  {
    palette: alienPalette,
    rows: [
      '.....ccccc.....',
      '....cwccccc....',
      '..ggggggggggg..',
      '.ggoggggggoggg.',
      'gggGggGggGggGgg',
      'gggggrggggggrgg',
      'ggoggggggoggggg',
      '.ggggggggggggg.',
      '..y...y...y..y.',
    ],
  },
]

/** Life icon / menu button saucer (same family, bigger). */
export const ALIEN_ICON = ALIEN_STAGES[0]

/** Space shuttle seen from above, nose pointing down (towards the player). */
export const SHUTTLE: Pattern = {
  palette: {
    w: '#f2f2f2',
    s: '#b8bcc8',
    k: '#24242c',
    o: '#ff9a2e',
    y: '#ffe14d',
  },
  rows: [
    '..o.o.o..',
    '..y.y.y..',
    '..wwwww..',
    'k.wwwww.k',
    'kswwwwwsk',
    'ksswwwssk',
    '.ksswssk.',
    '..swwws..',
    '...www...',
    '...www...',
    '....k....',
  ],
}

/** Junk food the shuttles throw at you. */
export const FOOD: Record<string, Pattern> = {
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

export const FOOD_KINDS = Object.keys(FOOD)

export const LASER: Pattern = {
  palette: { g: '#b6ff3d', w: '#ffffff' },
  rows: ['w', 'g', 'g'],
}

export function patternSize(p: Pattern) {
  return { w: Math.max(...p.rows.map((r) => r.length)), h: p.rows.length }
}
