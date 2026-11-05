import type { CharacterId } from './voxel/theme'
import { create } from 'zustand'

export type Settings = {
  music: boolean
  sfx: boolean
  /** 0..10 */
  musicVol: number
  /** 0..10 */
  sfxVol: number
  vibration: boolean
  character: CharacterId
  /** top = classic top-down view, eyes = first person. */
  camera: 'top' | 'eyes'
}

const KEY = 'paranoid.settings'
const DEFAULTS: Settings = { music: true, sfx: true, musicVol: 6, sfxVol: 8, vibration: true, character: 'bassist', camera: 'top' }

function load(): Settings {
  try {
    return { ...DEFAULTS, ...(JSON.parse(localStorage.getItem(KEY) ?? '{}') as Partial<Settings>) }
  } catch {
    return DEFAULTS
  }
}

type Store = Settings & { set: (patch: Partial<Settings>) => void }

export const useSettings = create<Store>((set, get) => ({
  ...load(),
  set: (patch) => {
    set(patch)
    const { set: _omit, ...data } = { ...get() }
    try {
      localStorage.setItem(KEY, JSON.stringify(data))
    } catch {
      /* storage unavailable */
    }
  },
}))
