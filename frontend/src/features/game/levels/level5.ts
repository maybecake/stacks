import type { LevelDef, TileType } from './types';

const E: TileType = 'empty';
const S: TileType = 'solid';

// 20 cols × 11 rows — ride the moving platform across the pit
// Pit spans cols 6-13. Platform is 1 tile wide and oscillates col 6↔13
// (its edges perfectly meet the ground on each side). A high platform on
// the right (row 5) holds two hats — jump up from right ground to reach them.
const tiles: TileType[][] = [
  [E,E,E,E,E,E,E,E,E,E, E,E,E,E,E,E,E,E,E,E], // row  0
  [E,E,E,E,E,E,E,E,E,E, E,E,E,E,E,E,E,E,E,E], // row  1
  [E,E,E,E,E,E,E,E,E,E, E,E,E,E,E,E,E,E,E,E], // row  2
  [E,E,E,E,E,E,E,E,E,E, E,E,E,E,E,E,E,E,E,E], // row  3
  [E,E,E,E,E,E,E,E,E,E, E,E,E,E,E,E,E,E,E,E], // row  4
  [E,E,E,E,E,E,E,E,E,E, E,E,E,E,S,S,S,S,S,E], // row  5 — right high platform
  [E,E,E,E,E,E,E,E,E,E, E,E,E,E,E,E,E,E,E,E], // row  6
  [E,E,E,E,E,E,E,E,E,E, E,E,E,E,E,E,E,E,E,E], // row  7
  [E,E,E,E,E,E,E,E,E,E, E,E,E,E,E,E,E,E,E,E], // row  8
  [E,E,E,E,E,E,E,E,E,E, E,E,E,E,E,E,E,E,E,E], // row  9
  [S,S,S,S,S,S,E,E,E,E, E,E,E,E,S,S,S,S,S,S], // row 10 — ground, pit cols 6-13
];

export const level5: LevelDef = {
  name: 'Level 5 — Moving Day',
  tiles,
  entities: [
    { type: 'player-spawn', tileX: 2, tileY: 9 },
    // Moving platform crosses the pit (col 6–13)
    { type: 'moving-platform', tileX: 6, tileY: 9, rangeLeft: 6, rangeRight: 13, speed: 75 },
    // Hats on the high right platform — must cross pit first, then jump up
    { type: 'hat', tileX: 15, tileY: 4 },
    { type: 'hat', tileX: 17, tileY: 4 },
  ],
  winCondition: 'all-hats',
};
