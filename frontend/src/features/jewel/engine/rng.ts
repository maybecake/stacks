/** Deterministic PRNG (mulberry32) — same seed always produces the same sequence. */
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

/** Production entry point: seeds from Date.now() unless an explicit seed is given (e.g. in tests). */
export function createRng(seed?: number): () => number {
  return mulberry32(seed ?? Date.now());
}
