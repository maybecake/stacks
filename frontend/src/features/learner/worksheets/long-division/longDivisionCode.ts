import { decodeLayout, encodeLayout, findLayout } from "../gridLayout";
import { formatSeed } from "../random";
import { invertRecord, normalizeCode, type SheetCodec } from "../sheetCode";
import {
  DIVISION_LAYOUTS,
  normalizeRange,
  type Difficulty,
  type DivisionRange,
  type PresetDifficulty,
  type WorkStyle,
} from "./longDivision";

/**
 * Everything needed to regenerate a long division sheet (except its title).
 *
 * Sheet code format: `<difficulty>-<layout><work style><flags>-<seed>`
 *   difficulty  E | M | H, or X<divMin>.<divMax>.<dividendMin>.<dividendMax> for custom
 *   layout      columns then rows, e.g. 34 = 3 columns × 4 rows
 *   work style  G = place-value grid, C = columns, L = lines, B = blank
 *   flags       R = remainders allowed, U = unnumbered problems (both optional)
 *   seed        6 digits
 * e.g. `M-34C-482913`, `X2.12.100.999-23GRU-000042`
 */
export interface LongDivisionSettings {
  difficulty: Difficulty;
  /** Only used when difficulty is "custom". */
  customRange: DivisionRange;
  layoutId: string;
  workStyle: WorkStyle;
  noRemainders: boolean;
  showNumbers: boolean;
  seed: number;
}

const DIFFICULTY_LETTERS: Record<PresetDifficulty, string> = { easy: "E", medium: "M", hard: "H" };
const WORK_STYLE_LETTERS: Record<WorkStyle, string> = {
  "aligned-grid": "G",
  "aligned-columns": "C",
  lines: "L",
  blank: "B",
};

const CODE_PATTERN =
  /^(?:([EMH])|X(\d{1,4})\.(\d{1,4})\.(\d{1,4})\.(\d{1,4}))-(\d)(\d)([GCLB])([RU]*)-(\d{6})$/;

export const DEFAULT_LONG_DIVISION_SETTINGS: LongDivisionSettings = {
  difficulty: "medium",
  customRange: { divisorMin: 2, divisorMax: 9, dividendMin: 100, dividendMax: 999 },
  layoutId: DIVISION_LAYOUTS[0].id,
  workStyle: "aligned-columns",
  noRemainders: true,
  showNumbers: true,
  seed: 0,
};

const LETTER_TO_DIFFICULTY = invertRecord(DIFFICULTY_LETTERS);
const LETTER_TO_WORK_STYLE = invertRecord(WORK_STYLE_LETTERS);

export function encodeLongDivision(settings: LongDivisionSettings): string {
  let difficulty: string;
  if (settings.difficulty === "custom") {
    const r = normalizeRange(settings.customRange);
    difficulty = `X${r.divisorMin}.${r.divisorMax}.${r.dividendMin}.${r.dividendMax}`;
  } else {
    difficulty = DIFFICULTY_LETTERS[settings.difficulty];
  }
  const layout = findLayout(DIVISION_LAYOUTS, settings.layoutId);
  const flags = `${settings.noRemainders ? "" : "R"}${settings.showNumbers ? "" : "U"}`;
  const options = `${encodeLayout(layout)}${WORK_STYLE_LETTERS[settings.workStyle]}${flags}`;
  return `${difficulty}-${options}-${formatSeed(settings.seed)}`;
}

/** Parse a sheet code (case- and whitespace-insensitive); returns null if it isn't valid. */
export function decodeLongDivision(code: string): LongDivisionSettings | null {
  const match = CODE_PATTERN.exec(normalizeCode(code));
  if (!match) return null;
  const [, preset, d1, d2, n1, n2, cols, rows, style, flags, seed] = match;

  const layout = decodeLayout(DIVISION_LAYOUTS, cols, rows);
  if (!layout) return null;

  return {
    difficulty: preset ? LETTER_TO_DIFFICULTY[preset] : "custom",
    customRange: preset
      ? DEFAULT_LONG_DIVISION_SETTINGS.customRange
      : normalizeRange({
          divisorMin: Number(d1),
          divisorMax: Number(d2),
          dividendMin: Number(n1),
          dividendMax: Number(n2),
        }),
    layoutId: layout.id,
    workStyle: LETTER_TO_WORK_STYLE[style],
    noRemainders: !flags.includes("R"),
    showNumbers: !flags.includes("U"),
    seed: Number(seed),
  };
}

export const LONG_DIVISION_CODEC: SheetCodec<LongDivisionSettings> = {
  defaults: DEFAULT_LONG_DIVISION_SETTINGS,
  encode: encodeLongDivision,
  decode: decodeLongDivision,
};
