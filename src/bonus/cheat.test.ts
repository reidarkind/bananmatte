import { describe, expect, it } from "vitest";
import { bonusMilestoneFromAnswer, parseBonusCheat } from "./cheat";
import { bonusVehicle, isBonusLevel } from "./milestones";

describe("parseBonusCheat", () => {
  it("reads 1337 plus the answer plus a milestone", () => {
    expect(parseBonusCheat("13372310", 23)).toBe(10);
    expect(parseBonusCheat("13372320", 23)).toBe(20);
    expect(parseBonusCheat("1337210", 2)).toBe(10);
    expect(parseBonusCheat("1337310", 3)).toBe(10);
    expect(parseBonusCheat("1337-510", -5)).toBe(10);
  });

  it("rejects a wrong answer or a normal typed number", () => {
    expect(parseBonusCheat("13372310", 5)).toBeNull();
    expect(parseBonusCheat("23", 23)).toBeNull();
    expect(parseBonusCheat("133723", 23)).toBeNull();
  });

  it("reads the cheat from the submitted number even without the raw buffer", () => {
    expect(bonusMilestoneFromAnswer(3, 1337310)).toBe(10);
    expect(bonusMilestoneFromAnswer(3, 1337310, "1337310")).toBe(10);
    expect(bonusMilestoneFromAnswer(7, 1337310)).toBeNull();
    expect(bonusMilestoneFromAnswer(3, 3)).toBeNull();
  });
});

describe("bonus milestones", () => {
  it("opens a bonus on the seven journey worlds only", () => {
    expect(isBonusLevel(10)).toBe(true);
    expect(isBonusLevel(20)).toBe(true);
    expect(isBonusLevel(70)).toBe(true);
    expect(isBonusLevel(9)).toBe(false);
    expect(isBonusLevel(15)).toBe(false);
    expect(isBonusLevel(80)).toBe(false);
  });

  it("picks a vehicle skin by milestone", () => {
    expect(bonusVehicle(10)).toBe("olabil");
    expect(bonusVehicle(20)).toBe("bil");
    expect(bonusVehicle(30)).toBe("vannscooter");
    expect(bonusVehicle(40)).toBe("baat");
    expect(bonusVehicle(50)).toBe("helikopter");
    expect(bonusVehicle(60)).toBe("propellfly");
    expect(bonusVehicle(70)).toBe("jetfly");
  });
});
