import { useEffect } from 'react'
import { useGame } from './store'

/** Spawns waves when the screen is cleared and hides short banners (HULL +1…). */
export function Director() {
  const remaining = useGame((s) => s.enemies.length + (s.boss ? 1 : 0))
  const wave = useGame((s) => s.wave)
  const gameOver = useGame((s) => s.gameOver)
  const banner = useGame((s) => s.banner)

  useEffect(() => {
    if (remaining > 0 || gameOver) return
    const t = setTimeout(() => useGame.getState().nextWave(), wave === 0 ? 500 : 1400)
    return () => clearTimeout(t)
  }, [remaining, gameOver, wave])

  useEffect(() => {
    if (!banner) return
    const t = setTimeout(() => useGame.getState().clearBanner(), 1600)
    return () => clearTimeout(t)
  }, [banner])

  return null
}
