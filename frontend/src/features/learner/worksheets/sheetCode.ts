/**
 * Shared pieces for sheet codes: short, printable strings that capture every setting
 * (plus the seed) needed to regenerate a worksheet exactly.
 */

/** Converts a generator's settings (including its seed) to and from a sheet code. */
export interface SheetCodec<S extends { seed: number }> {
  defaults: S;
  encode: (settings: S) => string;
  decode: (code: string) => S | null;
}

/** Flip a value → letter map into letter → value, for decoding single-letter options. */
export function invertRecord<K extends string | number>(
  record: Record<K, string>,
): Record<string, K> {
  return Object.fromEntries(
    (Object.keys(record) as K[]).map((key) => [record[key], key]),
  ) as Record<string, K>;
}

/** Normalize user input before matching it against a code pattern. */
export function normalizeCode(code: string): string {
  return code.trim().toUpperCase();
}
