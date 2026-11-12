export type Phase = 'ready' | 'playing' | 'paused' | 'won' | 'lost';
export interface Enemy { id: number; x: number; z: number; hp: number; cooldown: number }
export interface CombatState { phase: Phase; level: number; x: number; z: number; yaw: number; speed: number; hp: number; ammo: number; kills: number; time: number; reload: number; enemies: Enemy[]; notice: string }

const missions = [
  { enemies: [[0, 20], [-18, 48], [20, 65]] },
  { enemies: [[0, 20], [-24, 42], [24, 55], [-18, 78]] },
  { enemies: [[0, 22], [-28, 42], [28, 58], [-20, 78], [22, 94]] },
  { enemies: [[0, 24], [-28, 44], [28, 60], [-20, 80], [22, 98], [0, 112]] },
];

export function missionCount() { return missions.length; }
export function newCombat(level = 1): CombatState {
  const mission = missions[(Math.max(1, level) - 1) % missions.length];
  return { phase: 'ready', level, x: 0, z: -22, yaw: 0, speed: 0, hp: 100, ammo: 60, kills: 0, time: 0, reload: 0, notice: '', enemies: mission.enemies.map(([x,z], i) => ({ id:i+1, x, z, hp:100, cooldown: 18 + i * 3 })) };
}
export function drive(s: CombatState, throttle: number, steer: number, dt: number) {
  s.speed += throttle * 19 * dt;
  s.speed *= Math.exp(-0.36 * dt);
  s.speed = Math.max(-9, Math.min(24, s.speed));
  s.yaw += steer * 1.45 * Math.max(0.35, Math.min(Math.abs(s.speed) / 4, 1)) * Math.sign(s.speed || 1) * dt;
  const nextX = s.x + Math.sin(s.yaw) * s.speed * dt;
  const nextZ = s.z + Math.cos(s.yaw) * s.speed * dt;
  // Keep the vehicle footprint inside the playable area; vegetation stays clear of the road.
  s.x = Math.max(-67, Math.min(67, nextX));
  s.z = Math.max(-37, Math.min(112, nextZ));
}
export function fire(s: CombatState, aim = 0): Enemy | undefined {
  if (s.phase !== 'playing' || s.reload > 0 || s.ammo <= 0) return;
  s.ammo--; s.reload = 0.8;
  const yaw = s.yaw + aim;
  const target = s.enemies.filter(e => {
    if (e.hp <= 0) return false;
    const dx = e.x - s.x, dz = e.z - s.z;
    const distance = Math.hypot(dx, dz);
    const angle = Math.atan2(Math.sin(Math.atan2(dx, dz) - yaw), Math.cos(Math.atan2(dx, dz) - yaw));
    return distance < 105 && Math.abs(angle) < Math.atan2(5, distance);
  }).sort((a,b)=>Math.hypot(a.x-s.x,a.z-s.z)-Math.hypot(b.x-s.x,b.z-s.z))[0];
  if (target) {
    target.hp = Math.max(0, target.hp - 50);
    s.notice = target.hp === 0 ? 'ALVO DESTRUÍDO +200' : 'ACERTO CONFIRMADO +50';
    if (target.hp === 0) s.kills++;
    if (s.kills === s.enemies.length) s.phase = 'won';
  } else s.notice = '';
  if (s.ammo === 0 && s.phase === 'playing') s.phase = 'lost';
  return target;
}
export function tick(s: CombatState, dt: number) {
  if (s.phase !== 'playing') return;
  s.time += dt; s.reload = Math.max(0, s.reload - dt);
  for (const e of s.enemies) {
    if (e.hp <= 0 || Math.hypot(e.x - s.x, e.z - s.z) > 72) continue;
    e.cooldown -= dt;
    if (e.cooldown <= 0) { s.hp = Math.max(0, s.hp - 8); e.cooldown = 8; }
  }
  if (s.hp <= 0) s.phase = 'lost';
}
