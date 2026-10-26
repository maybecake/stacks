import type { ColorId, PickShape } from '../config/constants';

export type Cell = [number, number];

const PLUS_OFFSETS: Cell[] = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

const BLOCK_OFFSETS: Cell[] = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
];

/**
 * Owns the two parallel grids (fixed target colors, current jewels) and the pure rules around
 * them: which cells are locked, what a click at a cell selects, and whether the board is solved.
 * No Excalibur dependency — safe to unit test directly.
 */
export class BoardEngine {
  readonly rows: number;
  readonly cols: number;
  readonly targetColors: ColorId[][];
  jewels: (ColorId | null)[][];

  constructor(targetColors: ColorId[][], initialJewels: (ColorId | null)[][]) {
    this.rows = targetColors.length;
    this.cols = targetColors[0]?.length ?? 0;
    this.targetColors = targetColors;
    this.jewels = initialJewels;
  }

  isInBounds(r: number, c: number): boolean {
    return r >= 0 && r < this.rows && c >= 0 && c < this.cols;
  }

  isEmpty(r: number, c: number): boolean {
    return this.jewels[r][c] === null;
  }

  /** A cell locks the moment its jewel matches its target color — permanent for the level. */
  isLocked(r: number, c: number): boolean {
    const jewel = this.jewels[r][c];
    return jewel !== null && jewel === this.targetColors[r][c];
  }

  isPickable(r: number, c: number): boolean {
    return this.isInBounds(r, c) && !this.isEmpty(r, c) && !this.isLocked(r, c);
  }

  /** Clicked cell + neighbors per pick shape, filtered to in-bounds, non-empty, non-locked cells. */
  computePickGroup(r: number, c: number, pickShape: PickShape): Cell[] {
    if (!this.isPickable(r, c)) return [];

    const offsets = pickShape === 'plus' ? PLUS_OFFSETS : BLOCK_OFFSETS;
    const group: Cell[] = [[r, c]];
    for (const [dr, dc] of offsets) {
      const nr = r + dr;
      const nc = c + dc;
      if (this.isPickable(nr, nc)) group.push([nr, nc]);
    }
    return group;
  }

  colorsOf(cells: Cell[]): ColorId[] {
    return cells.map(([r, c]) => {
      const color = this.jewels[r][c];
      if (color === null) throw new Error(`Cell (${r},${c}) is empty`);
      return color;
    });
  }

  clearCells(cells: Cell[]): void {
    for (const [r, c] of cells) {
      this.jewels[r][c] = null;
    }
  }

  placeJewel(r: number, c: number, color: ColorId): void {
    this.jewels[r][c] = color;
  }

  /** Empty cells whose target color matches — eject destinations for a given belt color. */
  emptyCellsMatching(color: ColorId): Cell[] {
    const result: Cell[] = [];
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.jewels[r][c] === null && this.targetColors[r][c] === color) {
          result.push([r, c]);
        }
      }
    }
    return result;
  }

  /** Non-empty, non-locked cells — candidates for a legal pick. */
  pickableCells(): Cell[] {
    const result: Cell[] = [];
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.isPickable(r, c)) result.push([r, c]);
      }
    }
    return result;
  }

  isSolved(): boolean {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (!this.isLocked(r, c)) return false;
      }
    }
    return true;
  }
}
