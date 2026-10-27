import type { ColorId, PickShape } from '../config/constants';
import { BELT_EJECT_ANGLE_DEG } from '../config/constants';
import type { BoardEngine } from './BoardEngine';

export interface BeltSlot {
  color: ColorId;
  count: number;
}

/** True iff rotating forward by `delta` degrees from `prevAngle` passes over `targetAngle`. */
function crossedAngle(prevAngle: number, delta: number, targetAngle: number): boolean {
  if (delta <= 0) return false;
  const diff = (((targetAngle - prevAngle) % 360) + 360) % 360;
  return diff > 0 && diff <= delta;
}

/**
 * The capped-capacity conveyor ring: up to `maxStacks` slots, each a same-color stack capped at
 * `maxStackSize`. Insertion is not rotation-gated; ejection only happens once a slot's position
 * crosses the fixed eject-point angle. No Excalibur dependency — safe to unit test directly.
 */
export class BeltEngine {
  readonly maxStacks: number;
  readonly maxStackSize: number;
  readonly rotationPeriodMs: number;
  slots: (BeltSlot | null)[];
  ringRotationDeg = 0;

  constructor(maxStacks: number, maxStackSize: number, rotationPeriodMs: number) {
    this.maxStacks = maxStacks;
    this.maxStackSize = maxStackSize;
    this.rotationPeriodMs = rotationPeriodMs;
    this.slots = new Array<BeltSlot | null>(maxStacks).fill(null);
  }

  baseAngleOf(slotIndex: number): number {
    return (360 / this.maxStacks) * slotIndex;
  }

  occupiedCount(): number {
    return this.slots.filter((s) => s !== null).length;
  }

  clone(): BeltEngine {
    const copy = new BeltEngine(this.maxStacks, this.maxStackSize, this.rotationPeriodMs);
    copy.slots = this.slots.map((s) => (s ? { ...s } : null));
    copy.ringRotationDeg = this.ringRotationDeg;
    return copy;
  }

  /** Stacks onto a matching non-full slot, else claims a random free slot, else fails. Mutates `this`. */
  private insertJewel(color: ColorId, rng: () => number): boolean {
    for (const slot of this.slots) {
      if (slot && slot.color === color && slot.count < this.maxStackSize) {
        slot.count++;
        return true;
      }
    }

    const freeIndices: number[] = [];
    for (let i = 0; i < this.slots.length; i++) {
      if (this.slots[i] === null) freeIndices.push(i);
    }
    if (freeIndices.length === 0) return false;

    const chosen = freeIndices[Math.floor(rng() * freeIndices.length)];
    this.slots[chosen] = { color, count: 1 };
    return true;
  }

  /** Pure check: would every color in this list fit, in order, without mutating real state? */
  canAcceptGroup(colors: ColorId[], rng: () => number): boolean {
    const clone = this.clone();
    for (const color of colors) {
      if (!clone.insertJewel(color, rng)) return false;
    }
    return true;
  }

  /**
   * Atomically inserts every color in the group, or none at all. Simulates on a clone first;
   * only commits the clone's state back onto `this` if every insertion succeeded.
   */
  insertGroup(colors: ColorId[], rng: () => number): boolean {
    const clone = this.clone();
    for (const color of colors) {
      if (!clone.insertJewel(color, rng)) return false;
    }
    this.slots = clone.slots;
    return true;
  }

  /**
   * Advances the ring's rotation by elapsed time and returns the slot indices whose position
   * just crossed the fixed eject-point angle (at most one crossing per slot per call).
   */
  tick(elapsedMs: number): number[] {
    const delta = (360 * elapsedMs) / this.rotationPeriodMs;
    const prevRotation = this.ringRotationDeg;
    this.ringRotationDeg = (this.ringRotationDeg + delta) % 360;

    const crossed: number[] = [];
    for (let i = 0; i < this.slots.length; i++) {
      if (!this.slots[i]) continue;
      const prevAngle = (this.baseAngleOf(i) + prevRotation) % 360;
      if (crossedAngle(prevAngle, delta, BELT_EJECT_ANGLE_DEG)) {
        crossed.push(i);
      }
    }
    return crossed;
  }

  /**
   * Resolves one eject attempt for a slot that just crossed the eject point: places as many of
   * the stack's jewels as currently have a matching empty cell (one at a time, re-checking the
   * board after each placement since each one removes a candidate), shrinking/freeing the slot by
   * that amount. No-op (stack rides on, unchanged) if no matching empty cell exists right now.
   */
  resolveEject(slotIndex: number, board: BoardEngine, rng: () => number): boolean {
    const slot = this.slots[slotIndex];
    if (!slot) return false;

    let placedAny = false;
    while (slot.count > 0) {
      const candidates = board.emptyCellsMatching(slot.color);
      if (candidates.length === 0) break;

      const [r, c] = candidates[Math.floor(rng() * candidates.length)];
      board.placeJewel(r, c, slot.color);
      slot.count--;
      placedAny = true;
    }

    if (slot.count <= 0) {
      this.slots[slotIndex] = null;
    }
    return placedAny;
  }

  /**
   * Stuck/loss detection. Returns false ONLY when at least one non-empty, non-locked board cell
   * exists and every one of them would currently be rejected by the belt — the sole trigger for
   * "the loop filled up". Returns true (not stuck) when zero such cells exist, since any jewels
   * still on the belt are guaranteed to eventually find a matching empty cell.
   */
  hasAnyLegalPick(
    board: BoardEngine,
    pickShape: PickShape,
    rng: () => number,
    floodLimit?: number,
  ): boolean {
    const pickable = board.pickableCells();
    if (pickable.length === 0) return true;

    for (const [r, c] of pickable) {
      const group = board.computePickGroup(r, c, pickShape, floodLimit);
      const colors = board.colorsOf(group);
      if (this.canAcceptGroup(colors, rng)) return true;
    }
    return false;
  }
}
