import { CAMERA_Z } from '../scene/PixelCanvas'
import { JUMP_MS, JUMP_Z } from './config'
import { field } from './store'

export type JumpPose = { x: number; y: number; z: number; flip: number }

/**
 * Loop-jump pose relative to the ship's physics position at `px`, or null when not jumping.
 * Arcs towards the camera (looks bigger), rises on screen and does a full 360° flip.
 * Shared by the ship and the umbrella so both loop together.
 */
export function jumpPose(now: number, jumpStart: number, px: number): JumpPose | null {
  const k = (now - jumpStart) / JUMP_MS
  if (!(k >= 0 && k < 1)) return null
  const e = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2 // easeInOutQuad for the flip
  const arc = Math.sin(Math.PI * k)
  const z = arc * JUMP_Z
  // Undo the perspective push-out so on screen it rises straight up instead of drifting off.
  const shrink = (CAMERA_Z - z) / CAMERA_Z
  const screenY = field.playerY + arc * 2.8
  return { x: px * shrink - px, y: screenY * shrink - field.playerY, z, flip: -e * Math.PI * 2 }
}
