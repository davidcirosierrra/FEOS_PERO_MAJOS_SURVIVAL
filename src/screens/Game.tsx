import { useThree } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'
import { Suspense, useEffect, useRef, useState } from 'react'
import { PickupDropper, Pickups } from '../game/Pickups'
import { BossLayer } from '../game/Boss'
import { ConfigButton, ConfigPanel } from '../components/Config'
import { EdgeWarnings } from '../components/EdgeWarnings'
import { FirstPersonHands } from '../components/FirstPersonHands'
import { QuipProjector, Quips } from '../components/Quips'
import { Rain } from '../components/Rain'
import { Director } from '../game/Director'
import { Enemies } from '../game/Enemy'
import { Explosions } from '../game/Explosions'
import { GameOver, Hud } from '../game/Hud'
import { Player, Walls } from '../game/Player'
import { Shots } from '../game/Shots'
import { UmbrellaSlot } from '../game/Umbrella'
import { FLOOR_SPEED } from '../game/config'
import { field, useGame } from '../game/store'
import { CAMERA_Z, FOV, PixelCanvas } from '../scene/PixelCanvas'
import { Floor, LightPools } from '../scene/Floor'
import { CameraRig } from '../scene/View'
import { Victory } from './Victory'

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
  const paused = useGame((s) => s.paused)
  const hidden = usePageHidden()
  return (
    <Physics key={runId} gravity={[0, -12, 0]} paused={gameOver || hidden || paused}>
      <Walls />
      <Player />
      <UmbrellaSlot />
      <Enemies />
      <BossLayer />
      <Shots />
      <Pickups />
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
  const won = useGame((s) => s.won)
  const paused = useGame((s) => s.paused)
  const setPaused = useGame((s) => s.setPaused)
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
        <CameraRig />
        <QuipProjector />
        <Suspense fallback={null}>
          <Floor speed={FLOOR_SPEED} />
        </Suspense>
        <LightPools />
        <World />
      </PixelCanvas>
      <div className="vignette" />
      <Rain />
      <Quips />
      <FirstPersonHands />
      <Hud />
      <EdgeWarnings />
      <Director />
      <PickupDropper />
      {!gameOver && <ConfigButton />}
      {paused && <ConfigPanel onClose={() => setPaused(false)} title="PAUSAN" />}
      {gameOver && !won && <GameOver />}
      {won && <Victory />}
    </div>
  )
}
