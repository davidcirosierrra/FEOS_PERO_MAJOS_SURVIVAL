import { useFrame } from '@react-three/fiber'
import { CuboidCollider, RigidBody, type RapierRigidBody } from '@react-three/rapier'
import { useRef, useEffect } from 'react'
import type * as THREE from 'three'
import { patternSize } from '../voxel/patterns'
import { FAN_LEGS, FANS } from '../voxel/theme'
import { Walker } from '../voxel/Sprite'
import { Stand } from '../scene/View'
import { FAN_VOXEL, GROUPS, wave as waveCfg } from './config'
import { field, useGame, type Enemy as EnemyT, liveEnemies } from './store'

const { w, h } = patternSize(FANS[0])
const expRand = (mean: number) => -Math.log(1 - Math.random()) * mean

export function Enemy({ e }: { e: EnemyT }) {
  const body = useRef<RapierRigidBody>(null)
  const visual = useRef<THREE.Group>(null)
  const t = useRef(-e.delay)
  const y = useRef(field.halfH + 2)
  const slotY = useRef(e.slotY)
  const fireIn = useRef(1.2 + Math.random() * 2.5)
  const walkStep = useRef(0)
  const killEnemy = useGame((s) => s.killEnemy)
  useEffect(() => () => void liveEnemies.delete(e.id), [e.id])

  useFrame((_, rawDt) => {
    const b = body.current
    const s = useGame.getState()
    if (!b || s.gameOver || s.paused) return
    const dt = Math.min(rawDt, 0.05)
    t.current += dt
    if (t.current < 0) return
    const cfg = waveCfg(s.wave)

    // Formation slowly creeps down; if it gets too close it warps back to the top.
    slotY.current -= cfg.descent * dt
    if (slotY.current < field.playerY + 3.2) {
      slotY.current = e.slotY
      y.current = field.halfH + 2
    }
    y.current += (slotY.current - y.current) * Math.min(1, dt * 2.2)
    const halfSpan = field.halfW - (w * FAN_VOXEL) / 2
    const x = Math.max(-halfSpan, Math.min(halfSpan, e.slotX + Math.sin(t.current * 1.25 + e.phase) * cfg.sway))
    b.setNextKinematicTranslation({ x, y: y.current, z: 0 })
    liveEnemies.set(e.id, { x, y: y.current })

    if (visual.current) {
      // Walking wobble.
      const step = Math.sin(t.current * 8 + e.phase)
      walkStep.current = Math.floor((t.current * 8 + e.phase) / Math.PI) & 1
      visual.current.rotation.z = step * 0.08
      visual.current.rotation.y = Math.sin(t.current * 1.25 + e.phase) * 0.25
      visual.current.position.y = Math.abs(step) * 0.08
    }

    // Shoot only once in position.
    fireIn.current -= dt
    if (fireIn.current <= 0 && Math.abs(y.current - slotY.current) < 0.4) {
      fireIn.current = 0.4 + expRand(1 / cfg.fireRate)
      s.enemyFire(x, y.current)
    }
  })

  return (
    <RigidBody
      ref={body}
      type="kinematicPosition"
      position={[e.slotX, field.halfH + 2, 0]}
      colliders={false}
      userData={{ kind: 'enemy', id: e.id }}
      onIntersectionEnter={({ other }) => {
        const ud = other.rigidBodyObject?.userData as { kind?: string; id?: number } | undefined
        if (ud?.kind !== 'playerShot' || ud.id == null || !body.current) return
        const p = body.current.translation()
        killEnemy(e.id, ud.id, p.x, p.y)
      }}
    >
      <CuboidCollider args={[(w * FAN_VOXEL) / 2.2, (h * FAN_VOXEL) / 2.2, 0.3]} collisionGroups={GROUPS.enemy} />
      <Stand height={h * FAN_VOXEL}>
        <group ref={visual}>
          <Walker pattern={FANS[e.look]} legs={FAN_LEGS} size={FAN_VOXEL} depth={3} step={walkStep} />
        </group>
      </Stand>
    </RigidBody>
  )
}

export function Enemies() {
  const enemies = useGame((s) => s.enemies)
  return enemies.map((e) => <Enemy key={e.id} e={e} />)
}
