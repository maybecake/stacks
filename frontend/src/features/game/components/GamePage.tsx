import { GameCanvas } from './GameCanvas';
import { GameHUD } from './GameHUD';
import './GamePage.css';

export const GamePage = () => {
  return (
    <div className="game-page">
      <div className="game-page__title">
        <h2 className="game-page__heading">Hat Puzzle</h2>
        <p className="game-page__controls">
          Move: ← → / A D &nbsp;|&nbsp; Jump: ↑ / W / Space &nbsp;|&nbsp; Interact: E / F &nbsp;|&nbsp; Reset: R
        </p>
      </div>
      <div className="game-page__viewport">
        <GameHUD />
        <GameCanvas />
      </div>
    </div>
  );
};
