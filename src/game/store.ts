import { create } from 'zustand'
import { loadHighScore, saveHighScore } from '../storage'
import { FOOD_KINDS } from '../voxel/patterns'
import {
  HITS_PER_LIFE,
  INVULN_MS,
  LIVES,
  RESPAWN_INVULN_MS,
  SCORE_PER_KILL,
  STAGES,
  wave as waveCfg,
} from './config'

export type Screen = 'home' | 'game'

export type Enemy = { id: number; slotX: number; slotY: number; phase: number; delay: number }
export type Shot = { id: number; x: number; y: number }
export type FoodShot = Shot & { kind: string; speed: number }
export type Explosion = { id: number; x: number; y: number; colors: string[]; big?: boolean }

/** Playfield half-size in world units, set by the game scene from the viewport. */
export const field = { halfW: 4, halfH: 8, playerY: -6 }
/** Live player position, written every frame by the player body. */
export const playerState = { x: 0 }

let nextId = 1
const id = () => nextId++

type State = {
  screen: Screen
  highScore: number
  score: number
  lives: number
  stage: number
  wave: number
  runId: number
  gameOver: boolean
  newRecord: boolean
  banner: string | null
  invulnUntil: number
  lastShot: number
  enemies: Enemy[]
  playerShots: Shot[]
  enemyShots: FoodShot[]
  explosions: Explosion[]

  setScreen: (s: Screen) => void
  startGame: () => void
  nextWave: () => void
  clearBanner: () => void
  firePlayer: () => void
  removePlayerShot: (id: number) => void
  enemyFire: (x: number, y: number) => void
  removeEnemyShot: (id: number) => void
  hitPlayer: (shotId: number) => void
  killEnemy: (enemyId: number, shotId: number, x: number, y: number) => void
  removeExplosion: (id: number) => void
}

const vibrate = (p: number | number[]) => {
  try {
    navigator.vibrate?.(p)
  } catch {
    /* noop */
  }
}

export const useGame = create<State>((set, get) => ({
  screen: 'home',
  highScore: loadHighScore(),
  score: 0,
  lives: LIVES,
  stage: 0,
  wave: 0,
  runId: 0,
  gameOver: false,
  newRecord: false,
  banner: null,
  invulnUntil: 0,
  lastShot: 0,
  enemies: [],
  playerShots: [],
  enemyShots: [],
  explosions: [],

  setScreen: (screen) => set({ screen }),

  startGame: () =>
    set((s) => ({
      screen: 'game',
      score: 0,
      lives: LIVES,
      stage: 0,
      wave: 0,
      runId: s.runId + 1,
      gameOver: false,
      newRecord: false,
      banner: null,
      invulnUntil: 0,
      lastShot: 0,
      enemies: [],
      playerShots: [],
      enemyShots: [],
      explosions: [],
    })),

  nextWave: () => {
    const n = get().wave + 1
    const { count } = waveCfg(n)
    const perRow = Math.min(count, 4)
    const rows = Math.ceil(count / perRow)
    const spanX = field.halfW * 1.4
    const top = field.halfH * 0.7
    const enemies: Enemy[] = []
    for (let i = 0; i < count; i++) {
      const row = Math.floor(i / perRow)
      const inRow = Math.min(perRow, count - row * perRow)
      const col = i % perRow
      const x = inRow === 1 ? 0 : -spanX / 2 + (spanX * col) / (inRow - 1)
      enemies.push({
        id: id(),
        slotX: x + (row % 2 ? 0.35 : -0.35),
        slotY: top - row * 2.5 + (rows > 2 ? 0.6 : 0),
        phase: Math.random() * Math.PI * 2,
        delay: i * 0.12,
      })
    }
    set({ wave: n, enemies, banner: `WAVE ${n}` })
  },

  clearBanner: () => set({ banner: null }),

  firePlayer: () => {
    const s = get()
    if (s.gameOver || s.screen !== 'game') return
    const now = performance.now()
    if (now - s.lastShot < STAGES[s.stage].fireCooldown) return
    set({ lastShot: now, playerShots: [...s.playerShots, { id: id(), x: playerState.x, y: field.playerY + 0.7 }] })
  },

  removePlayerShot: (sid) => set((s) => ({ playerShots: s.playerShots.filter((p) => p.id !== sid) })),

  enemyFire: (x, y) => {
    const s = get()
    const cfg = waveCfg(s.wave)
    if (s.gameOver || s.enemyShots.length >= cfg.maxEnemyShots) return
    const kind = FOOD_KINDS[Math.floor(Math.random() * FOOD_KINDS.length)]
    set({ enemyShots: [...s.enemyShots, { id: id(), x, y: y - 1.3, kind, speed: cfg.shotSpeed }] })
  },

  removeEnemyShot: (sid) => set((s) => ({ enemyShots: s.enemyShots.filter((p) => p.id !== sid) })),

  hitPlayer: (shotId) => {
    const s = get()
    if (!s.enemyShots.some((e) => e.id === shotId)) return
    const enemyShots = s.enemyShots.filter((e) => e.id !== shotId)
    const now = performance.now()
    if (s.gameOver || now < s.invulnUntil) return set({ enemyShots })

    const hits = s.stage + 1
    if (hits < HITS_PER_LIFE) {
      vibrate(80)
      return set({
        enemyShots,
        stage: hits,
        invulnUntil: now + INVULN_MS,
        explosions: [...s.explosions, { id: id(), x: playerState.x, y: field.playerY, colors: ['#ff8a3d', '#ffe14d'] }],
      })
    }

    // Third hit: lose a life.
    vibrate([120, 60, 200])
    const lives = s.lives - 1
    const explosions = [
      ...s.explosions,
      { id: id(), x: playerState.x, y: field.playerY, colors: ['#39ff6a', '#5ef6ff', '#fff35c'], big: true },
    ]
    if (lives > 0) {
      return set({ enemyShots: [], lives, stage: 0, invulnUntil: now + RESPAWN_INVULN_MS, explosions })
    }
    const newRecord = s.score > s.highScore
    if (newRecord) saveHighScore(s.score)
    set({
      enemyShots: [],
      lives: 0,
      stage: 0,
      explosions,
      gameOver: true,
      newRecord,
      highScore: Math.max(s.score, s.highScore),
    })
  },

  killEnemy: (enemyId, shotId, x, y) => {
    const s = get()
    if (!s.enemies.some((e) => e.id === enemyId) || !s.playerShots.some((p) => p.id === shotId)) return
    vibrate(25)
    set({
      enemies: s.enemies.filter((e) => e.id !== enemyId),
      playerShots: s.playerShots.filter((p) => p.id !== shotId),
      score: s.score + SCORE_PER_KILL * s.wave,
      explosions: [...s.explosions, { id: id(), x, y, colors: ['#f2f2f2', '#b8bcc8', '#ff9a2e', '#ffe14d'] }],
    })
  },

  removeExplosion: (eid) => set((s) => ({ explosions: s.explosions.filter((e) => e.id !== eid) })),
}))
