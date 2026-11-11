import { BOSSES } from '../bosses'
import { bossPortrait } from '../bosses/portrait'
import type { Character } from '../characters'
import { pad } from '../storage'
import { patternSize, type Pattern } from '../voxel/patterns'

export type RunResult = { score: number; wave: number; bosses: number; won: boolean; who: Character }

/**
 * Where the game is being played right now: sharing from the Cloudflare copy shares the Cloudflare
 * address, from Vercel the Vercel one (so the anonymous copy never points back to the other).
 */
export const gameUrl = () => `${location.origin}/`

export function shareText(r: RunResult) {
  const url = gameUrl()
  if (r.won) return `🎸 ${r.who.name}-ekin FEOS PERO MAJOS SURVIVAL irabazi dut: ${pad(r.score)} puntu! Agertokira iritsiko zara? ${url}`
  return `🎸 ${r.who.name}-ekin ${pad(r.score)} puntu FEOS PERO MAJOS SURVIVAL-en (${r.wave}. maila, ${r.bosses}/${BOSSES.length} buruzagi). Gainditu nazazu! ${url}`
}

const FONT = '"Press Start 2P", monospace'
const W = 1080
const H = 1080

function drawPattern(g: CanvasRenderingContext2D, p: Pattern, x: number, y: number, px: number) {
  p.rows.forEach((row, ry) =>
    [...row].forEach((ch, rx) => {
      const c = p.palette[ch]
      if (!c) return
      g.fillStyle = c
      g.fillRect(Math.round(x + rx * px), Math.round(y + ry * px), Math.ceil(px), Math.ceil(px))
    }),
  )
}

function loadImage(src: string) {
  const img = new Image()
  img.src = src
  return img.decode().then(() => img)
}

/** Text with the game's hard pixel drop shadow. */
function label(g: CanvasRenderingContext2D, text: string, x: number, y: number, size: number, color: string, shadow = '#0b0610') {
  g.font = `${size}px ${FONT}`
  g.fillStyle = shadow
  g.fillText(text, x + size / 8, y + size / 8)
  g.fillStyle = color
  g.fillText(text, x, y)
}

/** Square score card (PNG) to attach when sharing: character, score, bosses, address. */
export async function scoreCard(r: RunResult): Promise<File | null> {
  try {
    await document.fonts.load(`40px ${FONT}`)
    const c = document.createElement('canvas')
    c.width = W
    c.height = H
    const g = c.getContext('2d')!
    g.imageSmoothingEnabled = false
    g.textAlign = 'center'
    g.textBaseline = 'top'

    // Night street: dark gradient, scanlines, stage-light beams.
    const bg = g.createLinearGradient(0, 0, 0, H)
    bg.addColorStop(0, '#120a1c')
    bg.addColorStop(1, '#24142f')
    g.fillStyle = bg
    g.fillRect(0, 0, W, H)
    const beams: [number, string][] = [
      [W * 0.2, 'rgba(94,246,255,0.13)'],
      [W * 0.5, 'rgba(255,126,182,0.2)'],
      [W * 0.8, 'rgba(255,225,77,0.12)'],
    ]
    for (const [x, col] of beams) {
      g.fillStyle = col
      g.beginPath()
      g.moveTo(x - 14, 0)
      g.lineTo(x + 14, 0)
      g.lineTo(x + 230, H * 0.72)
      g.lineTo(x - 230, H * 0.72)
      g.fill()
    }

    // Title
    label(g, 'FEOS PERO', W / 2, 60, 70, '#ff7eb6', '#7a2a5a')
    label(g, 'MAJOS', W / 2, 150, 86, '#ff7eb6', '#7a2a5a')
    g.save()
    g.translate(W / 2, 270)
    g.rotate(-0.035)
    g.fillStyle = '#0b0610'
    g.fillRect(-170, -6, 352, 58)
    g.fillStyle = '#ffe14d'
    g.fillRect(-176, -12, 352, 58)
    label(g, 'SURVIVAL', 0, 2, 32, '#0b0610', 'transparent')
    g.restore()

    // Character(s) on a spotlight
    const bodies = [r.who.pattern, r.who.partner].filter(Boolean) as Pattern[]
    const px = bodies.length > 1 ? 8 : 10
    const sizes = bodies.map(patternSize)
    const total = sizes.reduce((s, z) => s + z.w * px, 0) - (bodies.length - 1) * px * 3
    const floorY = 640
    g.fillStyle = 'rgba(255,240,200,0.18)'
    g.beginPath()
    g.ellipse(W / 2, floorY, total * 0.62, 34, 0, 0, Math.PI * 2)
    g.fill()
    let x = W / 2 - total / 2
    bodies.forEach((p, i) => {
      drawPattern(g, p, x, floorY - sizes[i].h * px + 10, px)
      x += sizes[i].w * px - px * 3
    })
    label(g, r.who.name, W / 2, floorY + 34, 32, '#ffffff')

    // Result
    label(g, r.won ? 'IRABAZI DUT!' : 'PUNTUAK', W / 2, 740, 28, r.won ? '#ffe14d' : '#c48ad8')
    label(g, pad(r.score), W / 2, 782, 74, '#ffe14d', '#a8580c')
    label(g, `${r.wave}. MAILA · ${r.bosses}/${BOSSES.length} BURUZAGI`, W / 2, 878, 22, '#c48ad8')

    // Bosses beaten (silhouettes for the rest)
    const portraits = await Promise.all(BOSSES.map((b) => loadImage(bossPortrait(b))))
    const slot = 110
    const maxH = 82
    let bx = W / 2 - (BOSSES.length * slot) / 2
    for (const [i, img] of portraits.entries()) {
      const k = Math.min((slot - 22) / img.width, maxH / img.height)
      const w = img.width * k
      const h = img.height * k
      g.globalAlpha = i < r.bosses ? 1 : 0.35
      g.filter = i < r.bosses ? 'none' : 'brightness(0)'
      g.drawImage(img, bx + (slot - w) / 2, 1012 - h, w, h)
      bx += slot
    }
    g.globalAlpha = 1
    g.filter = 'none'

    // Address
    label(g, location.host.toUpperCase(), W / 2, 1036, 18, '#8c84a4')

    // CRT scanlines
    g.fillStyle = 'rgba(0,0,0,0.13)'
    for (let y = 0; y < H; y += 4) g.fillRect(0, y, W, 2)

    const blob = await new Promise<Blob | null>((ok) => c.toBlob(ok, 'image/png'))
    return blob ? new File([blob], 'feos-pero-majos.png', { type: 'image/png' }) : null
  } catch {
    return null
  }
}

export type ShareOutcome = 'shared' | 'copied' | 'cancelled' | 'failed'

/** Native share sheet with the card attached when possible; otherwise text only; otherwise clipboard. */
export async function shareRun(r: RunResult): Promise<ShareOutcome> {
  const text = shareText(r)
  const title = 'Feos pero majos survival'
  try {
    if (navigator.share) {
      const file = await scoreCard(r)
      if (file && navigator.canShare?.({ files: [file] })) await navigator.share({ title, text, files: [file] })
      else await navigator.share({ title, text })
      return 'shared'
    }
  } catch (e) {
    if ((e as Error).name === 'AbortError') return 'cancelled'
  }
  try {
    await navigator.clipboard.writeText(text)
    return 'copied'
  } catch {
    return 'failed'
  }
}
