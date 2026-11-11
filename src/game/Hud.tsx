import { useEffect, useRef, useState } from 'react'
import { BOSSES, ENRAGE_AT } from '../bosses'
import { bossPortrait } from '../bosses/portrait'
import { character as characterOf } from '../characters'
import { PixelSprite } from '../components/PixelSprite'
import { sensorAlive } from '../input'
import { useSettings } from '../settings'
import { pad } from '../storage'
import { MEDAL_KINDS } from '../voxel/patterns'
import { PICKS } from '../voxel/theme'
import { BOSS_EVERY, JUMP_CHARGE_MS, SOLO_EVERY, UMBRELLA_COOLDOWN_MS } from './config'
import { fx } from './fx'
import { hitsPerLife, useGame } from './store'

/** Number that rolls up to its target instead of jumping (arcade style), leading zeros dimmed. */
function Counter({ value }: { value: number }) {
  const el = useRef<HTMLSpanElement>(null)
  const shown = useRef(value)
  useEffect(() => {
    let raf = 0
    const tick = () => {
      const d = value - shown.current
      shown.current = Math.abs(d) < 1 ? value : shown.current + d * 0.25
      const txt = pad(shown.current)
      const lead = txt.length - String(Math.floor(shown.current)).length
      if (el.current) el.current.innerHTML = `<i>${txt.slice(0, lead)}</i>${txt.slice(lead)}`
      if (shown.current !== value) raf = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(raf)
  }, [value])
  return <span ref={el} className="counter" />
}

export function Hud() {
  const score = useGame((s) => s.score)
  const hi = useGame((s) => s.highScore)
  const lives = useGame((s) => s.lives)
  const stage = useGame((s) => s.stage)
  const wave = useGame((s) => s.wave)
  const banner = useGame((s) => s.banner)
  const boss = useGame((s) => s.boss != null)
  const character = useSettings((s) => s.character)
  const who = characterOf(character)
  const power = who.power?.id
  const hpl = hitsPerLife()
  const beating = score > hi && hi > 0

  return (
    <div className="hud">
      <div className="hud-top">
        <div className="chip">
          <span className="label">PUNTUAK</span>
          <Counter value={score} />
        </div>
        <div className={`chip right ${beating ? 'record-run' : ''}`}>
          <span className="label">{beating ? 'ERREKOR BERRIA' : 'ERREKORRA'}</span>
          <Counter value={Math.max(hi, score)} />
        </div>
      </div>

      {boss ? <BossBar /> : wave > 0 && <LevelTrack wave={wave} />}
      {wave > 0 && <LevelCard key={wave} wave={wave} />}
      {banner && <div className="banner">{banner}</div>}
      <SensorWarning />

      <div className="hud-bottom dock">
        <div className="dock-row">
          <div className="lives">
            {Array.from({ length: lives }, (_, i) => (
              <PixelSprite key={i} pattern={who.head} scale={1.6} />
            ))}
          </div>
          <div className="hull" data-left={hpl - stage}>
            <span className="label">TXANDA</span>
            {Array.from({ length: hpl }, (_, i) => (
              <i key={i} className={i < hpl - stage ? 'on' : ''} />
            ))}
          </div>
          <Medals />
        </div>
        <div className="meters">
          <Meter label={power === 'redoble' ? 'BONBOA' : 'ATERKIA'} readyKey="umbrellaReadyAt" total={UMBRELLA_COOLDOWN_MS} className="umb" />
          <Meter label={power === 'oihua' ? 'OIHUA' : 'JAUZIA'} readyKey="jumpReadyAt" total={JUMP_CHARGE_MS} className="jump" />
          {power === 'solo' && <SoloMeter />}
        </div>
      </div>
      <Flash />
    </div>
  )
}

/** Where you are on the way to the next boss: one pip per level, the last one is the boss. */
function LevelTrack({ wave }: { wave: number }) {
  const inBlock = ((wave - 1) % BOSS_EVERY) + 1
  const next = BOSSES[Math.min(Math.floor((wave - 1) / BOSS_EVERY), BOSSES.length - 1)]
  return (
    <div className="level-track">
      <span className="lv">M{wave}</span>
      <span className="pips">
        {Array.from({ length: BOSS_EVERY - 1 }, (_, i) => (
          <i key={i} className={i < inBlock ? 'on' : ''} />
        ))}
      </span>
      <img className="next-boss" src={bossPortrait(next)} alt="" />
    </div>
  )
}

/** Slides across at the start of every level; bosses get a hazard-stripe warning card. */
function LevelCard({ wave }: { wave: number }) {
  if (wave % BOSS_EVERY !== 0) {
    return (
      <div className="level-card">
        <small>MAILA</small>
        <b>{wave}</b>
      </div>
    )
  }
  const index = Math.min(wave / BOSS_EVERY - 1, BOSSES.length - 1)
  const def = BOSSES[index]
  return (
    <div className="level-card boss">
      <span className="hazard" />
      <small>
        KONTUZ! · BURUZAGIA {index + 1}/{BOSSES.length}
      </small>
      <b>{def.name}</b>
      <em>{def.intro}</em>
      <span className="hazard" />
    </div>
  )
}

export function GameOver() {
  const score = useGame((s) => s.score)
  const wave = useGame((s) => s.wave)
  const newRecord = useGame((s) => s.newRecord)
  const startGame = useGame((s) => s.startGame)
  const setScreen = useGame((s) => s.setScreen)
  const bosses = Math.floor((wave - 1) / BOSS_EVERY)
  return (
    <div className="overlay" onPointerDown={(e) => e.stopPropagation()}>
      <div className="panel result">
        <h2 className="gameover">JOKOA AMAITU DA</h2>
        <dl className="stats">
          <dt>PUNTUAK</dt>
          <dd>{pad(score)}</dd>
          <dt>MAILA</dt>
          <dd>{wave}</dd>
          <dt>BURUZAGIAK</dt>
          <dd>
            {bosses}/{BOSSES.length}
          </dd>
        </dl>
        {newRecord && <p className="record blink">ERREKOR BERRIA!</p>}
        <div className="buttons">
          <button className="pixel-btn" onClick={startGame}>
            BERRIRO
          </button>
          <button className="pixel-btn alt" onClick={() => setScreen('home')}>
            MENUA
          </button>
        </div>
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
  return missing ? <div className="sensor-warn blink">SENTSORERIK EZ</div> : null
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

/** Guitarist: fans in a row towards the next solo. */
function SoloMeter() {
  const streak = useGame((s) => s.streak)
  const n = streak % SOLO_EVERY
  return (
    <div className={`meter solo ${n === SOLO_EVERY - 1 ? 'ready' : ''}`}>
      <span className="label">SOLOA</span>
      <span className="meter-track">
        <i style={{ width: `${(n / SOLO_EVERY) * 100}%` }} />
      </span>
    </div>
  )
}

/** Shot picks held (lit) / missing (dim). */
function Medals() {
  const medals = useGame((s) => s.medals)
  return (
    <div className="medals">
      {MEDAL_KINDS.map((k) => (
        <PixelSprite key={k} pattern={PICKS[k]} scale={1.6} className={medals.includes(k) ? 'on' : ''} />
      ))}
    </div>
  )
}

/** Boss name + segmented health bar; turns red once it is angry. */
function BossBar() {
  const boss = useGame((s) => s.boss)
  if (!boss) return null
  const def = BOSSES[boss.index]
  const k = boss.hp / boss.maxHp
  return (
    <div className={`boss-bar ${k < ENRAGE_AT ? 'angry' : ''}`}>
      <img src={bossPortrait(def)} alt="" />
      <div>
        <span className="label">{def.name}</span>
        <span className="boss-track">
          <i style={{ width: `${k * 100}%` }} />
        </span>
      </div>
    </div>
  )
}

/** Full-screen hit feedback: red vignette when hurt, white pop when a boss blows up. */
function Flash() {
  const el = useRef<HTMLDivElement>(null)
  useEffect(() => {
    let raf = 0
    const tick = () => {
      const d = el.current
      if (d) {
        const age = performance.now() - fx.flashAt
        const dur = fx.flashKind === 'white' ? 500 : 380
        const k = fx.flashAt && age < dur ? 1 - age / dur : 0
        d.style.opacity = String(k)
        if (k) d.className = `flash ${fx.flashKind}`
      }
      raf = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(raf)
  }, [])
  return <div ref={el} className="flash" style={{ opacity: 0 }} />
}
