import { useEffect, useState } from 'react';
import { GameEventBus } from '../engine/GameEventBus';
import type { GameEvent } from '../engine/GameEventBus';
import './JewelHUD.css';

type Outcome = 'in-progress' | 'won' | 'lost';

interface HUDState {
  occupiedStacks: number;
  maxStacks: number;
  lockedCells: number;
  totalCells: number;
  outcome: Outcome;
}

const INITIAL_STATE: HUDState = {
  occupiedStacks: 0,
  maxStacks: 0,
  lockedCells: 0,
  totalCells: 0,
  outcome: 'in-progress',
};

interface JewelHUDProps {
  onRestart?: () => void;
}

export const JewelHUD = ({ onRestart }: JewelHUDProps) => {
  const [state, setState] = useState<HUDState>(INITIAL_STATE);

  useEffect(() => {
    const unsub = GameEventBus.subscribe((event: GameEvent) => {
      if (event.type === 'level-started') {
        setState({
          occupiedStacks: 0,
          maxStacks: event.maxStacks,
          lockedCells: 0,
          totalCells: event.totalCells,
          outcome: 'in-progress',
        });
      } else if (event.type === 'belt-updated') {
        setState((s) => ({ ...s, occupiedStacks: event.occupiedStacks, maxStacks: event.maxStacks }));
      } else if (event.type === 'board-updated') {
        setState((s) => ({ ...s, lockedCells: event.lockedCells, totalCells: event.totalCells }));
      } else if (event.type === 'level-complete') {
        setState((s) => ({ ...s, outcome: 'won' }));
      } else if (event.type === 'level-failed') {
        setState((s) => ({ ...s, outcome: 'lost' }));
      }
    });
    return unsub;
  }, []);

  const handleRestart = () => {
    setState(INITIAL_STATE);
    onRestart?.();
  };

  return (
    <>
      <div className="jewel-hud">
        <div className="jewel-hud__belt" title="Belt occupancy">
          🔗 Belt: {state.occupiedStacks} / {state.maxStacks}
        </div>
        <div className="jewel-hud__progress" title="Board progress">
          💎 {state.lockedCells} / {state.totalCells}
        </div>
      </div>
      {state.outcome !== 'in-progress' && (
        <div className="jewel-hud__banner-overlay">
          <div className={`jewel-hud__banner jewel-hud__banner--${state.outcome}`}>
            <p className="jewel-hud__banner-text">
              {state.outcome === 'won' ? 'Level Complete!' : 'The loop filled up!'}
            </p>
            <button className="jewel-hud__restart-button" onClick={handleRestart}>
              Play Again
            </button>
          </div>
        </div>
      )}
    </>
  );
};
