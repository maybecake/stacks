export type GameEvent =
  | { type: 'level-started'; maxStacks: number; totalCells: number }
  | { type: 'board-updated'; lockedCells: number; totalCells: number }
  | { type: 'belt-updated'; occupiedStacks: number; maxStacks: number }
  | { type: 'pick-blocked'; row: number; col: number }
  | { type: 'level-complete' }
  | { type: 'level-failed' };

type Listener = (event: GameEvent) => void;

class GameEventBusImpl {
  private _listeners: Listener[] = [];

  subscribe(listener: Listener): () => void {
    this._listeners.push(listener);
    return () => this.unsubscribe(listener);
  }

  unsubscribe(listener: Listener): void {
    this._listeners = this._listeners.filter((l) => l !== listener);
  }

  emit(event: GameEvent): void {
    for (const l of this._listeners) l(event);
  }
}

export const GameEventBus = new GameEventBusImpl();
