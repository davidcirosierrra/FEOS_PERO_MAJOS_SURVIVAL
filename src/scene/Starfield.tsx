import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

const PALETTE = ['#ffffff', '#ffffff', '#9fe8ff', '#ffe9a3', '#ff9ad5']

/** Chunky scrolling stars far behind the play plane. */
export function Starfield({ count = 260, speed = 1.5 }: { count?: number; speed?: number }) {
  const ref = useRef<THREE.Points>(null)
  const { positions, colors, depth } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const depth = new Float32Array(count)
    const c = new THREE.Color()
    for (let i = 0; i < count; i++) {
      const z = -6 - Math.random() * 30
      positions.set([(Math.random() - 0.5) * 34, (Math.random() - 0.5) * 40, z], i * 3)
      c.set(PALETTE[i % PALETTE.length])
      colors.set([c.r, c.g, c.b], i * 3)
      depth[i] = 1 - (z + 6) / -30 // 1 near, 0 far
    }
    return { positions, colors, depth }
  }, [count])

  useFrame((_, dt) => {
    const geo = ref.current?.geometry
    if (!geo) return
    const pos = geo.attributes.position as THREE.BufferAttribute
    const arr = pos.array as Float32Array
    const step = Math.min(dt, 0.05) * speed
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] -= step * (0.4 + depth[i] * 1.6)
      if (arr[i * 3 + 1] < -20) arr[i * 3 + 1] += 40
    }
    pos.needsUpdate = true
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={2} sizeAttenuation={false} vertexColors />
    </points>
  )
}
