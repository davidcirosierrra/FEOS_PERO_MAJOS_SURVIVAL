import { setConsoleFunction } from 'three'

/**
 * @react-three/fiber (latest, 9.x) still creates a `THREE.Clock` for every canvas, which three r183+
 * flags as deprecated. That call lives inside the library and we can't change it, so this drops
 * exactly that one message and forwards everything else from three untouched.
 * Remove once fiber switches to `THREE.Timer`.
 */
const IGNORED = ['Clock: This module has been deprecated']

type StackTrace = { isStackTrace: true; getError: (message: string) => Error }

setConsoleFunction((type: string, message: string, ...params: unknown[]) => {
  if (IGNORED.some((m) => message.includes(m))) return
  // Same behaviour as three's default logger (message already carries the "THREE." prefix).
  const fn = (console as unknown as Record<string, (...a: unknown[]) => void>)[type] ?? console.log
  const first = params[0] as Partial<StackTrace> | undefined
  if (first?.isStackTrace) fn((first as StackTrace).getError(message))
  else fn(message, ...params)
})
