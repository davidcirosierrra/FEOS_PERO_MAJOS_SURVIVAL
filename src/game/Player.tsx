import { useFrame } from '@react-three/fiber'
import { CuboidCollider, RigidBody, useBeforePhysicsStep, type RapierRigidBody } from '@react-three/rapier'
import { useEffect, useRef } from 'react'
import type * as THREE from 'three'
import { readTilt } from '../input'
import { CAMERA_Z } from '../scene/PixelCanvas'
import { SAUCER_STAGES } from '../voxel/patterns'
import { latheSize, Saucer } from '../voxel/Voxel'
import { BASE_DAMPING, GROUPS, SAUCER_VOXEL, STAGES, THRUST } from './config'
import { jumpPose } from './jump'
import { field, playerState, useGame } from './store'

const PHYSICS_DT = 1 / 60

export function Player() {
  const body = useRef<RapierRigidBody>(null)
  const visual = useRef<THREE.Group>(null)
  const spin = useRef<THREE.Mesh>(null)
  const stage = useGame((s) => s.stage)
  const lives = useGame((s) => s.lives)
  const hitPlayer = useGame((s) => s.hitPlayer)

  const rows = SAUCER_STAGES[stage]
  const { halfW, halfH } = latheSize(rows, SAUCER_VOXEL)
  const { mass } = STAGES[stage]

  // Heavier ship: less damping → more inertia; with constant thrust its top speed drops too.
  useEffect(() => {
    body.current?.setLinearDamping(BASE_DAMPING / Math.sqrt(mass))
  }, [mass])

  // Back to the centre when a life is lost.
  useEffect(() => {
    const b = body.current
    if (!b) return
    b.setTranslation({ x: 0, y: field.playerY, z: 0 }, true)
    b.setLinvel({ x: 0, y: 0, z: 0 }, true)
  }, [lives])

  useBeforePhysicsStep(() => {
    const b = body.current
    if (!b || useGame.getState().gameOver) return
    b.applyImpulse({ x: readTilt() * THRUST * PHYSICS_DT, y: 0, z: 0 }, true)
  })

  useFrame((state) => {
    const b = body.current
    const v = visual.current
    if (!b || !v) return
    const p = b.translation()
    // Safety clamp in case something tunnels through a wall.
    const limit = field.halfW - halfW
    if (Math.abs(p.x) > limit + 0.3) b.setTranslation({ x: Math.sign(p.x) * limit, y: p.y, z: 0 }, true)
    playerState.x = p.x

    const vx = b.linvel().x
    const t = state.clock.elapsedTime
    // The camera looks down on the ship (~19°): tip it back so we see the side profile and dome.
    const { invulnUntil, gameOver, jumpStart } = useGame.getState()
    const now = performance.now()
    const tilt = -Math.atan2(-field.playerY, CAMERA_Z) + 0.1
    const pose = jumpPose(now, jumpStart, p.x)
    if (pose) {
      v.position.set(pose.x, pose.y, pose.z)
      v.rotation.x = tilt + pose.flip
    } else {
      v.position.set(0, Math.sin(t * 3) * 0.06, 0)
      v.rotation.x = tilt
    }
    v.rotation.z = -vx * 0.035
    spin.current?.rotateY(0.04 + Math.abs(vx) * 0.01)

    v.visible = gameOver ? false : now > invulnUntil || Math.floor(now / 90) % 2 === 0
  })

  return (
    <RigidBody
      ref={body}
      type="dynamic"
      position={[0, field.playerY, 0]}
      gravityScale={0}
      enabledTranslations={[true, false, false]}
      lockRotations
      colliders={false}
      ccd
      userData={{ kind: 'player' }}
      onIntersectionEnter={({ other }) => {
        const ud = other.rigidBodyObject?.userData as { kind?: string; id?: number; deflected?: boolean } | undefined
        if (ud?.kind === 'enemyShot' && ud.id != null && !ud.deflected) hitPlayer(ud.id)
      }}
    >
      <CuboidCollider
        args={[halfW, halfH, 0.3]}
        mass={mass}
        restitution={0.55}
        friction={0}
        collisionGroups={GROUPS.player}
      />
      <group ref={visual}>
        <Saucer ref={spin} rows={rows} size={SAUCER_VOXEL} />
      </group>
    </RigidBody>
  )
}

/** Invisible side walls the ship bounces against. */
export function Walls() {
  const x = field.halfW + 0.5
  return (
    <RigidBody type="fixed" colliders={false}>
      <CuboidCollider args={[0.5, field.halfH * 2, 2]} position={[-x, 0, 0]} collisionGroups={GROUPS.wall} restitution={0.5} />
      <CuboidCollider args={[0.5, field.halfH * 2, 2]} position={[x, 0, 0]} collisionGroups={GROUPS.wall} restitution={0.5} />
    </RigidBody>
  )
}
