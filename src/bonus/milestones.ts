export type BonusVehicle = "olabil" | "bil" | "baat" | "helikopter" | "lite-fly" | "stort-fly";

export function isBonusLevel(level: number): boolean {
  return level >= 10 && level % 10 === 0;
}

export function bonusVehicle(milestone: number): BonusVehicle {
  if (milestone <= 10) return "olabil";
  if (milestone <= 20) return "bil";
  if (milestone <= 30) return "baat";
  if (milestone <= 40) return "helikopter";
  if (milestone <= 50) return "lite-fly";
  return "stort-fly";
}
