import type { ColorId } from '../config/constants';

export interface ShuffleConfig {
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
 * Tiles the whole board into contiguous flood-fill chunks, grown and claimed two at a time so
 * every cell ends up in exactly one region and paired with exactly one swap partner. A region
 * grown last with no space left for a partner is returned unpaired (left for the repair pass).
 */
function buildRegionPairs(
  rows: number,
  cols: number,
  config: ShuffleConfig,
  rng: () => number,
): Array<[Cell[], Cell[]]> {
  const claimed: boolean[][] = Array.from({ length: rows }, () => new Array<boolean>(cols).fill(false));
  const pairs: Array<[Cell[], Cell[]]> = [];
  const sizeSpan = Math.max(0, config.maxRegionSize - config.minRegionSize);

  const pickUnclaimed = (): Cell | null => {
    const candidates: Cell[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!claimed[r][c]) candidates.push([r, c]);
      }
    }
    return candidates.length > 0 ? candidates[randInt(rng, candidates.length)] : null;
  };

  for (;;) {
    const startA = pickUnclaimed();
    if (!startA) break;

    const desiredSize = config.minRegionSize + randInt(rng, sizeSpan + 1);
    const regionA = growRegion(rows, cols, claimed, startA, desiredSize, rng);
    for (const [r, c] of regionA) claimed[r][c] = true;

    const startB = pickUnclaimed();
    if (!startB) break; // regionA has no partner left; repair pass covers any self-matches in it

    const regionB = growRegion(rows, cols, claimed, startB, regionA.length, rng);
    for (const [r, c] of regionB) claimed[r][c] = true;

    pairs.push([regionA, regionB]);
  }

  return pairs;
}

/** Swaps two regions' jewel values cell-for-cell, in a randomized pairing order. */
function swapRegions(jewels: ColorId[][], regionA: Cell[], regionB: Cell[], rng: () => number): void {
  const n = Math.min(regionA.length, regionB.length);
  if (n === 0) return;

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

/**
 * Guarantees no cell is left showing its own target color, by swapping any such cell with
 * another cell elsewhere on the board whose colors can be exchanged without creating a new
 * self-match on either side. Gives up (leaving a best-effort result) only for a cell with no
 * safe partner anywhere — e.g. an unsolvable 1x1 or single-color board.
 */
function repairSelfMatches(target: ColorId[][], jewels: ColorId[][], rng: () => number): void {
  const rows = target.length;
  const cols = target[0]?.length ?? 0;
  const allCells: Cell[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) allCells.push([r, c]);
  }

  const unfixable = new Set<string>();

  for (;;) {
    const selfMatched = allCells.filter(
      ([r, c]) => jewels[r][c] === target[r][c] && !unfixable.has(`${r},${c}`),
    );
    if (selfMatched.length === 0) break;

    const [ar, ac] = selfMatched[0];
    const aColor = jewels[ar][ac];
    const order = shuffledIndices(allCells.length, rng);
    let fixed = false;

    for (const idx of order) {
      const [br, bc] = allCells[idx];
      if (br === ar && bc === ac) continue;
      const bColor = jewels[br][bc];
      if (bColor === aColor) continue; // no-op swap
      if (aColor === target[br][bc]) continue; // would create a new self-match at B

      jewels[ar][ac] = bColor;
      jewels[br][bc] = aColor;
      fixed = true;
      break;
    }

    if (!fixed) unfixable.add(`${ar},${ac}`);
  }
}

/**
 * Permutes `targetColors` into a chunk-shuffled starting arrangement: tiles the board into
 * contiguous flood-fill regions, swaps each region pairwise with another region of matching
 * size, then repairs any cell left showing its own target color. Always a pure permutation of
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
  if (rows * cols < 2) return jewels;

  const pairs = buildRegionPairs(rows, cols, config, rng);
  for (const [regionA, regionB] of pairs) {
    swapRegions(jewels, regionA, regionB, rng);
  }

  repairSelfMatches(targetColors, jewels, rng);

  return jewels;
}
