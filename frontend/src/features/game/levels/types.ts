export type TileType = 'empty' | 'solid';

export type WinCondition = 'all-hats' | 'all-hats-and-door';

export interface EntityDef {
  type: 'hat' | 'key' | 'door' | 'push-block' | 'player-spawn' | 'cannon';
  tileX: number;
  tileY: number;
  /** Used to pair a key with its door. Both must share the same id. */
  id?: string;
  /** Cannon fire direction */
  dir?: 'left' | 'right';
}

export interface LevelDef {
  name: string;
  /** tiles[row][col] — row 0 is the top row */
  tiles: TileType[][];
  entities: EntityDef[];
  winCondition: WinCondition;
}
