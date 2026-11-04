import { useMemo } from 'react'
import type { ThreeElements } from '@react-three/fiber'
import * as THREE from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { patternSize, SAUCER_DENT, SHUTTLE, SHUTTLE_FIN, type LatheRow, type Pattern } from './patterns'

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

/** Saucer rows are flatter than wide so the disc reads as a saucer. */
const ROW_H = 0.6

const latheCache = new WeakMap<LatheRow[], Map<number, THREE.BufferGeometry>>()

/** Voxelised solid of revolution (one disc per row), centred on the origin. */
export function latheGeometry(rows: LatheRow[], size: number) {
  let bySize = latheCache.get(rows)
  if (!bySize) {
    bySize = new Map()
    latheCache.set(rows, bySize)
  }
  const hit = bySize.get(size)
  if (hit) return hit

  // Deterministic pseudo-random so dents don't jump around between renders.
  let seed = 1234567
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)

  const parts: THREE.BufferGeometry[] = []
  const color = new THREE.Color()
  const n = rows.length
  rows.forEach((row, ri) => {
    const R = Math.ceil(row.r)
    for (let ix = -R; ix <= R; ix++) {
      for (let iz = -R; iz <= R; iz++) {
        const d = Math.hypot(ix, iz)
        if (d > row.r) continue
        const edge = d > row.r - 1.2
        let hex = row.color
        if (row.lights && edge) {
          const a = Math.atan2(iz, ix)
          hex = Math.floor(((a + Math.PI) / (Math.PI * 2)) * 12) % 2 ? row.lights[0] : row.lights[1]
        } else if (row.dents && edge && rnd() < row.dents * 3) {
          hex = SAUCER_DENT
        }
        const box = new THREE.BoxGeometry(size, size * ROW_H, size)
        box.translate(ix * size, ((n - 1) / 2 - ri) * size * ROW_H, iz * size)
        color.set(hex)
        const count = box.attributes.position.count
        const colors = new Float32Array(count * 3)
        for (let i = 0; i < count; i++) color.toArray(colors, i * 3)
        box.setAttribute('color', new THREE.BufferAttribute(colors, 3))
        parts.push(box)
      }
    }
  })
  const merged = mergeGeometries(parts)
  parts.forEach((p) => p.dispose())
  bySize.set(size, merged)
  return merged
}

export function latheSize(rows: LatheRow[], size: number) {
  const maxR = Math.max(...rows.map((r) => r.r))
  return { halfW: (Math.floor(maxR) + 0.5) * size, halfH: (rows.length * size * ROW_H) / 2 }
}

export function Saucer({ rows, size, ...mesh }: { rows: LatheRow[]; size: number } & Omit<ThreeElements['mesh'], 'geometry'>) {
  const geometry = useMemo(() => latheGeometry(rows, size), [rows, size])
  return (
    <mesh geometry={geometry} {...mesh}>
      <meshLambertMaterial vertexColors flatShading />
    </mesh>
  )
}

/** Orbiter: flat voxel body seen from above plus a vertical tail fin sticking out towards the camera. */
export function Shuttle({ size, ...group }: { size: number } & ThreeElements['group']) {
  const { h } = patternSize(SHUTTLE)
  const fin = patternSize(SHUTTLE_FIN)
  const depth = 2
  return (
    <group {...group}>
      <Voxel pattern={SHUTTLE} size={size} depth={depth} />
      {/* fin: pattern columns become height (+z), rows run along the fuselage from the tail */}
      <group position={[0, ((h - 1) / 2 - 3 - (fin.h - 1) / 2) * size, (depth / 2 + fin.w / 2) * size]} rotation={[0, -Math.PI / 2, 0]}>
        <Voxel pattern={SHUTTLE_FIN} size={size} depth={1} />
      </group>
    </group>
  )
}
