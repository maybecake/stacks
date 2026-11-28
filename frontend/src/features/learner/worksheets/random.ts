/** Deterministic PRNG (mulberry32) so a worksheet can be regenerated from its seed. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function next(): number {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Random integer in [min, max], inclusive on both ends. */
export function randomInt(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

/** Seeds are always 6 digits so they are easy to read off a printed sheet and type back in. */
export const SEED_DIGITS = 6;

export function randomSeed(): number {
  return 100000 + Math.floor(Math.random() * 900000);
}

export function formatSeed(seed: number): string {
  return seed.toString().padStart(SEED_DIGITS, "0");
}
