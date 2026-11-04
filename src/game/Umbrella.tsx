import { useFrame } from '@react-three/fiber'
import { BallCollider, RigidBody, type RapierRigidBody } from '@react-three/rapier'
import { useRef } from 'react'
import type * as THREE from 'three'
import { patternSize, UMBRELLA } from '../voxel/patterns'
import { Voxel } from '../voxel/Voxel'
import { GROUPS } from './config'
import { field, playerState, useGame } from './store'

export const UMBRELLA_VOXEL = 0.1
const { h } = patternSize(UMBRELLA)
const HEIGHT = h * UMBRELLA_VOXEL
/** Centre of the umbrella sprite above the saucer. */
const OFFSET_Y = 0.55 + HEIGHT / 2
/** Big ball under the canopy: food bounces off at an angle depending on where it hits. */
const RADIUS = 1.05
const BALL_Y = OFFSET_Y + HEIGHT / 2 - RADIUS

/** Follows the saucer while open (swipe up). */
export function Umbrella() {
  const body = useRef<RapierRigidBody>(null)
  const visual = useRef<THREE.Group>(null)
  const openedAt = useRef(performance.now())

  useFrame(() => {
    const b = body.current
    if (b) b.setNextKinematicTranslation({ x: playerState.x, y: field.playerY, z: 0 })
    const v = visual.current
    if (v) {
      // quick 8-bit style "pop" open
      const k = Math.min(1, (performance.now() - openedAt.current) / 140)
      v.scale.set(Math.max(0.15, Math.round(k * 4) / 4), 1, 1)
    }
  })

  return (
    <RigidBody
      ref={body}
      type="kinematicPosition"
      position={[playerState.x, field.playerY, 0]}
      colliders={false}
      userData={{ kind: 'umbrella' }}
    >
      <BallCollider args={[RADIUS]} position={[0, BALL_Y, 0]} restitution={1} collisionGroups={GROUPS.umbrella} />
      <group ref={visual} position={[0, OFFSET_Y, 0.2]}>
        <Voxel pattern={UMBRELLA} size={UMBRELLA_VOXEL} depth={2} />
      </group>
    </RigidBody>
  )
}

export function UmbrellaSlot() {
  const open = useGame((s) => s.umbrellaOpen)
  return open ? <Umbrella /> : null
}
