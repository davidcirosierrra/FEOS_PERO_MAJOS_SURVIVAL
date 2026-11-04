import { useGame } from '../game/store'
import { pad } from '../storage'

const TITLE = 'PARANOID'

export function Splash() {
  const hi = useGame((s) => s.highScore)
  const setScreen = useGame((s) => s.setScreen)
  return (
    <div className="screen splash" onClick={() => setScreen('menu')}>
      <h1 className="title" aria-label={TITLE}>
        {[...TITLE].map((ch, i) => (
          <span key={i} style={{ animationDelay: `${1.3 + i * 0.12}s` }}>
            {ch}
          </span>
        ))}
      </h1>
      <div className="splash-bottom">
        <p className="hi">
          HI-SCORE <b>{pad(hi)}</b>
        </p>
        <p className="blink tap">TAP TO START</p>
      </div>
    </div>
  )
}
