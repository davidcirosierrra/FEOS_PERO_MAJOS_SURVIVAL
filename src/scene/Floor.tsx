import { useFrame, useLoader, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useEyes } from './View'

/** World size of one tile. */
const TILE = 2.6
const W = 48
const H = 60
/** A bit behind the play plane so shot-down stuff can "fall" towards it. */
const Z = -4

/** Scrolling Bilbao-tile pavement: the band is walking towards the stage. */
export function Floor({ speed = 2, topDown = false }: { speed?: number; topDown?: boolean }) {
  const eyes = useEyes() && !topDown
  // 2x2 atlas of 64 px tiles (drawn in scripts/sprites/tile.py), slightly different cement each.
  const loaded = useLoader(THREE.TextureLoader, '/textures/bilbao-tile.png')
  const gl = useThree((s) => s.gl)
  const tex = useMemo(() => {
    const t = loaded.clone()
    t.magFilter = THREE.NearestFilter // crisp pixels up close
    t.minFilter = THREE.LinearMipmapLinearFilter // no shimmering towards the horizon
    t.anisotropy = gl.capabilities.getMaxAnisotropy()
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.repeat.set(W / (TILE * 2), H / (TILE * 2))
    t.colorSpace = THREE.SRGBColorSpace
    t.needsUpdate = true
    return t
  }, [loaded, gl])

  useFrame((_, dt) => {
    // Moving the texture down = walking forwards.
    tex.offset.y = (tex.offset.y + (Math.min(dt, 0.05) * speed) / (TILE * 2)) % 1
  })

  return (
    // First person: the pavement is the ground the sprites stand on.
    <mesh position={[0, eyes ? 6 : 0, eyes ? -0.02 : Z]}>
      <planeGeometry args={[W, H]} />
      <meshBasicMaterial map={tex} color={eyes ? '#9a98b4' : '#a9a6c0'} />
    </mesh>
  )
}

const POOLS = [
  { rgb: '255,126,182', r: 9, sx: 0.23, sy: 0.17, ph: 0 },
  { rgb: '94,246,255', r: 8, sx: 0.19, sy: 0.26, ph: 2.1 },
  { rgb: '255,225,77', r: 7, sx: 0.31, sy: 0.14, ph: 4.2 },
]

/**
 * Soft coloured light pools sweeping over the pavement, as if the stage lights reached down the
 * street. Top view only; purely cosmetic and very faint so the sprites stay readable.
 */
export function LightPools() {
  const eyes = useEyes()
  const refs = useRef<(THREE.Mesh | null)[]>([])
  const textures = useMemo(
    () =>
      POOLS.map((p) => {
        const c = document.createElement('canvas')
        c.width = c.height = 32
        const g = c.getContext('2d')!
        const grd = g.createRadialGradient(16, 16, 0, 16, 16, 16)
        grd.addColorStop(0, `rgba(${p.rgb},0.17)`)
        grd.addColorStop(0.6, `rgba(${p.rgb},0.06)`)
        grd.addColorStop(1, `rgba(${p.rgb},0)`)
        g.fillStyle = grd
        g.fillRect(0, 0, 32, 32)
        return new THREE.CanvasTexture(c)
      }),
    [],
  )
  useFrame((state) => {
    const t = state.clock.elapsedTime
    POOLS.forEach((p, i) => refs.current[i]?.position.set(Math.sin(t * p.sx + p.ph) * 5, Math.cos(t * p.sy + p.ph * 1.7) * 9, Z + 0.05 + i * 0.01))
  })
  if (eyes) return null
  return POOLS.map((p, i) => (
    <mesh key={i} ref={(m) => void (refs.current[i] = m)}>
      <planeGeometry args={[p.r * 2, p.r * 2]} />
      <meshBasicMaterial map={textures[i]} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </mesh>
  ))
}
