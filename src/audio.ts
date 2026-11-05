/**
 * Chiptune audio, synthesised with Web Audio (no files): sound effects + a tiny step-sequenced
 * soundtrack. Everything is original. Volumes come from the settings store.
 */
import { useSettings } from './settings'

let ctx: AudioContext | null = null
let master: GainNode
let musicBus: GainNode
let sfxBus: GainNode
let noiseBuf: AudioBuffer

const midi = (n: number) => 440 * 2 ** ((n - 69) / 12)

function applyVolumes() {
  if (!ctx) return
  const s = useSettings.getState()
  const t = ctx.currentTime
  musicBus.gain.setTargetAtTime(s.music ? (s.musicVol / 10) * 0.55 : 0, t, 0.05)
  sfxBus.gain.setTargetAtTime(s.sfx ? (s.sfxVol / 10) * 0.9 : 0, t, 0.02)
}

/** Create / resume the audio context. Must run inside a user gesture the first time. */
export function unlockAudio() {
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AC) return
    ctx = new AC()
    master = ctx.createGain()
    master.gain.value = 0.8
    master.connect(ctx.destination)
    musicBus = ctx.createGain()
    sfxBus = ctx.createGain()
    musicBus.connect(master)
    sfxBus.connect(master)
    // 1 s of white noise, reused for drums / explosions.
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate)
    const d = noiseBuf.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
    applyVolumes()
    useSettings.subscribe(applyVolumes)
    document.addEventListener('visibilitychange', () => {
      if (!ctx) return
      if (document.hidden) void ctx.suspend()
      else void ctx.resume()
    })
  }
  if (ctx.state === 'suspended' && !document.hidden) void ctx.resume()
  if (wantedTrack && !timer) startSequencer()
}

// ---------------------------------------------------------------- primitives

type Wave = OscillatorType
function tone(bus: GainNode, freq: number, start: number, dur: number, type: Wave, vol: number, slideTo?: number) {
  if (!ctx) return
  const o = ctx.createOscillator()
  const g = ctx.createGain()
  o.type = type
  o.frequency.setValueAtTime(freq, start)
  if (slideTo) o.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), start + dur)
  g.gain.setValueAtTime(0.0001, start)
  g.gain.exponentialRampToValueAtTime(vol, start + 0.005)
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur)
  o.connect(g).connect(bus)
  o.start(start)
  o.stop(start + dur + 0.02)
}

function noise(bus: GainNode, start: number, dur: number, vol: number, filter: BiquadFilterType, freq: number, freqTo?: number) {
  if (!ctx) return
  const src = ctx.createBufferSource()
  src.buffer = noiseBuf
  const f = ctx.createBiquadFilter()
  f.type = filter
  f.frequency.setValueAtTime(freq, start)
  if (freqTo) f.frequency.exponentialRampToValueAtTime(freqTo, start + dur)
  const g = ctx.createGain()
  g.gain.setValueAtTime(vol, start)
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur)
  src.connect(f).connect(g).connect(bus)
  src.start(start, Math.random() * 0.5)
  src.stop(start + dur + 0.02)
}

const now = () => (ctx ? ctx.currentTime : 0)
const fx = (fn: (t: number) => void) => {
  if (!ctx || ctx.state !== 'running' || !useSettings.getState().sfx) return
  fn(now())
}

// ---------------------------------------------------------------- sound effects

let lastShoot = 0
export const sfx = {
  shoot: (medals: string[]) =>
    fx((t) => {
      if (t - lastShoot < 0.03) return
      lastShoot = t
      const base = medals.includes('red') ? 1500 : medals.includes('blue') ? 1250 : 1100
      tone(sfxBus, base, t, 0.09, 'square', 0.09, base / 3)
      if (medals.includes('blue')) tone(sfxBus, base * 1.5, t + 0.01, 0.07, 'square', 0.05, base / 2)
    }),
  explode: () =>
    fx((t) => {
      noise(sfxBus, t, 0.35, 0.5, 'lowpass', 2400, 200)
      tone(sfxBus, 180, t, 0.25, 'square', 0.12, 40)
    }),
  foodHit: (pierce: boolean) =>
    fx((t) => {
      tone(sfxBus, pierce ? 900 : 600, t, 0.08, 'square', 0.08, pierce ? 1800 : 200)
      noise(sfxBus, t, 0.08, 0.15, 'highpass', 3000)
    }),
  boing: () => fx((t) => tone(sfxBus, 220, t, 0.18, 'triangle', 0.25, 660)),
  umbrella: () =>
    fx((t) => {
      noise(sfxBus, t, 0.15, 0.25, 'bandpass', 800, 3000)
      tone(sfxBus, 330, t, 0.12, 'square', 0.06, 660)
    }),
  loop: () =>
    fx((t) => {
      tone(sfxBus, 200, t, 0.55, 'square', 0.08, 1600)
      tone(sfxBus, 300, t + 0.05, 0.5, 'triangle', 0.1, 2400)
    }),
  hurt: () =>
    fx((t) => {
      tone(sfxBus, 400, t, 0.25, 'sawtooth', 0.12, 90)
      noise(sfxBus, t, 0.15, 0.3, 'lowpass', 1200)
    }),
  lifeLost: () =>
    fx((t) => {
      noise(sfxBus, t, 0.6, 0.6, 'lowpass', 3000, 120)
      ;[523, 392, 311, 233].forEach((f, i) => tone(sfxBus, f, t + i * 0.11, 0.14, 'square', 0.1))
    }),
  gameOver: () =>
    fx((t) => {
      ;[392, 370, 349, 330, 311, 294, 277, 262].forEach((f, i) => tone(sfxBus, f, t + i * 0.16, 0.18, 'square', 0.1))
      tone(sfxBus, 131, t + 1.3, 0.9, 'triangle', 0.25, 65)
    }),
  pickup: (kind: string) =>
    fx((t) => {
      const seq = kind === 'banana' ? [72, 76, 79, 84] : kind === 'dup' ? [84, 88, 91] : [67, 71, 74, 79, 83]
      seq.forEach((n, i) => tone(sfxBus, midi(n), t + i * 0.06, 0.1, 'square', 0.09))
    }),
  medalLost: () => fx((t) => [79, 74, 67].forEach((n, i) => tone(sfxBus, midi(n), t + i * 0.08, 0.12, 'triangle', 0.2))),
  levelUp: () => fx((t) => [60, 64, 67, 72, 67, 72].forEach((n, i) => tone(sfxBus, midi(n), t + i * 0.07, 0.1, 'square', 0.08))),
  /** Ice-cream-van style chime (original tune). */
  bossArrive: () =>
    fx((t) => {
      ;[76, 79, 81, 79, 76, 72, 74, 76, 72, 67].forEach((n, i) => tone(sfxBus, midi(n), t + i * 0.13, 0.16, 'triangle', 0.22))
      ;[76, 79, 81, 79, 76, 72, 74, 76, 72, 67].forEach((n, i) => tone(sfxBus, midi(n + 12), t + i * 0.13, 0.1, 'sine', 0.05))
    }),
  bossHit: () =>
    fx((t) => {
      tone(sfxBus, 160, t, 0.07, 'square', 0.1, 90)
      noise(sfxBus, t, 0.05, 0.12, 'bandpass', 1500)
    }),
  partOff: () =>
    fx((t) => {
      noise(sfxBus, t, 0.4, 0.4, 'lowpass', 1800, 150)
      tone(sfxBus, 300, t, 0.3, 'sawtooth', 0.08, 60)
    }),
  bossDeath: () =>
    fx((t) => {
      for (let i = 0; i < 5; i++) noise(sfxBus, t + i * 0.18, 0.5, 0.55, 'lowpass', 2600, 100)
      ;[60, 64, 67, 72, 76, 79, 84].forEach((n, i) => tone(sfxBus, midi(n), t + 1 + i * 0.08, 0.14, 'square', 0.1))
    }),
  cookie: () => fx((t) => tone(sfxBus, 140, t, 0.12, 'triangle', 0.3, 70)),
  click: () => fx((t) => tone(sfxBus, 880, t, 0.05, 'square', 0.06)),
}

// ---------------------------------------------------------------- music

export type Track = 'menu' | 'game' | 'boss'

type Song = {
  bpm: number
  /** One chord per bar: [bass midi, arpeggio notes] */
  bars: [number, number[]][]
  lead: Wave
  arpVol: number
  drums: 'light' | 'full' | 'hard'
  /** Optional melody, one entry per 16th step across the whole loop (0 = rest). */
  melody?: number[]
}

const SONGS: Record<Track, Song> = {
  menu: {
    bpm: 100,
    lead: 'triangle',
    arpVol: 0.07,
    drums: 'light',
    bars: [
      [45, [69, 72, 76, 81]],
      [41, [65, 69, 72, 77]],
      [48, [67, 72, 76, 79]],
      [43, [67, 71, 74, 79]],
    ],
  },
  game: {
    bpm: 132,
    lead: 'square',
    arpVol: 0.035,
    drums: 'full',
    bars: [
      [45, [69, 72, 76, 72]],
      [41, [69, 72, 77, 72]],
      [48, [67, 72, 76, 72]],
      [43, [67, 71, 74, 71]],
      [45, [69, 72, 76, 81]],
      [41, [65, 69, 72, 77]],
      [43, [67, 71, 74, 79]],
      [40, [68, 71, 76, 80]],
    ],
    // prettier-ignore
    melody: [
      81,0,0,79, 0,76,0,0, 74,0,76,0, 0,0,0,0,
      77,0,0,76, 0,74,0,0, 72,0,74,0, 0,0,0,0,
      76,0,0,74, 0,72,0,0, 71,0,72,0, 74,0,0,0,
      74,0,0,0, 71,0,67,0, 71,0,74,0, 79,0,0,0,
      81,0,0,83, 0,84,0,0, 83,0,81,0, 0,0,79,0,
      77,0,0,79, 0,81,0,0, 79,0,77,0, 76,0,0,0,
      74,0,0,76, 0,77,0,0, 79,0,77,0, 74,0,0,0,
      76,0,0,0, 80,0,0,0, 83,0,0,0, 88,0,0,0,
    ],
  },
  boss: {
    bpm: 152,
    lead: 'sawtooth',
    arpVol: 0.03,
    drums: 'hard',
    bars: [
      [40, [64, 67, 71, 76]],
      [40, [64, 67, 71, 75]],
      [36, [64, 67, 72, 76]],
      [38, [62, 66, 69, 74]],
      [40, [64, 67, 71, 76]],
      [41, [65, 68, 72, 77]],
      [39, [63, 66, 71, 75]],
      [35, [63, 66, 71, 75]],
    ],
    // prettier-ignore
    melody: [
      76,0,76,0, 79,0,76,0, 74,0,72,0, 71,0,0,0,
      76,0,76,0, 79,0,81,0, 83,0,0,0, 0,0,0,0,
      84,0,83,0, 81,0,79,0, 81,0,79,0, 76,0,0,0,
      74,0,0,0, 78,0,0,0, 81,0,78,0, 74,0,0,0,
      76,0,76,0, 79,0,76,0, 74,0,72,0, 71,0,0,0,
      77,0,77,0, 80,0,77,0, 76,0,74,0, 72,0,0,0,
      75,0,0,0, 78,0,0,0, 83,0,82,0, 78,0,0,0,
      75,0,78,0, 83,0,87,0, 86,0,0,0, 0,0,0,0,
    ],
  },
}

let wantedTrack: Track | null = null
let timer: ReturnType<typeof setInterval> | null = null
let step = 0
let nextTime = 0

function scheduleStep(song: Song, s: number, t: number) {
  const bars = song.bars.length
  const bar = Math.floor(s / 16) % bars
  const i = s % 16
  const [bass, arp] = song.bars[bar]
  const sixteenth = 60 / song.bpm / 4

  // Bass: driving 8ths with an octave jump.
  if (i % 2 === 0) {
    const n = i % 8 === 6 ? bass + 12 : bass
    tone(musicBus, midi(n), t, sixteenth * 1.8, 'triangle', 0.32)
  }
  // Arpeggio: every 16th, cycling chord tones.
  tone(musicBus, midi(arp[i % arp.length] + (song.drums === 'light' ? 0 : 12)), t, sixteenth * 0.9, song.lead, song.arpVol)
  // Melody.
  if (song.melody) {
    const m = song.melody[s % song.melody.length]
    if (m) tone(musicBus, midi(m), t, sixteenth * 2.6, 'square', 0.06)
  }
  // Drums.
  if (song.drums === 'light') {
    if (i % 8 === 0) tone(musicBus, 120, t, 0.12, 'sine', 0.35, 45)
    if (i % 4 === 2) noise(musicBus, t, 0.03, 0.06, 'highpass', 7000)
    return
  }
  if (i % 8 === 0 || (song.drums === 'hard' && i % 8 === 3)) tone(musicBus, 150, t, 0.14, 'sine', 0.55, 40)
  if (i % 8 === 4) noise(musicBus, t, 0.12, 0.28, 'bandpass', 1800)
  if (i % 2 === 0 || song.drums === 'hard') noise(musicBus, t, 0.03, 0.07, 'highpass', 8000)
}

function startSequencer() {
  if (!ctx || timer) return
  nextTime = ctx.currentTime + 0.05
  timer = setInterval(() => {
    if (!ctx || !wantedTrack) return
    const song = SONGS[wantedTrack]
    const sixteenth = 60 / song.bpm / 4
    // Lookahead scheduling; skip ahead if the tab was throttled.
    if (nextTime < ctx.currentTime - 0.2) nextTime = ctx.currentTime + 0.02
    while (nextTime < ctx.currentTime + 0.12) {
      scheduleStep(song, step, nextTime)
      step++
      nextTime += sixteenth
    }
  }, 25)
}

/** Switch soundtrack (null = silence). Restarts from the top when the track changes. */
export function playMusic(track: Track | null) {
  if (track === wantedTrack) return
  wantedTrack = track
  step = 0
  if (!track) {
    if (timer) clearInterval(timer)
    timer = null
    return
  }
  if (ctx) startSequencer()
}
