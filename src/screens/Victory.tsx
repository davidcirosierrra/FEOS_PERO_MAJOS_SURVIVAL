import { useMemo } from 'react'
import { character as characterOf } from '../characters'
import { ShareButton } from '../components/ShareButton'
import { useGame } from '../game/store'
import { useSettings } from '../settings'
import { pad } from '../storage'
import { WIN_CANS, WIN_STAGE } from '../voxel/bosses.gen'
import { patternDataURL, patternSize } from '../voxel/patterns'
import { FANS } from '../voxel/theme'

const BEAM: Record<string, string> = { pink: '255,126,182', yellow: '255,225,77', cyan: '94,246,255', red: '255,61,90' }
const CONFETTI = ['#ff7eb6', '#5ef6ff', '#ffe14d', '#ffffff', '#c48ad8', '#39ff6a']

/**
 * The ending: the band finally reaches the stage. Lights come on over the waiting instruments,
 * the crowd goes wild, and the setlist taped to the floor says what they came to play.
 * Everything is DOM pixel art, sized in "stage pixels" (`--u` = 1/120 of the screen width).
 */
export function Victory() {
  const score = useGame((s) => s.score)
  const newRecord = useGame((s) => s.newRecord)
  const startGame = useGame((s) => s.startGame)
  const setScreen = useGame((s) => s.setScreen)
  const who = characterOf(useSettings((s) => s.character))
  const stage = patternSize(WIN_STAGE)
  const hero = patternSize(who.pattern)

  const crowd = useMemo(
    () =>
      Array.from({ length: 11 }, (_, i) => ({
        look: (i * 3 + 1) % FANS.length,
        x: -4 + i * 11.4 + ((i * 7) % 5),
        delay: ((i * 37) % 10) / 14,
        lighter: i % 3 === 1,
        back: i % 2 === 1,
      })),
    [],
  )
  const confetti = useMemo(
    () =>
      Array.from({ length: 34 }, (_, i) => ({
        x: (i * 37 + 11) % 100,
        delay: ((i * 53) % 40) / 10,
        dur: 3.2 + ((i * 29) % 20) / 10,
        color: CONFETTI[i % CONFETTI.length],
        w: 1 + (i % 2),
      })),
    [],
  )

  return (
    <div className="victory" onPointerDown={(e) => e.stopPropagation()}>
      <div className="win-head">
        <h2 className="win-title">
          {[...'IRABAZI DUZU!'].map((ch, i) => (
            <span key={i} style={{ animationDelay: `${1.5 + i * 0.05}s` }}>
              {ch === ' ' ? ' ' : ch}
            </span>
          ))}
        </h2>
        <p className="win-sub">AGERTOKIRA IRITSI ZARA</p>
      </div>

      <div className="win-scene" style={{ aspectRatio: `${stage.w} / ${stage.h + 14}` }}>
        <img className="win-stage" src={patternDataURL(WIN_STAGE)} alt="Agertokia: bateria, baxua, gitarra, mikrofonoa eta anplifikadoreak" />
        {WIN_CANS.map(([x, color], i) => (
          <i
            key={i}
            className="win-beam"
            style={{
              left: `calc(var(--u) * ${x})`,
              ['--rgb' as string]: BEAM[color],
              ['--tilt' as string]: `${(x - 60) * 0.32}deg`,
              animationDelay: `${0.5 + i * 0.12}s, ${1.4 + i * 0.3}s`,
            }}
          />
        ))}
        {[who.pattern, who.partner].map(
          (p, i) =>
            p && (
              <img
                key={i}
                className="win-hero"
                src={patternDataURL(p)}
                alt={i ? '' : who.name}
                style={{
                  width: `calc(var(--u) * ${hero.w * 0.8})`,
                  left: `calc(var(--u) * ${who.partner ? 24 + i * 72 : 31})`,
                  bottom: `calc(var(--u) * ${14 + 16})`,
                  animationDelay: `2s, ${2 + i * 0.27}s`,
                }}
              />
            ),
        )}
        <div className="win-crowd">
          {crowd.map((f, i) => (
            <span key={i} className={f.back ? 'back' : ''} style={{ left: `calc(var(--u) * ${f.x})`, animationDelay: `${f.delay}s` }}>
              <img src={patternDataURL(FANS[f.look])} alt="" />
              {f.lighter && <b />}
            </span>
          ))}
        </div>
        <div className="win-confetti" aria-hidden>
          {confetti.map((c, i) => (
            <i
              key={i}
              style={{ left: `${c.x}%`, background: c.color, width: `calc(var(--u) * ${c.w})`, animationDelay: `${2 + c.delay}s`, animationDuration: `${c.dur}s` }}
            />
          ))}
        </div>
      </div>

      <div className="win-foot">
        <div className="setlist" role="img" aria-label="Setlist: Odio a la paja">
          <i className="tape l" />
          <i className="tape r" />
          <h3>SETLIST</h3>
          <ol>
            <li>ODIO A LA PAJA</li>
          </ol>
          <p className="bis">BIS: ODIO A LA PAJA</p>
        </div>
        <div className="win-result">
          <p>
            PUNTUAK <b>{pad(score)}</b>
          </p>
          {newRecord && <p className="record blink">ERREKOR BERRIA!</p>}
          <ShareButton />
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
    </div>
  )
}
