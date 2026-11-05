import { useEffect, useRef } from 'react'
import { useGame } from '../game/store'
import { useEyes } from '../scene/View'
import { UMBRELLA_FP } from '../voxel/sprites.gen'
import { PixelSprite } from './PixelSprite'

/** First person: the umbrella held overhead, drawn as a pixel-art overlay (the rifle is 3D, see CameraRig). */
export function FirstPersonHands() {
  const eyes = useEyes()
  const umb = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!eyes) return
    let raf = 0
    let openedAt = 0
    let wasOpen = false
    const tick = () => {
      const now = performance.now()
      const s = useGame.getState()
      const t = now / 1000
      const bobX = Math.sin(t * 4.5) * 6
      if (umb.current) {
        if (s.umbrellaOpen && !wasOpen) openedAt = now
        wasOpen = s.umbrellaOpen
        const k = Math.min(1, (now - openedAt) / 160)
        umb.current.style.display = s.umbrellaOpen && !s.gameOver ? 'block' : 'none'
        umb.current.style.transform = `translateY(${(1 - k) * -60}%) translateX(${bobX * 0.5}px)`
      }
      raf = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(raf)
  }, [eyes])
  if (!eyes) return null
  return (
    <div className="fp-hands">
      <div ref={umb} className="fp-umbrella" style={{ display: 'none' }}>
        <PixelSprite pattern={UMBRELLA_FP} scale={1} />
      </div>
    </div>
  )
}
