import { useFrame } from '@react-three/fiber'
import { CuboidCollider, RigidBody, type RapierRigidBody } from '@react-three/rapier'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { BANANA } from '../voxel/patterns'
import { Voxel } from '../voxel/Voxel'
import { BANANA_EVERY_MS, BANANA_SPEED, GROUPS } from './config'
import { field, useGame, type Shot } from './store'

const SIZE = 0.12

/** Soft round glow texture, generated once. */
let glowTex: THREE.Texture | null = null
function glowTexture() {
  if (glowTex) return glowTex
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const g = c.getContext('2d')!
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32)
  grd.addColorStop(0, 'rgba(255,245,160,1)')
  grd.addColorStop(0.35, 'rgba(255,225,77,0.55)')
  grd.addColorStop(1, 'rgba(255,225,77,0)')
  g.fillStyle = grd
  g.fillRect(0, 0, 64, 64)
  glowTex = new THREE.CanvasTexture(c)
  return glowTex
}

function Banana({ b }: { b: Shot }) {
  const body = useRef<RapierRigidBody>(null)
  const fruit = useRef<THREE.Group>(null)
  const ring = useRef<THREE.Mesh>(null)
  const glow = useRef<THREE.Sprite>(null)
  const remove = useGame((s) => s.removeBanana)
  const catchBanana = useGame((s) => s.catchBanana)
  const tex = useMemo(glowTexture, [])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const p = body.current?.translation()
    if (p && p.y < -field.halfH - 1.5) remove(b.id)
    if (fruit.current) {
      fruit.current.rotation.y = t * 1.8
      fruit.current.position.y = Math.sin(t * 3) * 0.08
    }
    if (ring.current) {
      // Ring orbits on a tilted, wobbling axis.
      ring.current.rotation.set(0.9 + Math.sin(t * 1.3) * 0.35, t * 3, 0.5)
    }
    if (glow.current) {
      const s = 2.1 + Math.sin(t * 6) * 0.25
      glow.current.scale.set(s, s, 1)
    }
  })

  return (
    <RigidBody
      ref={body}
      type="dynamic"
      position={[b.x, b.y, 0]}
      gravityScale={0}
      linearVelocity={[0, -BANANA_SPEED, 0]}
      lockRotations
      colliders={false}
      userData={{ kind: 'banana', id: b.id }}
      onIntersectionEnter={({ other }) => {
        if (other.rigidBodyObject?.userData?.kind === 'player') catchBanana(b.id)
      }}
    >
      <CuboidCollider args={[0.65, 0.5, 0.4]} sensor mass={0.05} collisionGroups={GROUPS.powerup} />
      <sprite ref={glow} position={[0, 0, -0.3]}>
        <spriteMaterial map={tex} blending={THREE.AdditiveBlending} depthWrite={false} transparent />
      </sprite>
      <group ref={fruit}>
        <Voxel pattern={BANANA} size={SIZE} depth={3} basic />
      </group>
      <mesh ref={ring}>
        <torusGeometry args={[0.85, 0.05, 4, 20]} />
        <meshBasicMaterial color="#fff59d" />
      </mesh>
    </RigidBody>
  )
}

export function Bananas() {
  const bananas = useGame((s) => s.bananas)
  return bananas.map((b) => <Banana key={b.id} b={b} />)
}

/** Drops a banana every 15–22 s while playing. */
export function BananaDropper() {
  const runId = useGame((s) => s.runId)
  const gameOver = useGame((s) => s.gameOver)
  useEffect(() => {
    if (gameOver) return
    let t: ReturnType<typeof setTimeout>
    const schedule = () => {
      const [a, z] = BANANA_EVERY_MS
      t = setTimeout(() => {
        if (!document.hidden) useGame.getState().spawnBanana()
        schedule()
      }, a + Math.random() * (z - a))
    }
    schedule()
    return () => clearTimeout(t)
  }, [runId, gameOver])
  return null
}
