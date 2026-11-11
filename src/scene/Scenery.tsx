import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { FLOOR_SPEED } from '../game/config'
import * as THREE from 'three'
import { BOSS_EVERY } from '../game/config'
import { field, playerState, useGame } from '../game/store'
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
const WALL_TILE_LEN = (WALL_H * 192) / 64
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

/** The concert stage at the end of the street; it gets closer level by level (resets after every boss). */
function Stage() {
  const tex = useMemo(() => patternTexture(STAGE), [])
  const ref = useRef<THREE.Mesh>(null)
  useFrame((_, dt) => {
    const m = ref.current
    if (!m) return
    const wave = Math.max(1, useGame.getState().wave)
    const p = ((wave - 1) % BOSS_EVERY) / (BOSS_EVERY - 1)
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

export function Scenery({ speed = FLOOR_SPEED }: { speed?: number }) {
  return (
    <>
      <Sky />
      <Walls speed={speed} />
      <Roofs speed={speed} />
      <Kerbs />
      <Lamps speed={speed} />
      <Bunting speed={speed} />
      <AimLane />
      <Stage />
    </>
  )
}

/** Things along the street come towards you at walking pace and wrap around far ahead. */
const NEAR = -16
function useScroll(speed: number, spacing: number, count: number, place: (i: number, y: number) => void) {
  const off = useRef(0)
  useFrame((_, dt) => {
    off.current = (off.current + Math.min(dt, 0.05) * speed) % (spacing * count)
    for (let i = 0; i < count; i++) {
      const y = NEAR + ((((i * spacing - off.current) % (spacing * count)) + spacing * count) % (spacing * count))
      place(i, y)
    }
  })
}

/** Radial glow texture (cached per colour). */
const glows = new Map<string, THREE.Texture>()
function glow(rgb: string) {
  const hit = glows.get(rgb)
  if (hit) return hit
  const c = document.createElement('canvas')
  c.width = c.height = 32
  const g = c.getContext('2d')!
  const grd = g.createRadialGradient(16, 16, 0, 16, 16, 16)
  grd.addColorStop(0, `rgba(${rgb},0.95)`)
  grd.addColorStop(0.3, `rgba(${rgb},0.4)`)
  grd.addColorStop(1, `rgba(${rgb},0)`)
  g.fillStyle = grd
  g.fillRect(0, 0, 32, 32)
  const t = new THREE.CanvasTexture(c)
  glows.set(rgb, t)
  return t
}

const LAMP_SPACING = 13
const LAMP_COUNT = 6
const LAMP_H = 4.3
const WARM = '255,214,140'

/** Wrought-iron lanterns on the facades, alternating sides, each with its pool of light. */
function Lamps({ speed }: { speed: number }) {
  const refs = useRef<(THREE.Group | null)[]>([])
  const wall = field.halfW + 0.6
  useScroll(speed, LAMP_SPACING, LAMP_COUNT, (i, y) => refs.current[i]?.position.setY(y))
  const tex = glow(WARM)
  return Array.from({ length: LAMP_COUNT }, (_, i) => {
    const side = i % 2 ? 1 : -1
    return (
      <group key={i} ref={(g) => void (refs.current[i] = g)} position={[side * wall, 0, 0]}>
        {/* bracket + lantern */}
        <mesh position={[-side * 0.45, 0, LAMP_H + 0.45]}>
          <boxGeometry args={[0.9, 0.07, 0.07]} />
          <meshBasicMaterial color="#141218" />
        </mesh>
        <mesh position={[-side * 0.85, 0, LAMP_H + 0.02]}>
          <boxGeometry args={[0.34, 0.34, 0.5]} />
          <meshBasicMaterial color="#ffe9b0" fog={false} />
        </mesh>
        <mesh position={[-side * 0.85, 0, LAMP_H + 0.33]}>
          <boxGeometry args={[0.46, 0.46, 0.1]} />
          <meshBasicMaterial color="#141218" />
        </mesh>
        <mesh position={[-side * 0.85, 0, LAMP_H - 0.28]}>
          <boxGeometry args={[0.2, 0.2, 0.08]} />
          <meshBasicMaterial color="#141218" />
        </mesh>
        <sprite position={[-side * 0.85, -0.1, LAMP_H]} scale={[2.6, 2.6, 1]}>
          <spriteMaterial map={tex} blending={THREE.AdditiveBlending} depthWrite={false} transparent />
        </sprite>
        {/* light on the pavement and washing up the wall */}
        <mesh position={[-side * 1.6, 0, 0.03]}>
          <planeGeometry args={[7, 7]} />
          <meshBasicMaterial map={tex} transparent opacity={0.32} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
        <mesh position={[-side * 0.03, 0, LAMP_H - 0.6]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[6, 5]} />
          <meshBasicMaterial map={tex} transparent opacity={0.3} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      </group>
    )
  })
}

const FLAG_COLORS = ['#ff7eb6', '#5ef6ff', '#ffe14d', '#f4f4f2', '#c48ad8', '#39ff6a']
const BUNTING_SPACING = 11
const BUNTING_COUNT = 6
const BUNTING_H = 6.9

/** Fiesta bunting strung between the buildings: a sagging line of little flags. */
function Bunting({ speed }: { speed: number }) {
  const refs = useRef<(THREE.Group | null)[]>([])
  const geo = useMemo(() => {
    const half = field.halfW + 0.6
    const n = 19
    const pos: number[] = []
    const col: number[] = []
    const c = new THREE.Color()
    const sag = (x: number) => -1.5 * (1 - (x / half) ** 2)
    for (let i = 0; i < n; i++) {
      const x0 = -half + ((i + 0.15) / n) * half * 2
      const x1 = -half + ((i + 0.85) / n) * half * 2
      const xm = (x0 + x1) / 2
      pos.push(x0, 0, sag(x0), x1, 0, sag(x1), xm, 0, sag(xm) - 0.42)
      c.set(FLAG_COLORS[i % FLAG_COLORS.length])
      for (let k = 0; k < 3; k++) col.push(c.r, c.g, c.b)
    }
    // the string itself, as thin quads
    c.set('#1a1420')
    const seg = 16
    for (let i = 0; i < seg; i++) {
      const a = -half + (i / seg) * half * 2
      const b = -half + ((i + 1) / seg) * half * 2
      pos.push(a, 0, sag(a), b, 0, sag(b), b, 0, sag(b) + 0.05, a, 0, sag(a), b, 0, sag(b) + 0.05, a, 0, sag(a) + 0.05)
      for (let k = 0; k < 6; k++) col.push(c.r, c.g, c.b)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3))
    return g
  }, [])
  useScroll(speed, BUNTING_SPACING, BUNTING_COUNT, (i, y) => {
    const g = refs.current[i]
    if (!g) return
    g.position.y = y
    g.rotation.x = Math.sin(performance.now() / 600 + i * 1.7) * 0.12 // sways in the breeze
  })
  return Array.from({ length: BUNTING_COUNT }, (_, i) => (
    <group key={i} ref={(g) => void (refs.current[i] = g)} position={[0, 0, BUNTING_H + (i % 2) * 0.5]}>
      <mesh geometry={geo}>
        <meshBasicMaterial vertexColors side={THREE.DoubleSide} />
      </mesh>
    </group>
  ))
}

/** Dark stone kerb where the facades meet the pavement. */
function Kerbs() {
  const x = field.halfW + 0.6
  return [-1, 1].map((side) => (
    <mesh key={side} position={[side * (x - 0.22), 30, 0.09]}>
      <boxGeometry args={[0.44, WALL_LEN, 0.18]} />
      <meshBasicMaterial color="#4a4854" />
    </mesh>
  ))
}

/** Faint pink line on the pavement straight ahead of the rifle: where the forks will go. */
function AimLane() {
  const ref = useRef<THREE.Mesh>(null)
  const tex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 1
    c.height = 64
    const g = c.getContext('2d')!
    const grd = g.createLinearGradient(0, 64, 0, 0)
    grd.addColorStop(0, 'rgba(255,126,182,0)')
    grd.addColorStop(0.12, 'rgba(255,126,182,0.5)')
    grd.addColorStop(1, 'rgba(255,126,182,0)')
    g.fillStyle = grd
    g.fillRect(0, 0, 1, 64)
    return new THREE.CanvasTexture(c)
  }, [])
  useFrame(() => ref.current?.position.set(playerState.x, field.playerY + 10.5, 0.04))
  return (
    <mesh ref={ref}>
      <planeGeometry args={[0.09, 20]} />
      <meshBasicMaterial map={tex} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </mesh>
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
  const moon = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 24
    const g = c.getContext('2d')!
    for (let y = 0; y < 24; y++)
      for (let x = 0; x < 24; x++) {
        const d = Math.hypot(x - 11.5, y - 11.5)
        if (d > 10) continue
        const crater = Math.hypot(x - 8, y - 8) < 2.4 || Math.hypot(x - 15, y - 13) < 3 || Math.hypot(x - 9, y - 16) < 1.6
        g.fillStyle = crater ? '#cfc8b0' : d > 8.8 ? '#e8e0c4' : '#fff8dc'
        g.fillRect(x, y, 1, 1)
      }
    const t = new THREE.CanvasTexture(c)
    t.magFilter = t.minFilter = THREE.NearestFilter
    t.colorSpace = THREE.SRGBColorSpace
    return t
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
      {/* a big low moon over the rooftops, off to one side */}
      <sprite position={[-34, 70, 34]} scale={[11, 11, 1]} renderOrder={-1}>
        <spriteMaterial map={moon} fog={false} depthWrite={false} transparent />
      </sprite>
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
