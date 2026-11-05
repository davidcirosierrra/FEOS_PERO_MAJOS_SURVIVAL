import { useThree } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'
import { useEffect, useRef, useState } from 'react'
import { Director } from '../game/Director'
import { Enemies } from '../game/Enemy'
import { Explosions } from '../game/Explosions'
import { GameOver, Hud } from '../game/Hud'
import { Player, Walls } from '../game/Player'
import { Shots } from '../game/Shots'
import { UmbrellaSlot } from '../game/Umbrella'
import { field, useGame } from '../game/store'
import { CAMERA_Z, FOV, PixelCanvas } from '../scene/PixelCanvas'
import { Starfield } from '../scene/Starfield'

/** Derives the playfield size from the visible area at z = 0. */
function useField() {
  const size = useThree((s) => s.size)
  const halfH = CAMERA_Z * Math.tan(((FOV / 2) * Math.PI) / 180)
  field.halfH = halfH
  field.halfW = halfH * (size.width / Math.max(1, size.height))
  field.playerY = -halfH + 2.6
}

function World() {
  useField()
  const runId = useGame((s) => s.runId)
  const gameOver = useGame((s) => s.gameOver)
  const hidden = usePageHidden()
  return (
    <Physics key={runId} gravity={[0, -12, 0]} paused={gameOver || hidden}>
      <Walls />
      <Player />
      <UmbrellaSlot />
      <Enemies />
      <Shots />
      <Explosions />
    </Physics>
  )
}

function usePageHidden() {
  const [hidden, setHidden] = useState(document.hidden)
  useEffect(() => {
    const on = () => setHidden(document.hidden)
    document.addEventListener('visibilitychange', on)
    return () => document.removeEventListener('visibilitychange', on)
  }, [])
  return hidden
}

const SWIPE_PX = 40
const SWIPE_MS = 450

export function Game() {
  const gameOver = useGame((s) => s.gameOver)
  const firePlayer = useGame((s) => s.firePlayer)
  const openUmbrella = useGame((s) => s.openUmbrella)
  const jump = useGame((s) => s.jump)
  // Tap = fire (immediately, on touch down). Quick swipe up = loop jump, swipe down = umbrella.
  const swipe = useRef<{ y: number; t: number } | null>(null)

  return (
    <div
      className="screen game"
      onPointerDown={(e) => {
        e.preventDefault()
        swipe.current = { y: e.clientY, t: performance.now() }
        firePlayer()
      }}
      onPointerMove={(e) => {
        const st = swipe.current
        if (!st) return
        if (performance.now() - st.t > SWIPE_MS) swipe.current = null
        else if (Math.abs(st.y - e.clientY) > SWIPE_PX) {
          if (st.y > e.clientY) jump()
          else openUmbrella()
          swipe.current = null
        }
      }}
      onPointerUp={() => (swipe.current = null)}
      onKeyDown={(e) => {
        if (e.key === ' ') firePlayer()
        if (e.key === 'ArrowUp' || e.key === 'w') jump()
        if (e.key === 'ArrowDown' || e.key === 's') openUmbrella()
      }}
      tabIndex={0}
      ref={(el) => el?.focus()}
    >
      <PixelCanvas>
        <Starfield speed={3} />
        <World />
      </PixelCanvas>
      <Hud />
      <Director />
      {gameOver && <GameOver />}
    </div>
  )
}
