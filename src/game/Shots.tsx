import { useFrame } from '@react-three/fiber'
import { CuboidCollider, RigidBody, type RapierRigidBody } from '@react-three/rapier'
import { useMemo, useRef } from 'react'
import { FOOD, LASER, patternSize } from '../voxel/patterns'
import { Voxel } from '../voxel/Voxel'
import { FOOD_VOXEL, GROUPS, PLAYER_SHOT_SPEED } from './config'
import { field, useGame, type FoodShot, type Shot } from './store'

function PlayerShot({ s }: { s: Shot }) {
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
      linearVelocity={[0, PLAYER_SHOT_SPEED, 0]}
      lockRotations
      colliders={false}
      ccd
      userData={{ kind: 'playerShot', id: s.id }}
    >
      <CuboidCollider args={[0.1, 0.25, 0.3]} sensor mass={0.05} collisionGroups={GROUPS.playerShot} />
      <Voxel pattern={LASER} size={0.13} depth={1} basic />
    </RigidBody>
  )
}

function EnemyShot({ s }: { s: FoodShot }) {
  const body = useRef<RapierRigidBody>(null)
  const remove = useGame((st) => st.removeEnemyShot)
  const pattern = FOOD[s.kind]
  const { w, h } = patternSize(pattern)
  const spin = useMemo(() => (Math.random() < 0.5 ? -1 : 1) * (2 + Math.random() * 3), [])
  useFrame(() => {
    const b = body.current
    if (b && b.translation().y < -field.halfH - 1) remove(s.id)
  })
  return (
    <RigidBody
      ref={body}
      type="dynamic"
      position={[s.x, s.y, 0]}
      gravityScale={0}
      linearVelocity={[0, -s.speed, 0]}
      angularVelocity={[0, spin, 0]}
      enabledRotations={[false, true, false]}
      colliders={false}
      userData={{ kind: 'enemyShot', id: s.id }}
    >
      <CuboidCollider
        args={[(w * FOOD_VOXEL) / 2.4, (h * FOOD_VOXEL) / 2.4, 0.3]}
        sensor
        mass={0.05}
        collisionGroups={GROUPS.enemyShot}
      />
      <Voxel pattern={pattern} size={FOOD_VOXEL} depth={3} />
    </RigidBody>
  )
}

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
