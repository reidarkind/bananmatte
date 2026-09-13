export const BONUS_MILESTONES = [10, 20, 30, 40, 50, 60, 70] as const;

export type BonusMilestone = (typeof BONUS_MILESTONES)[number];
export type BonusVehicle = "olabil" | "bil" | "vannscooter" | "baat" | "helikopter" | "propellfly" | "jetfly";
export type WorldTheme = "land" | "water" | "air";

export function isBonusLevel(level: number): boolean {
  return (BONUS_MILESTONES as readonly number[]).includes(level);
}

export function isJourneyEnd(level: number): boolean {
  return level === 70;
}

export function bonusVehicle(milestone: number): BonusVehicle {
  if (milestone <= 10) return "olabil";
  if (milestone <= 20) return "bil";
  if (milestone <= 30) return "vannscooter";
  if (milestone <= 40) return "baat";
  if (milestone <= 50) return "helikopter";
  if (milestone <= 60) return "propellfly";
  return "jetfly";
}

export function worldTheme(vehicle: BonusVehicle): WorldTheme {
  if (vehicle === "vannscooter" || vehicle === "baat") return "water";
  if (vehicle === "helikopter" || vehicle === "propellfly" || vehicle === "jetfly") return "air";
  return "land";
}
