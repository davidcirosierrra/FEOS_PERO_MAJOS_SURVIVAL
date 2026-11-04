import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import type * as THREE from 'three'
import { PixelCanvas } from '../scene/PixelCanvas'
import { Starfield } from '../scene/Starfield'
import { ALIEN_STAGES, FOOD, FOOD_KINDS, SHUTTLE } from '../voxel/patterns'
import { Voxel } from '../voxel/Voxel'

const easeOutBack = (x: number) => {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2)
}

/** Big saucer that drops in from the top, then hovers and spins. */
function HeroSaucer({ y = 1.2 }: { y?: number }) {
  const ref = useRef<THREE.Group>(null)
  const start = useRef<number | null>(null)
  useFrame((state) => {
    const g = ref.current
    if (!g) return
    const t = state.clock.elapsedTime
    start.current ??= t
    const k = Math.min(1, (t - start.current) / 1.4)
    g.position.y = 12 + (y - 12) * easeOutBack(k) + Math.sin(t * 2) * 0.15 * k
    g.rotation.y = (1 - k) * Math.PI * 4 + Math.sin(t * 0.8) * 0.5
    g.rotation.x = 0.25 + Math.sin(t * 1.3) * 0.08
  })
  return (
    <group ref={ref} position={[0, 12, 0]}>
      <Voxel pattern={ALIEN_STAGES[0]} size={0.42} depth={3} />
    </group>
  )
}

/** Shuttles crossing in the background on a loop. */
function Flyby() {
  const refs = useRef<(THREE.Group | null)[]>([])
  const ships = useMemo(
    () => Array.from({ length: 3 }, (_, i) => ({ y: -3 - i * 2.2, z: -4 - i * 2, speed: 1.6 + i * 0.5, off: i * 7, dir: i % 2 ? -1 : 1 })),
    [],
  )
  useFrame((state) => {
    const t = state.clock.elapsedTime
    ships.forEach((s, i) => {
      const g = refs.current[i]
      if (!g) return
      const span = 22
      const x = (((t * s.speed + s.off) % span) - span / 2) * s.dir
      g.position.set(x, s.y + Math.sin(t + i) * 0.4, s.z)
      g.rotation.y = t * 1.5 + i
    })
  })
  return ships.map((s, i) => (
    <group key={i} ref={(g) => (refs.current[i] = g)} rotation={[0, 0, (s.dir * Math.PI) / 2]}>
      <Voxel pattern={SHUTTLE} size={0.18} />
    </group>
  ))
}

/** Junk food floating around. */
function FloatingFood() {
  const refs = useRef<(THREE.Group | null)[]>([])
  const items = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        kind: FOOD_KINDS[i % FOOD_KINDS.length],
        x: (Math.random() - 0.5) * 9,
        y: (Math.random() - 0.5) * 18,
        z: -2 - Math.random() * 6,
        s: 0.6 + Math.random() * 0.8,
      })),
    [],
  )
  useFrame((state, dt) => {
    const t = state.clock.elapsedTime
    items.forEach((it, i) => {
      const g = refs.current[i]
      if (!g) return
      it.y -= dt * it.s
      if (it.y < -11) it.y = 11
      g.position.set(it.x + Math.sin(t + i) * 0.3, it.y, it.z)
      g.rotation.y = t * it.s * 2
      g.rotation.z = Math.sin(t * 0.7 + i) * 0.4
    })
  })
  return items.map((it, i) => (
    <group key={i} ref={(g) => (refs.current[i] = g)}>
      <Voxel pattern={FOOD[it.kind]} size={0.16} depth={3} />
    </group>
  ))
}

export function Backdrop({ hero }: { hero: boolean }) {
  return (
    <PixelCanvas>
      <Starfield speed={hero ? 1.2 : 2} />
      <FloatingFood />
      <Flyby />
      {hero && <HeroSaucer />}
    </PixelCanvas>
  )
}
