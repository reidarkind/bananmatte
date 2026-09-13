import { describe, expect, it } from "vitest";
import { memoryStore } from "./adapter";
import { clearUnlocks, loadUnlocks, unlockBonus } from "./unlocks";

describe("bonus unlocks", () => {
  it("stores a reached bonus world on the device", () => {
    const store = memoryStore();
    expect(loadUnlocks(store)).toEqual([]);
    expect(unlockBonus(10, store)).toEqual([10]);
    expect(unlockBonus(10, store)).toEqual([10]);
    expect(unlockBonus(30, store)).toEqual([10, 30]);
    expect(loadUnlocks(store)).toEqual([10, 30]);
  });

  it("ignores worlds that are not on the bonus journey", () => {
    const store = memoryStore();
    expect(unlockBonus(15, store)).toEqual([]);
    expect(unlockBonus(80, store)).toEqual([]);
  });

  it("clears unlocks with the results wipe", () => {
    const store = memoryStore();
    unlockBonus(10, store);
    unlockBonus(20, store);
    expect(clearUnlocks(store)).toEqual([]);
    expect(loadUnlocks(store)).toEqual([]);
  });
});
