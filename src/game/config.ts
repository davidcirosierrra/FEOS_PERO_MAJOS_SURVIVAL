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

/** Umbrella (swipe up): open time and cooldown measured from opening. */
export const UMBRELLA_MS = 1400
export const UMBRELLA_COOLDOWN_MS = 2600

/** Loop jump (swipe up): dodge everything while flying towards the camera. */
export const JUMP_MS = 1100
/** Jump meter fills in this time; starts empty and resets on every jump. */
export const JUMP_CHARGE_MS = 10000
/** How far the saucer flies towards the camera at the top of the loop. */
export const JUMP_Z = 9

/** Collision groups. */
const G = { player: 0, playerShot: 1, enemy: 2, enemyShot: 3, wall: 4, debris: 5, foodSolid: 6, umbrella: 7 }
export const GROUPS = {
  player: interactionGroups(G.player, [G.enemyShot, G.wall]),
  playerShot: interactionGroups(G.playerShot, [G.enemy]),
  enemy: interactionGroups(G.enemy, [G.playerShot]),
  enemyShot: interactionGroups(G.enemyShot, [G.player]),
  wall: interactionGroups(G.wall, [G.player, G.debris]),
  debris: interactionGroups(G.debris, [G.wall]),
  /** Solid part of thrown food: only bounces off the umbrella. */
  foodSolid: interactionGroups(G.foodSolid, [G.umbrella]),
  umbrella: interactionGroups(G.umbrella, [G.foodSolid]),
}
