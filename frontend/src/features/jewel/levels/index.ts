import type { LevelDef } from './types';
import { level as level1 } from './level1';
import { level as level2 } from './level2';

// LEVELS[0] is what JewelCanvas loads by default — duck pond first since it's the newest/largest.
export const LEVELS: LevelDef[] = [level2, level1];

export type { LevelDef } from './types';
