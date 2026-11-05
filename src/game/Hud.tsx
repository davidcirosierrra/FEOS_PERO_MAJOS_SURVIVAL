import { useEffect, useRef, useState } from 'react'
import { sensorAlive } from '../input'
import { PixelSprite } from '../components/PixelSprite'
import { pad } from '../storage'
import { ALIEN_ICON, MEDAL_KINDS, MEDALS } from '../voxel/patterns'
import { HITS_PER_LIFE, JUMP_CHARGE_MS, UMBRELLA_COOLDOWN_MS } from './config'
import { useGame } from './store'

export function Hud() {
  const score = useGame((s) => s.score)
  const hi = useGame((s) => s.highScore)
  const lives = useGame((s) => s.lives)
  const stage = useGame((s) => s.stage)
  const wave = useGame((s) => s.wave)
  const banner = useGame((s) => s.banner)

  return (
    <div className="hud">
      <div className="hud-top">
        <div>
          <span className="label">SCORE</span>
          <span>{pad(score)}</span>
        </div>
        <div className="right">
          <span className="label">HI</span>
          <span>{pad(Math.max(hi, score))}</span>
        </div>
      </div>

      {wave > 0 && (
        // Remounts on every new level so the slide-in animation replays.
        <div key={wave} className="level-title">
          LEVEL {wave}
        </div>
      )}
      {banner && <div className="banner blink-slow">{banner}</div>}
      <SensorWarning />

      <div className="hud-bottom">
        <div className="lives">
          {Array.from({ length: lives }, (_, i) => (
            <PixelSprite key={i} pattern={ALIEN_ICON} scale={2} />
          ))}
        </div>
        <div className="hull">
          <span className="label">HULL</span>
          {Array.from({ length: HITS_PER_LIFE }, (_, i) => (
            <i key={i} className={i < HITS_PER_LIFE - stage ? 'on' : ''} />
          ))}
        </div>
        <Medals />
        <div className="meters">
          <Meter label="UMB" readyKey="umbrellaReadyAt" total={UMBRELLA_COOLDOWN_MS} className="umb" />
          <Meter label="LOOP" readyKey="jumpReadyAt" total={JUMP_CHARGE_MS} className="jump" />
        </div>
        <div className="wave-n">L{wave}</div>
      </div>
    </div>
  )
}

export function GameOver() {
  const score = useGame((s) => s.score)
  const newRecord = useGame((s) => s.newRecord)
  const startGame = useGame((s) => s.startGame)
  const setScreen = useGame((s) => s.setScreen)
  return (
    <div className="overlay" onPointerDown={(e) => e.stopPropagation()}>
      <h2 className="gameover">GAME OVER</h2>
      <p>SCORE {pad(score)}</p>
      {newRecord && <p className="record blink">NEW HI-SCORE!</p>}
      <div className="buttons">
        <button className="pixel-btn" onClick={startGame}>
          RETRY
        </button>
        <button className="pixel-btn alt" onClick={() => setScreen('home')}>
          MENU
        </button>
      </div>
    </div>
  )
}

function SensorWarning() {
  const [missing, setMissing] = useState(false)
  useEffect(() => {
    const id = setInterval(() => setMissing(!sensorAlive()), 1000)
    return () => clearInterval(id)
  }, [])
  return missing ? <div className="sensor-warn blink">NO TILT SENSOR</div> : null
}

/** Cooldown bar that fills up and lights when ready (updated without re-rendering). */
function Meter({ label, readyKey, total, className }: { label: string; readyKey: 'umbrellaReadyAt' | 'jumpReadyAt'; total: number; className: string }) {
  const bar = useRef<HTMLElement>(null)
  const box = useRef<HTMLDivElement>(null)
  useEffect(() => {
    let raf = 0
    const tick = () => {
      const left = Math.max(0, useGame.getState()[readyKey] - performance.now())
      const k = 1 - Math.min(1, left / total)
      if (bar.current) bar.current.style.width = `${k * 100}%`
      box.current?.classList.toggle('ready', left <= 0)
      raf = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(raf)
  }, [readyKey, total])
  return (
    <div ref={box} className={`meter ${className}`}>
      <span className="label">{label}</span>
      <span className="meter-track">
        <i ref={bar} />
      </span>
    </div>
  )
}

/** Shot medals held (lit) / missing (dim). */
function Medals() {
  const medals = useGame((s) => s.medals)
  return (
    <div className="medals">
      {MEDAL_KINDS.map((k) => (
        <PixelSprite key={k} pattern={MEDALS[k]} scale={1.6} className={medals.includes(k) ? 'on' : ''} />
      ))}
    </div>
  )
}
