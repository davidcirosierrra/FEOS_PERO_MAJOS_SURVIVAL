import { useFrame } from '@react-three/fiber'
import { BallCollider, CuboidCollider, RigidBody, type RapierRigidBody } from '@react-three/rapier'
import { memo, useEffect, useMemo, useRef, useState } from 'react'
import type * as THREE from 'three'
import { sfx } from '../audio'
import { patternSize } from '../voxel/patterns'
import { COOKIE, TRUCK_GRID, TRUCK_PARTS } from '../voxel/truck'
import { Voxel } from '../voxel/Voxel'
import { boss as bossCfg, COOKIE_PUSH, GROUPS, TRUCK_VOXEL as S } from './config'
import { field, useGame, type Cookie } from './store'

/** Parts with their centre offset (world units) inside the truck. */
const PARTS = TRUCK_PARTS.map((p) => {
  const { w, h } = patternSize(p.pattern)
  return { ...p, w, h, cx: (p.col + w / 2 - TRUCK_GRID.w / 2) * S, cy: (TRUCK_GRID.h / 2 - p.row - h / 2) * S }
})
/** Every part except the last (the cab) can break off. */
const DETACHABLE = PARTS.length - 1
const HALF_W = (TRUCK_GRID.w * S) / 2
const HALF_H = (TRUCK_GRID.h * S) / 2

/** Number of parts already broken off for a given health. */
const partsLost = (hp: number, maxHp: number) => Math.min(DETACHABLE, Math.floor((1 - hp / maxHp) * (DETACHABLE + 1)))

const rand = (a: number, b: number) => a + Math.random() * (b - a)
type Debris = { id: number; part: number; x: number; y: number }

function Truck() {
  const body = useRef<RapierRigidBody>(null)
  const visual = useRef<THREE.Group>(null)
  const boss = useGame((s) => s.boss)!
  const hitBoss = useGame((s) => s.hitBoss)
  const cfg = useMemo(() => bossCfg(boss.level), [boss.level])
  const lost = partsLost(boss.hp, boss.maxHp)
  const spawn = useMemo(() => [0, field.halfH + 3, 0] as [number, number, number], [])

  const t = useRef(0)
  const y = useRef(field.halfH + 3)
  const coneIn = useRef(1.5)
  const cookieIn = useRef(rand(...cfg.cookieEvery))
  const flashUntil = useRef(0)

  // Parts that just broke off fly away as physics debris.
  const [debris, setDebris] = useState<Debris[]>([])
  const prevLost = useRef(0)
  useEffect(() => {
    const b = body.current
    if (!b || lost <= prevLost.current) return
    const p = b.translation()
    const fresh: Debris[] = []
    for (let i = prevLost.current; i < lost; i++) fresh.push({ id: Math.random(), part: i, x: p.x + PARTS[i].cx, y: p.y + PARTS[i].cy })
    prevLost.current = lost
    sfx.partOff()
    setDebris((d) => [...d, ...fresh])
  }, [lost])

  // Short "flinch" whenever it takes a hit.
  const prevHp = useRef(boss.hp)
  useEffect(() => {
    if (boss.hp < prevHp.current) flashUntil.current = performance.now() + 90
    prevHp.current = boss.hp
  }, [boss.hp])

  useFrame((_, rawDt) => {
    const b = body.current
    const s = useGame.getState()
    if (!b || s.gameOver || s.paused) return
    const dt = Math.min(rawDt, 0.05)
    t.current += dt
    const targetY = field.halfH * 0.58
    y.current += (targetY - y.current) * Math.min(1, dt * 1.5)
    const amp = Math.max(0.5, field.halfW - HALF_W - 0.2)
    const x = Math.sin(t.current * cfg.sway) * amp
    b.setNextKinematicTranslation({ x, y: y.current + Math.sin(t.current * 2.3) * 0.12, z: 0 })

    const v = visual.current
    if (v) {
      v.rotation.y = Math.cos(t.current * cfg.sway) * 0.35 // turns a little as it changes direction
      const k = performance.now() < flashUntil.current ? 1.06 : 1
      v.scale.setScalar(k)
    }

    if (Math.abs(y.current - targetY) > 0.6) return // still driving in
    coneIn.current -= dt
    if (coneIn.current <= 0) {
      coneIn.current = rand(...cfg.coneEvery)
      // Thrown from somewhere along whatever is left of the truck.
      const alive = PARTS.slice(lost)
      const part = alive[Math.floor(Math.random() * alive.length)]
      s.bossFire(x + part.cx + rand(-0.3, 0.3), y.current - HALF_H * 0.6)
    }
    cookieIn.current -= dt
    if (cookieIn.current <= 0) {
      cookieIn.current = rand(...cfg.cookieEvery)
      s.cookieFire(x + PARTS[PARTS.length - 1].cx, y.current - HALF_H * 0.6)
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
        {PARTS.map((p, i) =>
          i < lost ? null : (
            <CuboidCollider
              key={p.name}
              args={[(p.w * S) / 2, (p.h * S) / 2, 0.4]}
              position={[p.cx, p.cy, 0]}
              collisionGroups={GROUPS.enemy}
            />
          ),
        )}
        <group ref={visual}>
          {PARTS.map((p, i) =>
            i < lost ? null : <Voxel key={p.name} pattern={p.pattern} size={S} depth={p.front ? 1 : 4} position={[p.cx, p.cy, p.front ? 0.3 : 0]} />,
          )}
        </group>
      </RigidBody>
      {debris.map((d) => (
        <PartDebris key={d.id} d={d} onDone={() => setDebris((all) => all.filter((x) => x.id !== d.id))} />
      ))}
    </>
  )
}

/** A broken-off part tumbling down with gravity. */
const PartDebris = memo(function PartDebris({ d, onDone }: { d: Debris; onDone: () => void }) {
  const p = PARTS[d.part]
  const init = useMemo(
    () => ({
      pos: [d.x, d.y, 0] as [number, number, number],
      vel: [rand(-3, 3), rand(2, 5), rand(1, 4)] as [number, number, number],
      ang: [rand(-4, 4), rand(-4, 4), rand(-6, 6)] as [number, number, number],
    }),
    [d],
  )
  useEffect(() => {
    const t = setTimeout(onDone, 2500)
    return () => clearTimeout(t)
  }, [onDone])
  return (
    <RigidBody position={init.pos} linearVelocity={init.vel} angularVelocity={init.ang} gravityScale={1.6} colliders={false}>
      <CuboidCollider args={[(p.w * S) / 2, (p.h * S) / 2, 0.2]} mass={0.5} collisionGroups={GROUPS.debris} />
      <Voxel pattern={p.pattern} size={S} depth={p.front ? 1 : 4} />
    </RigidBody>
  )
})

const XY_ONLY: [boolean, boolean, boolean] = [true, true, false]
const COOKIE_SIZE = 0.11
const COOKIE_R = (patternSize(COOKIE).w * COOKIE_SIZE) / 2

/** Indestructible cookie: lasers only push it off course. */
const CookieBody = memo(function CookieBody({ c }: { c: Cookie }) {
  const body = useRef<RapierRigidBody>(null)
  const visual = useRef<THREE.Group>(null)
  const remove = useGame((s) => s.removeCookie)
  const pushCookie = useGame((s) => s.pushCookie)
  const init = useMemo(() => ({ pos: [c.x, c.y, 0] as [number, number, number], vel: [c.vx, -c.speed, 0] as [number, number, number] }), [c])

  useFrame((_, dt) => {
    const b = body.current
    if (!b) return
    const p = b.translation()
    if (p.y < -field.halfH - 2 || p.y > field.halfH + 3) remove(c.id)
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
        // Pushed along the laser's direction, and sideways depending on where it was hit.
        const sv = shot.linvel()
        const len = Math.hypot(sv.x, sv.y) || 1
        const off = b.translation().x - shot.translation().x
        b.applyImpulse({ x: (sv.x / len) * COOKIE_PUSH + off * COOKIE_PUSH * 1.8, y: (sv.y / len) * COOKIE_PUSH, z: 0 }, true)
      }}
    >
      <BallCollider args={[COOKIE_R]} mass={1} restitution={1} friction={0} collisionGroups={GROUPS.cookie} />
      <BallCollider args={[COOKIE_R * 0.9]} sensor mass={0} collisionGroups={GROUPS.enemyShot} />
      <group ref={visual}>
        <Voxel pattern={COOKIE} size={COOKIE_SIZE} depth={2} />
      </group>
    </RigidBody>
  )
})

export function BossLayer() {
  const bossId = useGame((s) => s.boss?.id)
  const cookies = useGame((s) => s.cookies)
  return (
    <>
      {bossId != null && <Truck key={bossId} />}
      {cookies.map((c) => (
        <CookieBody key={c.id} c={c} />
      ))}
    </>
  )
}
