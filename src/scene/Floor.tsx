import { useFrame, useLoader, useThree } from '@react-three/fiber'
import { useMemo } from 'react'
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
      <meshBasicMaterial map={tex} color="#d4d6da" />
    </mesh>
  )
}
