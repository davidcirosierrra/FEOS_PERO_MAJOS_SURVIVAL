import './three-console'
import '@fontsource/press-start-2p'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { startInput } from './input'

void startInput()

if (location.search.includes('debug')) {
  void Promise.all([import('./input'), import('./game/store')]).then(([i, st]) => {
    Object.assign(window, { __paranoid: { input: i.input, player: st.playerState, store: st.useGame } })
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
