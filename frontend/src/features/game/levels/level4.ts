import type { LevelDef, TileType } from './types';

const E: TileType = 'empty';
const S: TileType = 'solid';

// 20 cols × 11 rows — two-key gauntlet
const tiles: TileType[][] = [
  [E,E,E,E,E,E,E,E,E,E, E,E,E,E,E,E,E,E,E,E], // row  0
  [E,E,E,E,E,E,E,E,E,E, E,E,E,E,E,E,E,E,E,E], // row  1
  [S,S,S,S,E,E,E,E,E,E, E,E,E,E,E,E,S,S,S,S], // row  2 — far platforms
  [E,E,E,E,E,E,E,E,E,E, E,E,E,E,E,E,E,E,E,E], // row  3
  [E,E,E,E,E,E,E,E,E,E, E,E,E,E,E,E,E,E,E,E], // row  4
  [E,E,E,E,S,S,S,S,S,S, S,S,S,S,S,E,E,E,E,E], // row  5 — wide mid platform
  [E,E,E,E,E,E,E,E,E,E, E,E,E,E,E,E,E,E,E,E], // row  6
  [E,E,E,E,E,E,E,E,E,E, E,E,E,E,E,E,E,E,E,E], // row  7
  [E,E,E,E,E,E,E,E,E,E, E,E,E,E,E,E,E,E,E,E], // row  8
  [E,E,E,E,E,E,E,E,E,E, E,E,E,E,E,E,E,E,E,E], // row  9
  [S,S,S,S,S,S,S,S,S,S, S,S,S,S,S,S,S,S,S,S], // row 10 — ground
];

export const level4: LevelDef = {
  name: 'Level 4 — Double Lock',
  tiles,
  entities: [
    { type: 'player-spawn', tileX: 9,  tileY: 9  },
    { type: 'push-block',   tileX: 3,  tileY: 9  },
    { type: 'push-block',   tileX: 16, tileY: 9  },
    // Hats
    { type: 'hat', tileX: 1,  tileY: 1  }, // top-left platform
    { type: 'hat', tileX: 17, tileY: 1  }, // top-right platform
    { type: 'hat', tileX: 7,  tileY: 4  }, // above mid platform left
    { type: 'hat', tileX: 12, tileY: 4  }, // above mid platform right
    // Two keys + two doors
    { type: 'cannon', tileX: 10, tileY: 5, dir: 'left'  },
    { type: 'cannon', tileX: 9,  tileY: 5, dir: 'right' },
    { type: 'key',  tileX: 0,  tileY: 9, id: 'keyA' },
    { type: 'door', tileX: 4,  tileY: 4, id: 'keyA' },
    { type: 'key',  tileX: 19, tileY: 9, id: 'keyB' },
    { type: 'door', tileX: 15, tileY: 4, id: 'keyB' },
  ],
  winCondition: 'all-hats-and-door',
};
