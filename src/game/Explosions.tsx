import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { useFrame } from '@react-three/fiber'
import { memo, useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useSettings } from '../settings'
import { GROUPS } from './config'
import { useGame, type Explosion as ExplosionT } from './store'

const rand = (a: number, b: number) => a + Math.random() * (b - a)

/** Voxel debris thrown around by the physics engine. */
const Explosion = memo(function Explosion({ ex }: { ex: ExplosionT }) {
  const remove = useGame((s) => s.removeExplosion)
  const pieces = useMemo(
    () =>
      Array.from({ length: ex.big ? 28 : 14 }, () => {
        const a = Math.random() * Math.PI * 2
        const sp = rand(2, ex.big ? 9 : 6)
        return {
          v: [Math.cos(a) * sp, Math.sin(a) * sp + 2, rand(-2, 3)] as [number, number, number],
          w: [rand(-10, 10), rand(-10, 10), rand(-10, 10)] as [number, number, number],
          size: rand(0.09, ex.big ? 0.26 : 0.18),
          color: ex.colors[Math.floor(Math.random() * ex.colors.length)],
        }
      }),
    [ex],
  )

  const origin = useMemo(() => [ex.x, ex.y, 0] as [number, number, number], [ex])

  useEffect(() => {
    const t = setTimeout(() => remove(ex.id), 1500)
    return () => clearTimeout(t)
  }, [ex.id, remove])

  return (
    <>
      <Shock x={ex.x} y={ex.y} big={!!ex.big} color={ex.colors[0]} />
      {pieces.map((p, i) => (
    <RigidBody
      key={i}
      position={origin}
      linearVelocity={p.v}
      angularVelocity={p.w}
      gravityScale={1.4}
      colliders={false}
    >
      <CuboidCollider args={[p.size / 2, p.size / 2, p.size / 2]} mass={0.02} restitution={0.6} collisionGroups={GROUPS.debris} />
      <mesh>
        <boxGeometry args={[p.size, p.size, p.size]} />
        <meshBasicMaterial color={p.color} />
      </mesh>
    </RigidBody>
      ))}
    </>
  )
})

/** Quick expanding ring + white pop where something blows up (top view). */
function Shock({ x, y, big, color }: { x: number; y: number; big: boolean; color: string }) {
  const ring = useRef<THREE.Mesh>(null)
  const pop = useRef<THREE.Mesh>(null)
  const t = useRef(0)
  const eyes = useSettings((s) => s.camera === 'eyes')
  useFrame((_, dt) => {
    t.current += dt
    const k = Math.min(1, t.current / (big ? 0.45 : 0.28))
    const r = (big ? 2.6 : 1.3) * (0.25 + 0.75 * (1 - (1 - k) ** 3))
    if (ring.current) {
      ring.current.scale.setScalar(r)
      ;(ring.current.material as THREE.MeshBasicMaterial).opacity = (1 - k) * 0.9
      ring.current.visible = k < 1
    }
    if (pop.current) {
      pop.current.scale.setScalar(r * 0.7)
      pop.current.visible = t.current < 0.07
    }
  })
  if (eyes) return null
  return (
    <group position={[x, y, 0.6]}>
      <mesh ref={ring}>
        <ringGeometry args={[0.78, 1, 20]} />
        <meshBasicMaterial color={color} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh ref={pop}>
        <circleGeometry args={[1, 16]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.85} depthWrite={false} />
      </mesh>
    </group>
  )
}

export function Explosions() {
  const explosions = useGame((s) => s.explosions)
  return explosions.map((ex) => <Explosion key={ex.id} ex={ex} />)
}
