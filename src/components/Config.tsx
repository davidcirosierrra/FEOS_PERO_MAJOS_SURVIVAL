import { sfx, unlockAudio } from '../audio'
import { useGame } from '../game/store'
import { useSettings, type Settings } from '../settings'
import type { Pattern } from '../voxel/patterns'
import { PixelSprite } from './PixelSprite'

const GEAR: Pattern = {
  palette: { g: '#c9ccd2', k: '#05010f' },
  rows: ['..g.g..', '.ggggg.', 'gggkggg', 'ggkkkgg', 'gggkggg', '.ggggg.', '..g.g..'],
}

/** Gear button (top centre) that pauses the game and opens the config panel. */
export function ConfigButton() {
  const setPaused = useGame((s) => s.setPaused)
  return (
    <button
      className="config-btn"
      aria-label="Config"
      onPointerDown={(e) => e.stopPropagation()}
      onClick={() => {
        sfx.click()
        setPaused(true)
      }}
    >
      <PixelSprite pattern={GEAR} scale={3} />
    </button>
  )
}

function Toggle({ k, label }: { k: 'music' | 'sfx' | 'vibration'; label: string }) {
  const on = useSettings((s) => s[k])
  const set = useSettings((s) => s.set)
  return (
    <div className="cfg-row">
      <span>{label}</span>
      <button
        className={`pixel-btn small ${on ? '' : 'off'}`}
        onClick={() => {
          set({ [k]: !on } as Partial<Settings>)
          sfx.click()
        }}
      >
        {on ? 'ON' : 'OFF'}
      </button>
    </div>
  )
}

function Volume({ k, enabled }: { k: 'musicVol' | 'sfxVol'; enabled: 'music' | 'sfx' }) {
  const v = useSettings((s) => s[k])
  const on = useSettings((s) => s[enabled])
  const set = useSettings((s) => s.set)
  const change = (d: number) => {
    set({ [k]: Math.max(0, Math.min(10, v + d)) } as Partial<Settings>)
    sfx.click()
  }
  return (
    <div className={`cfg-row vol ${on ? '' : 'disabled'}`}>
      <button className="pixel-btn small alt" onClick={() => change(-1)} aria-label="Down">
        -
      </button>
      <span className="vol-bar">
        {Array.from({ length: 10 }, (_, i) => (
          <i key={i} className={i < v ? 'on' : ''} />
        ))}
      </span>
      <button className="pixel-btn small alt" onClick={() => change(1)} aria-label="Up">
        +
      </button>
    </div>
  )
}

/** Audio / vibration settings. In game it doubles as the pause menu. */
export function ConfigPanel({ onClose, title = 'CONFIG' }: { onClose: () => void; title?: string }) {
  const inGame = useGame((s) => s.screen === 'game')
  const setScreen = useGame((s) => s.setScreen)
  return (
    <div
      className="overlay config"
      onPointerDown={(e) => {
        e.stopPropagation()
        unlockAudio()
      }}
    >
      <h2 className="cfg-title">{title}</h2>
      <div className="cfg-list">
        <Toggle k="music" label="MUSIC" />
        <Volume k="musicVol" enabled="music" />
        <Toggle k="sfx" label="SOUND FX" />
        <Volume k="sfxVol" enabled="sfx" />
        <Toggle k="vibration" label="VIBRATION" />
      </div>
      <div className="buttons">
        <button
          className="pixel-btn"
          onClick={() => {
            sfx.click()
            onClose()
          }}
        >
          {inGame ? 'RESUME' : 'BACK'}
        </button>
        {inGame && (
          <button
            className="pixel-btn alt"
            onClick={() => {
              sfx.click()
              setScreen('home')
            }}
          >
            QUIT
          </button>
        )}
      </div>
    </div>
  )
}
