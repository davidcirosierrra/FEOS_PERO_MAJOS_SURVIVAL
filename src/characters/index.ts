/**
 * Playable characters. To add one:
 *
 *  1. Draw it (scripts/sprites/band.py has a parametric musician; `python3 scripts/sprites/emit.py`),
 *     or write the `Pattern`s by hand: the full-body sprite and the first-person rifle.
 *  2. Add an entry to `ROSTER` below. That is all: the character select, HUD, first-person view,
 *     victory scene and sounds read everything from here.
 *  3. Optional: give it a `power` (see `Power`) and/or `stats`. A new power needs its rule in
 *     src/game/store.ts (search for `power ===`).
 *
 * `enabled: false` keeps a character in the code but out of the character select.
 */
import type { Legs, Pattern } from '../voxel/patterns'
import * as G from '../voxel/sprites.gen'

/**
 * solo     – every SOLO_EVERY kills without getting hit, a fan of forks comes out by itself
 * reverb   – a fork that takes a fan down bounces on to the nearest one
 * redoble  – two sticks per shot; the umbrella becomes a bass-drum kick that blasts away what's near
 * grave    – one more hit per life, forks go through fans
 * oihua    – two singers side by side: two lanes of forks; the jump becomes a scream that clears
 *            the screen
 * komodin  – picks are instruments: only one at a time, but never lost when hit
 */
export type Power = 'solo' | 'reverb' | 'redoble' | 'grave' | 'oihua' | 'komodin'

export type CharacterDef = {
  id: string
  /** Name shown in the character select (Basque, upper case). */
  name: string
  /** One-line flavour text under the name. */
  blurb: string
  /** Full-body sprite, facing the camera. */
  pattern: Pattern
  /** Second body walking next to the first (the two singers). */
  partner?: Pattern
  /** [row0, row1, col0, col1] of the head inside `pattern` (HUD life icon). */
  headBox: [number, number, number, number]
  /** Leg area, used to derive the walk cycle. */
  legs: Legs
  /** Fork-rifle seen in first person. */
  rifle: Pattern
  /** How it screams when hit. */
  voice: 'squeal' | 'gruff'
  power?: { id: Power; name: string; text: string }
  /** Gameplay tweaks (all default to 1 / the global value). */
  stats?: {
    /** Sideways push: >1 nimbler, <1 slower. */
    thrust?: number
    /** Time between shots: <1 fires faster. */
    fireCooldown?: number
    /** Hits per life (default HITS_PER_LIFE). */
    hitsPerLife?: number
  }
  enabled: boolean
}

/** All the band shares the same build (scripts/sprites/band.py). */
const BAND_HEAD: [number, number, number, number] = [0, 15, 4, 19]
const BAND_LEGS: Legs = { rows: 7, from: 6, split: 12, to: 18 }

const ROSTER: CharacterDef[] = [
  {
    id: 'pig',
    name: 'TXERRIA',
    blurb: 'ARROSA ETA ARRISKUTSUA',
    pattern: G.PIG,
    headBox: [0, 14, 3, 19],
    legs: { rows: 8, from: 7, split: 12, to: 17 },
    rifle: G.RIFLE_PIG,
    voice: 'squeal',
    enabled: true,
  },
  {
    id: 'singers',
    name: 'ABESLARIAK',
    blurb: 'BI AHOTS, BI TENEDORE',
    pattern: G.BAND_SINGER_A,
    partner: G.BAND_SINGER_B,
    headBox: BAND_HEAD,
    legs: BAND_LEGS,
    rifle: G.RIFLE_BASSIST,
    voice: 'gruff',
    power: { id: 'oihua', name: 'OIHUA', text: 'JAUZIAREN ORDEZ: DENA GARBITU' },
    stats: { thrust: 0.9 },
    enabled: true,
  },
  {
    id: 'drummer',
    name: 'BATERIA',
    blurb: 'ERRITMOA EZ DA NEGOZIAGARRIA',
    pattern: G.BAND_DRUMMER,
    headBox: BAND_HEAD,
    legs: BAND_LEGS,
    rifle: G.RIFLE_BASSIST,
    voice: 'gruff',
    power: { id: 'redoble', name: 'ERREDOBLEA', text: 'BI MAKILA · ATERKIA ORDEZ BONBOA' },
    stats: { fireCooldown: 0.85 },
    enabled: true,
  },
  {
    id: 'rasta',
    name: 'RASTA',
    blurb: 'LASAI, DENA ONGI DAGO',
    pattern: G.BAND_RASTA,
    headBox: BAND_HEAD,
    legs: BAND_LEGS,
    rifle: G.RIFLE_BASSIST,
    voice: 'gruff',
    power: { id: 'reverb', name: 'REVERB', text: 'TENEDOREAK HURRENGO FANERA DOAZ' },
    stats: { fireCooldown: 1.2 },
    enabled: true,
  },
  {
    id: 'bassman',
    name: 'BAXISTA',
    blurb: 'HANDIA, BIZARDUNA, GELDIEZINA',
    pattern: G.BAND_BASSMAN,
    headBox: BAND_HEAD,
    legs: BAND_LEGS,
    rifle: G.RIFLE_BASSIST,
    voice: 'gruff',
    power: { id: 'grave', name: 'GRABEA', text: '4 KOLPE BIZITZAKO · DENA ZEHARKATU' },
    stats: { thrust: 0.8, fireCooldown: 1.25, hitsPerLife: 4 },
    enabled: true,
  },
  {
    id: 'guitar',
    name: 'GITARRISTA',
    blurb: 'GARBIA ETA ZUZENA',
    pattern: G.BAND_GUITAR,
    headBox: BAND_HEAD,
    legs: BAND_LEGS,
    rifle: G.RIFLE_BASSIST,
    voice: 'gruff',
    power: { id: 'solo', name: 'SOLOA', text: '10 FAN MINIK GABE: ABANIKOA' },
    enabled: true,
  },
  {
    id: 'wildcard',
    name: 'KOMODINA',
    blurb: 'TXIKIA BAINA DENA JOTZEN DU',
    pattern: G.BAND_WILDCARD,
    headBox: [0, 13, 4, 19],
    legs: { rows: 6, from: 6, split: 12, to: 18 },
    rifle: G.RIFLE_BASSIST,
    voice: 'gruff',
    power: { id: 'komodin', name: 'INSTRUMENTUAK', text: 'PUA BAKOITZA INSTRUMENTU BAT' },
    stats: { thrust: 1.2 },
    enabled: true,
  },
]

export type CharacterId = string

const crop = (p: Pattern, [r0, r1, c0, c1]: [number, number, number, number]): Pattern => ({
  palette: p.palette,
  rows: p.rows.slice(r0, r1).map((r) => r.slice(c0, c1)),
})

export type Character = CharacterDef & { head: Pattern }

export const CHARACTERS: Record<CharacterId, Character> = Object.fromEntries(
  ROSTER.map((c) => [c.id, { ...c, head: crop(c.pattern, c.headBox) }]),
)

/** Ids you can currently pick, in menu order. */
export const PLAYABLE: CharacterId[] = ROSTER.filter((c) => c.enabled).map((c) => c.id)

/** Always returns a valid character (falls back to the first playable one). */
export const character = (id: CharacterId): Character => CHARACTERS[id] ?? CHARACTERS[PLAYABLE[0]]
