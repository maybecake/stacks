import { Engine, DisplayMode, Color, vec } from 'excalibur';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../config/constants';

export function createEngine(canvasElementId: string): Engine {
  return new Engine({
    canvasElementId,
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    displayMode: DisplayMode.Fixed,
    backgroundColor: Color.fromHex('#1b1b22'),
    physics: {
      gravity: vec(0, 0),
    },
    antialiasing: false,
  });
}
