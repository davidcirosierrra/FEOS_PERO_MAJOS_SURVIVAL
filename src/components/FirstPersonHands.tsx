import { useEffect, useRef } from 'react'
import { useGame } from '../game/store'
import { useEyes } from '../scene/View'
import { FP_GUN, UMBRELLA_FP } from '../voxel/sprites.gen'
import { PixelSprite } from './PixelSprite'

/**
 * First-person foreground (drawn as pixel-art overlays, Doom style): the fork-rifle held by the
 * pig's arms, bobbing with the walk and kicking on every shot, and the umbrella held overhead.
 */
export function FirstPersonHands() {
  const eyes = useEyes()
  const gun = useRef<HTMLDivElement>(null)
  const umb = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!eyes) return
    let raf = 0
    let lastShot = 0
    let kick = 0
    let openedAt = 0
    let wasOpen = false
    let prev = performance.now()
    const tick = () => {
      const now = performance.now()
      const dt = Math.min(0.05, (now - prev) / 1000)
      prev = now
      const s = useGame.getState()
      if (s.lastShot !== lastShot) {
        lastShot = s.lastShot
        kick = 1
      }
      kick = Math.max(0, kick - dt * 9)
      const t = now / 1000
      const bobX = Math.sin(t * 4.5) * 6
      const bobY = Math.abs(Math.cos(t * 4.5)) * 8
      if (gun.current) {
        gun.current.style.transform = `translate(${bobX}px, ${bobY + kick * 22}px) rotate(${-kick * 3}deg)`
        gun.current.style.display = s.gameOver ? 'none' : 'block'
      }
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
      <div ref={gun} className="fp-gun">
        <PixelSprite pattern={FP_GUN} scale={1} />
      </div>
    </div>
  )
}
