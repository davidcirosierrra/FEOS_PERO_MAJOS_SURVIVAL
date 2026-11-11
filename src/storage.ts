const HI_KEY = 'paranoid.highscore'

export function loadHighScore(): number {
  try {
    const v = Number(localStorage.getItem(HI_KEY))
    return Number.isFinite(v) && v > 0 ? Math.floor(v) : 0
  } catch {
    return 0
  }
}

export function saveHighScore(score: number) {
  try {
    localStorage.setItem(HI_KEY, String(Math.floor(score)))
  } catch {
    /* storage unavailable (private mode…) – ignore */
  }
}

const PROGRESS_KEY = 'paranoid.bosses'

/** How many bosses have ever been beaten (0..6). */
export function loadProgress(): number {
  try {
    const v = Number(localStorage.getItem(PROGRESS_KEY))
    return Number.isFinite(v) && v > 0 ? Math.floor(v) : 0
  } catch {
    return 0
  }
}

export function saveProgress(n: number) {
  try {
    localStorage.setItem(PROGRESS_KEY, String(n))
  } catch {
    /* storage unavailable */
  }
}

export const pad = (n: number, len = 6) => String(Math.max(0, Math.floor(n))).padStart(len, '0')
