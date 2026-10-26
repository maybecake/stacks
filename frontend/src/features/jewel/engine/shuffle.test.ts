import { describe, expect, it } from 'vitest';
import type { ColorId } from '../config/constants';
import { mulberry32 } from './rng';
import { shuffleBoard } from './shuffle';

function countColors(grid: ColorId[][]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const row of grid) {
    for (const color of row) {
      counts[color] = (counts[color] ?? 0) + 1;
    }
  }
  return counts;
}

function buildTargetGrid(size: number, palette: ColorId[]): ColorId[][] {
  return Array.from({ length: size }, (_, r) =>
    Array.from({ length: size }, (_, c) => palette[(r * size + c) % palette.length]),
  );
}

describe('shuffleBoard', () => {
  const palette: ColorId[] = ['red', 'blue', 'green', 'yellow', 'purple'];
  const target = buildTargetGrid(8, palette);
  const config = { regionCount: 40, minRegionSize: 2, maxRegionSize: 5 };

  it('always produces a color-count-preserving permutation of the target grid', () => {
    const rng = mulberry32(1);
    const shuffled = shuffleBoard(target, config, rng);

    expect(shuffled.length).toBe(target.length);
    expect(shuffled[0].length).toBe(target[0].length);
    expect(countColors(shuffled)).toEqual(countColors(target));
  });

  it('is deterministic for a fixed seed', () => {
    const shuffledA = shuffleBoard(target, config, mulberry32(42));
    const shuffledB = shuffleBoard(target, config, mulberry32(42));
    expect(shuffledA).toEqual(shuffledB);
  });

  it('different seeds produce different arrangements', () => {
    const shuffledA = shuffleBoard(target, config, mulberry32(1));
    const shuffledB = shuffleBoard(target, config, mulberry32(2));
    expect(shuffledA).not.toEqual(shuffledB);
  });

  it('actually moves jewels away from their target positions (chunky, not a no-op)', () => {
    const shuffled = shuffleBoard(target, config, mulberry32(7));
    let misplaced = 0;
    for (let r = 0; r < target.length; r++) {
      for (let c = 0; c < target[0].length; c++) {
        if (shuffled[r][c] !== target[r][c]) misplaced++;
      }
    }
    expect(misplaced).toBeGreaterThan(0);
  });

  it('handles a trivial 1x1 grid without crashing', () => {
    const tiny = buildTargetGrid(1, palette);
    const shuffled = shuffleBoard(tiny, config, mulberry32(1));
    expect(countColors(shuffled)).toEqual(countColors(tiny));
  });
});
