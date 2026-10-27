import { describe, expect, it } from 'vitest';
import type { ColorId } from '../config/constants';
import { BoardEngine } from './BoardEngine';

function makeBoard(target: ColorId[][], jewels: (ColorId | null)[][]): BoardEngine {
  return new BoardEngine(target, jewels);
}

describe('BoardEngine', () => {
  const target: ColorId[][] = [
    ['red', 'red', 'blue'],
    ['red', 'red', 'blue'],
    ['green', 'green', 'blue'],
  ];

  // Every cell's jewel deliberately differs from its target color, so no cell starts locked.
  const noLocksJewels: (ColorId | null)[][] = [
    ['blue', 'blue', 'green'],
    ['blue', 'blue', 'green'],
    ['red', 'red', 'green'],
  ];

  it('locks a cell only when its jewel matches the target color', () => {
    const jewels: (ColorId | null)[][] = [
      ['red', 'blue', 'blue'],
      ['red', 'red', 'blue'],
      ['green', 'green', 'red'],
    ];
    const board = makeBoard(target, jewels);

    expect(board.isLocked(0, 0)).toBe(true); // red === red
    expect(board.isLocked(0, 1)).toBe(false); // blue !== red
    expect(board.isLocked(2, 2)).toBe(false); // red !== blue
  });

  it('computes a plus-shaped pick group at an interior cell', () => {
    const board = makeBoard(target, noLocksJewels);

    const group = board.computePickGroup(1, 1, 'plus');
    expect(group).toHaveLength(5); // center + 4 orthogonal neighbors
    expect(group).toEqual(
      expect.arrayContaining([
        [1, 1],
        [0, 1],
        [2, 1],
        [1, 0],
        [1, 2],
      ]),
    );
  });

  it('clips the pick group at board edges/corners instead of substituting', () => {
    const board = makeBoard(target, noLocksJewels);

    const group = board.computePickGroup(0, 0, 'plus');
    // corner cell: only 2 valid in-bounds orthogonal neighbors + itself
    expect(group).toHaveLength(3);
    expect(group).toEqual(
      expect.arrayContaining([
        [0, 0],
        [1, 0],
        [0, 1],
      ]),
    );
  });

  it('excludes locked and empty neighbors from the pick group', () => {
    const jewels: (ColorId | null)[][] = [
      ['blue', 'red', 'red'], // (0,1) locked: jewel red === target red
      ['blue', 'blue', null], // (1,2) empty
      ['red', 'red', 'blue'], // (2,1) jewel red !== target green, pickable
    ];
    const board = makeBoard(target, jewels);

    const group = board.computePickGroup(1, 1, 'plus');
    expect(group).toEqual(
      expect.arrayContaining([
        [1, 1],
        [2, 1],
        [1, 0],
      ]),
    );
    expect(group).not.toContainEqual([0, 1]); // locked
    expect(group).not.toContainEqual([1, 2]); // empty
    expect(group).toHaveLength(3);
  });

  it('returns an empty group when clicking an empty or locked cell', () => {
    const jewels: (ColorId | null)[][] = [
      ['red', null, 'blue'],
      ['red', 'red', 'blue'],
      ['green', 'green', 'blue'],
    ];
    const board = makeBoard(target, jewels);

    expect(board.computePickGroup(0, 1, 'plus')).toEqual([]); // empty
    expect(board.computePickGroup(0, 0, 'plus')).toEqual([]); // locked (red === red)
  });

  it('computes a block3x3 pick group including diagonal neighbors', () => {
    const board = makeBoard(target, noLocksJewels);

    const group = board.computePickGroup(1, 1, 'block3x3');
    expect(group).toHaveLength(9); // center + all 8 neighbors
  });

  it('flood-fills same-colored pickable cells breadth-first, uncapped', () => {
    // A connected plus-shaped blob of 'yellow', a color absent from `target` so none of it can
    // accidentally lock (the point of this fixture is purely connectivity, not lock edge cases).
    const jewels: (ColorId | null)[][] = [
      ['green', 'yellow', 'green'],
      ['yellow', 'yellow', 'yellow'],
      ['green', 'yellow', 'green'],
    ];
    const board = makeBoard(target, jewels);

    const group = board.computePickGroup(1, 1, 'flood', 100);
    expect(group).toHaveLength(5); // the whole yellow plus-shaped blob
    expect(group).toEqual(
      expect.arrayContaining([
        [1, 1],
        [0, 1],
        [2, 1],
        [1, 0],
        [1, 2],
      ]),
    );
  });

  it('caps a flood pick at the configured limit', () => {
    const allBlue: (ColorId | null)[][] = [
      ['blue', 'blue', 'blue'],
      ['blue', 'blue', 'blue'],
      ['blue', 'blue', 'blue'],
    ];
    const board = makeBoard(target, allBlue);

    const group = board.computePickGroup(1, 1, 'flood', 4);
    expect(group).toHaveLength(4);
    expect(group[0]).toEqual([1, 1]); // always includes the clicked cell
  });

  it('flood pick does not cross into a different color or a locked/empty cell', () => {
    const jewels: (ColorId | null)[][] = [
      ['blue', 'blue', 'green'],
      ['blue', 'red', 'green'], // (1,1) locked: red === target red
      [null, 'blue', 'blue'], // (2,0) empty, (2,2) locked: blue === target blue
    ];
    const board = makeBoard(target, jewels);

    const group = board.computePickGroup(0, 0, 'flood', 10);
    expect(group).toEqual(
      expect.arrayContaining([
        [0, 0],
        [0, 1],
        [1, 0],
      ]),
    );
    expect(group).toHaveLength(3);
    expect(group).not.toContainEqual([1, 1]); // locked, blocks the flood
    expect(group).not.toContainEqual([2, 0]); // empty, blocks the flood
    expect(group).not.toContainEqual([0, 2]); // different color (green)
  });

  it('reports solved only when every cell is locked', () => {
    const allLocked: (ColorId | null)[][] = target.map((row) => [...row]);
    const board = makeBoard(target, allLocked);
    expect(board.isSolved()).toBe(true);

    board.jewels[0][0] = 'blue';
    expect(board.isSolved()).toBe(false);
  });

  it('finds empty cells matching a given color for eject targeting', () => {
    const jewels: (ColorId | null)[][] = [
      [null, 'blue', 'blue'],
      ['blue', 'blue', 'green'],
      ['green', null, 'green'],
    ];
    const board = makeBoard(target, jewels);

    expect(board.emptyCellsMatching('red')).toEqual([[0, 0]]);
    expect(board.emptyCellsMatching('green')).toEqual([[2, 1]]);
    expect(board.emptyCellsMatching('blue')).toEqual([]);
  });
});
