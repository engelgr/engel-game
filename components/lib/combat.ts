export type Phase = 'ready' | 'playing' | 'paused' | 'won' | 'lost';
export interface Enemy { id: number; x: number; z: number; hp: number; cooldown: number }
export interface CombatState { phase: Phase; x: number; z: number; yaw: number; speed: number; hp: number; ammo: number; kills: number; time: number; reload: number; enemies: Enemy[]; notice: string }
export function newCombat(): CombatState {
  return { phase: 'ready', x: 0, z: -22, yaw: 0, speed: 0, hp: 100, ammo: 60, kills: 0, time: 0, reload: 0, notice: '', enemies: [
    { id: 1, x: 0, z: 17, hp: 100, cooldown: 12 },
    { id: 2, x: -24, z: 38, hp: 100, cooldown: 16 },
    { id: 3, x: 27, z: 50, hp: 100, cooldown: 20 },
    { id: 4, x: -16, z: 78, hp: 100, cooldown: 24 },
    { id: 5, x: 32, z: 92, hp: 100, cooldown: 28 },
  ] };
}
export function drive(s: CombatState, throttle: number, steer: number, dt: number) {
  s.speed += throttle * 14 * dt;
  s.speed *= Math.exp(-0.65 * dt);
  s.speed = Math.max(-7, Math.min(19, s.speed));
  s.yaw += steer * 1.15 * Math.min(Math.abs(s.speed) / 4, 1) * Math.sign(s.speed || 1) * dt;
  s.x = Math.max(-70, Math.min(70, s.x + Math.sin(s.yaw) * s.speed * dt));
  s.z = Math.max(-40, Math.min(115, s.z + Math.cos(s.yaw) * s.speed * dt));
}
export function fire(s: CombatState, aim = 0): Enemy | undefined {
  if (s.phase !== 'playing' || s.reload > 0 || s.ammo <= 0) return;
  s.ammo--; s.reload = 0.45;
  const yaw = s.yaw + aim;
  const target = s.enemies.filter(e => {
    if (e.hp <= 0) return false;
    const dx = e.x - s.x, dz = e.z - s.z;
    const distance = Math.hypot(dx, dz);
    const angle = Math.atan2(Math.sin(Math.atan2(dx, dz) - yaw), Math.cos(Math.atan2(dx, dz) - yaw));
    return distance < 100 && Math.abs(angle) < Math.atan2(3.3, distance);
  }).sort((a,b) => Math.hypot(a.x-s.x,a.z-s.z)-Math.hypot(b.x-s.x,b.z-s.z))[0];
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
    if (e.hp <= 0 || Math.hypot(e.x - s.x, e.z - s.z) > 65) continue;
    e.cooldown -= dt;
    if (e.cooldown <= 0) { s.hp = Math.max(0, s.hp - 12); e.cooldown = 6; }
  }
  if (s.hp <= 0) s.phase = 'lost';
}