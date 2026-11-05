import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef, type ReactNode } from 'react'
import * as THREE from 'three'
import { jumpPose } from '../game/jump'
import { field, liveThreats, playerState, useGame } from '../game/store'
import { useSettings } from '../settings'
import { RIFLE_BASSIST, RIFLE_PIG } from '../voxel/sprites.gen'
import { Voxel } from '../voxel/Voxel'
import { CAMERA_Z, FOV } from './PixelCanvas'
import { Scenery } from './Scenery'

export const useEyes = () => useSettings((s) => s.camera === 'eyes')

/** Eye height of the player in first-person view (world units above the pavement). */
const EYE = 1.55
/** Camera a little behind the character's eyes so the space right beside you is visible. */
const BACK = 1.3
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
  return (
    <group position={[0, 0, lift + height / 2]} rotation={[Math.PI / 2, 0, 0]}>
      {children}
    </group>
  )
}

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
  const recoil = useRef(0)
  const lastShot = useRef(0)

  // Top view: fixed camera looking straight down at the play plane.
  useEffect(() => {
    if (eyes) {
      camera.fov = 88
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
    if (!eyes) return
    const s = useGame.getState()
    const now = performance.now()
    const pose = jumpPose(now, s.jumpStart, playerState.x)
    const arc = pose ? pose.z / 9 : 0 // 0..1
    const bob = Math.abs(Math.sin(state.clock.elapsedTime * 9)) * 0.05
    camera.up.copy(UP_EYES)
    camera.position.set(playerState.x, field.playerY - BACK, EYE + bob + arc * 2.6)
    _look.set(playerState.x, field.playerY + 30, -5)
    camera.lookAt(_look)
    // Jump = barrel roll around the view direction.
    if (pose) {
      _roll.setFromAxisAngle(FORWARD, pose.flip)
      camera.quaternion.multiply(_roll)
    }

    updateEdgeWarnings(camera, state.size)

    // Fork-rifle in the lower right of the view, kicking back on every shot.
    if (s.lastShot !== lastShot.current) {
      lastShot.current = s.lastShot
      recoil.current = 1
    }
    recoil.current = Math.max(0, recoil.current - dt * 8)
    const g = rifle.current
    if (g) {
      _off.set(0.13, -0.26 + bob * 0.5 - recoil.current * 0.02, -0.8 + recoil.current * 0.06).applyQuaternion(camera.quaternion)
      g.position.copy(camera.position).add(_off)
      g.quaternion.copy(camera.quaternion)
      g.rotateZ(0.12)
      g.visible = !s.gameOver
    }
  })

  if (!eyes) return null
  return (
    <>
      <color attach="background" args={['#2a1a30']} />
      <fog attach="fog" args={['#2a1a30', 14, 40]} />
      <Scenery />
      <group ref={rifle}>
        <Voxel pattern={character === 'pig' ? RIFLE_PIG : RIFLE_BASSIST} size={0.012} depth={3} />
      </group>
    </>
  )
}
