import { create } from 'zustand'
import { loadHighScore, saveHighScore } from '../storage'
import { FOOD_KINDS, MEDAL_KINDS, type MedalKind } from '../voxel/patterns'
import {
  HITS_PER_LIFE,
  INVULN_MS,
  LIVES,
  RESPAWN_INVULN_MS,
  BLUE_SPREAD,
  BOSS_EVERY,
  boss as bossCfg,
  SCORE_PER_BOSS_HIT,
  HITS_PER_MEDAL_LOSS,
  MEDAL_SPEED_FACTOR,
  SCORE_BANANA_FULL,
  SCORE_MEDAL_DUP,
  YELLOW_COOLDOWN_FACTOR,
  BANANA_SPEED,
  SCORE_PER_DEFLECT,
  SCORE_PER_FOOD,
  SCORE_PER_KILL,
  STAGES,
  JUMP_CHARGE_MS,
  JUMP_MS,
  UMBRELLA_COOLDOWN_MS,
  UMBRELLA_MS,
  wave as waveCfg,
} from './config'

export type Screen = 'home' | 'game'

export type Enemy = { id: number; slotX: number; slotY: number; phase: number; delay: number }
export type Shot = { id: number; x: number; y: number }
export type FoodShot = Shot & { kind: string; speed: number }
export type Boss = { id: number; hp: number; maxHp: number; level: number }
export type Cookie = Shot & { vx: number; speed: number }
export type PickupKind = 'banana' | MedalKind
export type Pickup = Shot & { kind: PickupKind; speed: number }
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
  umbrellaOpen: boolean
  umbrellaReadyAt: number
  jumpStart: number
  jumpReadyAt: number
  enemies: Enemy[]
  playerShots: Shot[]
  enemyShots: FoodShot[]
  explosions: Explosion[]
  pickups: Pickup[]
  boss: Boss | null
  cookies: Cookie[]
  /** Medals held, in the order they were earned. */
  medals: MedalKind[]
  /** Hits taken since the last medal was lost (only counts while holding medals). */
  medalHits: number

  setScreen: (s: Screen) => void
  startGame: () => void
  nextWave: () => void
  clearBanner: () => void
  firePlayer: () => void
  openUmbrella: () => void
  jump: () => void
  deflect: (shotId: number) => void
  /** Returns 'pierce' (red medal: the laser goes on), 'hit' (laser used up) or null. */
  shootFood: (foodId: number, shotId: number) => 'pierce' | 'hit' | null
  removePlayerShot: (id: number) => void
  enemyFire: (x: number, y: number) => void
  removeEnemyShot: (id: number) => void
  /** Food (`enemyShots`) or a boss cookie hit the player. */
  hitPlayer: (shotId: number, source?: 'food' | 'cookie') => void
  hitBoss: (shotId: number, x: number, y: number) => void
  bossFire: (x: number, y: number) => void
  cookieFire: (x: number, y: number) => void
  removeCookie: (id: number) => void
  pushCookie: (cookieId: number, shotId: number) => boolean
  killEnemy: (enemyId: number, shotId: number, x: number, y: number) => void
  removeExplosion: (id: number) => void
  spawnPickup: (kind: PickupKind) => void
  removePickup: (id: number) => void
  catchPickup: (id: number) => void
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
  umbrellaOpen: false,
  umbrellaReadyAt: 0,
  jumpStart: -Infinity,
  jumpReadyAt: Infinity,
  enemies: [],
  playerShots: [],
  enemyShots: [],
  explosions: [],
  pickups: [],
  medals: [],
  medalHits: 0,
  boss: null,
  cookies: [],

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
      umbrellaOpen: false,
      umbrellaReadyAt: 0,
      jumpStart: -Infinity,
      jumpReadyAt: performance.now() + JUMP_CHARGE_MS,
      enemies: [],
      playerShots: [],
      enemyShots: [],
      explosions: [],
      pickups: [],
      medals: [],
      medalHits: 0,
      boss: null,
      cookies: [],
    })),

  nextWave: () => {
    const n = get().wave + 1
    if (n % BOSS_EVERY === 0) {
      const hp = bossCfg(n).hp
      return set({ wave: n, enemies: [], boss: { id: id(), hp, maxHp: hp, level: n } })
    }
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
    set({ wave: n, enemies })
  },

  clearBanner: () => set({ banner: null }),

  firePlayer: () => {
    const s = get()
    if (s.gameOver || s.screen !== 'game') return
    const now = performance.now()
    const cooldown = STAGES[s.stage].fireCooldown * (s.medals.includes('yellow') ? YELLOW_COOLDOWN_FACTOR : 1)
    if (now - s.lastShot < cooldown) return
    const y = field.playerY + 0.7
    const shots = s.medals.includes('blue')
      ? [
          { id: id(), x: playerState.x - BLUE_SPREAD, y },
          { id: id(), x: playerState.x + BLUE_SPREAD, y },
        ]
      : [{ id: id(), x: playerState.x, y }]
    set({ lastShot: now, playerShots: [...s.playerShots, ...shots] })
  },

  openUmbrella: () => {
    const s = get()
    const now = performance.now()
    if (s.gameOver || s.screen !== 'game' || now < s.umbrellaReadyAt) return
    const run = s.runId
    vibrate(15)
    set({ umbrellaOpen: true, umbrellaReadyAt: now + UMBRELLA_COOLDOWN_MS })
    setTimeout(() => {
      if (get().runId === run) set({ umbrellaOpen: false })
    }, UMBRELLA_MS)
  },

  jump: () => {
    const s = get()
    const now = performance.now()
    if (s.gameOver || s.screen !== 'game' || now < s.jumpReadyAt) return
    vibrate(30)
    set({ jumpStart: now, jumpReadyAt: now + JUMP_CHARGE_MS })
  },

  /** Player laser hits food. The food stays in the list (it falls away in the scene). */
  shootFood: (foodId, shotId) => {
    const s = get()
    if (s.gameOver || !s.enemyShots.some((e) => e.id === foodId) || !s.playerShots.some((p) => p.id === shotId)) return null
    vibrate(10)
    const pierce = s.medals.includes('red')
    set({
      playerShots: pierce ? s.playerShots : s.playerShots.filter((p) => p.id !== shotId),
      score: s.score + SCORE_PER_FOOD * Math.max(1, s.wave),
    })
    return pierce ? 'pierce' : 'hit'
  },

  deflect: (sid) => {
    if (!get().enemyShots.some((e) => e.id === sid)) return
    vibrate(12)
    set((s) => ({ score: s.score + SCORE_PER_DEFLECT * Math.max(1, s.wave) }))
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

  hitPlayer: (shotId, source = 'food') => {
    const s = get()
    const list = source === 'food' ? s.enemyShots : s.cookies
    if (!list.some((e) => e.id === shotId)) return
    // Mid-loop everything just flies past underneath.
    if (isJumping()) return
    const removed =
      source === 'food' ? { enemyShots: s.enemyShots.filter((e) => e.id !== shotId) } : { cookies: s.cookies.filter((c) => c.id !== shotId) }
    const now = performance.now()
    if (s.gameOver || now < s.invulnUntil) return set(removed)

    // Every 2 hits while holding medals, the most recently earned one is lost.
    if (s.medals.length) {
      const medalHits = s.medalHits + 1
      if (medalHits >= HITS_PER_MEDAL_LOSS) {
        const lost = s.medals[s.medals.length - 1]
        set({ medals: s.medals.slice(0, -1), medalHits: 0, banner: `${lost.toUpperCase()} LOST` })
      } else set({ medalHits })
    }

    const hits = s.stage + 1
    if (hits < HITS_PER_LIFE) {
      vibrate(80)
      return set({
        ...removed,
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
      return set({ enemyShots: [], cookies: [], lives, stage: 0, invulnUntil: now + RESPAWN_INVULN_MS, explosions })
    }
    const newRecord = s.score > s.highScore
    if (newRecord) saveHighScore(s.score)
    set({
      enemyShots: [],
      cookies: [],
      lives: 0,
      stage: 0,
      explosions,
      gameOver: true,
      newRecord,
      highScore: Math.max(s.score, s.highScore),
    })
  },

  hitBoss: (shotId, x, y) => {
    const s = get()
    const b = s.boss
    if (s.gameOver || !b || b.hp <= 0 || !s.playerShots.some((p) => p.id === shotId)) return
    const hp = b.hp - 1
    const playerShots = s.playerShots.filter((p) => p.id !== shotId)
    const spark = { id: id(), x, y, colors: ['#ff7eb6', '#8fd3e8', '#ffffff'] }
    if (hp > 0) {
      return set({ playerShots, boss: { ...b, hp }, score: s.score + SCORE_PER_BOSS_HIT * s.wave, explosions: [...s.explosions, spark] })
    }
    // Defeated: big multi-colour blast, bonus, clear its projectiles.
    vibrate([60, 40, 60, 40, 200])
    const blast = [-1.5, 0, 1.5].map((dx, i) => ({
      id: id(),
      x: x + dx,
      y: y + (i === 1 ? 0.4 : 0),
      colors: ['#ff7eb6', '#8fd3e8', '#f4f4f2', '#ffe14d', '#d9963b'],
      big: true,
    }))
    const bonus = bossCfg(b.level).bonus
    set({
      playerShots,
      boss: null,
      cookies: [],
      enemyShots: s.enemyShots.filter((e) => e.kind !== 'cone'),
      score: s.score + SCORE_PER_BOSS_HIT * s.wave + bonus,
      banner: `BOSS +${bonus}`,
      explosions: [...s.explosions, ...blast],
    })
  },

  bossFire: (x, y) => {
    const s = get()
    if (s.gameOver || !s.boss) return
    set({ enemyShots: [...s.enemyShots, { id: id(), x, y, kind: 'cone', speed: bossCfg(s.boss.level).coneSpeed }] })
  },

  cookieFire: (x, y) => {
    const s = get()
    if (s.gameOver || !s.boss) return
    const speed = bossCfg(s.boss.level).cookieSpeed
    // Aim roughly at the player.
    const vx = Math.max(-2, Math.min(2, (playerState.x - x) * 0.25))
    set({ cookies: [...s.cookies, { id: id(), x, y, vx, speed }] })
  },

  removeCookie: (cid) => set((s) => ({ cookies: s.cookies.filter((c) => c.id !== cid) })),

  /** A laser hits a cookie: the laser is used up; the cookie only gets pushed (handled in the scene). */
  pushCookie: (cookieId, shotId) => {
    const s = get()
    if (s.gameOver || !s.cookies.some((c) => c.id === cookieId) || !s.playerShots.some((p) => p.id === shotId)) return false
    set({ playerShots: s.playerShots.filter((p) => p.id !== shotId) })
    return true
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

  spawnPickup: (kind) => {
    const s = get()
    if (s.gameOver || s.screen !== 'game') return
    const x = (Math.random() * 2 - 1) * (field.halfW - 0.8)
    const speed = kind === 'banana' ? BANANA_SPEED : waveCfg(Math.max(1, s.wave)).shotSpeed * MEDAL_SPEED_FACTOR
    set({ pickups: [...s.pickups, { id: id(), x, y: field.halfH + 1, kind, speed }] })
  },

  removePickup: (pid) => set((s) => ({ pickups: s.pickups.filter((p) => p.id !== pid) })),

  catchPickup: (pid) => {
    const s = get()
    const p = s.pickups.find((q) => q.id === pid)
    if (s.gameOver || !p) return
    vibrate([20, 40, 20])
    const pickups = s.pickups.filter((q) => q.id !== pid)
    const colors = p.kind === 'banana' ? ['#ffe14d', '#fff59d', '#ffffff'] : [MEDAL_SPARK[p.kind], '#ffffff']
    const explosions = [...s.explosions, { id: id(), x: playerState.x, y: field.playerY + 0.4, colors }]
    if (p.kind === 'banana') {
      if (s.stage > 0) return set({ pickups, explosions, stage: s.stage - 1, banner: 'HULL +1' })
      return set({ pickups, explosions, score: s.score + SCORE_BANANA_FULL, banner: `+${SCORE_BANANA_FULL}` })
    }
    if (s.medals.includes(p.kind)) {
      return set({ pickups, explosions, score: s.score + SCORE_MEDAL_DUP, banner: `+${SCORE_MEDAL_DUP}` })
    }
    set({ pickups, explosions, medals: [...s.medals, p.kind], banner: `${p.kind.toUpperCase()} MEDAL` })
  },

  removeExplosion: (eid) => set((s) => ({ explosions: s.explosions.filter((e) => e.id !== eid) })),
}))

const MEDAL_SPARK: Record<MedalKind, string> = { red: '#ff3d5a', blue: '#3da5ff', yellow: '#ffe14d' }

/** Medal to drop next: one the player doesn't have yet (any, if they have them all). */
export function nextMedal(owned: MedalKind[]): MedalKind {
  const missing = MEDAL_KINDS.filter((k) => !owned.includes(k))
  const pool = missing.length ? missing : MEDAL_KINDS
  return pool[Math.floor(Math.random() * pool.length)]
}

export const isJumping = (now = performance.now()) => now - useGame.getState().jumpStart < JUMP_MS
