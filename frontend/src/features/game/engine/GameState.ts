/**
 * Persistent game state that survives level transitions.
 * Hat indices are the display columns in hats_128x8.png (0–7).
 */
class GameStateImpl {
  private _collected: number[] = [];
  private _snapshot: number[] = [];

  get collectedHatIndices(): readonly number[] {
    return this._collected;
  }

  addHat(index: number): void {
    this._collected.push(index);
  }

  /** Call at the start of each level to set the reset baseline. */
  snapshot(): void {
    this._snapshot = [...this._collected];
  }

  /** Call on level reset to discard hats collected in this attempt. */
  restoreSnapshot(): void {
    this._collected = [...this._snapshot];
  }

  /** Call on Play Again — wipes everything. */
  reset(): void {
    this._collected = [];
    this._snapshot = [];
  }
}

export const GameState = new GameStateImpl();
