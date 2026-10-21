let ctx: AudioContext | undefined;
let muted = false;
export function toggleAudio() { muted = !muted; return muted; }
export function shotAudio(explosion = false) {
  if (muted) return;
  ctx ??= new AudioContext();
  void ctx.resume();
  const osc = ctx.createOscillator(), gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(explosion ? 100 : 180, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(28, ctx.currentTime + 0.25);
  gain.gain.setValueAtTime(0.25, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
  osc.connect(gain); gain.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + 0.32);
}