import type { LevelDef, TileType } from './types';

const E: TileType = 'empty';
const S: TileType = 'solid';

// 20 cols × 11 rows  (960 / 48 = 20)
const tiles: TileType[][] = [
  [E,E,E,E,E,E,E,E,E,E, E,E,E,E,E,E,E,E,E,E], // row  0
  [E,E,E,E,E,E,E,E,E,E, E,E,E,E,E,E,E,E,E,E], // row  1
  [E,E,E,E,E,E,E,E,S,S, S,E,E,E,E,E,E,E,E,E], // row  2 — high centre platform
  [E,E,E,E,E,E,E,E,E,E, E,E,E,E,E,E,E,E,E,E], // row  3
  [E,E,E,E,E,E,E,E,E,E, E,E,E,E,E,E,E,E,E,E], // row  4
  [E,E,E,S,S,S,E,E,E,E, E,E,E,E,S,S,S,E,E,E], // row  5 — two mid platforms
  [E,E,E,E,E,E,E,E,E,E, E,E,E,E,E,E,E,E,E,E], // row  6
  [E,S,S,S,E,E,E,E,E,E, E,E,E,E,E,E,S,S,S,E], // row  7 — two low platforms
  [E,E,E,E,E,E,E,E,E,E, E,E,E,E,E,E,E,E,E,E], // row  8
  [E,E,E,E,E,E,E,E,E,E, E,E,E,E,E,E,E,E,E,E], // row  9
  [S,S,S,S,S,S,S,S,S,S, S,S,S,S,S,S,S,S,S,S], // row 10 — ground
];

export const level1: LevelDef = {
  name: 'Level 1 — Hat Hunt',
  tiles,
  entities: [
    { type: 'player-spawn', tileX: 0,  tileY: 9  },
    { type: 'push-block',   tileX: 6,  tileY: 9  },
    // Hats — display index randomized at collect time
    { type: 'hat', tileX: 2,  tileY: 6  }, // above low-left platform (row 7)
    { type: 'hat', tileX: 4,  tileY: 4  }, // above mid-left platform (row 5)
    { type: 'hat', tileX: 9,  tileY: 1  }, // above high platform (row 2)
    { type: 'hat', tileX: 14, tileY: 4  }, // above mid-right platform (row 5)
    { type: 'hat', tileX: 17, tileY: 6  }, // above low-right platform (row 7)
    { type: 'cannon', tileX: 19, tileY: 9, dir: 'left' },
  ],
  winCondition: 'all-hats',
};
