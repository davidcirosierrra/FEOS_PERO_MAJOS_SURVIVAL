/**
 * "Feos pero majos" theme: the band walking to the stage through a crowd of fans.
 * All sprites are pixel patterns ('.' = empty).
 */
import { outlined, type MedalKind, type Pattern } from './patterns'
import * as G from './sprites.gen'

const BASSIST = G.BASSIST
const PIG = G.PIG

export type CharacterId = 'bassist' | 'pig'

const crop = (p: Pattern, r0: number, r1: number, c0: number, c1: number): Pattern => ({
  palette: p.palette,
  rows: p.rows.slice(r0, r1).map((r) => r.slice(c0, c1)),
})

/**
 * Characters you can currently pick. The bass player is kept (sprite, rifle, scream) but parked:
 * add 'bassist' back here to bring the character select back.
 */
export const PLAYABLE: CharacterId[] = ['pig']

export const CHARACTERS: Record<CharacterId, { name: string; pattern: Pattern; head: Pattern }> = {
  bassist: { name: 'BAXU-JOTZAILEA', pattern: BASSIST, head: crop(BASSIST, 0, 20, 5, 19) },
  pig: { name: 'TXERRIA', pattern: PIG, head: crop(PIG, 0, 14, 3, 19) },
}

/** Fans walking towards the band (front view). */
export const FANS: Pattern[] = [G.FAN_METAL, G.FAN_BANDTEE, G.FAN_TOURIST, G.FAN_PUNK]

/** What fans throw at the band. `burger` is reserved for the bar boss. */
export const THROWN: Record<string, Pattern> = { lighter: G.LIGHTER, cd: G.CD, wine: G.WINE, burger: G.BURGER }
export const FAN_THROWS = ['lighter', 'cd', 'wine']

/** Pink fork bullets. */
export const FORK: Pattern = G.FORK

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

/**
 * Bilbao floor tile (the grey cement "flor de Bilbao"): central circle, four rounded petals and
 * corner arcs that join up with the neighbouring tiles. g = groove, l = light lip (relief), . = cement.
 * Designed in scripts/sprites/tile.py.
 */
const BILBAO_TILE = [
  'gggggggggggggggggggggggggggggggg',
  'gllggllllllllllllllllllllllgglll',
  'glggll.......gggggg.........gg..',
  'gggll.......ggllllgg.........gg.',
  'ggll........gll....gl.........gg',
  'gll........ggl.....gg..........l',
  'gl.........gll......gl..........',
  'gl.........gl.......gl..........',
  'gl.........gl.......gl..........',
  'gl.........gg......ggl..........',
  'gl..........gl.....gll..........',
  'gl...ggggg..gg....ggl.ggggg.....',
  'gl.ggglllggg.gggggglggglllggg...',
  'glgglll...lgggggggggglll...lgg..',
  'glgll.......ggllllggll.......gl.',
  'glgl........ggl...ggl........gl.',
  'glgl........ggl...ggl........gg.',
  'glgl........ggl...ggl........gll',
  'glgg.......gggggggggg.......ggl.',
  'gl.ggg...ggglgggggglggg...gggll.',
  'gl..lgggggllggllllgg.lggggglll..',
  'gl....lllll.gll....gl..lllll....',
  'gl.........ggl.....gg...........',
  'gl.........gll......gl..........',
  'gl.........gl.......gl..........',
  'gl.........gl.......gl..........',
  'gl.........gg......ggl..........',
  'gg..........gl.....gll........gg',
  'ggg.........gg....ggl........ggl',
  'glgg.........ggggggll.......ggll',
  'gl.gg.........llglll.......ggll.',
  'gl..gl...........l.........gll..',
]

export function bilbaoTileCanvas() {
  const px = BILBAO_TILE.length
  const c = document.createElement('canvas')
  c.width = c.height = px
  const g = c.getContext('2d')!
  const img = g.createImageData(px, px)
  const COL: Record<string, number[]> = { g: [92, 95, 101], l: [186, 189, 194], '.': [152, 155, 160] }
  let seed = 42
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
  for (let y = 0; y < px; y++)
    for (let x = 0; x < px; x++) {
      const ch = BILBAO_TILE[y][x]
      const n = ch === '.' ? (rnd() - 0.5) * 12 : 0 // cement speckle
      img.data.set([...COL[ch].map((v) => Math.max(0, Math.min(255, v + n))), 255], (y * px + x) * 4)
    }
  g.putImageData(img, 0, 0)
  return c
}
