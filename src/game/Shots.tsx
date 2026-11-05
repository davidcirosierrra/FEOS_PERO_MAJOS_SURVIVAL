import { useFrame } from '@react-three/fiber'
import { CuboidCollider, RigidBody, type RapierRigidBody } from '@react-three/rapier'
import { memo, useMemo, useRef } from 'react'
import { FOOD, LASER, patternSize } from '../voxel/patterns'
import { Voxel } from '../voxel/Voxel'
import { FOOD_VOXEL, GROUPS, PLAYER_SHOT_SPEED } from './config'
import { field, useGame, type FoodShot, type Shot } from './store'

// Velocity props are only meant as the *initial* velocity: keep them referentially stable (and the
// components memoised) so re-renders don't make @react-three/rapier re-apply them mid-flight.
const PLAYER_SHOT_VEL: [number, number, number] = [0, PLAYER_SHOT_SPEED, 0]

const PlayerShot = memo(function PlayerShot({ s }: { s: Shot }) {
  const body = useRef<RapierRigidBody>(null)
  const remove = useGame((st) => st.removePlayerShot)
  useFrame(() => {
    const b = body.current
    if (b && b.translation().y > field.halfH + 1) remove(s.id)
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
      <Voxel pattern={LASER} size={0.13} depth={1} basic />
    </RigidBody>
  )
})

/** Shot-down food falls along -z (away from the camera) at this speed and is removed past this depth. */
const FALL_SPEED = 14
const FALL_GONE_Z = 45

const EnemyShot = memo(function EnemyShot({ s }: { s: FoodShot }) {
  const body = useRef<RapierRigidBody>(null)
  const remove = useGame((st) => st.removeEnemyShot)
  const pattern = FOOD[s.kind]
  const { w, h } = patternSize(pattern)
  const { vel, angVel } = useMemo(() => {
    const spin = (Math.random() < 0.5 ? -1 : 1) * (2 + Math.random() * 3)
    return { vel: [0, -s.speed, 0] as [number, number, number], angVel: [0, spin, 0] as [number, number, number] }
  }, [s.speed])
  const deflect = useGame((st) => st.deflect)
  const shootFood = useGame((st) => st.shootFood)
  useFrame(() => {
    const b = body.current
    if (!b) return
    const p = b.translation()
    if (p.y < -field.halfH - 1 || p.y > field.halfH + 2 || Math.abs(p.x) > field.halfW + 2 || p.z < -FALL_GONE_Z) remove(s.id)
  })
  return (
    <RigidBody
      ref={body}
      type="dynamic"
      position={[s.x, s.y, 0]}
      gravityScale={0}
      linearVelocity={vel}
      angularVelocity={angVel}
      enabledRotations={[false, true, false]}
      colliders={false}
      userData={{ kind: 'enemyShot', id: s.id, deflected: false }}
      onIntersectionEnter={({ other, target }) => {
        const ud = target.rigidBodyObject?.userData as { deflected?: boolean; falling?: boolean } | undefined
        const shot = other.rigidBodyObject?.userData as { kind?: string; id?: number } | undefined
        const b = body.current
        if (!ud || ud.falling || !b || shot?.kind !== 'playerShot' || shot.id == null) return
        if (!shootFood(s.id, shot.id)) return
        // Shot down: harmless, no more collisions, tumbles away from the camera until it vanishes.
        ud.deflected = ud.falling = true
        for (let i = 0; i < b.numColliders(); i++) b.collider(i).setCollisionGroups(0)
        b.setGravityScale(0, true)
        const v = b.linvel()
        b.setLinvel({ x: v.x * 0.3 + (Math.random() - 0.5) * 2, y: v.y * 0.3 + 1.5, z: -FALL_SPEED }, true)
        b.setEnabledRotations(true, true, true, true)
        b.setAngvel({ x: (Math.random() - 0.5) * 16, y: (Math.random() - 0.5) * 16, z: (Math.random() - 0.5) * 16 }, true)
      }}
      onCollisionEnter={({ other, target }) => {
        const ud = target.rigidBodyObject?.userData as { deflected?: boolean } | undefined
        const b = body.current
        if (!ud || ud.deflected || !b || other.rigidBodyObject?.userData?.kind !== 'umbrella') return
        // Harmless from now on: fly off with gravity and a wild spin.
        ud.deflected = true
        b.setGravityScale(0.8, true)
        const v = b.linvel()
        b.setLinvel({ x: v.x + (b.translation().x - other.rigidBody!.translation().x) * 4 + (Math.random() - 0.5) * 3, y: Math.max(Math.abs(v.y), 6), z: 0 }, true)
        b.setEnabledRotations(true, true, true, true)
        b.setAngvel({ x: (Math.random() - 0.5) * 20, y: (Math.random() - 0.5) * 20, z: (Math.random() - 0.5) * 20 }, true)
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
      <Voxel pattern={pattern} size={FOOD_VOXEL} depth={3} />
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
