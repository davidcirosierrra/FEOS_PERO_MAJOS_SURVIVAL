import type { ReactNode, SVGProps } from 'react'
import { patternSize, type Pattern } from '../voxel/patterns'

type Props = { pattern: Pattern; scale?: number; children?: ReactNode } & SVGProps<SVGSVGElement>

/** Renders a pixel pattern as a crisp SVG. Each pixel gets class `px-<char>` so CSS can animate it. */
export function PixelSprite({ pattern, scale = 4, children, ...svg }: Props) {
  const { w, h } = patternSize(pattern)
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={w * scale}
      height={h * scale}
      shapeRendering="crispEdges"
      aria-hidden
      {...svg}
    >
      {pattern.rows.flatMap((row, y) =>
        [...row].map((ch, x) => {
          const fill = pattern.palette[ch]
          return fill ? <rect key={`${x}-${y}`} x={x} y={y} width={1.02} height={1.02} fill={fill} className={`px-${ch}`} /> : null
        }),
      )}
      {children}
    </svg>
  )
}
