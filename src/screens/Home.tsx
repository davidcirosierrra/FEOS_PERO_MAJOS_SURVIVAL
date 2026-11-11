import { useEffect, useRef, useState } from 'react'
import { sfx, unlockAudio } from '../audio'
import { BOSSES } from '../bosses'
import { bossPortrait } from '../bosses/portrait'
import { character as characterOf, PLAYABLE } from '../characters'
import { ConfigPanel } from '../components/Config'
import { PixelSprite } from '../components/PixelSprite'
import { useGame } from '../game/store'
import { calibrate, input, readTilt, sensorAlive, startInput } from '../input'
import { useSettings } from '../settings'
import { pad } from '../storage'
import type { Pattern } from '../voxel/patterns'

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

/**
 * The hero on its spotlight. With more than one playable character the arrows cycle through
 * them; with a single one it is simply shown off.
 */
function CharacterSelect() {
  const id = useSettings((s) => s.character)
  const set = useSettings((s) => s.set)
  const who = characterOf(id)
  const many = PLAYABLE.length > 1
  const cycle = (d: number) => {
    unlockAudio()
    sfx.click()
    const i = Math.max(0, PLAYABLE.indexOf(who.id))
    set({ character: PLAYABLE[(i + d + PLAYABLE.length) % PLAYABLE.length] })
  }
  return (
    <div className="hero intro" onPointerDown={(e) => e.stopPropagation()}>
      <span className="hero-beam" />
      {many && (
        <button className="hero-arrow" aria-label="Aurrekoa" onClick={() => cycle(-1)}>
          ‹
        </button>
      )}
      <div className="hero-figure" key={who.id}>
        <PixelSprite pattern={who.pattern} scale={4} />
        <span className="hero-shadow" />
      </div>
      {many && (
        <button className="hero-arrow" aria-label="Hurrengoa" onClick={() => cycle(1)}>
          ›
        </button>
      )}
      <div className="hero-plate">
        <b>{who.name}</b>
        <small>{who.blurb}</small>
        {many && (
          <span className="hero-dots">
            {PLAYABLE.map((p) => (
              <i key={p} className={p === who.id ? 'on' : ''} />
            ))}
          </span>
        )}
      </div>
    </div>
  )
}

/** The six bosses: silhouettes until you have beaten them at least once. */
function BossGallery() {
  const best = useGame((s) => s.bestBoss)
  return (
    <div className="boss-gallery intro">
      <span className="label">
        BURUZAGIAK {Math.min(best, BOSSES.length)}/{BOSSES.length}
      </span>
      <div>
        {BOSSES.map((b, i) => (
          <img key={b.id} src={bossPortrait(b)} alt={i < best ? b.name : '?'} className={i < best ? 'beaten' : ''} />
        ))}
      </div>
    </div>
  )
}

const ICON_PAL = { w: '#ffffff', p: '#ff7eb6', c: '#5ef6ff', y: '#ffe14d', k: '#1a1020' }
const ICONS: Record<string, Pattern> = {
  tilt: { palette: ICON_PAL, rows: ['...ppp...', '...pkp...', 'w..pkp..w', 'ww.pkp.ww', 'w..pkp..w', '...pkp...', '...ppp...'] },
  tap: { palette: ICON_PAL, rows: ['..yyy..', '.y...y.', 'y..w..y', 'y.www.y', 'y..w..y', '.y...y.', '..yyy..'] },
  up: { palette: ICON_PAL, rows: ['...c...', '..ccc..', '.ccccc.', 'ccccccc', '..ccc..', '..ccc..', '..ccc..'] },
  down: { palette: ICON_PAL, rows: ['..ppp..', '..ppp..', '..ppp..', 'ppppppp', '.ppppp.', '..ppp..', '...p...'] },
}
const HOW: [string, string, string][] = [
  ['tilt', 'MAKURTU', 'MUGITU'],
  ['tap', 'UKITU', 'TIRO'],
  ['up', 'GORA', 'JAUZIA'],
  ['down', 'BEHERA', 'ATERKIA'],
]

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
      <div className="beams" aria-hidden>
        <i />
        <i />
        <i />
      </div>

      <div className="title-block">
        <h1 className="title" aria-label="Feos pero majos">
          {TITLE_LINES.map((line, l) => (
            <span key={l} className="title-line">
              {[...line].map((ch, i) => (
                <span key={i} style={{ animationDelay: `${0.2 + (l * 9 + i) * 0.07}s` }}>
                  {ch === ' ' ? ' ' : ch}
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
        <BossGallery />
        <div className="how">
          {HOW.map(([icon, a, b]) => (
            <div key={icon} className="how-card">
              <PixelSprite pattern={ICONS[icon]} scale={2} />
              <span>{a}</span>
              <b>{b}</b>
            </div>
          ))}
        </div>
        <TiltMeter />
      </div>
      {config && <ConfigPanel onClose={() => setConfig(false)} />}
    </div>
  )
}
