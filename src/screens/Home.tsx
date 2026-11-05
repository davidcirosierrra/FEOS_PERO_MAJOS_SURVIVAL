import { useEffect, useRef } from 'react'
import { useGame } from '../game/store'
import { calibrate, input, readTilt, sensorAlive, startInput } from '../input'
import { pad } from '../storage'

const TITLE = 'PARANOID'

// Warm up the game chunk (Rapier) while the player looks at the home screen.
const preload = () => void import('./Game')

async function goFullscreen() {
  try {
    if (!document.fullscreenElement) await document.documentElement.requestFullscreen({ navigationUI: 'hide' })
    await (screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> }).lock?.('portrait')
  } catch {
    /* not supported / not allowed: play windowed */
  }
}

/** Live tilt meter so it is obvious whether the phone sensor is delivering data. */
function TiltMeter() {
  const dot = useRef<HTMLElement>(null)
  const label = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    let raf = 0
    const tick = () => {
      const alive = sensorAlive()
      const t = alive ? Math.max(-1, Math.min(1, input.raw)) : readTilt()
      if (dot.current) dot.current.style.left = `${50 + t * 46}%`
      if (label.current) label.current.textContent = alive ? 'SENSOR OK' : 'NO SENSOR · TAP'
      label.current?.classList.toggle('warn', !alive)
      raf = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(raf)
  }, [])
  return (
    <div className="tilt-meter">
      <div className="tilt-track">
        <i ref={dot} />
      </div>
      <span ref={label} />
    </div>
  )
}

export function Home() {
  const hi = useGame((s) => s.highScore)
  const startGame = useGame((s) => s.startGame)
  useEffect(preload, [])

  const play = async () => {
    await startInput(true)
    calibrate()
    void goFullscreen()
    startGame()
  }

  return (
    <div className="screen home" onPointerDown={() => void startInput(true)}>
      <h1 className="title" aria-label={TITLE}>
        {[...TITLE].map((ch, i) => (
          <span key={i} style={{ animationDelay: `${0.2 + i * 0.1}s` }}>
            {ch}
          </span>
        ))}
      </h1>

      <p className="hi intro">
        HI-SCORE <b>{pad(hi)}</b>
      </p>

      <button className="pixel-btn play-btn intro-drop" onClick={play}>
        PLAY
      </button>

      <div className="menu-info intro">
        <TiltMeter />
        <p>TILT TO MOVE · TAP TO FIRE</p>
        <p>SWIPE UP: LOOP</p>
        <p>SWIPE DOWN: UMBRELLA</p>
        <p className="dim">3 HITS = 1 LIFE</p>
        <p className="dim">RED PIERCE · BLUE x2 · YELLOW FAST</p>
      </div>
    </div>
  )
}
