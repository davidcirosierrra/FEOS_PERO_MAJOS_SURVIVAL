/**
 * Playable characters. To add one:
 *
 *  1. Draw it (scripts/sprites/<name>.py → `python3 scripts/sprites/emit.py`), or write the
 *     `Pattern`s by hand: the full-body sprite and the first-person rifle.
 *  2. Add an entry to `ROSTER` below. That is all: the home screen, HUD, first-person view and
 *     sounds read everything from here.
 *
 * `enabled: false` keeps a character in the code but out of the character select.
 */
import type { Legs, Pattern } from '../voxel/patterns'
import * as G from '../voxel/sprites.gen'

export type CharacterDef = {
  id: string
  /** Name shown in the character select (Basque, upper case). */
  name: string
  /** One-line flavour text under the name. */
  blurb: string
  /** Full-body sprite, facing the camera. */
  pattern: Pattern
  /** [row0, row1, col0, col1] of the head inside `pattern` (HUD life icon). */
  headBox: [number, number, number, number]
  /** Leg area, used to derive the walk cycle. */
  legs: Legs
  /** Fork-rifle seen in first person. */
  rifle: Pattern
  /** How it screams when hit. */
  voice: 'squeal' | 'gruff'
  /** Optional gameplay tweaks (1 = default). */
  stats?: { thrust?: number; fireRate?: number }
  enabled: boolean
}

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
    // Parked: sprite, rifle and scream are ready; flip `enabled` to bring him back.
    id: 'bassist',
    name: 'BAXU-JOTZAILEA',
    blurb: 'LAU SOKA, ARAZO BAT',
    pattern: G.BASSIST,
    headBox: [0, 20, 5, 19],
    legs: { rows: 7, from: 5, split: 12, to: 18 },
    rifle: G.RIFLE_BASSIST,
    voice: 'gruff',
    enabled: false,
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
