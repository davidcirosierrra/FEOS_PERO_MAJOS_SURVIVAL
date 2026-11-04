import { lazy, Suspense } from 'react'
import { useGame } from './game/store'
import { Backdrop } from './screens/Backdrop'
import { Menu } from './screens/Menu'
import { Splash } from './screens/Splash'

// Physics (Rapier WASM) only loads when playing.
const Game = lazy(() => import('./screens/Game').then((m) => ({ default: m.Game })))

export default function App() {
  const screen = useGame((s) => s.screen)
  return (
    <main className="app">
      {screen === 'game' ? (
        <Suspense fallback={<div className="screen loading blink">LOADING</div>}>
          <Game />
        </Suspense>
      ) : (
        <>
          <Backdrop hero={screen === 'splash'} />
          {screen === 'splash' ? <Splash /> : <Menu />}
        </>
      )}
      <div className="scanlines" />
    </main>
  )
}
