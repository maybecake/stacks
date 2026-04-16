/**
 * Character sprite sheet: character_256x4.png
 * Linear strip — 4 frames × 256×256 px
 *   Frame 0: standing (idle / jump / fall / carry-idle)
 *   Frames 1–3: walking (walk / carry-walk)
 */
export const FRAME_W = 256;
export const FRAME_H = 256;
export const SHEET_COLS = 4;
export const SHEET_ROWS = 1;

/** ms per animation frame */
export const FRAME_DURATION = 120;

/** Flat sprite sheet indices for each animation clip */
export const ANIM_INDICES = {
  idle:      [0],
  walk:      [1, 2, 3],
  jump:      [0],
  fall:      [0],
  carryIdle: [0],
  carryWalk: [1, 2, 3],
} as const;

/** Hat sprite sheet: hats_128x8.png — 8 designs × 128×128 px */
export const HAT_FRAME_SIZE = 128;
export const HAT_SHEET_COLS = 8;

/** Key sprite: key_128x1.png — single 128×128 frame */
export const KEY_FRAME_SIZE = 128;

/** Tile size in pixels — all grid math uses this */
export const TILE_SIZE = 48;

/** Logical game canvas size (16:9) */
export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;

/** Player physics */
export const PLAYER_SPEED = 160; // px/s
export const JUMP_VELOCITY = -680; // negative = upward
export const GRAVITY = 800; // px/s²
export const INTERACT_RANGE = TILE_SIZE * 1.5; // px
