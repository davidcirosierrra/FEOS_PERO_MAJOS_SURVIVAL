import { useFrame } from '@react-three/fiber'
import { BallCollider, RigidBody, type RapierRigidBody } from '@react-three/rapier'
import { useRef } from 'react'
import type * as THREE from 'three'
import { patternSize, UMBRELLA } from '../voxel/patterns'
import { Voxel } from '../voxel/Voxel'
import { Stand, useEyes } from '../scene/View'
import { useSettings } from '../settings'
import { GROUPS } from './config'
import { jumpPose } from './jump'
import { field, playerState, useGame } from './store'

export const UMBRELLA_VOXEL = 0.1
const { h } = patternSize(UMBRELLA)
const HEIGHT = h * UMBRELLA_VOXEL
/** Centre of the umbrella sprite above the saucer. */
const OFFSET_Y = 1.05 + HEIGHT / 2
/** Big ball under the canopy: food bounces off at an angle depending on where it hits. */
const RADIUS = 1.1
const BALL_Y = OFFSET_Y + HEIGHT / 2 - RADIUS

/** Follows the saucer while open (swipe up). */
export function Umbrella() {
  const eyes = useEyes()
  const body = useRef<RapierRigidBody>(null)
  const visual = useRef<THREE.Group>(null)
  const pivot = useRef<THREE.Group>(null)
  const openedAt = useRef(performance.now())

  useFrame(() => {
    const b = body.current
    const now = performance.now()
    // Loop together with the saucer: same arc and flip around the ship's centre.
    const pose = useSettings.getState().camera === 'eyes' ? null : jumpPose(now, useGame.getState().jumpStart, playerState.x)
    if (pivot.current) {
      pivot.current.position.set(pose?.x ?? 0, pose?.y ?? 0, pose?.z ?? 0)
      pivot.current.rotation.x = pose?.flip ?? 0
    }
    if (b) {
      b.setNextKinematicTranslation({ x: playerState.x, y: field.playerY, z: 0 })
      // While looping it's up in the air with the ship: nothing to bounce off down here.
      if (b.isEnabled() === !!pose) b.setEnabled(!pose)
    }
    const v = visual.current
    if (v) {
      // quick 8-bit style "pop" open
      const k = Math.min(1, (now - openedAt.current) / 140)
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
      {/* First person: held out in front like a shield. */}
      {/* First person draws its own umbrella in front of the camera (see CameraRig). */}
      <group visible={!eyes}>
      <Stand height={0} lift={-0.9}>
      <group ref={pivot}>
        <group ref={visual} position={[0, OFFSET_Y, 0.2]}>
          <Voxel pattern={UMBRELLA} size={UMBRELLA_VOXEL} depth={2} />
        </group>
      </group>
      </Stand>
      </group>
    </RigidBody>
  )
}

export function UmbrellaSlot() {
  const open = useGame((s) => s.umbrellaOpen)
  return open ? <Umbrella /> : null
}
