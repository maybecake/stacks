import { ImageSource, DefaultLoader } from 'excalibur';

export const Resources = {
  character: new ImageSource('/assets/game/character_256x4.png'),
  hat: new ImageSource('/assets/game/hats_128x8.png'),
  key: new ImageSource('/assets/game/key_128x1.png'),
  door: new ImageSource('/assets/game/door.png'),
  block: new ImageSource('/assets/game/block.png'),
} as const;

export const loader = new DefaultLoader({
  loadables: Object.values(Resources),
});
