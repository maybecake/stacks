import { Actor, CollisionType, Color, Engine } from 'excalibur';
import { TILE_SIZE } from '../config/sprites';

const FIRE_INTERVAL_MS = 1400; // faster than before

export class Cannon extends Actor {
  private _dir: 'left' | 'right';
  private _accum: number;
  onFire: ((wx: number, wy: number, dir: 'left' | 'right') => void) | null = null;

  constructor(tileX: number, tileY: number, dir: 'left' | 'right', offsetMs = 0) {
    super({
      x: tileX * TILE_SIZE + TILE_SIZE / 2,
      y: tileY * TILE_SIZE + TILE_SIZE / 2,
      width: TILE_SIZE,
      height: TILE_SIZE,
      collisionType: CollisionType.Fixed,
      color: Color.fromHex('#222222'),
    });
    this._dir = dir;
    this._accum = offsetMs; // stagger so cannons don't all fire simultaneously
  }

  onPreUpdate(_engine: Engine, elapsed: number): void {
    this._accum += elapsed;
    if (this._accum >= FIRE_INTERVAL_MS) {
      this._accum -= FIRE_INTERVAL_MS;
      const muzzleX = this.pos.x + (this._dir === 'right' ? TILE_SIZE * 0.6 : -TILE_SIZE * 0.6);
      this.onFire?.(muzzleX, this.pos.y, this._dir);
    }
  }
}
