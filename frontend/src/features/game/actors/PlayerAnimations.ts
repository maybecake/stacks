import { Animation, AnimationStrategy, SpriteSheet, vec } from 'excalibur';
import { Resources } from '../engine/resources';
import {
  FRAME_W, FRAME_H, SHEET_COLS, SHEET_ROWS, FRAME_DURATION, ANIM_INDICES, TILE_SIZE,
} from '../config/sprites';

export interface PlayerAnims {
  idle: Animation;
  walk: Animation;
  jump: Animation;
  fall: Animation;
  carryIdle: Animation;
  carryWalk: Animation;
}

export function buildPlayerAnimations(): PlayerAnims {
  const sheet = SpriteSheet.fromImageSource({
    image: Resources.character,
    grid: {
      rows: SHEET_ROWS,
      columns: SHEET_COLS,
      spriteWidth: FRAME_W,
      spriteHeight: FRAME_H,
    },
  });

  const scale = vec(TILE_SIZE / FRAME_W, TILE_SIZE / FRAME_H);
  const make = (indices: readonly number[], strategy = AnimationStrategy.Loop) => {
    const anim = Animation.fromSpriteSheet(sheet, [...indices], FRAME_DURATION, strategy);
    anim.scale = scale;
    return anim;
  };

  return {
    idle:      make(ANIM_INDICES.idle),
    walk:      make(ANIM_INDICES.walk),
    jump:      make(ANIM_INDICES.jump, AnimationStrategy.Freeze),
    fall:      make(ANIM_INDICES.fall, AnimationStrategy.Freeze),
    carryIdle: make(ANIM_INDICES.carryIdle),
    carryWalk: make(ANIM_INDICES.carryWalk),
  };
}
