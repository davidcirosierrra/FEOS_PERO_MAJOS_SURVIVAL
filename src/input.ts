/**
 * Tilt input. Mutable singleton read every frame (no React re-renders).
 * `tilt` is in [-1, 1]: negative = left, positive = right.
 */
export const input = {
  tilt: 0,
  hasSensor: false,
  keys: { left: false, right: false },
}

/** Degrees of roll needed for full speed. */
const FULL_TILT_DEG = 25
const FULL_TILT_ACC = 9.81 * Math.sin((FULL_TILT_DEG * Math.PI) / 180)
const DEADZONE = 0.06
const SMOOTHING = 0.35

// iOS reports accelerometer axes with the opposite sign to Android.
const IOS = /iPad|iPhone|iPod/.test(navigator.userAgent)

type IOSMotionEvent = typeof DeviceMotionEvent & { requestPermission?: () => Promise<'granted' | 'denied'> }

/** Must be called from a user gesture (needed on iOS, harmless elsewhere). */
export async function requestMotionPermission(): Promise<boolean> {
  const DME = (globalThis as { DeviceMotionEvent?: IOSMotionEvent }).DeviceMotionEvent
  if (!DME) return false
  if (typeof DME.requestPermission === 'function') {
    try {
      return (await DME.requestPermission()) === 'granted'
    } catch {
      return false
    }
  }
  return true
}

function screenAngle() {
  return screen.orientation?.angle ?? (window as { orientation?: number }).orientation ?? 0
}

function onMotion(e: DeviceMotionEvent) {
  const g = e.accelerationIncludingGravity
  if (!g || g.x == null || g.y == null) return
  input.hasSensor = true
  // Use the axis that is horizontal on screen for the current orientation.
  const angle = screenAngle()
  let ax = angle === 90 ? g.y : angle === -90 || angle === 270 ? -g.y : angle === 180 ? -g.x : g.x
  if (IOS) ax = -ax
  // Android: tilting the right edge down gives negative x.
  let t = Math.max(-1, Math.min(1, -ax / FULL_TILT_ACC))
  t = Math.abs(t) < DEADZONE ? 0 : (t - Math.sign(t) * DEADZONE) / (1 - DEADZONE)
  input.tilt += (t - input.tilt) * SMOOTHING
}

function onKey(e: KeyboardEvent) {
  const down = e.type === 'keydown'
  if (e.key === 'ArrowLeft' || e.key === 'a') input.keys.left = down
  if (e.key === 'ArrowRight' || e.key === 'd') input.keys.right = down
}

let started = false
export function startInput() {
  if (started) return
  started = true
  window.addEventListener('devicemotion', onMotion)
  window.addEventListener('keydown', onKey)
  window.addEventListener('keyup', onKey)
}

/** Final horizontal control in [-1, 1] (keyboard overrides sensor for desktop testing). */
export function readTilt() {
  const k = (input.keys.right ? 1 : 0) - (input.keys.left ? 1 : 0)
  return k !== 0 ? k : input.tilt
}
