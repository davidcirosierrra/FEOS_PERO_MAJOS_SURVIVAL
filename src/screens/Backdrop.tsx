import { useFrame } from '@react-three/fiber'
import { Suspense, useMemo, useRef } from 'react'
import type * as THREE from 'three'
import { Floor, LightPools } from '../scene/Floor'
import { PixelCanvas } from '../scene/PixelCanvas'
import { FAN_LEGS, FAN_THROWS, FANS, THROWN } from '../voxel/theme'
import { Shadow, Walker } from '../voxel/Sprite'
import { Voxel } from '../voxel/Voxel'

/** Fans wandering across the pavement on a loop. */
function Crowd() {
  const refs = useRef<(THREE.Group | null)[]>([])
  const steps = useMemo(() => Array.from({ length: 5 }, () => ({ current: 0 })), [])
  const fans = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => ({
        look: i % FANS.length,
        y: -9 + i * 4.2,
        speed: 1.2 + (i % 3) * 0.5,
        off: i * 5.3,
        dir: i % 2 ? -1 : 1,
      })),
    [],
  )
  useFrame((state) => {
    const t = state.clock.elapsedTime
    fans.forEach((f, i) => {
      const g = refs.current[i]
      if (!g) return
      const span = 24
      const x = (((t * f.speed + f.off) % span) - span / 2) * f.dir
      const step = Math.sin(t * 8 + i)
      steps[i].current = Math.floor((t * 8 + i) / Math.PI) & 1
      g.position.set(x, f.y + Math.abs(step) * 0.1, -1)
      g.rotation.z = step * 0.08
    })
  })
  return fans.map((f, i) => (
    <group key={i} ref={(g) => (refs.current[i] = g)}>
      <Walker pattern={FANS[f.look]} legs={FAN_LEGS} size={0.12} depth={3} step={steps[i]} />
    </group>
  ))
}

/** Lighters, CDs and wine glasses tumbling through the air. */
function Flying() {
  const refs = useRef<(THREE.Group | null)[]>([])
  const items = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        kind: FAN_THROWS[i % FAN_THROWS.length],
        x: (Math.random() - 0.5) * 9,
        y: (Math.random() - 0.5) * 18,
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
      g.position.set(it.x + Math.sin(t + i) * 0.3, it.y, 0)
      g.rotation.y = t * it.s * 2
      g.rotation.z = Math.sin(t * 0.7 + i) * 0.4
    })
  })
  return items.map((it, i) => (
    <group key={i} ref={(g) => (refs.current[i] = g)}>
      <Voxel pattern={THROWN[it.kind]} size={0.14} depth={3} />
      <Shadow pattern={THROWN[it.kind]} size={0.14} offset={0.5} />
    </group>
  ))
}

export function Backdrop() {
  return (
    <PixelCanvas>
      <Suspense fallback={null}>
        <Floor speed={1} topDown />
      </Suspense>
      <LightPools />
      <Crowd />
      <Flying />
    </PixelCanvas>
  )
}
