export type VirtualAction = 'left' | 'right' | 'jump' | 'interact';

class VirtualInputManager {
  private _held = new Set<VirtualAction>();
  private _justPressed = new Set<VirtualAction>();

  press(action: VirtualAction): void {
    if (!this._held.has(action)) {
      this._justPressed.add(action);
    }
    this._held.add(action);
  }

  release(action: VirtualAction): void {
    this._held.delete(action);
  }

  isHeld(action: VirtualAction): boolean {
    return this._held.has(action);
  }

  /** Returns true once per press — clears on read */
  wasPressed(action: VirtualAction): boolean {
    if (this._justPressed.has(action)) {
      this._justPressed.delete(action);
      return true;
    }
    return false;
  }

  clearJustPressed(): void {
    this._justPressed.clear();
  }
}

export const VirtualInput = new VirtualInputManager();
