import { useFrame } from '@react-three/fiber'
import { CuboidCollider, RigidBody, type RapierRigidBody } from '@react-three/rapier'
import { memo, useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { BANANA, MEDAL_COLORS, MEDALS, type Pattern } from '../voxel/patterns'
import { Voxel } from '../voxel/Voxel'
import { BANANA_EVERY_MS, GROUPS, MEDAL_EVERY_MS } from './config'
import { field, nextMedal, useGame, type Pickup as PickupT, type PickupKind } from './store'

const LOOK: Record<PickupKind, { pattern: Pattern; size: number; glow: string; ring: string }> = {
  banana: { pattern: BANANA, size: 0.12, glow: '255,225,77', ring: '#fff59d' },
  red: { pattern: MEDALS.red, size: 0.12, glow: MEDAL_COLORS.red.glow, ring: '#ffd1d8' },
  blue: { pattern: MEDALS.blue, size: 0.12, glow: MEDAL_COLORS.blue.glow, ring: '#cfe8ff' },
  yellow: { pattern: MEDALS.yellow, size: 0.12, glow: MEDAL_COLORS.yellow.glow, ring: '#fff59d' },
}

/** Soft round glow texture per colour, generated once. */
const glowCache = new Map<string, THREE.Texture>()
function glowTexture(rgb: string) {
  const hit = glowCache.get(rgb)
  if (hit) return hit
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const g = c.getContext('2d')!
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32)
  grd.addColorStop(0, 'rgba(255,255,230,1)')
  grd.addColorStop(0.35, `rgba(${rgb},0.55)`)
  grd.addColorStop(1, `rgba(${rgb},0)`)
  g.fillStyle = grd
  g.fillRect(0, 0, 64, 64)
  const tex = new THREE.CanvasTexture(c)
  glowCache.set(rgb, tex)
  return tex
}

/** Glowing falling power-up with a spinning ring (banana or shot medal). */
const Pickup = memo(function Pickup({ p }: { p: PickupT }) {
  const body = useRef<RapierRigidBody>(null)
  const item = useRef<THREE.Group>(null)
  const ring = useRef<THREE.Mesh>(null)
  const glow = useRef<THREE.Sprite>(null)
  const remove = useGame((s) => s.removePickup)
  const catchPickup = useGame((s) => s.catchPickup)
  const look = LOOK[p.kind]
  const tex = useMemo(() => glowTexture(look.glow), [look.glow])
  // Initial values only (stable so re-renders never re-apply them).
  const { spawn, vel } = useMemo(
    () => ({ spawn: [p.x, p.y, 0] as [number, number, number], vel: [0, -p.speed, 0] as [number, number, number] }),
    [p],
  )

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const pos = body.current?.translation()
    if (pos && pos.y < -field.halfH - 1.5) remove(p.id)
    if (item.current) {
      item.current.rotation.y = t * 1.8
      item.current.position.y = Math.sin(t * 3) * 0.08
    }
    // Ring orbits on a tilted, wobbling axis.
    ring.current?.rotation.set(0.9 + Math.sin(t * 1.3) * 0.35, t * 3, 0.5)
    if (glow.current) {
      const s = 2.1 + Math.sin(t * 6) * 0.25
      glow.current.scale.set(s, s, 1)
    }
  })

  return (
    <RigidBody
      ref={body}
      type="dynamic"
      position={spawn}
      gravityScale={0}
      linearVelocity={vel}
      lockRotations
      colliders={false}
      userData={{ kind: 'pickup', id: p.id }}
      onIntersectionEnter={({ other }) => {
        if (other.rigidBodyObject?.userData?.kind === 'player') catchPickup(p.id)
      }}
    >
      <CuboidCollider args={[0.65, 0.5, 0.4]} sensor mass={0.05} collisionGroups={GROUPS.powerup} />
      <sprite ref={glow} position={[0, 0, -0.3]}>
        <spriteMaterial map={tex} blending={THREE.AdditiveBlending} depthWrite={false} transparent />
      </sprite>
      <group ref={item}>
        <Voxel pattern={look.pattern} size={look.size} depth={3} basic />
      </group>
      <mesh ref={ring}>
        <torusGeometry args={[0.85, 0.05, 4, 20]} />
        <meshBasicMaterial color={look.ring} />
      </mesh>
    </RigidBody>
  )
})

export function Pickups() {
  const pickups = useGame((s) => s.pickups)
  return pickups.map((p) => <Pickup key={p.id} p={p} />)
}

/** Calls `drop` at random intervals within `range` while a run is active. */
function useRandomInterval(range: [number, number], drop: () => void) {
  const runId = useGame((s) => s.runId)
  const gameOver = useGame((s) => s.gameOver)
  useEffect(() => {
    if (gameOver) return
    let t: ReturnType<typeof setTimeout>
    const schedule = () => {
      const [a, z] = range
      t = setTimeout(() => {
        if (!document.hidden) drop()
        schedule()
      }, a + Math.random() * (z - a))
    }
    schedule()
    return () => clearTimeout(t)
  }, [runId, gameOver, range, drop])
}

const dropBanana = () => useGame.getState().spawnPickup('banana')
const dropMedal = () => {
  const s = useGame.getState()
  s.spawnPickup(nextMedal(s.medals))
}

/** Drops bananas (15–22 s) and shot medals (12–20 s) while playing. */
export function PickupDropper() {
  useRandomInterval(BANANA_EVERY_MS, dropBanana)
  useRandomInterval(MEDAL_EVERY_MS, dropMedal)
  return null
}
