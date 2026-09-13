import { describe, expect, it } from "vitest";
import { applyCatchEvent, createPlayState } from "./rules";
import { attackHitEvent, attackLeaveEvent, attackMissEvent, defendEscapeEvent, defendHitEvent } from "./play-map";

describe("bananangrep mapping", () => {
  it("counts a hit orangutan as a caught banana", () => {
    const next = applyCatchEvent(createPlayState(6), attackHitEvent("orangutan", 5));
    expect(next.collected).toBe(5);
    expect(next.lives).toBe(2);
  });

  it("counts a hit gorilla as a rotten catch", () => {
    const next = applyCatchEvent(createPlayState(6), attackHitEvent("gorilla", 1));
    expect(next.rottenCaught).toBe(1);
    expect(next.collected).toBe(0);
  });

  it("counts a missed throw or a leaving orangutan as a missed banana", () => {
    const miss = applyCatchEvent(createPlayState(6), attackMissEvent());
    expect(miss.lives).toBe(1);
    const left = attackLeaveEvent("orangutan");
    expect(left).toEqual(attackMissEvent());
    expect(attackLeaveEvent("gorilla")).toBeNull();
  });
});

describe("bananforsvar mapping", () => {
  it("counts a dodged rotten banana as a catch", () => {
    const next = applyCatchEvent(createPlayState(8), defendEscapeEvent("rotten", 5));
    expect(next.collected).toBe(5);
    expect(next.lives).toBe(2);
  });

  it("counts being hit by a rotten banana as a miss", () => {
    const next = applyCatchEvent(createPlayState(8), defendHitEvent("rotten", 1));
    expect(next.lives).toBe(1);
    expect(next.collected).toBe(0);
  });

  it("treats a trick banana like a rotten one", () => {
    const hit = applyCatchEvent(createPlayState(8), defendHitEvent("trick", 10));
    expect(hit.lives).toBe(1);
    expect(hit.collected).toBe(0);
    const dodged = applyCatchEvent(createPlayState(8), defendEscapeEvent("trick", 10));
    expect(dodged.collected).toBe(10);
  });

  it("counts a caught ripe banana as a catch and a missed ripe as rotten", () => {
    const caught = applyCatchEvent(createPlayState(8), defendHitEvent("banana", 1));
    expect(caught.collected).toBe(1);
    const dropped = applyCatchEvent(createPlayState(8), defendEscapeEvent("banana", 1));
    expect(dropped.rottenCaught).toBe(1);
  });
});
