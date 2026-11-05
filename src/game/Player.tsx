import { useFrame } from '@react-three/fiber'
import { CuboidCollider, RigidBody, useBeforePhysicsStep, type RapierRigidBody } from '@react-three/rapier'
import { useEffect, useMemo, useRef } from 'react'
import type * as THREE from 'three'
import { readTilt } from '../input'
import { useSettings } from '../settings'
import { patternSize } from '../voxel/patterns'
import { CHARACTERS } from '../voxel/theme'
import { Voxel } from '../voxel/Voxel'
import { BASE_DAMPING, CHAR_VOXEL, GROUPS, STAGE_WIDTH, STAGES, THRUST } from './config'
import { jumpPose } from './jump'
import { field, playerState, useGame } from './store'

const PHYSICS_DT = 1 / 60
const X_ONLY: [boolean, boolean, boolean] = [true, false, false]

export function Player() {
  const body = useRef<RapierRigidBody>(null)
  const visual = useRef<THREE.Group>(null)
  const fat = useRef<THREE.Group>(null)
  const character = useSettings((s) => s.character)
  const stage = useGame((s) => s.stage)
  const lives = useGame((s) => s.lives)
  const hitPlayer = useGame((s) => s.hitPlayer)

  // Initial position only: stable reference so re-renders (hits, banana) never re-apply it.
  const spawn = useMemo(() => [0, field.playerY, 0] as [number, number, number], [])
  const pattern = CHARACTERS[character].pattern
  const { w, h } = patternSize(pattern)
  // Every hit makes the character fatter (wider and heavier).
  const halfW = (w * CHAR_VOXEL * STAGE_WIDTH[stage]) / 2
  const halfH = (h * CHAR_VOXEL) / 2
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
    const { invulnUntil, gameOver, jumpStart } = useGame.getState()
    const now = performance.now()
    const pose = jumpPose(now, jumpStart, p.x)
    // Walking: little bounce and sway; leans into the direction it's moving.
    const step = Math.sin(t * 9)
    if (pose) {
      v.position.set(pose.x, pose.y, pose.z)
      v.rotation.x = pose.flip
    } else {
      v.position.set(0, Math.abs(step) * 0.07, 0)
      v.rotation.x = 0
    }
    v.rotation.z = -vx * 0.03 + step * 0.04
    v.rotation.y = vx * 0.04
    // Ease into the new width after a hit / kalimotxo.
    const f = fat.current
    if (f) f.scale.x += (STAGE_WIDTH[stage] - f.scale.x) * 0.2

    // In first person we *are* the character: only the rifle is drawn (see CameraRig).
    v.visible = gameOver || useSettings.getState().camera === 'eyes' ? false : now > invulnUntil || Math.floor(now / 90) % 2 === 0
  })

  return (
    <RigidBody
      ref={body}
      type="dynamic"
      position={spawn}
      gravityScale={0}
      enabledTranslations={X_ONLY}
      lockRotations
      colliders={false}
      ccd
      userData={{ kind: 'player' }}
      onIntersectionEnter={({ other }) => {
        const ud = other.rigidBodyObject?.userData as { kind?: string; id?: number; deflected?: boolean } | undefined
        if (ud?.kind === 'enemyShot' && ud.id != null && !ud.deflected) hitPlayer(ud.id)
        if (ud?.kind === 'cookie' && ud.id != null) hitPlayer(ud.id, 'cookie')
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
        <group ref={fat}>
          <Voxel pattern={pattern} size={CHAR_VOXEL} depth={3} />
        </group>
      </group>
    </RigidBody>
  )
}

/** Invisible side walls the character bounces against. */
export function Walls() {
  const x = field.halfW + 0.5
  return (
    <RigidBody type="fixed" colliders={false}>
      <CuboidCollider args={[0.5, field.halfH * 2, 2]} position={[-x, 0, 0]} collisionGroups={GROUPS.wall} restitution={0.5} />
      <CuboidCollider args={[0.5, field.halfH * 2, 2]} position={[x, 0, 0]} collisionGroups={GROUPS.wall} restitution={0.5} />
    </RigidBody>
  )
}
