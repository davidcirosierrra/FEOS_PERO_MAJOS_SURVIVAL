import { useFrame } from '@react-three/fiber'
import { useMemo, useRef, type RefObject } from 'react'
import type * as THREE from 'three'
import { useSettings } from '../settings'
import { walkFrames, type Legs, type Pattern } from './patterns'
import { Voxel, voxelGeometry } from './Voxel'

/**
 * Hard-edged pixel drop shadow on the pavement, the exact silhouette of the sprite.
 * Top view only: in first person sprites stand upright and the fog does the grounding.
 */
export function Shadow({ pattern, size, offset = 0.2 }: { pattern: Pattern; size: number; offset?: number }) {
  const eyes = useSettings((s) => s.camera === 'eyes')
  const geometry = useMemo(() => voxelGeometry(pattern, size, 1), [pattern, size])
  if (eyes) return null
  return (
    <mesh geometry={geometry} position={[offset, -offset * 1.3, -0.5]} scale={[1, 1, 0.02]} renderOrder={-1}>
      <meshBasicMaterial color="#0a0612" transparent opacity={0.34} depthWrite={false} />
    </mesh>
  )
}

/**
 * A character with a two-frame walk cycle. The parent decides the pace by writing 0 / 1 into
 * `step` (usually from the same sine it uses for the body bounce).
 */
export function Walker({
  pattern,
  legs,
  size,
  depth = 3,
  step,
  shadow = true,
}: {
  pattern: Pattern
  legs: Legs
  size: number
  depth?: number
  step: RefObject<number>
  shadow?: boolean
}) {
  const [a, b] = walkFrames(pattern, legs)
  const ra = useRef<THREE.Mesh>(null)
  const rb = useRef<THREE.Mesh>(null)
  useFrame(() => {
    if (ra.current) ra.current.visible = step.current === 0
    if (rb.current) rb.current.visible = step.current !== 0
  })
  return (
    <>
      <Voxel ref={ra} pattern={a} size={size} depth={depth} />
      <Voxel ref={rb} pattern={b} size={size} depth={depth} visible={false} />
      {shadow && <Shadow pattern={pattern} size={size} />}
    </>
  )
}
