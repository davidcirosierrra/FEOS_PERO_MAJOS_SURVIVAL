import { useFrame } from '@react-three/fiber'
import { useMemo } from 'react'
import * as THREE from 'three'
import { bilbaoTileCanvas } from '../voxel/theme'
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
  const tex = useMemo(() => {
    const t = new THREE.CanvasTexture(bilbaoTileCanvas())
    t.magFilter = THREE.NearestFilter
    t.minFilter = THREE.NearestFilter
    t.generateMipmaps = false
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.repeat.set(W / TILE, H / TILE)
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [])

  useFrame((_, dt) => {
    // Moving the texture down = walking forwards.
    tex.offset.y = (tex.offset.y + (Math.min(dt, 0.05) * speed) / TILE) % 1
  })

  return (
    // First person: the pavement is the ground the sprites stand on.
    <mesh position={[0, eyes ? 6 : 0, eyes ? -0.02 : Z]}>
      <planeGeometry args={[W, H]} />
      <meshBasicMaterial map={tex} color="#a2a5aa" />
    </mesh>
  )
}
