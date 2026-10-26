import { useEffect, useRef } from 'react';
import { DefaultLoader } from 'excalibur';
import type { Engine } from 'excalibur';
import { createEngine } from '../engine/createEngine';
import { JewelScene } from '../scenes/JewelScene';
import { JEWEL_LOADABLES } from '../actors/JewelActor';
import { LEVELS } from '../levels';

const CANVAS_ID = 'jewel-canvas';

interface JewelCanvasProps {
  onSceneReady?: (scene: JewelScene) => void;
}

export const JewelCanvas = ({ onSceneReady }: JewelCanvasProps) => {
  const engineRef = useRef<Engine | null>(null);
  const startedRef = useRef(false);
  const onSceneReadyRef = useRef(onSceneReady);

  // Keeps the ref current without mutating it during render (runs after every commit).
  useEffect(() => {
    onSceneReadyRef.current = onSceneReady;
  });

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const engine = createEngine(CANVAS_ID);
    engineRef.current = engine;

    const scene = new JewelScene(LEVELS[0]);
    engine.addScene('jewel', scene);
    void engine.goToScene('jewel');

    const loader = new DefaultLoader({ loadables: JEWEL_LOADABLES });
    void engine.start(loader);

    onSceneReadyRef.current?.(scene);

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
