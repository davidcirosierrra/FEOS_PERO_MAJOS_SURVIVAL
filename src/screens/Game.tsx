import { useThree } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'
import { useEffect, useState } from 'react'
import { Director } from '../game/Director'
import { Enemies } from '../game/Enemy'
import { Explosions } from '../game/Explosions'
import { GameOver, Hud } from '../game/Hud'
import { Player, Walls } from '../game/Player'
import { Shots } from '../game/Shots'
import { field, useGame } from '../game/store'
import { CAMERA_Z, FOV, PixelCanvas } from '../scene/PixelCanvas'
import { Starfield } from '../scene/Starfield'

/** Derives the playfield size from the visible area at z = 0. */
function useField() {
  const size = useThree((s) => s.size)
  const halfH = CAMERA_Z * Math.tan(((FOV / 2) * Math.PI) / 180)
  field.halfH = halfH
  field.halfW = halfH * (size.width / Math.max(1, size.height))
  field.playerY = -halfH + 2.4
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

export function Game() {
  const gameOver = useGame((s) => s.gameOver)
  const firePlayer = useGame((s) => s.firePlayer)

  return (
    <div
      className="screen game"
      onPointerDown={(e) => {
        e.preventDefault()
        firePlayer()
      }}
      onKeyDown={(e) => e.key === ' ' && firePlayer()}
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
