import { useState } from 'react'
import { sfx } from '../audio'
import { BOSSES } from '../bosses'
import { character } from '../characters'
import { BOSS_EVERY } from '../game/config'
import { useGame } from '../game/store'
import { useSettings } from '../settings'
import type { Pattern } from '../voxel/patterns'
import { PixelSprite } from './PixelSprite'
import { shareRun, type ShareOutcome } from './share'

const ICON: Pattern = {
  palette: { k: '#0b0610' },
  rows: ['.....kk', '....kkk', 'kk..kk.', 'kkkkk..', 'kk..kk.', '....kkk', '.....kk'],
}

const LABEL: Record<ShareOutcome | 'idle' | 'busy', string> = {
  idle: 'PARTEKATU',
  busy: 'PRESTATZEN…',
  shared: 'BIDALIA!',
  copied: 'KOPIATUTA!',
  cancelled: 'PARTEKATU',
  failed: 'EZIN IZAN DA',
}

/** Share the run (score, character, level, bosses) with a link to wherever the game is hosted. */
export function ShareButton() {
  const [state, setState] = useState<keyof typeof LABEL>('idle')
  const run = async () => {
    if (state === 'busy') return
    sfx.click()
    setState('busy')
    const g = useGame.getState()
    const outcome = await shareRun({
      score: g.score,
      wave: g.wave,
      bosses: g.won ? BOSSES.length : Math.floor((g.wave - 1) / BOSS_EVERY),
      won: g.won,
      who: character(useSettings.getState().character),
    })
    setState(outcome)
    if (outcome !== 'cancelled') setTimeout(() => setState('idle'), 2200)
  }
  return (
    <button className={`pixel-btn share-btn ${state}`} onClick={run} disabled={state === 'busy'}>
      <PixelSprite pattern={ICON} scale={2.5} />
      {LABEL[state]}
    </button>
  )
}
