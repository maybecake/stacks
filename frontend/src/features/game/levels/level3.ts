import type { LevelDef, TileType } from './types';

const E: TileType = 'empty';
const S: TileType = 'solid';

// 20 cols × 11 rows — staircase ascent
const tiles: TileType[][] = [
  [E,E,E,E,E,E,E,E,E,E, E,E,E,E,E,E,E,E,E,E], // row  0
  [E,E,E,E,E,E,E,E,E,E, E,E,E,E,E,E,E,E,E,E], // row  1
  [E,E,E,E,E,E,E,E,E,E, E,E,E,E,E,E,E,S,S,S], // row  2 — top-right platform
  [E,E,E,E,E,E,E,E,E,E, E,E,E,E,E,E,E,E,E,E], // row  3
  [E,E,E,E,E,E,E,E,E,E, E,E,E,S,S,S,E,E,E,E], // row  4 — upper-mid platform
  [E,E,E,E,E,E,E,E,E,E, E,E,E,E,E,E,E,E,E,E], // row  5
  [E,E,E,E,E,E,E,S,S,S, E,E,E,E,E,E,E,E,E,E], // row  6 — centre platform
  [E,E,E,E,E,E,E,E,E,E, E,E,E,E,E,E,E,E,E,E], // row  7
  [E,E,E,S,S,S,E,E,E,E, E,E,E,E,E,E,E,E,E,E], // row  8 — lower-left platform
  [E,E,E,E,E,E,E,E,E,E, E,E,E,E,E,E,E,E,E,E], // row  9
  [S,S,S,S,S,S,S,S,S,S, S,S,S,S,S,S,S,S,S,S], // row 10 — ground
];

export const level3: LevelDef = {
  name: 'Level 3 — Stairway',
  tiles,
  entities: [
    { type: 'player-spawn', tileX: 0,  tileY: 9  },
    { type: 'push-block',   tileX: 7,  tileY: 9  },
    { type: 'push-block',   tileX: 8,  tileY: 9  },
    { type: 'hat', tileX: 4,  tileY: 7  }, // above lower-left platform
    { type: 'hat', tileX: 8,  tileY: 5  }, // above centre platform
    { type: 'hat', tileX: 14, tileY: 3  }, // above upper-mid platform
    { type: 'hat', tileX: 18, tileY: 1  }, // top-right platform
    { type: 'key',  tileX: 1,  tileY: 9, id: 'key1' },
    { type: 'door', tileX: 19, tileY: 9, id: 'key1' },
    { type: 'cannon', tileX: 19, tileY: 2, dir: 'left' },
    { type: 'cannon', tileX: 0,  tileY: 8, dir: 'right' },
  ],
  winCondition: 'all-hats-and-door',
};
