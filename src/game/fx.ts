/**
 * Screen-space juice shared between the store (which triggers it) and the scene / overlays
 * (which play it). Mutable singleton: read every frame, no React re-renders.
 */
export const fx = {
  /** Camera shake strength in world units; decays every frame. */
  shake: 0,
  /** Full-screen flash: when it started and what kind. */
  flashAt: 0,
  flashKind: 'hurt' as 'hurt' | 'white',
}

export function addShake(amount: number) {
  fx.shake = Math.min(1.6, Math.max(fx.shake, amount))
}

export function flash(kind: 'hurt' | 'white') {
  fx.flashAt = performance.now()
  fx.flashKind = kind
}
