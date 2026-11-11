import { patternSize } from '../voxel/patterns'
import type { BossDef } from './index'

const cache = new Map<string, string>()

/** The whole boss (all parts assembled) as a PNG data URL, 1 px per sprite pixel. For the DOM. */
export function bossPortrait(def: BossDef): string {
  const hit = cache.get(def.id)
  if (hit) return hit
  const c = document.createElement('canvas')
  c.width = def.grid.w
  c.height = def.grid.h
  const g = c.getContext('2d')!
  // Back parts first, overlays (front) on top.
  for (const p of [...def.parts].sort((a, b) => Number(!!a.front) - Number(!!b.front))) {
    const { w } = patternSize(p.pattern)
    p.pattern.rows.forEach((row, y) =>
      [...row.padEnd(w, '.')].forEach((ch, x) => {
        const hex = p.pattern.palette[ch]
        if (!hex) return
        g.fillStyle = hex
        g.fillRect(p.col + x, p.row + y, 1, 1)
      }),
    )
  }
  const url = c.toDataURL()
  cache.set(def.id, url)
  return url
}
