import { useFrame } from '@react-three/fiber'
import { CuboidCollider, RigidBody, useBeforePhysicsStep, type RapierRigidBody } from '@react-three/rapier'
import { useEffect, useRef } from 'react'
import type * as THREE from 'three'
import { readTilt } from '../input'
import { ALIEN_STAGES, patternSize } from '../voxel/patterns'
import { Voxel } from '../voxel/Voxel'
import { BASE_DAMPING, GROUPS, STAGES, THRUST, VOXEL } from './config'
import { field, playerState, useGame } from './store'

const PHYSICS_DT = 1 / 60

export function Player() {
  const body = useRef<RapierRigidBody>(null)
  const visual = useRef<THREE.Group>(null)
  const stage = useGame((s) => s.stage)
  const lives = useGame((s) => s.lives)
  const hitPlayer = useGame((s) => s.hitPlayer)

  const pattern = ALIEN_STAGES[stage]
  const { w, h } = patternSize(pattern)
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
    const limit = field.halfW - (w * VOXEL) / 2
    if (Math.abs(p.x) > limit + 0.3) b.setTranslation({ x: Math.sign(p.x) * limit, y: p.y, z: 0 }, true)
    playerState.x = p.x

    const vx = b.linvel().x
    const t = state.clock.elapsedTime
    v.rotation.y = -vx * 0.07
    v.rotation.z = -vx * 0.025
    v.position.y = Math.sin(t * 3) * 0.06

    const { invulnUntil, gameOver } = useGame.getState()
    const now = performance.now()
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
        const ud = other.rigidBodyObject?.userData as { kind?: string; id?: number } | undefined
        if (ud?.kind === 'enemyShot' && ud.id != null) hitPlayer(ud.id)
      }}
    >
      <CuboidCollider
        args={[(w * VOXEL) / 2, (h * VOXEL) / 2, 0.3]}
        mass={mass}
        restitution={0.55}
        friction={0}
        collisionGroups={GROUPS.player}
      />
      <group ref={visual}>
        <Voxel pattern={pattern} size={VOXEL} depth={3} />
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
