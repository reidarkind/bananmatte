import { describe, expect, it } from "vitest";
import { applyCatchEvent, createPlayState, fallSpeed, spawnRotten } from "./rules";

describe("applyCatchEvent", () => {
  it("subtracts 5 on a missed banana and clamps at 0", () => {
    const low = applyCatchEvent(createPlayState(5, 3), { type: "missed", kind: "banana", value: 1 });
    expect(low.score).toBe(0);
    const mid = applyCatchEvent(createPlayState(5, 20), { type: "missed", kind: "banana", value: 1 });
    expect(mid.score).toBe(15);
  });

  it("ends the game after two missed bananas", () => {
    let state = createPlayState(5);
    state = applyCatchEvent(state, { type: "missed", kind: "banana", value: 1 });
    expect(state.ended).toBe(false);
    expect(state.lives).toBe(1);
    state = applyCatchEvent(state, { type: "missed", kind: "banana", value: 1 });
    expect(state.ended).toBe(true);
    expect(state.endReason).toBe("misses");
  });

  it("does not spend a life on a rotten miss", () => {
    const state = applyCatchEvent(createPlayState(5), { type: "missed", kind: "rotten", value: 1 });
    expect(state.lives).toBe(2);
    expect(state.score).toBe(0);
  });

  it("penalizes catching a rotten banana without ending the round", () => {
    const state = applyCatchEvent(createPlayState(5, 30), { type: "caught", kind: "rotten", value: 1 });
    expect(state.score).toBe(10);
    expect(state.lives).toBe(2);
    expect(state.rottenCaught).toBe(1);
    expect(state.roundComplete).toBe(false);
  });

  it("ends the game after more than three rotten catches and keeps the count across rounds", () => {
    let state = createPlayState(5, 0, 2);
    state = applyCatchEvent(state, { type: "caught", kind: "rotten", value: 1 });
    expect(state.ended).toBe(false);
    expect(state.rottenCaught).toBe(3);
    const nextRound = createPlayState(8, state.score, state.rottenCaught);
    expect(nextRound.rottenCaught).toBe(3);
    const ended = applyCatchEvent(nextRound, { type: "caught", kind: "rotten", value: 1 });
    expect(ended.ended).toBe(true);
    expect(ended.endReason).toBe("rotten");
  });

  it("completes the round when collected reaches the target", () => {
    let state = createPlayState(6);
    state = applyCatchEvent(state, { type: "caught", kind: "banana", value: 5 });
    expect(state.roundComplete).toBe(false);
    state = applyCatchEvent(state, { type: "caught", kind: "banana", value: 1 });
    expect(state.roundComplete).toBe(true);
    expect(state.collected).toBe(6);
  });
});

describe("level helpers", () => {
  it("increases fall speed each level", () => {
    expect(fallSpeed(2)).toBeGreaterThan(fallSpeed(1));
  });

  it("does not spawn rotten bananas before level 2", () => {
    expect(spawnRotten(1, () => 0)).toBe(false);
    expect(spawnRotten(2, () => 0)).toBe(true);
  });
});
