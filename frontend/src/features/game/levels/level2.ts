import type { LevelDef, TileType } from './types';

const E: TileType = 'empty';
const S: TileType = 'solid';

// 20 cols × 11 rows
const tiles: TileType[][] = [
  [E,E,E,E,E,E,E,E,E,E, E,E,E,E,E,E,E,E,E,E], // row  0
  [E,E,E,E,E,E,E,E,E,E, E,E,E,E,E,E,E,E,E,E], // row  1
  [E,E,E,E,S,S,S,E,E,E, E,E,E,E,S,S,S,E,E,E], // row  2 — high platforms
  [E,E,E,E,E,E,E,E,E,E, E,E,E,E,E,E,E,E,E,E], // row  3
  [E,E,E,E,E,E,E,E,E,E, E,E,E,E,E,E,E,E,E,E], // row  4
  [E,E,E,E,E,E,E,E,E,E, E,E,E,E,E,E,E,E,E,E], // row  5
  [E,E,E,E,E,E,E,E,S,S, S,E,E,E,E,E,E,E,E,E], // row  6 — mid platform
  [E,E,E,E,E,E,E,E,E,E, E,E,E,E,E,E,E,E,E,E], // row  7
  [E,S,S,S,E,E,E,E,E,E, E,E,E,E,E,E,S,S,S,E], // row  8 — low platforms
  [E,E,E,E,E,E,E,E,E,E, E,E,E,E,E,E,E,E,E,E], // row  9
  [S,S,S,S,S,S,S,S,S,S, S,S,S,S,S,S,S,S,S,S], // row 10 — ground
];

export const level2: LevelDef = {
  name: 'Level 2 — Key & Lock',
  tiles,
  entities: [
    { type: 'player-spawn', tileX: 0,  tileY: 9  },
    { type: 'push-block',   tileX: 4,  tileY: 9  },
    { type: 'push-block',   tileX: 5,  tileY: 9  },
    // Hats
    { type: 'hat', tileX: 2,  tileY: 7  }, // above low-left platform (row 8)
    { type: 'hat', tileX: 5,  tileY: 1  }, // above high-left platform (row 2)
    { type: 'hat', tileX: 9,  tileY: 5  }, // above mid platform (row 6)
    { type: 'hat', tileX: 14, tileY: 1  }, // above high-right platform (row 2) — behind door
    { type: 'hat', tileX: 17, tileY: 7  }, // above low-right platform (row 8) — behind door
    // Key / door
    { type: 'key',  tileX: 2,  tileY: 9, id: 'key1' },
    { type: 'door', tileX: 11, tileY: 9, id: 'key1' },
  ],
  winCondition: 'all-hats-and-door',
};
