import { decodeLayout, encodeLayout, findLayout } from "../gridLayout";
import { formatSeed } from "../random";
import { invertRecord, normalizeCode, type SheetCodec } from "../sheetCode";
import { ADDITION_LAYOUTS, type AdditionFormat, type MaxSum } from "./addition";

/**
 * Everything needed to regenerate an addition sheet (except its title).
 *
 * Sheet code format: `A<max sum>-<layout><format><flags>-<seed>`
 *   max sum  5, 10 or 20
 *   layout   columns then rows, e.g. 25 = 2 columns × 5 rows
 *   format   H = side by side, V = stacked
 *   flags    Z = zeros allowed, U = unnumbered problems, C = counting shapes (all optional)
 *   seed     6 digits
 * e.g. `A20-25H-482913`
 */
export interface AdditionSettings {
  maxSum: MaxSum;
  layoutId: string;
  format: AdditionFormat;
  allowZero: boolean;
  showNumbers: boolean;
  /** Draw shapes beside each number for the learner to count. */
  counting: boolean;
  seed: number;
}

const FORMAT_LETTERS: Record<AdditionFormat, string> = { horizontal: "H", vertical: "V" };
const LETTER_TO_FORMAT = invertRecord(FORMAT_LETTERS);
const CODE_PATTERN = /^A(5|10|20)-(\d)(\d)([HV])([ZUC]*)-(\d{6})$/;

export const DEFAULT_ADDITION_SETTINGS: AdditionSettings = {
  maxSum: 20,
  layoutId: ADDITION_LAYOUTS[0].id,
  format: "horizontal",
  allowZero: false,
  showNumbers: true,
  counting: false,
  seed: 0,
};

export function encodeAddition(settings: AdditionSettings): string {
  const layout = findLayout(ADDITION_LAYOUTS, settings.layoutId);
  const flags = [
    settings.allowZero ? "Z" : "",
    settings.showNumbers ? "" : "U",
    settings.counting ? "C" : "",
  ].join("");
  const options = `${encodeLayout(layout)}${FORMAT_LETTERS[settings.format]}${flags}`;
  return `A${settings.maxSum}-${options}-${formatSeed(settings.seed)}`;
}

/** Parse a sheet code (case- and whitespace-insensitive); returns null if it isn't valid. */
export function decodeAddition(code: string): AdditionSettings | null {
  const match = CODE_PATTERN.exec(normalizeCode(code));
  if (!match) return null;
  const [, maxSum, cols, rows, format, flags, seed] = match;

  const layout = decodeLayout(ADDITION_LAYOUTS, cols, rows);
  if (!layout) return null;

  return {
    maxSum: Number(maxSum) as MaxSum,
    layoutId: layout.id,
    format: LETTER_TO_FORMAT[format],
    allowZero: flags.includes("Z"),
    showNumbers: !flags.includes("U"),
    counting: flags.includes("C"),
    seed: Number(seed),
  };
}

export const ADDITION_CODEC: SheetCodec<AdditionSettings> = {
  defaults: DEFAULT_ADDITION_SETTINGS,
  encode: encodeAddition,
  decode: decodeAddition,
};
