import { Actor, CollisionType, SpriteSheet, Color, vec } from 'excalibur';

import { Resources } from '../engine/resources';
import { TILE_SIZE, HAT_FRAME_SIZE, HAT_SHEET_COLS } from '../config/sprites';

export class Hat extends Actor {
  readonly hatId: string;
  private _collected = false;

  constructor(tileX: number, tileY: number, id: string) {
    super({
      x: tileX * TILE_SIZE + TILE_SIZE / 2,
      y: tileY * TILE_SIZE + TILE_SIZE / 2,
      width: TILE_SIZE,
      height: TILE_SIZE,
      collisionType: CollisionType.Passive,
      color: Color.Yellow,
    });
    this.hatId = id;
  }

  onInitialize(): void {
    const sheet = SpriteSheet.fromImageSource({
      image: Resources.hat,
      grid: { rows: 1, columns: HAT_SHEET_COLS, spriteWidth: HAT_FRAME_SIZE, spriteHeight: HAT_FRAME_SIZE },
    });
    const index = parseInt(this.hatId.replace('hat-', ''), 10) || 0;
    const sprite = sheet.getSprite(index % HAT_SHEET_COLS, 0)!;
    const s = TILE_SIZE / HAT_FRAME_SIZE;
    sprite.scale = vec(s, s);
    this.graphics.use(sprite);
  }

  get collected(): boolean {
    return this._collected;
  }

  collect(): void {
    if (this._collected) return;
    this._collected = true;
    this.scene?.remove(this);
  }

  /** Returns distance to the given world position */
  distanceTo(wx: number, wy: number): number {
    return vec(wx, wy).distance(this.pos);
  }
}
