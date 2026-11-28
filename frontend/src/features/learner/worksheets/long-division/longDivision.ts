import { randomInt } from "../random";

export type Difficulty = "easy" | "medium" | "hard" | "custom";
export type PresetDifficulty = Exclude<Difficulty, "custom">;
export type WorkStyle = "aligned-grid" | "aligned-columns" | "lines" | "blank";

export interface DivisionRange {
  divisorMin: number;
  divisorMax: number;
  dividendMin: number;
  dividendMax: number;
}

export interface DivisionProblem {
  id: number;
  divisor: number;
  dividend: number;
  quotient: number;
  remainder: number;
}

export interface GridLayout {
  id: string;
  cols: number;
  rows: number;
  label: string;
}

export const DIFFICULTY_PRESETS: Record<
  PresetDifficulty,
  { label: string; description: string; range: DivisionRange }
> = {
  easy: {
    label: "Easy",
    description: "1-digit ÷ 2-digit",
    range: { divisorMin: 2, divisorMax: 9, dividendMin: 12, dividendMax: 99 },
  },
  medium: {
    label: "Medium",
    description: "1-digit ÷ 3-digit",
    range: { divisorMin: 2, divisorMax: 9, dividendMin: 100, dividendMax: 999 },
  },
  hard: {
    label: "Hard",
    description: "2-digit ÷ 3-digit",
    range: { divisorMin: 11, divisorMax: 25, dividendMin: 100, dividendMax: 999 },
  },
};

export const GRID_LAYOUTS: GridLayout[] = [
  { id: "3x4", cols: 3, rows: 4, label: "3 columns × 4 rows (12 problems)" },
  { id: "2x3", cols: 2, rows: 3, label: "2 columns × 3 rows (6 problems, extra space)" },
  { id: "2x4", cols: 2, rows: 4, label: "2 columns × 4 rows (8 problems)" },
  { id: "3x3", cols: 3, rows: 3, label: "3 columns × 3 rows (9 problems)" },
];

export const WORK_STYLES: { id: WorkStyle; label: string }[] = [
  { id: "aligned-grid", label: "Place-value grid (columns + rows)" },
  { id: "aligned-columns", label: "Place-value columns only" },
  { id: "lines", label: "Horizontal writing lines" },
  { id: "blank", label: "Blank area" },
];

export const DIVISOR_LIMITS = { min: 2, max: 99 };
export const DIVIDEND_LIMITS = { min: 1, max: 9999 };

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Clamp user-entered ranges to sane limits and swap any inverted min/max pairs. */
export function normalizeRange(range: DivisionRange): DivisionRange {
  const d1 = clamp(Math.round(range.divisorMin), DIVISOR_LIMITS.min, DIVISOR_LIMITS.max);
  const d2 = clamp(Math.round(range.divisorMax), DIVISOR_LIMITS.min, DIVISOR_LIMITS.max);
  const n1 = clamp(Math.round(range.dividendMin), DIVIDEND_LIMITS.min, DIVIDEND_LIMITS.max);
  const n2 = clamp(Math.round(range.dividendMax), DIVIDEND_LIMITS.min, DIVIDEND_LIMITS.max);
  return {
    divisorMin: Math.min(d1, d2),
    divisorMax: Math.max(d1, d2),
    dividendMin: Math.min(n1, n2),
    dividendMax: Math.max(n1, n2),
  };
}

/** Quotient bounds that keep divisor × quotient inside the dividend range, or null if none exist. */
function exactQuotientBounds(divisor: number, range: DivisionRange): [number, number] | null {
  const minQ = Math.max(1, Math.ceil(range.dividendMin / divisor));
  const maxQ = Math.floor(range.dividendMax / divisor);
  return maxQ >= minQ ? [minQ, maxQ] : null;
}

function makeProblem(id: number, divisor: number, dividend: number): DivisionProblem {
  return {
    id,
    divisor,
    dividend,
    quotient: Math.floor(dividend / divisor),
    remainder: dividend % divisor,
  };
}

export function generateProblems(
  rawRange: DivisionRange,
  count: number,
  noRemainders: boolean,
  rng: () => number,
): DivisionProblem[] {
  const range = normalizeRange(rawRange);
  const divisors: number[] = [];
  for (let d = range.divisorMin; d <= range.divisorMax; d++) divisors.push(d);

  // Divisors that can divide some dividend in range exactly. If none can, fall back to remainders.
  const exactDivisors = noRemainders
    ? divisors.filter((d) => exactQuotientBounds(d, range) !== null)
    : [];
  const useExact = noRemainders && exactDivisors.length > 0;

  const problems: DivisionProblem[] = [];
  for (let i = 0; i < count; i++) {
    if (useExact) {
      const divisor = exactDivisors[randomInt(rng, 0, exactDivisors.length - 1)];
      const [minQ, maxQ] = exactQuotientBounds(divisor, range)!;
      problems.push(makeProblem(i + 1, divisor, divisor * randomInt(rng, minQ, maxQ)));
    } else {
      const divisor = randomInt(rng, range.divisorMin, range.divisorMax);
      // Keep the dividend at least as large as the divisor when the range allows it.
      const low = Math.min(Math.max(range.dividendMin, divisor), range.dividendMax);
      problems.push(makeProblem(i + 1, divisor, randomInt(rng, low, range.dividendMax)));
    }
  }
  return problems;
}
