import { useEffect } from 'react'
import { PixelSprite } from '../components/PixelSprite'
import { useGame } from '../game/store'
import { requestMotionPermission, startInput } from '../input'
import { pad } from '../storage'
import type { Pattern } from '../voxel/patterns'

/** Big saucer used as the PLAY button. */
const PLAY_SAUCER: Pattern = {
  palette: { c: '#5ef6ff', w: '#ffffff', g: '#39ff6a', G: '#169c3c', y: '#fff35c', b: '#5ef6ff' },
  rows: [
    '.......ccccccc.......',
    '.....ccwwccccccc.....',
    '....cwccccccccccc....',
    '..ggggggggggggggggg..',
    '.gGGgGGgGGgGGgGGgGGg.',
    'ggggggggggggggggggggg',
    'ggggggggggggggggggggg',
    '.ggggggggggggggggggg.',
    '..yy...yy...yy...yy..',
    '.....b...b...b...b...',
    '....b...b.....b...b..',
  ],
}

async function goFullscreen() {
  try {
    if (!document.fullscreenElement) await document.documentElement.requestFullscreen({ navigationUI: 'hide' })
    await (screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> }).lock?.('portrait')
  } catch {
    /* not supported / not allowed: play windowed */
  }
}

// Warm up the game chunk while the player looks at the menu.
const preload = () => void import('./Game')

export function Menu() {
  useEffect(preload, [])
  const hi = useGame((s) => s.highScore)
  const startGame = useGame((s) => s.startGame)
  const setScreen = useGame((s) => s.setScreen)

  const play = async () => {
    // Permission must be requested inside the tap (iOS); Android grants it silently.
    await requestMotionPermission()
    startInput()
    void goFullscreen()
    startGame()
  }

  return (
    <div className="screen menu">
      <h1 className="title small" onClick={() => setScreen('splash')}>
        PARANOID
      </h1>

      <button className="play" onClick={play} aria-label="Play">
        <PixelSprite pattern={PLAY_SAUCER} scale={12} className="play-sprite">
          <text x="10.5" y="6.9" textAnchor="middle" className="play-text">
            PLAY
          </text>
        </PixelSprite>
      </button>

      <div className="menu-info">
        <p className="hi">
          HI-SCORE <b>{pad(hi)}</b>
        </p>
        <p>TILT TO MOVE</p>
        <p>TAP TO FIRE</p>
        <p className="dim">3 HITS = 1 LIFE</p>
      </div>
    </div>
  )
}
