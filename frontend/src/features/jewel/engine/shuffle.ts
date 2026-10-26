import type { ColorId } from '../config/constants';

export interface ShuffleConfig {
  regionCount: number;
  minRegionSize: number;
  maxRegionSize: number;
}

export type Cell = [number, number];

function randInt(rng: () => number, maxExclusive: number): number {
  return Math.floor(rng() * maxExclusive);
}

function cloneGrid<T>(grid: T[][]): T[][] {
  return grid.map((row) => [...row]);
}

function shuffledIndices(n: number, rng: () => number): number[] {
  const arr = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = randInt(rng, i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Flood-fill grows a contiguous region of up to targetSize cells (4-directional), starting from one seed cell. */
function growRegion(
  rows: number,
  cols: number,
  claimed: boolean[][],
  start: Cell,
  targetSize: number,
  rng: () => number,
): Cell[] {
  const [startR, startC] = start;
  const region: Cell[] = [[startR, startC]];
  const regionSet = new Set<string>([`${startR},${startC}`]);
  const frontier: Cell[] = [[startR, startC]];

  while (region.length < targetSize && frontier.length > 0) {
    const idx = randInt(rng, frontier.length);
    const [r, c] = frontier[idx];
    const neighbors: Cell[] = (
      [
        [r - 1, c],
        [r + 1, c],
        [r, c - 1],
        [r, c + 1],
      ] as Cell[]
    ).filter(
      ([nr, nc]) =>
        nr >= 0 && nr < rows && nc >= 0 && nc < cols && !claimed[nr][nc] && !regionSet.has(`${nr},${nc}`),
    );

    if (neighbors.length === 0) {
      frontier.splice(idx, 1);
      continue;
    }

    const [nr, nc] = neighbors[randInt(rng, neighbors.length)];
    region.push([nr, nc]);
    regionSet.add(`${nr},${nc}`);
    frontier.push([nr, nc]);
  }

  return region;
}

/**
 * Permutes `targetColors` into a chunk-shuffled starting arrangement: repeatedly grows two
 * same-size contiguous regions and swaps their contents pairwise. Always a pure permutation of
 * the input, so the result is guaranteed solvable and color counts are always preserved.
 */
export function shuffleBoard(
  targetColors: ColorId[][],
  config: ShuffleConfig,
  rng: () => number,
): ColorId[][] {
  const rows = targetColors.length;
  const cols = targetColors[0]?.length ?? 0;
  const jewels = cloneGrid(targetColors);
  const totalCells = rows * cols;
  if (totalCells < 2) return jewels;

  for (let i = 0; i < config.regionCount; i++) {
    const claimed: boolean[][] = Array.from({ length: rows }, () => new Array<boolean>(cols).fill(false));

    const sizeSpan = Math.max(0, config.maxRegionSize - config.minRegionSize);
    const desiredSize = Math.max(1, Math.min(config.minRegionSize + randInt(rng, sizeSpan + 1), totalCells));

    const startA: Cell = [randInt(rng, rows), randInt(rng, cols)];
    const regionA = growRegion(rows, cols, claimed, startA, desiredSize, rng);
    for (const [r, c] of regionA) claimed[r][c] = true;

    const available: Cell[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!claimed[r][c]) available.push([r, c]);
      }
    }
    if (available.length === 0) continue;

    const startB = available[randInt(rng, available.length)];
    const regionB = growRegion(rows, cols, claimed, startB, Math.min(regionA.length, available.length), rng);

    const n = Math.min(regionA.length, regionB.length);
    if (n === 0) continue;

    const pairing = shuffledIndices(n, rng);
    const valuesA = regionA.slice(0, n).map(([r, c]) => jewels[r][c]);
    const valuesB = regionB.slice(0, n).map(([r, c]) => jewels[r][c]);

    for (let k = 0; k < n; k++) {
      const [ar, ac] = regionA[k];
      const [br, bc] = regionB[pairing[k]];
      jewels[ar][ac] = valuesB[pairing[k]];
      jewels[br][bc] = valuesA[k];
    }
  }

  return jewels;
}
