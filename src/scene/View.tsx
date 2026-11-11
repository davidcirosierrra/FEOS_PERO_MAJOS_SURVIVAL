import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef, type ReactNode } from 'react'
import * as THREE from 'three'
import { jumpPose } from '../game/jump'
import { readTilt } from '../input'
import { field, liveThreats, playerState, useGame } from '../game/store'
import { useSettings } from '../settings'
import { character as characterOf } from '../characters'
import { fx } from '../game/fx'
import { Voxel } from '../voxel/Voxel'
import { CAMERA_Z, FOV } from './PixelCanvas'
import { Scenery } from './Scenery'

export const useEyes = () => useSettings((s) => s.camera === 'eyes')

/** Eye height of the player in first-person view (world units above the pavement). */
const EYE = 1.7
/** Camera a little behind the character's eyes so the space right beside you is visible. */
const BACK = 1.8
/** Wide lens: in portrait the sides are what you miss most. */
const EYES_FOV = 96
/** How far the head turns towards the side you are leaning to (world units at the look-at point). */
const LOOK_SIDE = 9
/** Height things fly at in first person (roughly chest height). */
export const FLY_Z = 1.0

/**
 * In first person, stand a flat sprite up on the pavement facing the camera (a "billboard");
 * in the top view it renders the children untouched.
 * `height` = sprite height (so its feet touch the ground), `lift` raises it off the ground.
 */
export function Stand({ height, lift = 0, children }: { height: number; lift?: number; children: ReactNode }) {
  const eyes = useEyes()
  if (!eyes) return <>{children}</>
  // Blob shadow on the pavement: grounds whoever stands there and, for things in the air, shows
  // where they are along the street (the one thing that is hard to judge in first person).
  const r = Math.max(0.22, Math.min(1.6, height * 0.34))
  return (
    <>
      <mesh position={[0, 0, 0.05]} scale={[1, 0.55, 1]} renderOrder={-1}>
        <circleGeometry args={[r, 12]} />
        <meshBasicMaterial color="#07040c" transparent opacity={lift > 0 ? 0.3 : 0.42} depthWrite={false} />
      </mesh>
      <group position={[0, 0, lift + height / 2]} rotation={[Math.PI / 2, 0, 0]}>
        {children}
      </group>
    </>
  )
}

const RIFLE_VOXEL = 0.0088
/** Four-pointed pink star for the muzzle flash. */
const FLASH = (() => {
  const c = document.createElement('canvas')
  c.width = c.height = 16
  const g = c.getContext('2d')!
  for (let y = 0; y < 16; y++)
    for (let x = 0; x < 16; x++) {
      const dx = Math.abs(x - 7.5)
      const dy = Math.abs(y - 7.5)
      const d = Math.min(dx, dy) * 2.2 + Math.max(dx, dy) * 0.55
      if (d > 5.2) continue
      g.fillStyle = d < 1.6 ? '#ffffff' : d < 3.4 ? '#ffd1e6' : '#ff7eb6'
      g.fillRect(x, y, 1, 1)
    }
  const t = new THREE.CanvasTexture(c)
  t.magFilter = t.minFilter = THREE.NearestFilter
  return t
})()

const UP_TOP = new THREE.Vector3(0, 1, 0)
const UP_EYES = new THREE.Vector3(0, 0, 1)
const _look = new THREE.Vector3()
const _off = new THREE.Vector3()
const _roll = new THREE.Quaternion()
const FORWARD = new THREE.Vector3(0, 0, -1)

/**
 * Off-screen danger markers for first person: anything harmful near you that the camera can't see
 * (beside you, or about to hit you from the side). Positions are in CSS px; read by <EdgeWarnings>.
 */
export const edgeWarnings: { side: -1 | 1; y: number }[] = []
const _p = new THREE.Vector3()
function updateEdgeWarnings(camera: THREE.Camera, size: { width: number; height: number }) {
  edgeWarnings.length = 0
  for (const t of liveThreats.values()) {
    if (t.harmless || t.y > field.playerY + 6 || t.y < field.playerY - 2) continue
    _p.set(t.x, t.y, FLY_Z).project(camera)
    const onScreen = _p.z < 1 && Math.abs(_p.x) < 0.92 && Math.abs(_p.y) < 1
    if (onScreen) continue
    const y = _p.z < 1 ? Math.max(0.2, Math.min(0.85, (1 - _p.y) / 2)) : 0.75
    edgeWarnings.push({ side: t.x >= playerState.x ? 1 : -1, y: y * size.height })
  }
}

/** Drives the camera for the current view mode, plus the first-person fork-rifle. */
export function CameraRig() {
  const eyes = useEyes()
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  const character = useSettings((s) => s.character)
  const rifle = useRef<THREE.Group>(null)
  const muzzle = useRef<THREE.Sprite>(null)
  const recoil = useRef(0)
  const lastShot = useRef(0)
  const lean = useRef(0)
  const lastX = useRef(0)
  const sway = useRef(0)

  // Top view: fixed camera looking straight down at the play plane.
  useEffect(() => {
    if (eyes) {
      camera.fov = EYES_FOV
      camera.near = 0.05
    } else {
      camera.fov = FOV
      camera.near = 0.1
      camera.up.copy(UP_TOP)
      camera.position.set(0, 0, CAMERA_Z)
      camera.lookAt(0, 0, 0)
    }
    camera.updateProjectionMatrix()
  }, [eyes, camera])

  useFrame((state, dt) => {
    // Screen shake (hits, explosions): a decaying random offset, snapped to whole render pixels.
    fx.shake *= Math.exp(-dt * 7)
    if (fx.shake < 0.01) fx.shake = 0
    const sx = fx.shake ? (Math.random() * 2 - 1) * fx.shake * 0.5 : 0
    const sy = fx.shake ? (Math.random() * 2 - 1) * fx.shake * 0.5 : 0
    if (!eyes) {
      camera.position.set(sx, sy, CAMERA_Z)
      return
    }
    const s = useGame.getState()
    const now = performance.now()
    const pose = jumpPose(now, s.jumpStart, playerState.x)
    const arc = pose ? pose.z / 9 : 0 // 0..1
    const bob = Math.abs(Math.sin(state.clock.elapsedTime * 9)) * 0.05
    camera.up.copy(UP_EYES)
    camera.position.set(playerState.x + sx * 0.3, field.playerY - BACK, EYE + bob + arc * 2.6 + sy * 0.3)
    // Lean the phone and the head turns that way, banking a little like when you run.
    lean.current += (readTilt() - lean.current) * Math.min(1, dt * 5)
    // (less so towards a wall you are already next to: there is nothing to see there)
    const room = Math.max(0.15, Math.min(1, (field.halfW - Math.sign(lean.current) * playerState.x) / field.halfW))
    _look.set(playerState.x + lean.current * LOOK_SIDE * room, field.playerY + 30, -1.5)
    camera.lookAt(_look)
    camera.rotateZ(-lean.current * 0.045)
    // Jump = barrel roll around the view direction.
    if (pose) {
      _roll.setFromAxisAngle(FORWARD, pose.flip)
      camera.quaternion.multiply(_roll)
    }

    updateEdgeWarnings(camera, state.size)

    // Fork-rifle in the lower right of the view: kicks on every shot, lags behind when you move
    // sideways and bobs with your steps.
    if (s.lastShot !== lastShot.current) {
      lastShot.current = s.lastShot
      recoil.current = 1
    }
    recoil.current = Math.max(0, recoil.current - dt * 7)
    const vx = (playerState.x - lastX.current) / Math.max(dt, 1e-3)
    lastX.current = playerState.x
    sway.current += (Math.max(-1, Math.min(1, vx / 6)) - sway.current) * Math.min(1, dt * 6)
    const walk = Math.sin(state.clock.elapsedTime * 9)
    const g = rifle.current
    if (g) {
      const k = recoil.current
      _off
        .set(0.15 - sway.current * 0.05 + walk * 0.006, -0.3 + bob * 0.4 - k * 0.035, -0.74 + k * 0.07)
        .applyQuaternion(camera.quaternion)
      g.position.copy(camera.position).add(_off)
      g.quaternion.copy(camera.quaternion)
      g.rotateZ(0.1 - sway.current * 0.18)
      g.rotateX(-0.28 + k * 0.16)
      g.visible = !s.gameOver
    }
    if (muzzle.current) {
      muzzle.current.visible = recoil.current > 0.5
      muzzle.current.material.rotation = lastShot.current
      muzzle.current.scale.setScalar(0.12 + recoil.current * 0.1)
    }
  })

  if (!eyes) return null
  return (
    <>
      <color attach="background" args={['#05030c']} />
      <fog attach="fog" args={['#2a1a30', 14, 40]} />
      <Scenery />
      <group ref={rifle}>
        <Voxel pattern={characterOf(character).rifle} size={RIFLE_VOXEL} depth={3} />
        {/* muzzle flash at the tines */}
        <sprite ref={muzzle} position={[-0.004, RIFLE_VOXEL * 25, 0.02]} visible={false}>
          <spriteMaterial map={FLASH} blending={THREE.AdditiveBlending} depthWrite={false} depthTest={false} transparent />
        </sprite>
      </group>
    </>
  )
}
