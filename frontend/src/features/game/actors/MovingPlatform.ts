import { Actor, CollisionType, Color, Engine } from 'excalibur';
import { TILE_SIZE } from '../config/sprites';

export class MovingPlatform extends Actor {
  velX: number;
  private _minX: number;
  private _maxX: number;

  constructor(
    tileX: number,
    tileY: number,
    rangeLeft: number,
    rangeRight: number,
    speed = 70,
  ) {
    super({
      x: tileX * TILE_SIZE + TILE_SIZE / 2,
      y: tileY * TILE_SIZE + TILE_SIZE / 2,
      width: TILE_SIZE,
      height: TILE_SIZE,
      collisionType: CollisionType.Fixed,
      color: Color.fromHex('#3399FF'),
    });
    this._minX = rangeLeft * TILE_SIZE + TILE_SIZE / 2;
    this._maxX = rangeRight * TILE_SIZE + TILE_SIZE / 2;
    this.velX = speed;
  }

  onPreUpdate(_engine: Engine, elapsed: number): void {
    const dt = elapsed / 1000;
    this.pos.x += this.velX * dt;

    if (this.pos.x >= this._maxX) {
      this.pos.x = this._maxX;
      this.velX = -Math.abs(this.velX);
    } else if (this.pos.x <= this._minX) {
      this.pos.x = this._minX;
      this.velX = Math.abs(this.velX);
    }
  }
}
