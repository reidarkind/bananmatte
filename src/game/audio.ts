export function playTone(enabled: boolean, frequency: number, duration = 0.12, type: OscillatorType = "sine"): void {
  if (!enabled) return;
  try {
    if (typeof window === "undefined") return;
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
    void ctx.resume();
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + Math.max(0.05, duration));
    osc.stop(ctx.currentTime + Math.max(0.05, duration));
    osc.onended = () => void ctx.close();
  } catch {
    // iOS/Safari can reject AudioContext from the game loop; never freeze the catch.
  }
}

export const sfx = {
  catch: (on: boolean) => playTone(on, 660, 0.08, "triangle"),
  miss: (on: boolean) => playTone(on, 180, 0.16, "sawtooth"),
  rotten: (on: boolean) => playTone(on, 120, 0.2, "square"),
  ok: (on: boolean) => playTone(on, 880, 0.18, "triangle"),
  fail: (on: boolean) => playTone(on, 140, 0.28, "sawtooth"),
};
