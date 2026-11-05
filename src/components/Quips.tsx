import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { QUIP_MS, useGame } from '../game/store'
import { useSettings } from '../settings'

/** Screen positions of the speech bubbles, filled in by <QuipProjector> inside the canvas. */
const screenPos = new Map<number, { x: number; y: number; k: number }>()
const _v = new THREE.Vector3()

/** Inside the Canvas: projects each bubble's world position (floating upwards) to CSS pixels. */
export function QuipProjector() {
  const camera = useThree((s) => s.camera)
  const size = useThree((s) => s.size)
  useFrame(() => {
    const now = performance.now()
    const eyes = useSettings.getState().camera === 'eyes'
    screenPos.clear()
    for (const q of useGame.getState().quips) {
      const k = (now - q.at) / QUIP_MS
      if (k > 1) continue
      // top view: rises on screen; first person: above the fan's head
      if (eyes) _v.set(q.x, q.y, 1.9 + k * 0.6)
      else _v.set(q.x, q.y + 0.9 + k * 0.8, 0)
      _v.project(camera)
      if (_v.z > 1) continue
      screenPos.set(q.id, { x: ((_v.x + 1) / 2) * size.width, y: ((1 - _v.y) / 2) * size.height, k })
    }
  })
  return null
}

/** Overlay: comic speech bubbles with the fans' complaints. */
export function Quips() {
  const quips = useGame((s) => s.quips)
  const refs = useRef(new Map<number, HTMLDivElement>())
  useEffect(() => {
    let raf = 0
    const tick = () => {
      for (const [id, el] of refs.current) {
        const p = screenPos.get(id)
        if (!p) {
          el.style.opacity = '0'
          continue
        }
        el.style.opacity = String(p.k < 0.8 ? 1 : (1 - p.k) * 5)
        el.style.transform = `translate(${p.x}px, ${p.y}px) translate(-50%, -100%) scale(${p.k < 0.1 ? 0.6 + p.k * 4 : 1})`
      }
      raf = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(raf)
  }, [])
  return (
    <div className="quips">
      {quips.map((q) => (
        <div
          key={q.id}
          className="quip"
          ref={(el) => {
            if (el) refs.current.set(q.id, el)
            else refs.current.delete(q.id)
          }}
        >
          {q.text}
        </div>
      ))}
    </div>
  )
}
