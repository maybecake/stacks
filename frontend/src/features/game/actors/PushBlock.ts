import { Actor, CollisionType, Sprite, Color, Engine } from 'excalibur';
import { Resources } from '../engine/resources';
import { TILE_SIZE } from '../config/sprites';

const FALL_SPEED = 4; // tiles per second (manual, not physics)

export class PushBlock extends Actor {
  tileX: number;
  tileY: number;
  private _falling = false;

  constructor(tileX: number, tileY: number) {
    super({
      x: tileX * TILE_SIZE + TILE_SIZE / 2,
      y: tileY * TILE_SIZE + TILE_SIZE / 2,
      width: TILE_SIZE,
      height: TILE_SIZE,
      collisionType: CollisionType.Fixed,
      color: Color.fromHex('#FF5500'),
    });
    this.tileX = tileX;
    this.tileY = tileY;
  }

  onInitialize(): void {
    const scaled = new Sprite({
      image: Resources.block,
      sourceView: { x: 0, y: 0, width: 32, height: 32 },
      destSize: { width: TILE_SIZE, height: TILE_SIZE },
    });
    scaled.tint = Color.fromHex('#FF5500');
    this.graphics.use(scaled);
  }

  /** Teleport block to a new tile position */
  moveTo(newTileX: number, newTileY: number): void {
    this.tileX = newTileX;
    this.tileY = newTileY;
    this.pos.x = newTileX * TILE_SIZE + TILE_SIZE / 2;
    this.pos.y = newTileY * TILE_SIZE + TILE_SIZE / 2;
  }

  /** Called by LevelScene each frame to apply manual gravity */
  applyGravity(isTileBelow: (tx: number, ty: number) => boolean, _elapsed: number): void {
    const belowTileY = this.tileY + 1;
    if (!isTileBelow(this.tileX, belowTileY)) {
      this._falling = true;
      this.tileY += 1;
      this.pos.y += TILE_SIZE;
      // snap to grid
      this.pos.y = this.tileY * TILE_SIZE + TILE_SIZE / 2;
    } else {
      this._falling = false;
    }
    void _elapsed;
  }

  get isFalling(): boolean {
    return this._falling;
  }

  onPreUpdate(_engine: Engine, _elapsed: number): void {
    // Position is managed externally via moveTo / applyGravity
  }
}

export { FALL_SPEED };
