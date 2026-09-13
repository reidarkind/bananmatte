export const PLAY_REF_HEIGHT = 840;
export const PLAY_REF_WIDTH = 430;

export function playSpeedScale(size: number, ref: number): number {
  return Math.max(1, size / ref);
}
