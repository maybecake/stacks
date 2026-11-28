import { describe, expect, it } from "vitest";
import { mulberry32 } from "../random";
import { DIFFICULTY_PRESETS, generateProblems, normalizeRange } from "./longDivision";

describe("normalizeRange", () => {
  it("swaps inverted pairs and clamps to limits", () => {
    expect(
      normalizeRange({ divisorMin: 150, divisorMax: 0, dividendMin: 20000, dividendMax: 50 }),
    ).toEqual({ divisorMin: 2, divisorMax: 99, dividendMin: 50, dividendMax: 9999 });
  });
});

describe("generateProblems", () => {
  it("produces the requested count with consistent quotient/remainder", () => {
    const problems = generateProblems(DIFFICULTY_PRESETS.medium.range, 12, false, mulberry32(7));
    expect(problems).toHaveLength(12);
    for (const p of problems) {
      expect(p.divisor * p.quotient + p.remainder).toBe(p.dividend);
      expect(p.remainder).toBeLessThan(p.divisor);
    }
  });

  it("respects ranges and exactness for every preset", () => {
    for (const { range } of Object.values(DIFFICULTY_PRESETS)) {
      const problems = generateProblems(range, 200, true, mulberry32(42));
      for (const p of problems) {
        expect(p.remainder).toBe(0);
        expect(p.divisor).toBeGreaterThanOrEqual(range.divisorMin);
        expect(p.divisor).toBeLessThanOrEqual(range.divisorMax);
        expect(p.dividend).toBeGreaterThanOrEqual(range.dividendMin);
        expect(p.dividend).toBeLessThanOrEqual(range.dividendMax);
      }
    }
  });

  it("only uses divisors that can divide the dividend range exactly", () => {
    // 60 can't divide anything in 100..110 exactly, but 11 (110) and 50 (100) can.
    const range = { divisorMin: 11, divisorMax: 60, dividendMin: 100, dividendMax: 110 };
    for (const p of generateProblems(range, 100, true, mulberry32(3))) {
      expect(p.remainder).toBe(0);
      expect(p.dividend).toBeGreaterThanOrEqual(100);
      expect(p.dividend).toBeLessThanOrEqual(110);
    }
  });

  it("falls back to remainders when no exact problem fits the range", () => {
    const range = { divisorMin: 50, divisorMax: 60, dividendMin: 61, dividendMax: 99 };
    const problems = generateProblems(range, 20, true, mulberry32(5));
    expect(problems).toHaveLength(20);
    for (const p of problems) expect(p.dividend).toBeGreaterThanOrEqual(61);
  });

  it("is deterministic for a given seed", () => {
    const a = generateProblems(DIFFICULTY_PRESETS.hard.range, 9, true, mulberry32(99));
    const b = generateProblems(DIFFICULTY_PRESETS.hard.range, 9, true, mulberry32(99));
    expect(a).toEqual(b);
  });
});
