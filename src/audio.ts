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

// ---------------------------------------------------------------- voice

/**
 * Synthesised scream: a buzzy glottal source (saw) with pitch slide + vibrato, shaped into a vowel
 * by parallel formant filters, plus breath noise. `pig` = high squeal, otherwise a gruff "AAARGH".
 */
function scream(t: number, pig: boolean, long: boolean) {
  if (!ctx) return
  const dur = long ? 0.9 : 0.5
  const src = ctx.createOscillator()
  src.type = 'sawtooth'
  const f = pig ? [700, 1500, 900] : [210, 330, 160]
  src.frequency.setValueAtTime(f[0], t)
  src.frequency.exponentialRampToValueAtTime(f[1], t + dur * 0.18)
  src.frequency.exponentialRampToValueAtTime(f[2], t + dur)
  // vibrato / roughness
  const lfo = ctx.createOscillator()
  lfo.frequency.value = pig ? 13 : 7
  const lfoGain = ctx.createGain()
  lfoGain.gain.value = pig ? 60 : 14
  lfo.connect(lfoGain).connect(src.frequency)

  const out = ctx.createGain()
  out.gain.setValueAtTime(0.0001, t)
  out.gain.exponentialRampToValueAtTime(pig ? 0.5 : 0.75, t + 0.03)
  out.gain.setValueAtTime(pig ? 0.5 : 0.75, t + dur * 0.6)
  out.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  out.connect(sfxBus)

  // vowel "aa" (a bit of "e" for the pig's squeal)
  const formants: [number, number, number][] = pig
    ? [
        [1100, 6, 1],
        [2600, 8, 0.6],
        [3800, 10, 0.3],
      ]
    : [
        [750, 5, 1],
        [1200, 7, 0.7],
        [2600, 9, 0.25],
      ]
  for (const [freq, q, gain] of formants) {
    const bp = ctx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.value = freq
    bp.Q.value = q
    const g = ctx.createGain()
    g.gain.value = gain * 2.2
    src.connect(bp).connect(g).connect(out)
  }
  // throat noise
  noise(sfxBus, t, dur * 0.9, pig ? 0.05 : 0.09, 'bandpass', pig ? 2400 : 1100)
  src.start(t)
  lfo.start(t)
  src.stop(t + dur + 0.05)
  lfo.stop(t + dur + 0.05)
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
  /** Short offended grunt from a fan. */
  grumble: () =>
    fx((t) => {
      if (!ctx) return
      const o = ctx.createOscillator()
      o.type = 'sawtooth'
      const f0 = 140 + Math.random() * 120
      o.frequency.setValueAtTime(f0 * 1.3, t)
      o.frequency.exponentialRampToValueAtTime(f0 * 0.8, t + 0.28)
      const g = ctx.createGain()
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(0.35, t + 0.02)
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3)
      for (const [fq, q] of [
        [600, 6],
        [1050, 8],
      ]) {
        const bp = ctx.createBiquadFilter()
        bp.type = 'bandpass'
        bp.frequency.value = fq
        bp.Q.value = q
        o.connect(bp).connect(g)
      }
      g.connect(sfxBus)
      o.start(t)
      o.stop(t + 0.32)
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
  /** Hit by something: the character screams. */
  hurt: () =>
    fx((t) => {
      noise(sfxBus, t, 0.08, 0.3, 'lowpass', 1500) // thud
      scream(t + 0.02, useSettings.getState().character === 'pig', false)
    }),
  lifeLost: () =>
    fx((t) => {
      scream(t, useSettings.getState().character === 'pig', true)
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

// ---------------------------------------------------------------- rain ambience

let rain: { src: AudioBufferSourceNode; gain: GainNode } | null = null

/** Looping rain: filtered noise (hiss of drops + low rumble), faded in/out. */
export function setRain(on: boolean) {
  if (!ctx) return
  const t = ctx.currentTime
  if (on && !rain) {
    const src = ctx.createBufferSource()
    src.buffer = noiseBuf
    src.loop = true
    const hiss = ctx.createBiquadFilter()
    hiss.type = 'bandpass'
    hiss.frequency.value = 3500
    hiss.Q.value = 0.6
    const rumble = ctx.createBiquadFilter()
    rumble.type = 'lowpass'
    rumble.frequency.value = 400
    const rumbleGain = ctx.createGain()
    rumbleGain.gain.value = 0.6
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.0001, t)
    gain.gain.exponentialRampToValueAtTime(0.32, t + 2.5)
    src.connect(hiss).connect(gain)
    src.connect(rumble).connect(rumbleGain).connect(gain)
    gain.connect(sfxBus)
    src.start()
    rain = { src, gain }
  } else if (!on && rain) {
    const r = rain
    rain = null
    r.gain.gain.cancelScheduledValues(t)
    r.gain.gain.setValueAtTime(Math.max(0.0001, r.gain.gain.value), t)
    r.gain.gain.exponentialRampToValueAtTime(0.0001, t + 2)
    r.src.stop(t + 2.1)
  }
}

/** Random fat drop hitting something nearby. */
export function rainDrip() {
  fx((t) => tone(sfxBus, 1800 + Math.random() * 1600, t, 0.05, 'sine', 0.05, 600))
}

// ---------------------------------------------------------------- music
// Fast street-punk in the spirit of 80s Basque/Spanish punk (all original riffs): distorted power
// chords in eighths, driving bass, skank beat (kick/snare alternating on every eighth).

export type Track = 'menu' | 'game' | 'boss'

type Song = {
  bpm: number
  /** Power-chord roots (midi), one per half bar (8 sixteenths). */
  riff: number[]
  /** Which eighths (0..7 within half a bar) are palm-muted chugs. */
  mute: number[]
  drums: 'oi' | 'skank'
  /** Optional lead line, one entry per 16th across the loop (0 = rest). */
  lead?: number[]
}

const E = 40, F = 41, G = 43, A = 45, Bb = 46, B = 47, C = 48, D = 50
const SONGS: Record<Track, Song> = {
  // mid-tempo "oi!" stomp for the menu
  menu: { bpm: 152, drums: 'oi', mute: [1, 3, 5], riff: [D, D, A, A, B, B, G, A] },
  // fast skank for the levels
  game: {
    bpm: 196,
    drums: 'skank',
    mute: [1, 2, 5, 6],
    riff: [E, E, G, A, E, E, D, C, E, E, G, A, C, B, A, B],
    // prettier-ignore
    lead: [
      ...Array(64).fill(0),
      76,0,76,0, 79,0,0,0, 81,0,79,0, 76,0,0,0,
      74,0,74,0, 76,0,0,0, 72,0,71,0, 0,0,0,0,
      76,0,76,0, 79,0,0,0, 81,0,83,0, 84,0,0,0,
      83,0,81,0, 79,0,0,0, 81,0,0,0, 83,0,0,0,
    ],
  },
  // even faster, chromatic and nasty for the bar boss
  boss: { bpm: 214, drums: 'skank', mute: [1, 3, 5, 7], riff: [A, A, Bb, A, A, A, C, Bb, A, A, Bb, A, F, F, E, E] },
}

let wantedTrack: Track | null = null
let timer: ReturnType<typeof setInterval> | null = null
let step = 0
let nextTime = 0
let guitarIn: GainNode | null = null

/** Distortion chain for the guitar (built lazily on the music bus). */
function guitarBus() {
  if (guitarIn || !ctx) return guitarIn
  const pre = ctx.createGain()
  pre.gain.value = 3.5
  const shaper = ctx.createWaveShaper()
  const n = 1024
  const curve = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * 2 - 1
    curve[i] = Math.tanh(x * 6) // hard-ish clipping fuzz
  }
  shaper.curve = curve
  const tone = ctx.createBiquadFilter()
  tone.type = 'lowpass'
  tone.frequency.value = 3200
  const out = ctx.createGain()
  out.gain.value = 0.16
  pre.connect(shaper).connect(tone).connect(out).connect(musicBus)
  guitarIn = pre
  return pre
}

/** One power-chord stab: root + fifth + octave, two slightly detuned saws each. */
function powerChord(root: number, t: number, dur: number, muted: boolean) {
  const bus = guitarBus()
  if (!ctx || !bus) return
  for (const iv of [0, 7, 12]) {
    for (const det of [-7, 7]) {
      const o = ctx.createOscillator()
      o.type = 'sawtooth'
      o.frequency.value = midi(root + 12 + iv)
      o.detune.value = det
      const g = ctx.createGain()
      const v = muted ? 0.12 : 0.2
      g.gain.setValueAtTime(v, t)
      g.gain.exponentialRampToValueAtTime(0.001, t + (muted ? dur * 0.45 : dur * 0.95))
      o.connect(g).connect(bus)
      o.start(t)
      o.stop(t + dur)
    }
  }
}

function scheduleStep(song: Song, s: number, t: number) {
  const i = s % 16
  const half = Math.floor(s / 8) % song.riff.length
  const root = song.riff[half]
  const sixteenth = 60 / song.bpm / 4

  // Guitar + bass on every eighth.
  if (i % 2 === 0) {
    const eighth = (i / 2) % 8
    const muted = song.mute.includes(eighth % 8)
    powerChord(root, t, sixteenth * 2, muted)
    tone(musicBus, midi(root - 12), t, sixteenth * 1.9, 'sawtooth', 0.12)
    tone(musicBus, midi(root - 12), t, sixteenth * 1.9, 'triangle', 0.3)
  }
  // Lead line (square, slightly detuned "second guitar").
  if (song.lead) {
    const m = song.lead[s % song.lead.length]
    if (m) {
      tone(musicBus, midi(m), t, sixteenth * 2.4, 'square', 0.05)
      tone(musicBus, midi(m) * 1.004, t, sixteenth * 2.4, 'square', 0.035)
    }
  }
  // Drums.
  const kick = () => tone(musicBus, 140, t, 0.12, 'sine', 0.7, 45)
  const snare = () => {
    noise(musicBus, t, 0.14, 0.38, 'bandpass', 1900)
    tone(musicBus, 190, t, 0.06, 'triangle', 0.2, 120)
  }
  const hat = () => noise(musicBus, t, 0.035, 0.09, 'highpass', 8000)
  if (song.drums === 'skank') {
    // kick-snare-kick-snare on eighths, hats on top, crash every 4 bars
    if (i % 4 === 0) kick()
    if (i % 4 === 2) snare()
    if (i % 2 === 0) hat()
    if (s % 64 === 0) noise(musicBus, t, 0.9, 0.22, 'highpass', 5000)
  } else {
    // oi! beat: kick on 1 and 3, snare on 2 and 4, open eighths on the hats
    if (i === 0 || i === 8 || i === 10) kick()
    if (i === 4 || i === 12) snare()
    if (i % 2 === 0) hat()
  }
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
