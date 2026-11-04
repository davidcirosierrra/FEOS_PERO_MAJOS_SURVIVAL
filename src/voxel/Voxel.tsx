import { useMemo } from 'react'
import type { ThreeElements } from '@react-three/fiber'
import * as THREE from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { patternSize, type Pattern } from './patterns'

const cache = new WeakMap<Pattern, Map<string, THREE.BufferGeometry>>()

/** Builds (and caches) a single merged geometry with vertex colours for a pixel pattern. */
export function voxelGeometry(pattern: Pattern, size: number, depth = 2) {
  let bySize = cache.get(pattern)
  if (!bySize) {
    bySize = new Map()
    cache.set(pattern, bySize)
  }
  const key = `${size}:${depth}`
  const hit = bySize.get(key)
  if (hit) return hit

  const { w, h } = patternSize(pattern)
  const parts: THREE.BufferGeometry[] = []
  const color = new THREE.Color()

  pattern.rows.forEach((row, r) => {
    ;[...row].forEach((ch, c) => {
      const hex = pattern.palette[ch]
      if (!hex) return
      const box = new THREE.BoxGeometry(size, size, size * depth)
      box.translate((c - (w - 1) / 2) * size, ((h - 1) / 2 - r) * size, 0)
      color.set(hex)
      const n = box.attributes.position.count
      const colors = new Float32Array(n * 3)
      for (let i = 0; i < n; i++) color.toArray(colors, i * 3)
      box.setAttribute('color', new THREE.BufferAttribute(colors, 3))
      parts.push(box)
    })
  })

  const merged = mergeGeometries(parts)
  parts.forEach((p) => p.dispose())
  bySize.set(key, merged)
  return merged
}

type Props = {
  pattern: Pattern
  size: number
  depth?: number
  /** Unlit material (lasers, glowing bits). */
  basic?: boolean
} & Omit<ThreeElements['mesh'], 'geometry'>

export function Voxel({ pattern, size, depth = 2, basic = false, ...mesh }: Props) {
  const geometry = useMemo(() => voxelGeometry(pattern, size, depth), [pattern, size, depth])
  return (
    <mesh geometry={geometry} {...mesh}>
      {basic ? <meshBasicMaterial vertexColors /> : <meshLambertMaterial vertexColors flatShading />}
    </mesh>
  )
}
