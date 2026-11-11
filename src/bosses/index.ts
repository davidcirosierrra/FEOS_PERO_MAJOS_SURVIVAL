/**
 * The six bosses, one every `BOSS_EVERY` levels. Beating the last one wins the game.
 *
 * A boss is data: its art (parts that break off as it loses health), how it moves, the light stuff
 * it throws (can be shot down / bounced off the umbrella) and its heavy projectile (indestructible,
 * forks only push it). `src/game/Boss.tsx` runs any `BossDef`.
 */
import { BAR_GRID, BAR_PARTS } from '../voxel/bar'
import { BOSS_ART, BOSS_SHOTS, type BossPart } from '../voxel/bosses.gen'
import type { Pattern } from '../voxel/patterns'
import * as G from '../voxel/sprites.gen'
import { PIZZA } from '../voxel/theme'

/**
 * single – one shot straight down · spread – a fan of `count` · aimed – one at the player ·
 * burst – three aimed in quick succession · rain – `count` across the whole street
 */
export type FirePattern = 'single' | 'spread' | 'aimed' | 'burst' | 'rain'
/**
 * sway – side to side · dash – waits on one side, then shoots across · chase – follows the player ·
 * bounce – sways while hopping to the beat · hop – jumps between three lanes · eight – figure of 8
 */
export type MoveKind = 'sway' | 'dash' | 'chase' | 'bounce' | 'hop' | 'eight'

export type BossDef = {
  id: string
  /** Name on the health bar and the intro card. */
  name: string
  /** Second line of the intro card. */
  intro: string
  grid: { w: number; h: number }
  /** In break-off order; the last one is the core. */
  parts: BossPart[]
  /** World size of one sprite pixel. */
  voxel: number
  hp: number
  /** Score for beating it. */
  bonus: number
  move: MoveKind
  /** Movement speed factor. */
  speed: number
  light: { kind: string; sprite: Pattern; patterns: FirePattern[]; every: [number, number]; speed: number; count?: number }
  heavy: { sprite: Pattern; size: number; every: [number, number]; speed: number }
  /** Explosion colours. */
  colors: string[]
}

const art = (id: string) => ({ grid: BOSS_ART[id].grid, parts: BOSS_ART[id].parts })

export const BOSSES: BossDef[] = [
  {
    id: 'felipe',
    name: 'FELIPE TABERNA',
    intro: 'AZKEN TXANDA!',
    grid: BAR_GRID,
    parts: BAR_PARTS,
    voxel: 0.1,
    hp: 40,
    bonus: 5000,
    move: 'sway',
    speed: 0.55,
    light: { kind: 'burger', sprite: G.BURGER, patterns: ['single'], every: [0.7, 1.3], speed: 5.4 },
    heavy: { sprite: PIZZA, size: 0.11, every: [4.5, 6.5], speed: 2.8 },
    colors: ['#2e8b57', '#ffd23d', '#f4f4f2', '#c9b48a'],
  },
  {
    id: 'van',
    name: 'FURGONETA',
    intro: 'FRENORIK GABE!',
    ...art('van'),
    voxel: 0.1,
    hp: 55,
    bonus: 7500,
    move: 'dash',
    speed: 0.5,
    light: { kind: 'wrench', sprite: BOSS_SHOTS.wrench, patterns: ['single', 'aimed'], every: [0.6, 1.1], speed: 6 },
    heavy: { sprite: BOSS_SHOTS.wheel, size: 0.11, every: [3.8, 5.5], speed: 3.2 },
    colors: ['#ff7eb6', '#f4ecd8', '#c9ccd2', '#8fd3e8'],
  },
  {
    id: 'bouncer',
    name: 'SEGURATA',
    intro: 'ZERRENDAN ZAUDE?',
    ...art('bouncer'),
    voxel: 0.1,
    hp: 70,
    bonus: 10000,
    move: 'chase',
    speed: 1.5,
    light: { kind: 'torch', sprite: BOSS_SHOTS.torch, patterns: ['aimed', 'aimed', 'spread'], every: [0.6, 1.0], speed: 6.4, count: 3 },
    heavy: { sprite: BOSS_SHOTS.barrier, size: 0.1, every: [3.4, 5], speed: 3.4 },
    colors: ['#1c1a22', '#ffd23d', '#d9a37a', '#ff3d5a'],
  },
  {
    id: 'speakers',
    name: 'BAFLE DORREA',
    intro: 'BOLUMENA 11-RA!',
    ...art('speakers'),
    voxel: 0.1,
    hp: 85,
    bonus: 12500,
    move: 'bounce',
    speed: 0.7,
    light: { kind: 'note', sprite: BOSS_SHOTS.note, patterns: ['spread', 'single', 'spread', 'rain'], every: [0.7, 1.1], speed: 6.2, count: 3 },
    heavy: { sprite: BOSS_SHOTS.bass, size: 0.11, every: [3, 4.5], speed: 3.6 },
    colors: ['#ff7eb6', '#5ef6ff', '#ffe14d', '#26232c'],
  },
  {
    id: 'manager',
    name: 'MANAGERRA',
    intro: 'SINATU HEMEN!',
    ...art('manager'),
    voxel: 0.1,
    hp: 100,
    bonus: 15000,
    move: 'hop',
    speed: 1,
    light: { kind: 'contract', sprite: BOSS_SHOTS.contract, patterns: ['spread', 'burst', 'spread', 'aimed'], every: [0.6, 1.0], speed: 6.6, count: 4 },
    heavy: { sprite: BOSS_SHOTS.briefcase, size: 0.105, every: [2.8, 4.2], speed: 3.8 },
    colors: ['#6a3f9a', '#ffd23d', '#ff7eb6', '#5be35b'],
  },
  {
    id: 'paja',
    name: 'LA PAJA',
    intro: 'AZKEN BURUZAGIA',
    ...art('paja'),
    voxel: 0.088,
    hp: 130,
    bonus: 25000,
    move: 'eight',
    speed: 0.75,
    light: { kind: 'straw', sprite: BOSS_SHOTS.straw, patterns: ['rain', 'spread', 'burst', 'rain', 'aimed'], every: [0.55, 0.95], speed: 6.8, count: 5 },
    heavy: { sprite: BOSS_SHOTS.bale, size: 0.105, every: [2.6, 3.8], speed: 4 },
    colors: ['#e8c24a', '#fff0a0', '#c79a2a', '#e0283c', '#ffd23d'],
  },
]

/** Below this share of its health a boss gets angry: it fires and moves faster. */
export const ENRAGE_AT = 0.35
