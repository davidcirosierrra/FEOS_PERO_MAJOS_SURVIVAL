import { useFrame } from '@react-three/fiber'
import { BallCollider, CuboidCollider, RigidBody, type RapierRigidBody } from '@react-three/rapier'
import { memo, useEffect, useMemo, useRef, useState } from 'react'
import type * as THREE from 'three'
import { sfx } from '../audio'
import { BOSSES, ENRAGE_AT, type BossDef, type FirePattern } from '../bosses'
import { patternSize } from '../voxel/patterns'
import { Shadow } from '../voxel/Sprite'
import { Voxel } from '../voxel/Voxel'
import { FLY_Z, Stand } from '../scene/View'
import { COOKIE_PUSH, GROUPS } from './config'
import { addShake } from './fx'
import { field, liveThreats, playerState, useGame, type Cookie } from './store'

const rand = (a: number, b: number) => a + Math.random() * (b - a)
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))
const smooth = (k: number) => k * k * (3 - 2 * k)

/** Parts with their centre offset (world units) inside the boss sprite. */
function layout(def: BossDef) {
  const S = def.voxel
  const parts = def.parts.map((p) => {
    const { w, h } = patternSize(p.pattern)
    return { ...p, w, h, cx: (p.col + w / 2 - def.grid.w / 2) * S, cy: (def.grid.h / 2 - p.row - h / 2) * S }
  })
  return { parts, halfW: (def.grid.w * S) / 2, halfH: (def.grid.h * S) / 2, detachable: parts.length - 1 }
}
const layouts = new Map<string, ReturnType<typeof layout>>()
const layoutOf = (def: BossDef) => layouts.get(def.id) ?? layouts.set(def.id, layout(def)).get(def.id)!

/** Number of parts already broken off for a given health. */
const partsLost = (hp: number, maxHp: number, detachable: number) => Math.min(detachable, Math.floor((1 - hp / maxHp) * (detachable + 1)))

type Debris = { id: number; part: number; x: number; y: number }

function BossBody() {
  const body = useRef<RapierRigidBody>(null)
  const visual = useRef<THREE.Group>(null)
  const boss = useGame((s) => s.boss)!
  const hitBoss = useGame((s) => s.hitBoss)
  const def = BOSSES[boss.index]
  const L = layoutOf(def)
  const S = def.voxel
  const lost = partsLost(boss.hp, boss.maxHp, L.detachable)
  const spawn = useMemo(() => [0, field.halfH + 4, 0] as [number, number, number], [])

  const t = useRef(0)
  const pos = useRef({ x: 0, y: field.halfH + 4, lane: 0, laneIn: 1.2, squash: 0 })
  const lightIn = useRef(1.6)
  const heavyIn = useRef(rand(...def.heavy.every))
  const shotN = useRef(0)
  const flashUntil = useRef(0)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  // Parts that just broke off fly away as physics debris.
  const [debris, setDebris] = useState<Debris[]>([])
  const prevLost = useRef(0)
  useEffect(() => {
    const b = body.current
    if (!b || lost <= prevLost.current) return
    const p = b.translation()
    const fresh: Debris[] = []
    for (let i = prevLost.current; i < lost; i++) fresh.push({ id: Math.random(), part: i, x: p.x + L.parts[i].cx, y: p.y + L.parts[i].cy })
    prevLost.current = lost
    sfx.partOff()
    addShake(0.45)
    setDebris((d) => [...d, ...fresh])
  }, [lost, L])

  // Below a third of its health it loses its temper.
  const angry = boss.hp / boss.maxHp < ENRAGE_AT
  useEffect(() => {
    if (!angry) return
    sfx.enrage()
    addShake(0.5)
    useGame.setState({ banner: 'HASERRETU DA!' })
  }, [angry])

  // Short "flinch" whenever it takes a hit.
  const prevHp = useRef(boss.hp)
  useEffect(() => {
    if (boss.hp < prevHp.current) flashUntil.current = performance.now() + 90
    prevHp.current = boss.hp
  }, [boss.hp])

  /** One volley of the light projectile, from the boss at (x, y). */
  const volley = (pattern: FirePattern, x: number, y: number) => {
    const s = useGame.getState()
    const speed = def.light.speed
    const n = def.light.count ?? 3
    // Sideways speed that lands the shot on the player.
    const aim = (fromX: number) => clamp(((playerState.x - fromX) * speed) / Math.max(1, y - field.playerY), -4.5, 4.5)
    const alive = L.parts.slice(lost)
    const from = () => x + alive[Math.floor(Math.random() * alive.length)].cx * 0.8 + rand(-0.2, 0.2)
    switch (pattern) {
      case 'single':
        return s.bossFire([{ x: from(), y }])
      case 'aimed':
        return s.bossFire([{ x, y, vx: aim(x) }])
      case 'spread':
        return s.bossFire(Array.from({ length: n }, (_, i) => ({ x, y, vx: (i - (n - 1) / 2) * 1.7 })))
      case 'rain':
        return s.bossFire(
          Array.from({ length: n }, (_, i) => ({ x: (((i + 0.5) / n) * 2 - 1) * (field.halfW - 0.6) + rand(-0.4, 0.4), y: y + rand(0, 1.2) })),
        )
      case 'burst':
        for (let i = 0; i < 3; i++) {
          timers.current.push(
            setTimeout(() => {
              const g = useGame.getState()
              if (g.boss?.id !== boss.id || g.gameOver || g.paused) return
              const bx = body.current?.translation().x ?? x
              g.bossFire([{ x: bx, y, vx: aim(bx) }])
            }, i * 170),
          )
        }
    }
  }

  useFrame((_, rawDt) => {
    const b = body.current
    const s = useGame.getState()
    if (!b || s.gameOver || s.paused || !s.boss) return
    const dt = Math.min(rawDt, 0.05)
    const angry = s.boss.hp / s.boss.maxHp < ENRAGE_AT
    const rage = angry ? 1.35 : 1
    t.current += dt * rage
    const p = pos.current
    const targetY = field.halfH * 0.52
    p.y += (targetY - p.y) * Math.min(1, dt * 1.5)
    const amp = Math.max(0.5, field.halfW - L.halfW - 0.2)
    const w = t.current * def.speed
    let yOff = Math.sin(t.current * 2.3) * 0.12
    let turn = 0
    switch (def.move) {
      case 'sway':
        p.x = Math.sin(w) * amp
        turn = Math.cos(w) * 0.35
        break
      case 'dash': {
        // Waits on one side, then drives across.
        const c = w % 2
        const k = c % 1
        const go = k < 0.62 ? 0 : smooth((k - 0.62) / 0.38)
        const dir = c < 1 ? 1 : -1
        p.x = dir * amp * (go * 2 - 1)
        turn = k < 0.62 ? 0 : dir * 0.5
        yOff = k < 0.62 ? Math.sin(t.current * 30) * 0.03 : 0 // engine rattle while idling
        break
      }
      case 'chase': {
        const max = def.speed * rage * dt
        const d = clamp(playerState.x, -amp, amp) - p.x
        p.x += clamp(d, -max, max)
        turn = clamp(d, -1, 1) * 0.3
        yOff = Math.abs(Math.sin(t.current * 5)) * 0.14 // stomping
        break
      }
      case 'bounce':
        p.x = Math.sin(w) * amp
        yOff = Math.abs(Math.sin(t.current * 5.6)) * 0.45
        p.squash = 1 - Math.abs(Math.sin(t.current * 5.6))
        break
      case 'hop': {
        p.laneIn -= dt * rage
        if (p.laneIn <= 0) {
          p.laneIn = 2.2 / def.speed
          const lanes = [-1, 0, 1].filter((l) => l !== p.lane)
          p.lane = lanes[Math.floor(Math.random() * lanes.length)]
        }
        const d = p.lane * amp - p.x
        p.x += d * Math.min(1, dt * 7)
        yOff = Math.min(1.2, Math.abs(d)) * 0.5 // arcs while changing lane
        turn = clamp(d, -1, 1) * 0.5
        break
      }
      case 'eight':
        p.x = Math.sin(w) * amp
        yOff = Math.sin(w * 2) * 1.1
        turn = Math.cos(w) * 0.3
        break
    }
    const x = p.x
    const y = p.y + yOff
    b.setNextKinematicTranslation({ x, y, z: 0 })

    const v = visual.current
    if (v) {
      v.rotation.y = turn
      const k = performance.now() < flashUntil.current ? 1.06 : 1
      // Angry: trembles with rage.
      const tremble = angry ? Math.sin(t.current * 40) * 0.02 : 0
      v.position.x = tremble
      if (def.move === 'bounce') v.scale.set(k * (1 + p.squash * 0.06), k * (1 - p.squash * 0.08), k)
      else v.scale.setScalar(k)
    }

    if (Math.abs(p.y - targetY) > 0.6) return // still arriving
    const mouthY = y - L.halfH * 0.6
    lightIn.current -= dt * rage
    if (lightIn.current <= 0) {
      lightIn.current = rand(...def.light.every)
      const pattern = def.light.patterns[shotN.current++ % def.light.patterns.length]
      volley(pattern, x, mouthY)
    }
    heavyIn.current -= dt * rage
    if (heavyIn.current <= 0) {
      heavyIn.current = rand(...def.heavy.every)
      s.cookieFire(x, mouthY)
    }
  })

  return (
    <>
      <RigidBody
        ref={body}
        type="kinematicPosition"
        position={spawn}
        colliders={false}
        userData={{ kind: 'boss' }}
        onIntersectionEnter={({ other }) => {
          const ud = other.rigidBodyObject?.userData as { kind?: string; id?: number } | undefined
          if (ud?.kind !== 'playerShot' || ud.id == null) return
          const p = other.rigidBody?.translation()
          hitBoss(ud.id, p?.x ?? 0, p?.y ?? 0)
        }}
      >
        {/* One collider per remaining part: as parts fall off the target gets smaller. */}
        {L.parts.map((p, i) =>
          i < lost ? null : (
            <CuboidCollider key={p.name} args={[(p.w * S) / 2, (p.h * S) / 2, 0.4]} position={[p.cx, p.cy, 0]} collisionGroups={GROUPS.enemy} />
          ),
        )}
        <Stand height={L.halfH * 2}>
          <group ref={visual}>
            {L.parts.map((p, i) =>
              i < lost ? null : (
                <group key={p.name} position={[p.cx, p.cy, p.front ? 0.3 : 0]}>
                  <Voxel pattern={p.pattern} size={S} depth={p.front ? 2 : 4} />
                  {!p.front && <Shadow pattern={p.pattern} size={S} offset={0.4} />}
                </group>
              ),
            )}
          </group>
        </Stand>
      </RigidBody>
      {debris.map((d) => (
        <PartDebris key={d.id} def={def} d={d} onDone={() => setDebris((all) => all.filter((x) => x.id !== d.id))} />
      ))}
    </>
  )
}

/** A broken-off part tumbling down with gravity. */
const PartDebris = memo(function PartDebris({ def, d, onDone }: { def: BossDef; d: Debris; onDone: () => void }) {
  const p = layoutOf(def).parts[d.part]
  const S = def.voxel
  const init = useMemo(
    () => ({
      pos: [d.x, d.y, 0] as [number, number, number],
      vel: [rand(-3, 3), rand(2, 5), rand(1, 4)] as [number, number, number],
      ang: [rand(-4, 4), rand(-4, 4), rand(-6, 6)] as [number, number, number],
    }),
    [d],
  )
  const done = useRef(onDone)
  done.current = onDone
  useEffect(() => {
    const t = setTimeout(() => done.current(), 2500)
    return () => clearTimeout(t)
  }, [])
  return (
    <RigidBody position={init.pos} linearVelocity={init.vel} angularVelocity={init.ang} gravityScale={1.6} colliders={false}>
      <CuboidCollider args={[(p.w * S) / 2, (p.h * S) / 2, 0.2]} mass={0.5} collisionGroups={GROUPS.debris} />
      <Voxel pattern={p.pattern} size={S} depth={p.front ? 2 : 4} />
    </RigidBody>
  )
})

const XY_ONLY: [boolean, boolean, boolean] = [true, true, false]

/** The boss's heavy projectile: indestructible, forks only push it off course. */
const HeavyBody = memo(function HeavyBody({ c, def }: { c: Cookie; def: BossDef }) {
  const body = useRef<RapierRigidBody>(null)
  const visual = useRef<THREE.Group>(null)
  const remove = useGame((s) => s.removeCookie)
  const pushCookie = useGame((s) => s.pushCookie)
  const { sprite, size } = def.heavy
  const R = (patternSize(sprite).w * size) / 2
  const init = useMemo(() => ({ pos: [c.x, c.y, 0] as [number, number, number], vel: [c.vx, -c.speed, 0] as [number, number, number] }), [c])
  useEffect(() => () => void liveThreats.delete(c.id), [c.id])

  useFrame((_, dt) => {
    const b = body.current
    if (!b) return
    const p = b.translation()
    if (p.y < -field.halfH - 2 || p.y > field.halfH + 3) remove(c.id)
    liveThreats.set(c.id, { x: p.x, y: p.y, harmless: false })
    if (visual.current) visual.current.rotation.z += b.linvel().x * -dt * 1.5 + dt * 0.8 // rolls as it drifts
  })

  return (
    <RigidBody
      ref={body}
      type="dynamic"
      position={init.pos}
      linearVelocity={init.vel}
      gravityScale={0}
      linearDamping={0}
      enabledTranslations={XY_ONLY}
      lockRotations
      colliders={false}
      ccd
      userData={{ kind: 'cookie', id: c.id }}
      onIntersectionEnter={({ other, target }) => {
        const ud = other.rigidBodyObject?.userData as { kind?: string; id?: number } | undefined
        const shot = other.rigidBody
        const b = target.rigidBody
        if (ud?.kind !== 'playerShot' || ud.id == null || !shot || !b) return
        if (!pushCookie(c.id, ud.id)) return
        // Pushed along the fork's direction, and sideways depending on where it was hit.
        const sv = shot.linvel()
        const len = Math.hypot(sv.x, sv.y) || 1
        const off = b.translation().x - shot.translation().x
        b.applyImpulse({ x: (sv.x / len) * COOKIE_PUSH + off * COOKIE_PUSH * 1.8, y: (sv.y / len) * COOKIE_PUSH, z: 0 }, true)
      }}
    >
      <BallCollider args={[R]} mass={1} restitution={1} friction={0} collisionGroups={GROUPS.cookie} />
      <BallCollider args={[R * 0.9]} sensor mass={0} collisionGroups={GROUPS.enemyShot} />
      <Stand height={R * 2} lift={FLY_Z - R}>
        <group ref={visual}>
          <Voxel pattern={sprite} size={size} depth={2} />
        </group>
        <Shadow pattern={sprite} size={size} offset={0.3} />
      </Stand>
    </RigidBody>
  )
})

export function BossLayer() {
  const bossId = useGame((s) => s.boss?.id)
  const index = useGame((s) => s.boss?.index)
  const cookies = useGame((s) => s.cookies)
  // Heavies outlive nothing: they are cleared with the boss, so the last index is always theirs.
  const lastIndex = useRef(0)
  if (index != null) lastIndex.current = index
  return (
    <>
      {bossId != null && <BossBody key={bossId} />}
      {cookies.map((c) => (
        <HeavyBody key={c.id} c={c} def={BOSSES[lastIndex.current]} />
      ))}
    </>
  )
}
