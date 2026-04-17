export type { LevelDef, EntityDef, TileType, WinCondition } from './types';
export { level1 } from './level1';
export { level2 } from './level2';
export { level3 } from './level3';
export { level4 } from './level4';

import { level1 } from './level1';
import { level2 } from './level2';
import { level3 } from './level3';
import { level4 } from './level4';
import type { LevelDef } from './types';

export const LEVELS: LevelDef[] = [level1, level2, level3, level4];
