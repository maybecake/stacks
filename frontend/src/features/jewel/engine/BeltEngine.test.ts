import { describe, expect, it } from 'vitest';
import type { ColorId } from '../config/constants';
import { BoardEngine } from './BoardEngine';
import { BeltEngine } from './BeltEngine';
import { mulberry32 } from './rng';

describe('BeltEngine insertion', () => {
  it('stacks a jewel onto an existing matching, non-full stack', () => {
    const belt = new BeltEngine(12, 8, 8000);
    const rng = mulberry32(1);

    expect(belt.insertGroup(['red'], rng)).toBe(true);
    expect(belt.insertGroup(['red'], rng)).toBe(true);

    const redSlots = belt.slots.filter((s) => s?.color === 'red');
    expect(redSlots).toHaveLength(1);
    expect(redSlots[0]?.count).toBe(2);
  });

  it('starts a new stack in a free slot when the color has no non-full stack', () => {
    const belt = new BeltEngine(12, 8, 8000);
    const rng = mulberry32(1);

    belt.insertGroup(['red'], rng);
    belt.insertGroup(['blue'], rng);

    expect(belt.occupiedCount()).toBe(2);
    const colors = belt.slots.filter((s) => s !== null).map((s) => s?.color);
    expect(colors).toEqual(expect.arrayContaining(['red', 'blue']));
  });

  it('fails to insert when every matching stack is full and no slot is free', () => {
    const belt = new BeltEngine(1, 2, 8000); // one slot, cap 2
    const rng = mulberry32(1);

    expect(belt.insertGroup(['red'], rng)).toBe(true);
    expect(belt.insertGroup(['red'], rng)).toBe(true); // fills the only stack to cap
    expect(belt.insertGroup(['blue'], rng)).toBe(false); // no free slot for a new color

    expect(belt.slots[0]).toEqual({ color: 'red', count: 2 });
  });

  it('rejects the whole group atomically if any jewel in it cannot be inserted', () => {
    const belt = new BeltEngine(1, 8, 8000); // one slot
    const rng = mulberry32(1);

    // group has two different colors but only one slot exists — the second insert must fail,
    // and the whole group must be rejected, leaving the belt completely untouched
    const accepted = belt.insertGroup(['red', 'blue'], rng);

    expect(accepted).toBe(false);
    expect(belt.occupiedCount()).toBe(0);
  });

  it('canAcceptGroup checks capacity without mutating real state', () => {
    const belt = new BeltEngine(1, 8, 8000);
    const rng = mulberry32(1);

    expect(belt.canAcceptGroup(['red', 'blue'], rng)).toBe(false);
    expect(belt.occupiedCount()).toBe(0); // unchanged by the pure check

    expect(belt.canAcceptGroup(['red', 'red'], rng)).toBe(true);
    expect(belt.occupiedCount()).toBe(0); // still unchanged
  });
});

describe('BeltEngine stuck-state detection (hasAnyLegalPick)', () => {
  const target: ColorId[][] = [
    ['red', 'blue'],
    ['blue', 'red'],
  ];

  it('is not stuck when no non-empty, non-locked cells remain', () => {
    const belt = new BeltEngine(1, 1, 8000);
    const jewels: (ColorId | null)[][] = [
      ['red', 'blue'],
      ['blue', 'red'],
    ]; // fully solved, nothing pickable
    const board = new BoardEngine(target, jewels);

    expect(belt.hasAnyLegalPick(board, 'plus', mulberry32(1))).toBe(true);
  });

  it('has a legal pick when belt capacity allows at least one candidate', () => {
    const belt = new BeltEngine(12, 8, 8000);
    const jewels: (ColorId | null)[][] = [
      ['blue', 'red'],
      ['red', 'blue'],
    ]; // nothing locked, plenty of belt room
    const board = new BoardEngine(target, jewels);

    expect(belt.hasAnyLegalPick(board, 'plus', mulberry32(1))).toBe(true);
  });

  it('reports stuck when every candidate pick would be rejected by the belt', () => {
    const belt = new BeltEngine(1, 1, 8000); // one slot, cap 1 — essentially no room
    belt.insertGroup(['green'], mulberry32(1)); // occupy the only slot with an unrelated color
    const jewels: (ColorId | null)[][] = [
      ['blue', 'red'],
      ['red', 'blue'],
    ]; // two pickable cells, but belt has zero room left
    const board = new BoardEngine(target, jewels);

    expect(belt.hasAnyLegalPick(board, 'plus', mulberry32(1))).toBe(false);
  });
});

describe('BeltEngine rotation and ejection', () => {
  it('only reports a crossing once a slot rotates past the eject-point angle', () => {
    const belt = new BeltEngine(4, 8, 360); // 1 degree per ms, eject point at 90deg, slot 1 base angle = 90deg
    const rng = mulberry32(1);
    belt.insertGroup(['red'], rng); // lands in a random free slot among 0..3

    // Force slot index 1 (base angle 90) to currently sit just before the eject point
    belt.slots = [null, { color: 'blue', count: 1 }, null, null];
    belt.ringRotationDeg = 350; // slot1 angle = (90 + 350) % 360 = 80

    const crossed = belt.tick(15); // delta = 15deg -> slot1 angle moves 80 -> 95, crossing 90
    expect(crossed).toContain(1);
  });

  it('does not report a crossing when the slot has not reached the eject point yet', () => {
    const belt = new BeltEngine(4, 8, 360);
    belt.slots = [null, { color: 'blue', count: 1 }, null, null];
    belt.ringRotationDeg = 0; // slot1 angle = 90 exactly at start (not yet "crossed" by motion)

    const crossed = belt.tick(5); // moves 90 -> 95, started exactly at the point, no fresh crossing
    expect(crossed).not.toContain(1);
  });

  it('ejects a jewel into a matching empty cell and shrinks the stack', () => {
    const target: ColorId[][] = [['red', 'blue']];
    const jewels: (ColorId | null)[][] = [[null, 'blue']];
    const board = new BoardEngine(target, jewels);

    const belt = new BeltEngine(4, 8, 360);
    belt.slots = [{ color: 'red', count: 2 }, null, null, null];

    const ejected = belt.resolveEject(0, board, mulberry32(1));

    expect(ejected).toBe(true);
    expect(board.jewels[0][0]).toBe('red');
    expect(board.isLocked(0, 0)).toBe(true);
    expect(belt.slots[0]).toEqual({ color: 'red', count: 1 });
  });

  it('frees the slot entirely when the last jewel in a stack ejects', () => {
    const target: ColorId[][] = [['red', 'blue']];
    const jewels: (ColorId | null)[][] = [[null, 'blue']];
    const board = new BoardEngine(target, jewels);

    const belt = new BeltEngine(4, 8, 360);
    belt.slots = [{ color: 'red', count: 1 }, null, null, null];

    belt.resolveEject(0, board, mulberry32(1));

    expect(belt.slots[0]).toBeNull();
  });

  it('places every eligible jewel from the stack in one eject, not just one', () => {
    const target: ColorId[][] = [['red', 'red', 'red']];
    const jewels: (ColorId | null)[][] = [[null, null, null]]; // three matching empty cells
    const board = new BoardEngine(target, jewels);

    const belt = new BeltEngine(4, 8, 360);
    belt.slots = [{ color: 'red', count: 2 }, null, null, null]; // only 2 jewels in the stack

    const ejected = belt.resolveEject(0, board, mulberry32(1));

    expect(ejected).toBe(true);
    const placedCount = board.jewels[0].filter((c) => c === 'red').length;
    expect(placedCount).toBe(2); // both jewels placed, capped by stack size not cell count
    expect(belt.slots[0]).toBeNull(); // stack fully emptied and freed
  });

  it('places jewels until it runs out of matching empty cells, keeping the remainder on the belt', () => {
    const target: ColorId[][] = [['red', 'blue', 'blue']];
    const jewels: (ColorId | null)[][] = [[null, 'blue', null]]; // only cell 0 is an empty red-target cell
    const board = new BoardEngine(target, jewels);

    const belt = new BeltEngine(4, 8, 360);
    belt.slots = [{ color: 'red', count: 3 }, null, null, null];

    const ejected = belt.resolveEject(0, board, mulberry32(1));

    expect(ejected).toBe(true);
    const placedCount = board.jewels[0].filter((c) => c === 'red').length;
    expect(placedCount).toBe(1); // capped by the single available matching cell
    expect(belt.slots[0]).toEqual({ color: 'red', count: 2 }); // remainder rides on
  });

  it('leaves the stack unchanged when no empty cell matches its color', () => {
    const target: ColorId[][] = [['red', 'blue']];
    const jewels: (ColorId | null)[][] = [['red', 'blue']]; // no empty cells at all
    const board = new BoardEngine(target, jewels);

    const belt = new BeltEngine(4, 8, 360);
    belt.slots = [{ color: 'red', count: 1 }, null, null, null];

    const ejected = belt.resolveEject(0, board, mulberry32(1));

    expect(ejected).toBe(false);
    expect(belt.slots[0]).toEqual({ color: 'red', count: 1 });
  });
});
