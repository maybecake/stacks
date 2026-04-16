import { Engine, DisplayMode, Color, vec } from 'excalibur';
import { GAME_WIDTH, GAME_HEIGHT, GRAVITY } from '../config/sprites';

export function createEngine(canvasElementId: string): Engine {
  return new Engine({
    canvasElementId,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    displayMode: DisplayMode.Fixed,
    backgroundColor: Color.fromHex('#1a1a2e'),
    physics: {
      gravity: vec(0, GRAVITY),
    },
    antialiasing: false, // pixel art
  });
}
