import { useRef } from 'react';
import { JewelCanvas } from './JewelCanvas';
import { JewelHUD } from './JewelHUD';
import type { JewelScene } from '../scenes/JewelScene';
import './JewelPage.css';

export const JewelPage = () => {
  const sceneRef = useRef<JewelScene | null>(null);

  return (
    <div className="jewel-page">
      <div className="jewel-page__title">
        <h2 className="jewel-page__heading">Jewel Loop</h2>
        <p className="jewel-page__instructions">
          Click a jewel to send it and its neighbors to the belt. Matching jewels return to the board as the belt
          spins past the eject point.
        </p>
      </div>
      <div className="jewel-page__viewport">
        <JewelHUD onRestart={() => sceneRef.current?.restart()} />
        <JewelCanvas onSceneReady={(scene) => (sceneRef.current = scene)} />
      </div>
    </div>
  );
};
