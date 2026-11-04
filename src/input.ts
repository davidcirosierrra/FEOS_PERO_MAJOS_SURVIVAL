/**
 * Tilt input. Mutable singleton read every frame (no React re-renders).
 * `raw` is the smoothed sensor tilt in [-1, 1] (negative = left), `offset` the neutral position
 * captured when a game starts, so the phone can be held at any comfortable angle.
 */
export type TiltSource = 'none' | 'motion' | 'sensor-api' | 'orientation'

export const input = {
  raw: 0,
  offset: 0,
  source: 'none' as TiltSource,
  lastAt: 0,
  events: 0,
  keys: { left: false, right: false },
}

/** Degrees of roll needed for full speed. */
const FULL_TILT_DEG = 22
const FULL_TILT_ACC = 9.81 * Math.sin((FULL_TILT_DEG * Math.PI) / 180)
const DEADZONE = 0.05
const SMOOTHING = 0.4
/** A lower-priority source is ignored while a better one delivered data recently. */
const STALE_MS = 400

const IOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
const PRIORITY: Record<TiltSource, number> = { none: 0, orientation: 1, 'sensor-api': 2, motion: 3 }

function screenAngle() {
  return screen.orientation?.angle ?? (window as { orientation?: number }).orientation ?? 0
}

/** Map a device-frame gravity vector to "right edge down" in [-1, 1] for the current screen rotation. */
function fromGravity(x: number, y: number) {
  const a = screenAngle()
  let ax = a === 90 ? y : a === 270 || a === -90 ? -y : a === 180 ? -x : x
  if (IOS) ax = -ax
  return -ax / FULL_TILT_ACC // Android: right edge down → x negative
}

function feed(value: number, source: TiltSource) {
  if (!Number.isFinite(value)) return
  const now = performance.now()
  if (PRIORITY[source] < PRIORITY[input.source] && now - input.lastAt < STALE_MS) return
  input.source = source
  input.lastAt = now
  input.events++
  const t = Math.max(-1.5, Math.min(1.5, value))
  input.raw += (t - input.raw) * SMOOTHING
}

function onMotion(e: DeviceMotionEvent) {
  const g = e.accelerationIncludingGravity
  if (g?.x == null || g.y == null) return
  feed(fromGravity(g.x, g.y), 'motion')
}

function onOrientation(e: DeviceOrientationEvent) {
  if (e.gamma == null) return
  const a = screenAngle()
  // gamma = roll around the device's long axis; only meaningful in portrait.
  if (a !== 0 && a !== 180) return
  feed(((a === 180 ? -1 : 1) * e.gamma) / FULL_TILT_DEG, 'orientation')
}

type GenericSensor = EventTarget & { x?: number; y?: number; start: () => void }
type SensorCtor = new (opts: { frequency: number }) => GenericSensor

function startSensorApi() {
  const w = window as unknown as { GravitySensor?: SensorCtor; Accelerometer?: SensorCtor }
  const Ctor = w.GravitySensor ?? w.Accelerometer
  if (!Ctor) return
  try {
    const s = new Ctor({ frequency: 60 })
    s.addEventListener('reading', () => {
      if (s.x != null && s.y != null) feed(fromGravity(s.x, s.y), 'sensor-api')
    })
    s.addEventListener('error', () => {})
    s.start()
  } catch {
    /* blocked by permissions policy / not allowed */
  }
}

function onKey(e: KeyboardEvent) {
  const down = e.type === 'keydown'
  if (e.key === 'ArrowLeft' || e.key === 'a') input.keys.left = down
  if (e.key === 'ArrowRight' || e.key === 'd') input.keys.right = down
}

type PermissionCtor = { requestPermission?: () => Promise<'granted' | 'denied'> }

/**
 * Starts every available tilt source. Call it once at load and again from a user gesture:
 * iOS needs the gesture for its permission prompt, and some Android builds only deliver
 * sensor events after the first interaction.
 */
let listening = false
let sensorApiStarted = false
export async function startInput(fromGesture = false) {
  if (!listening) {
    listening = true
    window.addEventListener('devicemotion', onMotion)
    window.addEventListener('deviceorientation', onOrientation)
    window.addEventListener('keydown', onKey)
    window.addEventListener('keyup', onKey)
  }
  if (!fromGesture) return
  for (const Ctor of [globalThis.DeviceMotionEvent, globalThis.DeviceOrientationEvent] as PermissionCtor[]) {
    if (typeof Ctor?.requestPermission === 'function') {
      try {
        await Ctor.requestPermission()
      } catch {
        /* denied */
      }
    }
  }
  if (!sensorApiStarted) {
    sensorApiStarted = true
    startSensorApi()
  }
}

export const sensorAlive = () => performance.now() - input.lastAt < 1000

/** Current position becomes "neutral". */
export function calibrate() {
  input.offset = sensorAlive() ? input.raw : 0
}

function shape(t: number) {
  const c = Math.max(-1, Math.min(1, t))
  return Math.abs(c) < DEADZONE ? 0 : (c - Math.sign(c) * DEADZONE) / (1 - DEADZONE)
}

/** Final horizontal control in [-1, 1] (keyboard overrides sensor for desktop testing). */
export function readTilt() {
  const k = (input.keys.right ? 1 : 0) - (input.keys.left ? 1 : 0)
  if (k !== 0) return k
  return sensorAlive() ? shape(input.raw - input.offset) : 0
}
