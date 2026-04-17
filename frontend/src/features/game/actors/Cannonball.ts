import { Actor, CollisionType, Color, Engine } from 'excalibur';
import { GAME_WIDTH } from '../config/sprites';

export const BALL_SPEED = 480; // px/s — fast enough to be threatening
export const BALL_RADIUS = 8;

export class Cannonball extends Actor {
  private _dir: number; // -1 = left, 1 = right
  dead = false;

  constructor(wx: number, wy: number, dir: 'left' | 'right') {
    super({
      x: wx,
      y: wy,
      radius: BALL_RADIUS,
      collisionType: CollisionType.PreventCollision, // no physics collision — proximity-checked manually
      color: Color.fromHex('#111111'),
    });
    this._dir = dir === 'right' ? 1 : -1;
  }

  onInitialize(_engine: Engine): void {
    this.vel.x = this._dir * BALL_SPEED;
  }

  onPreUpdate(_engine: Engine, _elapsed: number): void {
    if (this.pos.x < -BALL_RADIUS * 2 || this.pos.x > GAME_WIDTH + BALL_RADIUS * 2) {
      this.dead = true;
      this.kill();
    }
  }
}
