export type GameEvent =
  | { type: 'level-started'; total: number }
  | { type: 'hat-collected'; collected: number; total: number }
  | { type: 'key-picked-up' }
  | { type: 'key-dropped' }
  | { type: 'item-dropped' }
  | { type: 'level-complete' };

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
