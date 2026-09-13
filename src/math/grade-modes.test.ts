import { describe, expect, it } from "vitest";
import { createRng } from "./rng";
import {
  planBytteplass,
  planDobbeltHalv,
  planHoppetelling,
  planKlokke,
  planLikhet,
  planManglendeTall,
  planTiMerMindre,
} from "./grade-modes";

describe("planManglendeTall", () => {
  it("hides one addend and asks for it", () => {
    const rng = createRng(11);
    for (let i = 0; i < 30; i += 1) {
      const plan = planManglendeTall(10, rng);
      expect(plan.mode).toBe("manglende-tall");
      expect(plan.kind).toBe("number");
      expect(plan.expression).toMatch(/□/);
      const match = plan.expression?.match(/(\d+|□)\s*\+\s*(\d+|□)\s*=\s*(\d+)/);
      expect(match).not.toBeNull();
      const left = match![1] === "□" ? plan.answer : Number(match![1]);
      const right = match![2] === "□" ? plan.answer : Number(match![2]);
      const sum = Number(match![3]);
      expect(Number(left) + Number(right)).toBe(sum);
      expect(sum).toBeLessThanOrEqual(10);
      expect([left, right, sum]).toContain(plan.catchTarget);
      expect(plan.catchTarget).not.toBe(plan.answer);
    }
  });
});

describe("planBytteplass", () => {
  it("asks for the swapped addend", () => {
    const rng = createRng(3);
    for (let i = 0; i < 24; i += 1) {
      const plan = planBytteplass(10, rng);
      expect(plan.mode).toBe("bytteplass");
      const match = plan.expression?.match(/(\d+)\s*\+\s*(\d+)\s*=\s*(\d+|□)\s*\+\s*(\d+|□)/);
      expect(match).not.toBeNull();
      const a = Number(match![1]);
      const b = Number(match![2]);
      const c = match![3] === "□" ? Number(plan.answer) : Number(match![3]);
      const d = match![4] === "□" ? Number(plan.answer) : Number(match![4]);
      expect(a + b).toBe(c + d);
      expect([a, b]).toContain(plan.catchTarget);
      expect([a, b]).toContain(plan.answer);
    }
  });
});

describe("planLikhet", () => {
  it("keeps both sides equal", () => {
    const rng = createRng(8);
    for (let i = 0; i < 24; i += 1) {
      const plan = planLikhet(20, rng);
      expect(plan.mode).toBe("likhet");
      const match = plan.expression?.match(/(\d+)\s*\+\s*(\d+)\s*=\s*□\s*\+\s*(\d+)/);
      expect(match).not.toBeNull();
      const a = Number(match![1]);
      const b = Number(match![2]);
      const c = Number(match![3]);
      expect(a + b).toBe(Number(plan.answer) + c);
      expect([a, b, c]).toContain(plan.catchTarget);
      expect(plan.catchTarget).not.toBe(plan.answer);
    }
  });
});

describe("planTiMerMindre", () => {
  it("asks ten more or ten less inside maxN", () => {
    const rng = createRng(21);
    for (let i = 0; i < 30; i += 1) {
      const plan = planTiMerMindre(20, rng);
      expect(plan.mode).toBe("ti-mer-mindre");
      const n = plan.catchTarget;
      expect(n).toBeGreaterThanOrEqual(1);
      expect(n).toBeLessThanOrEqual(20);
      expect([n + 10, n - 10]).toContain(plan.answer);
      if (plan.answer === n - 10) expect(n).toBeGreaterThanOrEqual(11);
      if (plan.answer === n + 10) expect(n + 10).toBeLessThanOrEqual(20);
    }
  });
});

describe("planHoppetelling", () => {
  it("continues a skip-count sequence inside maxN", () => {
    const rng = createRng(4);
    for (let i = 0; i < 30; i += 1) {
      const plan = planHoppetelling(20, rng);
      expect(plan.mode).toBe("hoppetelling");
      const parts = plan.expression?.split(",").map((part) => part.trim()) ?? [];
      expect(parts).toHaveLength(4);
      expect(parts[3]).toBe("□");
      const shown = parts.slice(0, 3).map(Number);
      const step = shown[1]! - shown[0]!;
      expect([2, -2, 5, -5]).toContain(step);
      expect(shown[2]! - shown[1]!).toBe(step);
      expect(plan.answer).toBe(shown[2]! + step);
      expect(plan.catchTarget).toBe(plan.answer);
      expect([shown[0], shown[1], shown[2], Number(plan.answer)].every((n) => n >= 1 && n <= 20)).toBe(true);
    }
  });

  it("only hops by two when maxN is 10", () => {
    const rng = createRng(9);
    for (let i = 0; i < 20; i += 1) {
      const plan = planHoppetelling(10, rng);
      const shown = plan.expression!.split(",").slice(0, 3).map((part) => Number(part.trim()));
      expect(Math.abs(shown[1]! - shown[0]!)).toBe(2);
    }
  });
});

describe("planDobbeltHalv", () => {
  it("asks double or half of the caught number", () => {
    const rng = createRng(6);
    for (let i = 0; i < 24; i += 1) {
      const plan = planDobbeltHalv(20, rng);
      expect(plan.mode).toBe("dobbelt-halv");
      const x = plan.catchTarget;
      expect([x * 2, x / 2]).toContain(plan.answer);
      if (plan.answer === x / 2) expect(x % 2).toBe(0);
      expect(Number(plan.answer)).toBeLessThanOrEqual(20);
    }
  });
});

describe("planKlokke", () => {
  it("catches the hour, never 30", () => {
    const rng = createRng(12);
    for (let i = 0; i < 40; i += 1) {
      const plan = planKlokke(10, rng);
      expect(plan.mode).toBe("klokke");
      expect(plan.catchTarget).toBeGreaterThanOrEqual(1);
      expect(plan.catchTarget).toBeLessThanOrEqual(10);
      expect(plan.catchTarget).not.toBe(30);
      if (plan.expression?.includes(":30")) expect(plan.answer).toBe(30);
      else expect([plan.catchTarget, plan.catchTarget === 12 ? 1 : plan.catchTarget + 1]).toContain(plan.answer);
    }
  });

  it("uses hours 1-12 when maxN is at least 20", () => {
    const rng = createRng(2);
    const hours = new Set<number>();
    for (let i = 0; i < 80; i += 1) {
      hours.add(planKlokke(20, rng).catchTarget);
    }
    expect(hours.has(11) || hours.has(12)).toBe(true);
  });
});
