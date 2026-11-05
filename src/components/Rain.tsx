import { useEffect, useRef } from 'react'
import { rainDrip, setRain } from '../audio'
import { useGame } from '../game/store'
import { useEyes } from '../scene/View'

const W = 120 // low-res canvas, upscaled pixelated
const H = 260

/** Rain overlay (pixel streaks + darkening) and rain sound, while `raining` is on. */
export function Rain() {
  const raining = useGame((s) => s.raining && !s.gameOver)
  const paused = useGame((s) => s.paused)
  const eyes = useEyes()
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    setRain(raining && !paused)
    return () => setRain(false)
  }, [raining, paused])

  useEffect(() => {
    if (!raining) return
    const c = canvas.current
    const g = c?.getContext('2d')
    if (!c || !g) return
    // In the top view rain falls "into" the screen: short slanted streaks + splashes on the
    // pavement. In first person: long streaks falling past the camera.
    const drops = Array.from({ length: eyes ? 90 : 70 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      v: (eyes ? 220 : 140) + Math.random() * 80,
      len: eyes ? 6 + Math.random() * 8 : 2 + Math.random() * 3,
    }))
    const splashes: { x: number; y: number; t: number }[] = []
    let raf = 0
    let prev = performance.now()
    let dripIn = 1
    const tick = () => {
      const now = performance.now()
      const dt = Math.min(0.05, (now - prev) / 1000)
      prev = now
      if (!useGame.getState().paused) {
        g.clearRect(0, 0, W, H)
        g.fillStyle = 'rgba(20, 24, 48, 0.25)'
        g.fillRect(0, 0, W, H)
        g.fillStyle = 'rgba(190, 210, 255, 0.55)'
        for (const d of drops) {
          d.y += d.v * dt
          d.x -= d.v * dt * 0.18
          if (d.y > H || d.x < 0) {
            if (!eyes && Math.random() < 0.5) splashes.push({ x: d.x, y: Math.random() * H, t: 0 })
            d.y = -d.len
            d.x = Math.random() * (W + 30)
          }
          for (let i = 0; i < d.len; i++) g.fillRect(Math.round(d.x - i * 0.18), Math.round(d.y - i), 1, 1)
        }
        g.fillStyle = 'rgba(210, 225, 255, 0.6)'
        for (let i = splashes.length - 1; i >= 0; i--) {
          const s = splashes[i]
          s.t += dt
          const r = Math.round(s.t * 10)
          g.fillRect(s.x - r, s.y, 1, 1)
          g.fillRect(s.x + r, s.y, 1, 1)
          if (s.t > 0.25) splashes.splice(i, 1)
        }
        dripIn -= dt
        if (dripIn <= 0) {
          rainDrip()
          dripIn = 0.15 + Math.random() * 0.6
        }
      }
      raf = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(raf)
  }, [raining, eyes])

  if (!raining) return null
  return <canvas ref={canvas} className="rain" width={W} height={H} />
}
