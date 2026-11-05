import { Canvas } from '@react-three/fiber'
import { useEffect, useRef, useState, type ReactNode } from 'react'

/** Render width in real pixels: low on purpose for the 8-bit look (CSS upscales with `pixelated`). */
const TARGET_WIDTH = 340
/** Further away = everything smaller and a wider playfield. */
export const CAMERA_Z = 25
export const FOV = 50

/** Canvas rendered at a low internal resolution and upscaled without smoothing. */
export function PixelCanvas({ children }: { children: ReactNode }) {
  const wrap = useRef<HTMLDivElement>(null)
  const [dpr, setDpr] = useState(0.5)

  useEffect(() => {
    const el = wrap.current
    if (!el) return
    const update = () => setDpr(Math.min(1, TARGET_WIDTH / Math.max(1, el.clientWidth)))
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div ref={wrap} className="canvas-wrap">
      <Canvas
        dpr={dpr}
        gl={{ antialias: false, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, CAMERA_Z], fov: FOV, near: 0.1, far: 100 }}
      >
        <color attach="background" args={['#05010f']} />
        <ambientLight intensity={1.1} />
        <directionalLight position={[4, 5, 10]} intensity={2.2} />
        {children}
      </Canvas>
    </div>
  )
}
