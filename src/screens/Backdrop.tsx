import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import type * as THREE from 'three'
import { PixelCanvas } from '../scene/PixelCanvas'
import { Starfield } from '../scene/Starfield'
import { FOOD, FOOD_KINDS } from '../voxel/patterns'
import { Shuttle, Voxel } from '../voxel/Voxel'

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
      <Shuttle size={0.14} />
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

export function Backdrop() {
  return (
    <PixelCanvas>
      <Starfield speed={1.5} />
      <FloatingFood />
      <Flyby />
    </PixelCanvas>
  )
}
