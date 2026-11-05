import { useEffect, useRef } from 'react'
import { edgeWarnings, useEyes } from '../scene/View'

const MAX = 8

/** Red arrows on the screen edges for incoming stuff you can't see in first person. */
export function EdgeWarnings() {
  const eyes = useEyes()
  const refs = useRef<(HTMLDivElement | null)[]>([])
  useEffect(() => {
    if (!eyes) return
    let raf = 0
    const tick = () => {
      refs.current.forEach((el, i) => {
        if (!el) return
        const w = edgeWarnings[i]
        if (!w) {
          el.style.display = 'none'
          return
        }
        el.style.display = 'block'
        el.className = `edge-warn ${w.side < 0 ? 'left' : 'right'}`
        el.style.top = `${w.y}px`
      })
      raf = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(raf)
  }, [eyes])
  if (!eyes) return null
  return (
    <div className="edge-warnings">
      {Array.from({ length: MAX }, (_, i) => (
        <div key={i} ref={(el) => {
            refs.current[i] = el
          }} className="edge-warn" style={{ display: 'none' }} />
      ))}
    </div>
  )
}
