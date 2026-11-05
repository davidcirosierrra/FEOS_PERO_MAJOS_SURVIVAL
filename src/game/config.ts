/** Same bit layout as Rapier's `interactionGroups` (kept local so Rapier stays out of the main chunk). */
const bits = (g: number[]) => g.reduce((acc, i) => acc | (1 << i), 0)
const interactionGroups = (member: number, filter: number[]) => ((bits([member]) << 16) | bits(filter)) >>> 0

export const VOXEL = 0.15
export const SAUCER_VOXEL = 0.13
export const SHUTTLE_VOXEL = 0.11
export const FOOD_VOXEL = 0.11

export const LIVES = 3
/** Hits per life. Stage 0..2 are the ship getting fatter; the 3rd hit costs a life. */
export const HITS_PER_LIFE = 3

/** Per damage stage: heavier ship = slower top speed and more inertia; slower fire rate. */
export const STAGES = [
  { mass: 1, fireCooldown: 220 },
  { mass: 2, fireCooldown: 420 },
  { mass: 3.4, fireCooldown: 700 },
]
export const THRUST = 50
export const BASE_DAMPING = 4.5

export const PLAYER_SHOT_SPEED = 17
export const INVULN_MS = 1200
export const RESPAWN_INVULN_MS = 2200

export const wave = (n: number) => ({
  count: Math.min(3 + n, 12),
  fireRate: 0.22 + 0.06 * n, // shots per second per shuttle
  shotSpeed: Math.min(4 + 0.45 * n, 10),
  descent: Math.min(0.08 + 0.025 * n, 0.4), // units/s the formation creeps down
  sway: 0.6 + 0.08 * Math.min(n, 8),
  maxEnemyShots: 6 + n * 2,
})

export const SCORE_PER_KILL = 100
export const SCORE_PER_DEFLECT = 25
export const SCORE_PER_FOOD = 10

/** Umbrella (swipe up): open time and cooldown measured from opening. */
export const UMBRELLA_MS = 1400
export const UMBRELLA_COOLDOWN_MS = 2600

/** Loop jump (swipe up): dodge everything while flying towards the camera. */
export const JUMP_MS = 1100
/** Jump meter fills in this time; starts empty and resets on every jump. */
export const JUMP_CHARGE_MS = 10000
/** How far the saucer flies towards the camera at the top of the loop. */
export const JUMP_Z = 9

/** Banana power-up: falls every 15–22 s, slower than food; heals one hull point. */
export const BANANA_EVERY_MS: [number, number] = [15000, 22000]
export const BANANA_SPEED = 2.2
/** Points when caught with the hull already intact. */
export const SCORE_BANANA_FULL = 250

/**
 * Shot medals (falling power-ups, faster than food):
 *  red    – piercing: knocks food down and the laser carries on upwards at an angle
 *  blue   – two parallel lasers
 *  yellow – double fire rate
 * They stack. While holding medals, every 2 hits costs the most recently earned one.
 */
export const MEDAL_EVERY_MS: [number, number] = [12000, 20000]
export const MEDAL_SPEED_FACTOR = 1.5
export const HITS_PER_MEDAL_LOSS = 2
export const SCORE_MEDAL_DUP = 300
export const RED_DEFLECT_DEG: [number, number] = [20, 35]
export const BLUE_SPREAD = 0.24
export const YELLOW_COOLDOWN_FACTOR = 0.5

/** Ice-cream truck boss every 10 levels. */
export const BOSS_EVERY = 10
export const TRUCK_VOXEL = 0.11
export const boss = (level: number) => {
  const n = Math.max(1, Math.floor(level / BOSS_EVERY)) // 1st, 2nd… boss
  return {
    hp: 50 + 25 * (n - 1),
    coneEvery: [Math.max(0.35, 0.9 - 0.12 * n), Math.max(0.6, 1.5 - 0.15 * n)] as [number, number], // seconds
    cookieEvery: [Math.max(2.5, 5 - 0.5 * n), Math.max(4, 7 - 0.5 * n)] as [number, number],
    coneSpeed: Math.min(5 + 0.6 * n, 10),
    cookieSpeed: Math.min(2.6 + 0.3 * n, 5),
    sway: 0.45 + 0.08 * n, // horizontal speed factor
    bonus: 5000 * n,
  }
}
export const SCORE_PER_BOSS_HIT = 10
/** Lasers shove cookies around with this impulse. */
export const COOKIE_PUSH = 1.6

/** Collision groups. */
const G = { player: 0, playerShot: 1, enemy: 2, enemyShot: 3, wall: 4, debris: 5, foodSolid: 6, umbrella: 7, powerup: 8, cookie: 9 }
export const GROUPS = {
  player: interactionGroups(G.player, [G.enemyShot, G.wall, G.powerup]),
  playerShot: interactionGroups(G.playerShot, [G.enemy, G.foodSolid, G.cookie]),
  enemy: interactionGroups(G.enemy, [G.playerShot]),
  enemyShot: interactionGroups(G.enemyShot, [G.player]),
  wall: interactionGroups(G.wall, [G.player, G.debris, G.cookie]),
  debris: interactionGroups(G.debris, [G.wall]),
  /** Solid part of thrown food: bounces off the umbrella, can be shot down. */
  foodSolid: interactionGroups(G.foodSolid, [G.umbrella, G.playerShot]),
  umbrella: interactionGroups(G.umbrella, [G.foodSolid]),
  powerup: interactionGroups(G.powerup, [G.player]),
  /** Solid cookie body: bounces off the side walls, pushed by lasers (sensors). */
  cookie: interactionGroups(G.cookie, [G.wall, G.playerShot]),
}
