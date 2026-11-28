import { describe, expect, it } from "vitest";
import {
  DEFAULT_LONG_DIVISION_SETTINGS,
  decodeLongDivision,
  encodeLongDivision,
  type LongDivisionSettings,
} from "./longDivisionCode";

const base: LongDivisionSettings = { ...DEFAULT_LONG_DIVISION_SETTINGS, seed: 482913 };

describe("long division sheet code", () => {
  it("encodes the default settings compactly", () => {
    expect(encodeLongDivision(base)).toBe("M-34C-482913");
  });

  it("encodes custom ranges, flags, and zero-padded seeds", () => {
    const code = encodeLongDivision({
      ...base,
      difficulty: "custom",
      customRange: { divisorMin: 12, divisorMax: 2, dividendMin: 100, dividendMax: 999 },
      layoutId: "2x3",
      workStyle: "aligned-grid",
      noRemainders: false,
      showNumbers: false,
      seed: 42,
    });
    expect(code).toBe("X2.12.100.999-23GRU-000042");
  });

  it("round-trips every combination of options", () => {
    const variants: LongDivisionSettings[] = [
      base,
      { ...base, difficulty: "easy", layoutId: "3x3", workStyle: "blank" },
      { ...base, difficulty: "hard", layoutId: "2x4", workStyle: "lines", noRemainders: false },
      {
        ...base,
        difficulty: "custom",
        customRange: { divisorMin: 3, divisorMax: 40, dividendMin: 50, dividendMax: 9999 },
        showNumbers: false,
        seed: 999999,
      },
    ];
    for (const settings of variants) {
      expect(decodeLongDivision(encodeLongDivision(settings))).toEqual(settings);
    }
  });

  it("accepts lowercase and surrounding whitespace", () => {
    expect(decodeLongDivision("  m-34c-482913 ")).toEqual(base);
  });

  it("rejects malformed codes", () => {
    for (const code of [
      "",
      "M-34C",
      "M-34C-48291",
      "M-34C-4829130",
      "Q-34C-482913",
      "M-99C-482913",
      "M-34Z-482913",
      "X2.9.100-34C-482913",
    ]) {
      expect(decodeLongDivision(code)).toBeNull();
    }
  });
});
