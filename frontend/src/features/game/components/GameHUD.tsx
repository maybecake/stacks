import { useEffect, useState } from 'react';
import { GameEventBus } from '../engine/GameEventBus';
import type { GameEvent } from '../engine/GameEventBus';
import './GameHUD.css';

interface HUDState {
  hatsCollected: number;
  hatsTotal: number;
  hasKey: boolean;
}

export const GameHUD = () => {
  const [state, setState] = useState<HUDState>({ hatsCollected: 0, hatsTotal: 0, hasKey: false });

  useEffect(() => {
    const unsub = GameEventBus.subscribe((event: GameEvent) => {
      if (event.type === 'level-started') {
        setState({ hatsCollected: 0, hatsTotal: event.total, hasKey: false });
      } else if (event.type === 'hat-collected') {
        setState((s) => ({
          ...s,
          hatsCollected: event.collected,
          hatsTotal: event.total,
        }));
      } else if (event.type === 'key-picked-up') {
        setState((s) => ({ ...s, hasKey: true }));
      } else if (event.type === 'key-dropped' || event.type === 'item-dropped') {
        setState((s) => ({ ...s, hasKey: false }));
      }
    });
    return unsub;
  }, []);

  return (
    <div className="game-hud">
      <div className="game-hud__hats" title="Hats collected">
        🎩 {state.hatsCollected} / {state.hatsTotal}
      </div>
      {state.hasKey && (
        <div className="game-hud__key" title="Carrying a key">
          🗝️ Key
        </div>
      )}
    </div>
  );
};
