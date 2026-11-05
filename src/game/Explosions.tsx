import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { memo, useEffect, useMemo } from 'react'
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

  return pieces.map((p, i) => (
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
  ))
})

export function Explosions() {
  const explosions = useGame((s) => s.explosions)
  return explosions.map((ex) => <Explosion key={ex.id} ex={ex} />)
}
