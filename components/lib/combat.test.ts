import { describe, expect, it } from 'vitest';
import { newCombat, drive, fire, tick } from './combat';
describe('Combat simulation', () => {
  it('moves forward in vehicle heading and turns left', () => {
    const s = newCombat(); s.phase = 'playing';
    for(let i=0;i<60;i++) drive(s,1,0,1/60);
    expect(s.z).toBeGreaterThan(-22); expect(s.x).toBe(0);
    drive(s,1,-1,0.05); expect(s.yaw).toBeLessThan(0);
  });
  it('destroys an aligned target after two shots and consumes ammunition', () => {
    const s = newCombat(); s.phase='playing';
    expect(fire(s)?.hp).toBe(50);
    tick(s,0.5); expect(fire(s)?.hp).toBe(0);
    expect(s.kills).toBe(1); expect(s.ammo).toBe(58);
  });
  it('prevents shooting during pause and cooldown', () => {
    const s=newCombat(); s.phase='paused'; fire(s); expect(s.ammo).toBe(60);
    s.phase='playing'; fire(s); fire(s); expect(s.ammo).toBe(59);
  });
  it('does not advance combat while paused and resets every round', () => {
    const s=newCombat(); s.phase='paused'; tick(s,20); expect(s.hp).toBe(100); expect(s.time).toBe(0);
    s.phase='playing'; tick(s,13); expect(s.hp).toBeLessThan(100);
    expect(newCombat().hp).toBe(100); expect(newCombat().kills).toBe(0);
  });
});