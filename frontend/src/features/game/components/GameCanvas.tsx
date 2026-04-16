import { useEffect, useRef } from 'react';
import type { Engine } from 'excalibur';
import { createEngine } from '../engine/createEngine';
import { loader } from '../engine/resources';
import { LevelScene } from '../scenes/LevelScene';
import { VictoryScene } from '../scenes/VictoryScene';

const CANVAS_ID = 'game-canvas';

export const GameCanvas = () => {
  const engineRef = useRef<Engine | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const engine = createEngine(CANVAS_ID);
    engineRef.current = engine;

    engine.addScene('level-0', new LevelScene(0));
    engine.addScene('victory', new VictoryScene());

    void engine.goToScene('level-0');
    void engine.start(loader);

    return () => {
      engine.stop();
      engineRef.current = null;
      startedRef.current = false;
    };
  }, []);

  return (
    <canvas
      id={CANVAS_ID}
      style={{ display: 'block', maxWidth: '100%', margin: '0 auto' }}
    />
  );
};
