export function playTone(enabled: boolean, frequency: number, duration = 0.12, type: OscillatorType = "sine"): void {
  if (!enabled) return;
  const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return;
  const ctx = new AudioCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = frequency;
  gain.gain.value = 0.08;
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.stop(ctx.currentTime + duration);
  osc.onended = () => void ctx.close();
}

export const sfx = {
  catch: (on: boolean) => playTone(on, 660, 0.08, "triangle"),
  miss: (on: boolean) => playTone(on, 180, 0.16, "sawtooth"),
  rotten: (on: boolean) => playTone(on, 120, 0.2, "square"),
  ok: (on: boolean) => playTone(on, 880, 0.18, "triangle"),
  fail: (on: boolean) => playTone(on, 140, 0.28, "sawtooth"),
};
