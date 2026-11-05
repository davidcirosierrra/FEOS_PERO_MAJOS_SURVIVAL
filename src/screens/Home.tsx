import { useEffect, useRef, useState } from 'react'
import { sfx, unlockAudio } from '../audio'
import { ConfigPanel } from '../components/Config'
import { PixelSprite } from '../components/PixelSprite'
import { useSettings } from '../settings'
import { CHARACTERS, PLAYABLE } from '../voxel/theme'
import { useGame } from '../game/store'
import { calibrate, input, readTilt, sensorAlive, startInput } from '../input'
import { pad } from '../storage'

const TITLE_LINES = ['FEOS PERO', 'MAJOS']

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
      if (label.current) label.current.textContent = alive ? 'SENTSOREA ONDO' : 'SENTSORERIK EZ · UKITU'
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

/** Pick who walks to the stage: the bass player or the pink pig. */
function CharacterSelect() {
  const character = useSettings((s) => s.character)
  const set = useSettings((s) => s.set)
  return (
    <div className="char-select intro" onPointerDown={(e) => e.stopPropagation()}>
      {PLAYABLE.map((id) => (
        <button
          key={id}
          className={`char-card ${character === id ? 'on' : ''} ${PLAYABLE.length === 1 ? 'solo' : ''}`}
          onClick={() => {
            unlockAudio()
            sfx.click()
            set({ character: id })
          }}
        >
          <PixelSprite pattern={CHARACTERS[id].pattern} scale={4} />
          <span>{CHARACTERS[id].name}</span>
        </button>
      ))}
    </div>
  )
}

export function Home() {
  const hi = useGame((s) => s.highScore)
  const startGame = useGame((s) => s.startGame)
  const [config, setConfig] = useState(false)
  useEffect(preload, [])

  const play = async () => {
    unlockAudio()
    sfx.click()
    await startInput(true)
    calibrate()
    void goFullscreen()
    startGame()
  }

  return (
    <div
      className="screen home"
      onPointerDown={() => {
        // First touch unlocks audio (browsers need a gesture) and the motion sensors.
        unlockAudio()
        void startInput(true)
      }}
    >
      <div className="title-block">
        <h1 className="title" aria-label="Feos pero majos">
          {TITLE_LINES.map((line, l) => (
            <span key={l} className="title-line">
              {[...line].map((ch, i) => (
                <span key={i} style={{ animationDelay: `${0.2 + (l * 9 + i) * 0.07}s` }}>
                  {ch === ' ' ? '\u00a0' : ch}
                </span>
              ))}
            </span>
          ))}
        </h1>
        <p className="subtitle intro">SURVIVAL</p>
        <p className="hi intro">
          ERREKORRA <b>{pad(hi)}</b>
        </p>
      </div>

      <CharacterSelect />

      <div className="home-buttons intro-drop">
        <button className="pixel-btn play-btn" onClick={play}>
          JOLASTU
        </button>
        <button
          className="pixel-btn alt small"
          onClick={() => {
            sfx.click()
            setConfig(true)
          }}
        >
          EZARPENAK
        </button>
      </div>

      <div className="menu-info intro">
        <TiltMeter />
        <p>MAKURTU MUGITZEKO</p>
        <p>UKITU TIRO EGITEKO</p>
        <p>GORA LERRATU: JAUZIA</p>
        <p>BEHERA LERRATU: ATERKIA</p>
        <p className="dim">3 KOLPE = TXANDA 1</p>
        <p className="dim">PUAK: GORRIA ZULATU</p>
        <p className="dim">URDINA x2 · HORIA AZKAR</p>
      </div>
      {config && <ConfigPanel onClose={() => setConfig(false)} />}
    </div>
  )
}
