import { lazy, Suspense, useEffect } from 'react'
import { playMusic } from './audio'
import { useGame } from './game/store'
import { Backdrop } from './screens/Backdrop'
import { Home } from './screens/Home'

// Physics (Rapier WASM) only loads when playing.
const Game = lazy(() => import('./screens/Game').then((m) => ({ default: m.Game })))

export default function App() {
  const screen = useGame((s) => s.screen)
  const bossFight = useGame((s) => s.boss != null)
  const gameOver = useGame((s) => s.gameOver)
  useEffect(() => {
    playMusic(screen === 'home' ? 'menu' : gameOver ? null : bossFight ? 'boss' : 'game')
  }, [screen, bossFight, gameOver])
  return (
    <main className="app">
      {screen === 'game' ? (
        <Suspense fallback={<div className="screen loading blink">KARGATZEN</div>}>
          <Game />
        </Suspense>
      ) : (
        <>
          <Backdrop />
          <Home />
        </>
      )}
      <div className="scanlines" />
    </main>
  )
}
