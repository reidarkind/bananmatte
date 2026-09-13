import { describe, expect, it } from "vitest";
import { parseBonusCheat } from "./cheat";
import { bonusVehicle, isBonusLevel } from "./milestones";

describe("parseBonusCheat", () => {
  it("reads 1337 plus the answer plus a milestone", () => {
    expect(parseBonusCheat("13372310", 23)).toBe(10);
    expect(parseBonusCheat("13372320", 23)).toBe(20);
    expect(parseBonusCheat("1337210", 2)).toBe(10);
    expect(parseBonusCheat("1337-510", -5)).toBe(10);
  });

  it("rejects a wrong answer or a normal typed number", () => {
    expect(parseBonusCheat("13372310", 5)).toBeNull();
    expect(parseBonusCheat("23", 23)).toBeNull();
    expect(parseBonusCheat("133723", 23)).toBeNull();
  });
});

describe("bonus milestones", () => {
  it("opens a bonus on level 10, 20, 30", () => {
    expect(isBonusLevel(10)).toBe(true);
    expect(isBonusLevel(20)).toBe(true);
    expect(isBonusLevel(9)).toBe(false);
    expect(isBonusLevel(15)).toBe(false);
  });

  it("picks a vehicle skin by milestone", () => {
    expect(bonusVehicle(10)).toBe("olabil");
    expect(bonusVehicle(20)).toBe("bil");
    expect(bonusVehicle(30)).toBe("baat");
    expect(bonusVehicle(40)).toBe("helikopter");
    expect(bonusVehicle(50)).toBe("lite-fly");
    expect(bonusVehicle(60)).toBe("stort-fly");
  });
});
