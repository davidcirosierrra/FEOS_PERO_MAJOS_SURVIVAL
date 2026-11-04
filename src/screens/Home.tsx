import { useEffect, useRef } from 'react'
import { PixelSprite } from '../components/PixelSprite'
import { useGame } from '../game/store'
import { calibrate, input, readTilt, sensorAlive, startInput } from '../input'
import { pad } from '../storage'
import type { Pattern } from '../voxel/patterns'

const TITLE = 'PARANOID'

/** Grey flying saucer used as the PLAY button. */
const PLAY_SAUCER: Pattern = {
  palette: { d: '#cfd8de', w: '#ffffff', h: '#a9b0b7', m: '#7f868d', n: '#5c6268', y: '#ffffff', k: '#3a3e43', b: '#9fe8ff' },
  rows: [
    '........ddddd........',
    '......ddwwddddd......',
    '.....dwddddddddd.....',
    '...hhhhhhhhhhhhhhh...',
    '.hhhhhhhhhhhhhhhhhhh.',
    'mmymmmymmmymmmymmmymm',
    '.nnnnnnnnnnnnnnnnnnn.',
    '...nnnnnnnnnnnnnnn...',
    '.......kkkkkkk.......',
    '......b...b...b......',
    '.....b....b....b.....',
  ],
}

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

      <button className="play intro-drop" onClick={play} aria-label="Play">
        <PixelSprite pattern={PLAY_SAUCER} scale={12} className="play-sprite">
          <text x="10.5" y="5.3" textAnchor="middle" dominantBaseline="middle" className="play-text">
            PLAY
          </text>
        </PixelSprite>
      </button>

      <div className="menu-info intro">
        <TiltMeter />
        <p>TILT TO MOVE · TAP TO FIRE</p>
        <p className="dim">3 HITS = 1 LIFE</p>
      </div>
    </div>
  )
}
