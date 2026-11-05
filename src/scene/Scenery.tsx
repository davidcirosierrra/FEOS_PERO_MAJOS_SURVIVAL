import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { field, useGame } from '../game/store'
import type { Pattern } from '../voxel/patterns'
import { STAGE, WALL_TILE } from '../voxel/sprites.gen'

/** Pixel pattern → nearest-filtered texture (palette colours may carry alpha: #rrggbbaa). */
function patternTexture(p: Pattern) {
  const h = p.rows.length
  const w = Math.max(...p.rows.map((r) => r.length))
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const g = c.getContext('2d')!
  const img = g.createImageData(w, h)
  p.rows.forEach((row, y) =>
    [...row].forEach((ch, x) => {
      const hex = p.palette[ch]
      if (!hex) return
      const n = (i: number) => parseInt(hex.slice(i, i + 2), 16)
      img.data.set([n(1), n(3), n(5), hex.length > 7 ? n(7) : 255], (y * w + x) * 4)
    }),
  )
  g.putImageData(img, 0, 0)
  const t = new THREE.CanvasTexture(c)
  t.magFilter = t.minFilter = THREE.NearestFilter
  t.generateMipmaps = false
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

const WALL_H = 7.5
const WALL_TILE_LEN = (WALL_H * 96) / 64
const WALL_LEN = 90

/** Old-town facades lining both sides of the street (first-person view). */
function Walls({ speed }: { speed: number }) {
  const tex = useMemo(() => {
    const t = patternTexture(WALL_TILE)
    t.wrapS = THREE.RepeatWrapping
    t.repeat.set(WALL_LEN / WALL_TILE_LEN, 1)
    return t
  }, [])
  const geo = useMemo(() => {
    // Plane standing along the street: u runs along +y, v goes up (+z).
    const g = new THREE.PlaneGeometry(WALL_LEN, WALL_H)
    g.rotateX(Math.PI / 2)
    g.rotateZ(Math.PI / 2)
    return g
  }, [])
  useFrame((_, dt) => {
    tex.offset.x = (tex.offset.x + (Math.min(dt, 0.05) * speed) / WALL_TILE_LEN) % 1
  })
  const x = field.halfW + 0.6
  return (
    <>
      {[-x, x].map((wx) => (
        <mesh key={wx} geometry={geo} position={[wx, 30, WALL_H / 2]}>
          <meshBasicMaterial map={tex} side={THREE.DoubleSide} color="#c8c4cc" />
        </mesh>
      ))}
    </>
  )
}

const STAGE_W = 30
const STAGE_H = (STAGE_W * 76) / 160

/** The concert stage at the end of the street; it gets closer level by level (resets every 10). */
function Stage() {
  const tex = useMemo(() => patternTexture(STAGE), [])
  const ref = useRef<THREE.Mesh>(null)
  useFrame((_, dt) => {
    const m = ref.current
    if (!m) return
    const wave = Math.max(1, useGame.getState().wave)
    const p = ((wave - 1) % 10) / 9
    const target = 78 - p * 38
    m.position.y += (target - m.position.y) * Math.min(1, dt * 0.8)
  })
  return (
    <mesh ref={ref} position={[0, 78, STAGE_H / 2]} rotation={[Math.PI / 2, 0, 0]}>
      <planeGeometry args={[STAGE_W, STAGE_H]} />
      {/* Not fogged: the lit stage glows at the end of the dark street. */}
      <meshBasicMaterial map={tex} transparent fog={false} />
    </mesh>
  )
}

export function Scenery({ speed = 2.2 }: { speed?: number }) {
  return (
    <>
      <Walls speed={speed} />
      <Stage />
    </>
  )
}
