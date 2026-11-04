import { PixelSprite } from '../components/PixelSprite'
import { pad } from '../storage'
import { ALIEN_ICON } from '../voxel/patterns'
import { HITS_PER_LIFE } from './config'
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

      {banner && <div className="banner blink-slow">{banner}</div>}

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
        <div className="wave-n">W{wave}</div>
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
        <button className="pixel-btn alt" onClick={() => setScreen('menu')}>
          MENU
        </button>
      </div>
    </div>
  )
}
