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
      <div className={`hero-figure ${who.partner ? 'duo' : ''}`} key={who.id} onClick={() => many && cycle(1)}>
        <span className="hero-bodies">
          <PixelSprite pattern={who.pattern} scale={4} />
          {who.partner && <PixelSprite pattern={who.partner} scale={4} />}
        </span>
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
        {who.power && (
          <span className="hero-power" key={who.id}>
            <em>{who.power.name}</em>
            {who.power.text}
          </span>
        )}
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

/** Tiny animated previews of the two views. */
function ViewThumb({ kind }: { kind: 'top' | 'eyes' }) {
  if (kind === 'top')
    return (
      <svg viewBox="0 0 40 30" className="thumb top" shapeRendering="crispEdges" aria-hidden>
        <rect width="40" height="30" fill="#8a879e" />
        <rect width="5" height="30" fill="#4a3a5a" />
        <rect x="35" width="5" height="30" fill="#4a3a5a" />
        <g className="t-floor" fill="#77748c">
          {[0, 8, 16, 24, 32].map((y) => (
            <rect key={y} x="5" y={y} width="30" height="1" />
          ))}
        </g>
        <g className="t-fans">
          <rect x="10" y="4" width="3" height="4" fill="#ffd23d" />
          <rect x="19" y="2" width="3" height="4" fill="#5ef6ff" />
          <rect x="28" y="5" width="3" height="4" fill="#c48ad8" />
        </g>
        <rect className="t-fork" x="20" y="18" width="1" height="3" fill="#ff7eb6" />
        <rect x="18" y="23" width="5" height="5" fill="#ff8fc0" />
        <rect x="19" y="22" width="3" height="1" fill="#1c1410" />
      </svg>
    )
  return (
    <svg viewBox="0 0 40 30" className="thumb eyes" shapeRendering="crispEdges" aria-hidden>
      <rect width="40" height="30" fill="#140b22" />
      <rect x="6" y="3" width="1" height="1" fill="#fff" />
      <rect x="31" y="2" width="1" height="1" fill="#fff" />
      <polygon points="0,0 15,11 15,14 0,30" fill="#d9a85a" />
      <polygon points="40,0 25,11 25,14 40,30" fill="#8ab8d0" />
      <polygon points="15,14 25,14 40,30 0,30" fill="#8a879e" />
      <rect x="16" y="10" width="8" height="3" fill="#ff7eb6" />
      <g className="e-lines" fill="#6f6c86">
        <rect x="0" y="0" width="40" height="1" />
      </g>
      <rect className="e-fan" x="19" y="12" width="2" height="3" fill="#ffd23d" />
      <g fill="#3346a8">
        <rect x="27" y="20" width="1" height="3" />
        <rect x="29" y="20" width="1" height="3" />
        <rect x="31" y="20" width="1" height="3" />
        <rect x="27" y="23" width="5" height="1" />
        <rect x="29" y="24" width="2" height="6" />
      </g>
      <rect x="28" y="26" width="4" height="3" fill="#ffa3cc" />
    </svg>
  )
}

const VIEWS = [
  { id: 'top', name: 'GOITIK', hint: 'KLASIKOA' },
  { id: 'eyes', name: 'BEGIETATIK', hint: 'ZURE BEGIEKIN' },
] as const

/** Top-down or first person, chosen before playing (also in the in-game settings). */
function ViewPicker() {
  const camera = useSettings((s) => s.camera)
  const set = useSettings((s) => s.set)
  return (
    <div className="view-picker intro" onPointerDown={(e) => e.stopPropagation()}>
      <span className="label">IKUSPEGIA</span>
      <div className="view-options" role="radiogroup" aria-label="Ikuspegia" data-on={camera}>
        <i className="view-glider" aria-hidden />
        {VIEWS.map((v) => (
          <button
            key={v.id}
            role="radio"
            aria-checked={camera === v.id}
            className={`view-card ${camera === v.id ? 'on' : ''}`}
            onClick={() => {
              unlockAudio()
              if (camera !== v.id) sfx.click()
              set({ camera: v.id })
            }}
          >
            <ViewThumb kind={v.id} />
            <b>{v.name}</b>
            <small>{v.hint}</small>
          </button>
        ))}
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
/** Controls card: up / down change meaning for characters whose power replaces them. */
const how = (power?: string): [string, string, string][] => [
  ['tilt', 'MAKURTU', 'MUGITU'],
  ['tap', 'UKITU', 'TIRO'],
  ['up', 'GORA', power === 'oihua' ? 'OIHUA' : 'JAUZIA'],
  ['down', 'BEHERA', power === 'redoble' ? 'BONBOA' : 'ATERKIA'],
]

export function Home() {
  const hi = useGame((s) => s.highScore)
  const startGame = useGame((s) => s.startGame)
  const [config, setConfig] = useState(false)
  const power = characterOf(useSettings((s) => s.character)).power?.id
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

      <ViewPicker />

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
          {how(power).map(([icon, a, b]) => (
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
