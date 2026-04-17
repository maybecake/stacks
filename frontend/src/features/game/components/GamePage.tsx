import { useState } from 'react';
import { GameCanvas } from './GameCanvas';
import { GameHUD } from './GameHUD';
import { TouchControls } from './TouchControls';
import './GamePage.css';

const STORAGE_KEY = 'hatpuzzle-touch';

const loadTouchPref = () => localStorage.getItem(STORAGE_KEY) === 'true';

export const GamePage = () => {
  const [touchEnabled, setTouchEnabled] = useState(loadTouchPref);

  const toggleTouch = () => {
    setTouchEnabled((v) => {
      localStorage.setItem(STORAGE_KEY, String(!v));
      return !v;
    });
  };

  return (
    <div className="game-page">
      <div className="game-page__title">
        <h2 className="game-page__heading">Hat Puzzle</h2>
        <p className="game-page__controls">
          Move: ← → / A D &nbsp;|&nbsp; Jump: ↑ / W / Space &nbsp;|&nbsp; Interact: E / F &nbsp;|&nbsp; Reset: R / Enter
        </p>
      </div>
      <div className="game-page__viewport">
        <GameHUD />
        {touchEnabled && <TouchControls />}
        <GameCanvas />
      </div>
      <button className="game-page__touch-toggle" onClick={toggleTouch} aria-pressed={touchEnabled}>
        {touchEnabled ? 'Touch Controls: ON' : 'Touch Controls: OFF'}
      </button>
    </div>
  );
};
