import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { field, useGame } from '../game/store'
import type { Pattern } from '../voxel/patterns'
import { ROOF_TILE, STAGE, WALL_TILE } from '../voxel/sprites.gen'

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

const ROOF_W = 2.4
const ROOF_TILE_LEN = (ROOF_W * 32) / 24

/** Tiled roofs with a wooden eave sticking out over the street from the top of each wall. */
function Roofs({ speed }: { speed: number }) {
  const tex = useMemo(() => {
    const t = patternTexture(ROOF_TILE)
    t.wrapS = THREE.RepeatWrapping
    t.repeat.set(WALL_LEN / ROOF_TILE_LEN, 1)
    return t
  }, [])
  const geo = useMemo(() => {
    // u along the street (+y), v across the roof: v=0 (eave) towards the street, v=1 up the slope.
    const g = new THREE.PlaneGeometry(WALL_LEN, ROOF_W)
    g.rotateZ(Math.PI / 2)
    return g
  }, [])
  useFrame((_, dt) => {
    tex.offset.x = (tex.offset.x + (Math.min(dt, 0.05) * speed) / ROOF_TILE_LEN) % 1
  })
  const x = field.halfW + 0.6
  const slope = 0.5 // radians: rises towards the outside
  return (
    <>
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          geometry={geo}
          // centre of the roof strip: half overhanging the street, half over the wall
          position={[side * (x - 0.2 + (Math.cos(slope) * ROOF_W) / 2 - 0.9), 30, WALL_H + (Math.sin(slope) * ROOF_W) / 2]}
          rotation={[0, side * -slope, 0]}
          scale={[side, 1, 1]}
        >
          <meshBasicMaterial map={tex} side={THREE.DoubleSide} color="#d8d0cc" />
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
      <Sky />
      <Walls speed={speed} />
      <Roofs speed={speed} />
      <Stage />
    </>
  )
}

/** Night sky for first person: gradient dome + twinkling stars that follow the camera. */
export function Sky() {
  const group = useRef<THREE.Group>(null)
  const dome = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 4
    c.height = 128
    const g = c.getContext('2d')!
    const grd = g.createLinearGradient(0, 0, 0, 128)
    grd.addColorStop(0, '#05030c') // zenith
    grd.addColorStop(0.42, '#140a24')
    grd.addColorStop(0.5, '#3a1d40') // warm glow on the horizon (city + stage lights)
    grd.addColorStop(1, '#2a1a30')
    g.fillStyle = grd
    g.fillRect(0, 0, 4, 128)
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [])
  const { positions, colors } = useMemo(() => {
    const n = 420
    const positions = new Float32Array(n * 3)
    const colors = new Float32Array(n * 3)
    const col = new THREE.Color()
    const tints = ['#ffffff', '#fff3c4', '#cfe0ff', '#ffd1e6']
    for (let i = 0; i < n; i++) {
      // random direction in the upper hemisphere (z is up), a few degrees above the horizon
      const az = Math.random() * Math.PI * 2
      const el = 0.06 + Math.asin(Math.random()) * 0.94
      const r = 85
      positions.set([Math.cos(az) * Math.cos(el) * r, Math.sin(az) * Math.cos(el) * r, Math.sin(el) * r], i * 3)
      col.set(tints[i % tints.length]).multiplyScalar(0.6 + Math.random() * 0.4)
      colors.set([col.r, col.g, col.b], i * 3)
    }
    return { positions, colors }
  }, [])
  const stars = useRef<THREE.PointsMaterial>(null)
  useFrame((state) => {
    // centred on the camera so the sky is infinitely far away
    group.current?.position.copy(state.camera.position)
    if (stars.current) stars.current.opacity = 0.85 + Math.sin(state.clock.elapsedTime * 3) * 0.15
  })
  return (
    <group ref={group}>
      <mesh rotation={[Math.PI / 2, 0, 0]} renderOrder={-2}>
        <sphereGeometry args={[95, 16, 16]} />
        <meshBasicMaterial map={dome} side={THREE.BackSide} fog={false} depthWrite={false} />
      </mesh>
      <points renderOrder={-1}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial ref={stars} size={2} sizeAttenuation={false} vertexColors fog={false} transparent depthWrite={false} />
      </points>
    </group>
  )
}
