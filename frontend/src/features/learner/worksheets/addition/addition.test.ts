import { describe, expect, it } from "vitest";
import { mulberry32 } from "../random";
import { additionPairs, generateAdditionProblems } from "./addition";
import {
  DEFAULT_ADDITION_SETTINGS,
  decodeAddition,
  encodeAddition,
  type AdditionSettings,
} from "./additionCode";

describe("additionPairs", () => {
  it("lists every pair of positive addends within the max sum", () => {
    expect(additionPairs(3, false)).toEqual([
      [1, 1],
      [1, 2],
      [2, 1],
    ]);
  });

  it("includes zero addends only when allowed", () => {
    expect(additionPairs(1, true)).toEqual([
      [0, 0],
      [0, 1],
      [1, 0],
    ]);
  });
});

describe("generateAdditionProblems", () => {
  it("keeps every sum within range with no zeros by default", () => {
    for (const maxSum of [5, 10, 20]) {
      const problems = generateAdditionProblems(maxSum, 20, false, mulberry32(maxSum));
      expect(problems).toHaveLength(20);
      for (const p of problems) {
        expect(p.sum).toBe(p.a + p.b);
        expect(p.sum).toBeLessThanOrEqual(maxSum);
        expect(Math.min(p.a, p.b)).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it("doesn't repeat a problem until every pair has been used", () => {
    // "Up to 5" without zeros has exactly 10 pairs.
    const problems = generateAdditionProblems(5, 20, false, mulberry32(3));
    const key = (p: { a: number; b: number }) => `${p.a}+${p.b}`;
    expect(new Set(problems.slice(0, 10).map(key)).size).toBe(10);
    expect(new Set(problems.slice(10).map(key)).size).toBe(10);
  });

  it("is deterministic for a given seed", () => {
    const run = (seed: number) => generateAdditionProblems(20, 10, false, mulberry32(seed));
    expect(run(123456)).toEqual(run(123456));
    expect(run(123456)).not.toEqual(run(654321));
  });
});

describe("addition sheet code", () => {
  const base: AdditionSettings = { ...DEFAULT_ADDITION_SETTINGS, seed: 482913 };

  it("encodes the default settings", () => {
    expect(encodeAddition(base)).toBe("A20-25H-482913");
  });

  it("round-trips options and flags", () => {
    const variants: AdditionSettings[] = [
      base,
      { ...base, maxSum: 5, layoutId: "4x5", format: "vertical", allowZero: true, seed: 7 },
      { ...base, maxSum: 10, layoutId: "2x4", showNumbers: false, seed: 999999 },
    ];
    for (const settings of variants) {
      expect(decodeAddition(encodeAddition(settings))).toEqual(settings);
    }
    expect(encodeAddition(variants[1])).toBe("A5-45VZ-000007");
  });

  it("rejects malformed codes, including codes from other generators", () => {
    for (const code of ["", "A15-25H-482913", "A20-99H-482913", "A20-25X-482913", "M-34C-482913"]) {
      expect(decodeAddition(code)).toBeNull();
    }
  });
});
