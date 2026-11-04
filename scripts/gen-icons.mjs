// Generates PWA icons (PNG) from the player saucer pixel pattern. No dependencies.
import { writeFileSync, mkdirSync } from 'node:fs'
import { deflateSync } from 'node:zlib'

const rows = ['....ddd....', '...dwddd...', '.hhhhhhhhh.', 'mymmymmymmy', '.nnnnnnnnn.', '...kkkkk...']
const pal = { d: 'cfd8de', w: 'ffffff', h: 'a9b0b7', m: '7f868d', n: '5c6268', y: 'ffffff', k: '3a3e43' }
const BG = '05010f'

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})
const crc = (buf) => {
  let c = 0xffffffff
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}
const chunk = (type, data) => {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const td = Buffer.concat([Buffer.from(type), data])
  const c = Buffer.alloc(4)
  c.writeUInt32BE(crc(td))
  return Buffer.concat([len, td, c])
}
const hex = (h) => [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]

function png(size, fill) {
  const w = rows[0].length
  const h = rows.length
  const px = Math.floor((size * fill) / w)
  const ox = Math.floor((size - px * w) / 2)
  const oy = Math.floor((size - px * h) / 2)
  const raw = Buffer.alloc((size * 3 + 1) * size)
  for (let y = 0; y < size; y++) {
    raw[y * (size * 3 + 1)] = 0
    for (let x = 0; x < size; x++) {
      const cx = Math.floor((x - ox) / px)
      const cy = Math.floor((y - oy) / px)
      const ch = x >= ox && y >= oy && cy < h && cx < w ? rows[cy][cx] : '.'
      const [r, g, b] = hex(pal[ch] ?? BG)
      const i = y * (size * 3 + 1) + 1 + x * 3
      raw[i] = r
      raw[i + 1] = g
      raw[i + 2] = b
    }
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8
  ihdr[9] = 2
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

mkdirSync('public/icons', { recursive: true })
writeFileSync('public/icons/icon-192.png', png(192, 0.8))
writeFileSync('public/icons/icon-512.png', png(512, 0.8))
writeFileSync('public/icons/maskable-512.png', png(512, 0.6))
writeFileSync('public/icons/apple-touch-icon.png', png(180, 0.8))
writeFileSync('public/favicon.png', png(64, 0.9))
console.log('icons generated')
