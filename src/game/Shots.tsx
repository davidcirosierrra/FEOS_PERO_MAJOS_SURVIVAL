import { useFrame } from '@react-three/fiber'
import { CuboidCollider, RigidBody, type RapierRigidBody } from '@react-three/rapier'
import { memo, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { grayPattern, patternSize, type Pattern } from '../voxel/patterns'
import { FORK, THROWN } from '../voxel/theme'
import { Shadow } from '../voxel/Sprite'
import { Voxel } from '../voxel/Voxel'
import { FLY_Z, Stand } from '../scene/View'
import { FOOD_VOXEL, GROUPS, PLAYER_SHOT_SPEED, RED_DEFLECT_DEG } from './config'
import { field, liveThreats, useGame, type FoodShot, type Shot } from './store'
import { useSettings } from '../settings'

// Velocity props are only meant as the *initial* velocity: keep them referentially stable (and the
// components memoised) so re-renders don't make @react-three/rapier re-apply them mid-flight.
const PLAYER_SHOT_VEL: [number, number, number] = [0, PLAYER_SHOT_SPEED, 0]

/** Vertical fade used as the fork's trail (pink at the head, nothing at the tail). */
const TRAIL = (() => {
  const c = document.createElement('canvas')
  c.width = 2
  c.height = 16
  const g = c.getContext('2d')!
  const grd = g.createLinearGradient(0, 0, 0, 16)
  grd.addColorStop(0, 'rgba(255,170,215,0.9)')
  grd.addColorStop(1, 'rgba(255,126,182,0)')
  g.fillStyle = grd
  g.fillRect(0, 0, 2, 16)
  const t = new THREE.CanvasTexture(c)
  t.magFilter = t.minFilter = THREE.NearestFilter
  return t
})()

const PlayerShot = memo(function PlayerShot({ s }: { s: Shot }) {
  const body = useRef<RapierRigidBody>(null)
  const remove = useGame((st) => st.removePlayerShot)
  useFrame(() => {
    const b = body.current
    const p = b?.translation()
    if (p && (p.y > field.halfH + 1 || Math.abs(p.x) > field.halfW + 1)) remove(s.id)
  })
  return (
    <RigidBody
      ref={body}
      type="dynamic"
      position={[s.x, s.y, 0]}
      gravityScale={0}
      linearVelocity={PLAYER_SHOT_VEL}
      lockRotations
      colliders={false}
      ccd
      userData={{ kind: 'playerShot', id: s.id }}
    >
      <CuboidCollider args={[0.1, 0.25, 0.3]} sensor mass={0.05} collisionGroups={GROUPS.playerShot} />
      <Stand height={0.5} lift={FLY_Z + 0.1}>
        <Voxel pattern={FORK} size={0.075} depth={1} basic />
        {/* Speed streak + glow: forks should feel fast. */}
        <mesh position={[0, -0.75, -0.05]}>
          <planeGeometry args={[0.16, 1]} />
          <meshBasicMaterial map={TRAIL} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
        <Shadow pattern={FORK} size={0.075} offset={0.12} />
      </Stand>
    </RigidBody>
  )
})

/**
 * Food sprite. Spinning and tumbling are purely visual (the body never rotates): in first person
 * the sprite is lifted off the ground inside the body, and a rotating body would swing it below
 * the pavement. Greys out and fades once it can't hurt you any more (shot down / deflected).
 */
function FoodLook({ pattern, markHarmless }: { pattern: Pattern; markHarmless: { current: () => void } }) {
  const [harmless, setHarmless] = useState(false)
  const spinner = useRef<THREE.Group>(null)
  const motion = useRef({ spin: (Math.random() < 0.5 ? -1 : 1) * (2 + Math.random() * 3), tumble: [0, 0, 0] })
  markHarmless.current = () => {
    motion.current.tumble = [0, 1, 2].map(() => (Math.random() - 0.5) * 18)
    setHarmless(true)
  }
  useFrame((_, dt) => {
    const g = spinner.current
    if (!g) return
    const { spin, tumble } = motion.current
    g.rotation.x += tumble[0] * dt
    g.rotation.y += (spin + tumble[1]) * dt
    g.rotation.z += tumble[2] * dt
  })
  return (
    <group ref={spinner}>
      <Voxel pattern={harmless ? grayPattern(pattern) : pattern} size={FOOD_VOXEL} depth={3} opacity={harmless ? 0.45 : 1} />
    </group>
  )
}

/** Shot-down food falls along -z (away from the camera) at this speed and is removed past this depth. */
const FALL_SPEED = 14
const FALL_GONE_Z = 45
const Z_AXIS = new THREE.Vector3(0, 0, 1)

const EnemyShot = memo(function EnemyShot({ s }: { s: FoodShot }) {
  const body = useRef<RapierRigidBody>(null)
  const remove = useGame((st) => st.removeEnemyShot)
  const pattern = THROWN[s.kind]
  const { w, h } = patternSize(pattern)
  const vel = useMemo(() => [s.vx ?? 0, -s.speed, 0] as [number, number, number], [s.vx, s.speed])
  const deflect = useGame((st) => st.deflect)
  const shootFood = useGame((st) => st.shootFood)
  // Turns grey/translucent once harmless. Kept in a child so the RigidBody itself never re-renders
  // (a re-render would make @react-three/rapier re-apply its props mid-flight).
  const markHarmless = useRef<() => void>(() => {})
  const harmlessRef = useRef(false)
  useFrame(() => {
    const b = body.current
    if (!b) return
    const p = b.translation()
    if (p.y < -field.halfH - 1 || p.y > field.halfH + 2 || Math.abs(p.x) > field.halfW + 2 || p.z < -FALL_GONE_Z) remove(s.id)
    liveThreats.set(s.id, { x: p.x, y: p.y, harmless: harmlessRef.current })
  })
  useEffect(() => () => void liveThreats.delete(s.id), [s.id])
  return (
    <RigidBody
      ref={body}
      type="dynamic"
      position={[s.x, s.y, 0]}
      gravityScale={0}
      linearVelocity={vel}
      lockRotations
      colliders={false}
      userData={{ kind: 'enemyShot', id: s.id, deflected: false }}
      onIntersectionEnter={({ other, target }) => {
        const ud = target.rigidBodyObject?.userData as { deflected?: boolean; falling?: boolean } | undefined
        const shot = other.rigidBodyObject?.userData as { kind?: string; id?: number } | undefined
        const b = body.current
        if (!ud || ud.falling || !b || shot?.kind !== 'playerShot' || shot.id == null) return
        const result = shootFood(s.id, shot.id)
        if (!result) return
        // Shot down: harmless and no more collisions from now on.
        ud.deflected = ud.falling = true
        harmlessRef.current = true
        markHarmless.current()
        for (let i = 0; i < b.numColliders(); i++) b.collider(i).setCollisionGroups(0)
        const v = b.linvel()
        if (result === 'hit') {
          // Plain laser: the food tumbles away from the camera until it vanishes.
          b.setGravityScale(0, true)
          // (first person: drops to the pavement more gently, it's right under your eyes)
          const fall = useSettings.getState().camera === 'eyes' ? 3 : FALL_SPEED
          b.setLinvel({ x: v.x * 0.3 + (Math.random() - 0.5) * 2, y: v.y * 0.3 + 1.5, z: -fall }, true)
          return
        }
        // Red medal: knocked straight down, and the laser carries on upwards at an angle.
        b.setGravityScale(1.5, true)
        b.setLinvel({ x: (Math.random() - 0.5) * 2, y: -Math.max(Math.abs(v.y), 6) - 3, z: 0 }, true)
        const laser = other.rigidBody
        if (laser) {
          const lp = laser.translation()
          const side = Math.sign(lp.x - b.translation().x) || (Math.random() < 0.5 ? -1 : 1)
          const [a0, a1] = RED_DEFLECT_DEG
          const a = (side * (a0 + Math.random() * (a1 - a0)) * Math.PI) / 180
          laser.setLinvel({ x: Math.sin(a) * PLAYER_SHOT_SPEED, y: Math.cos(a) * PLAYER_SHOT_SPEED, z: 0 }, true)
          laser.setRotation(new THREE.Quaternion().setFromAxisAngle(Z_AXIS, -a), true)
        }
      }}
      onCollisionEnter={({ other, target }) => {
        const ud = target.rigidBodyObject?.userData as { deflected?: boolean } | undefined
        const b = body.current
        if (!ud || ud.deflected || !b || other.rigidBodyObject?.userData?.kind !== 'umbrella') return
        // Harmless from now on: fly off with gravity and a wild spin.
        ud.deflected = true
        harmlessRef.current = true
        markHarmless.current()
        b.setGravityScale(0.8, true)
        const v = b.linvel()
        b.setLinvel({ x: v.x + (b.translation().x - other.rigidBody!.translation().x) * 4 + (Math.random() - 0.5) * 3, y: Math.max(Math.abs(v.y), 6), z: 0 }, true)
        deflect(s.id)
      }}
    >
      <CuboidCollider
        args={[(w * FOOD_VOXEL) / 2.4, (h * FOOD_VOXEL) / 2.4, 0.3]}
        sensor
        mass={0.05}
        collisionGroups={GROUPS.enemyShot}
      />
      <CuboidCollider
        args={[(w * FOOD_VOXEL) / 2.2, (h * FOOD_VOXEL) / 2.2, 0.3]}
        mass={0.05}
        restitution={1}
        friction={0}
        collisionGroups={GROUPS.foodSolid}
      />
      <Stand height={h * FOOD_VOXEL} lift={FLY_Z}>
        <FoodLook pattern={pattern} markHarmless={markHarmless} />
        <Shadow pattern={pattern} size={FOOD_VOXEL} offset={0.3} />
      </Stand>
    </RigidBody>
  )
})

export function Shots() {
  const playerShots = useGame((s) => s.playerShots)
  const enemyShots = useGame((s) => s.enemyShots)
  return (
    <>
      {playerShots.map((s) => (
        <PlayerShot key={s.id} s={s} />
      ))}
      {enemyShots.map((s) => (
        <EnemyShot key={s.id} s={s} />
      ))}
    </>
  )
}
