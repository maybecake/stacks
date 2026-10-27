export type ColorId = 'red' | 'blue' | 'green' | 'yellow' | 'purple';

export type PickShape = 'plus' | 'block3x3' | 'flood';

export const DEFAULT_PALETTE: ColorId[] = ['red', 'blue', 'green', 'yellow', 'purple'];

export const COLOR_HEX: Record<ColorId, string> = {
  red: '#e2473b',
  blue: '#3b6fe2',
  green: '#3bbf6e',
  yellow: '#e2c53b',
  purple: '#9b3be2',
};

export const DEFAULT_GRID_SIZE = 8;
export const DEFAULT_PICK_SHAPE: PickShape = 'plus';
/** Max cells a 'flood' pick can gather in one go (including the clicked cell). */
export const DEFAULT_FLOOD_LIMIT = 10;
export const DEFAULT_MAX_STACKS = 12;
export const DEFAULT_MAX_STACK_SIZE = 8;
export const DEFAULT_ROTATION_PERIOD_MS = 8000;

export const DEFAULT_SHUFFLE_CONFIG = {
  minRegionSize: 2,
  maxRegionSize: 5,
};

/**
 * Board cell size in pixels. The board always fits within a fixed canvas, so the actual
 * per-level cell size is computed at runtime (see JewelScene) from the level's grid size,
 * clamped between these bounds — MAX_CELL_SIZE is what a small grid (e.g. the default 8x8)
 * renders at; MIN_CELL_SIZE is the floor for very large grids (e.g. a 48x48 pixel-art level).
 */
export const MAX_CELL_SIZE = 56;
export const MIN_CELL_SIZE = 6;

/** Belt ring area dimensions, below the board */
export const BELT_AREA_HEIGHT = 260;
export const BELT_RADIUS_X = 260;
export const BELT_RADIUS_Y = 90;

/** Fixed world angles (degrees, 0 = up, clockwise) for the belt's insert/eject points */
export const BELT_INSERT_ANGLE_DEG = 270;
export const BELT_EJECT_ANGLE_DEG = 90;

export const CANVAS_WIDTH = DEFAULT_GRID_SIZE * MAX_CELL_SIZE + 2 * MAX_CELL_SIZE;
/** Board area + belt ring area, see scenes/JewelScene.ts */
export const CANVAS_HEIGHT = 820;
