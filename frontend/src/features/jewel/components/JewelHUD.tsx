import { useEffect, useState } from 'react';
import { GameEventBus } from '../engine/GameEventBus';
import type { GameEvent } from '../engine/GameEventBus';
import './JewelHUD.css';

type Outcome = 'in-progress' | 'won' | 'lost';

function useJewelOutcome(): Outcome {
  const [outcome, setOutcome] = useState<Outcome>('in-progress');

  useEffect(() => {
    const unsub = GameEventBus.subscribe((event: GameEvent) => {
      if (event.type === 'level-started') {
        setOutcome('in-progress');
      } else if (event.type === 'level-complete') {
        setOutcome('won');
      } else if (event.type === 'level-failed') {
        setOutcome('lost');
      }
    });
    return unsub;
  }, []);

  return outcome;
}

interface JewelOutcomeBannerProps {
  onRestart?: () => void;
}

export const JewelOutcomeBanner = ({ onRestart }: JewelOutcomeBannerProps) => {
  const outcome = useJewelOutcome();

  if (outcome === 'in-progress') return null;

  return (
    <div className="jewel-hud__banner-overlay">
      <div className={`jewel-hud__banner jewel-hud__banner--${outcome}`}>
        <p className="jewel-hud__banner-text">
          {outcome === 'won' ? 'Level Complete!' : 'The loop filled up!'}
        </p>
        <button className="jewel-hud__restart-button" onClick={onRestart}>
          Play Again
        </button>
      </div>
    </div>
  );
};
