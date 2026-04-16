import { Actor, CollisionType, Sprite, Color, vec } from 'excalibur';
import { Resources } from '../engine/resources';
import { TILE_SIZE, KEY_FRAME_SIZE } from '../config/sprites';

export class Key extends Actor {
  readonly keyId: string;
  private _pickedUp = false;

  constructor(tileX: number, tileY: number, id: string) {
    super({
      x: tileX * TILE_SIZE + TILE_SIZE / 2,
      y: tileY * TILE_SIZE + TILE_SIZE / 2,
      width: TILE_SIZE,
      height: TILE_SIZE,
      collisionType: CollisionType.Passive,
      color: Color.fromHex('#c8c832'),
    });
    this.keyId = id;
  }

  onInitialize(): void {
    const sprite = new Sprite({ image: Resources.key, sourceView: { x: 0, y: 0, width: KEY_FRAME_SIZE, height: KEY_FRAME_SIZE } });
    const s = TILE_SIZE / KEY_FRAME_SIZE;
    sprite.scale = vec(s, s);
    this.graphics.use(sprite);
  }

  get pickedUp(): boolean {
    return this._pickedUp;
  }

  pickUp(): void {
    if (this._pickedUp) return;
    this._pickedUp = true;
    this.graphics.isVisible = false;
  }

  drop(wx: number, wy: number): void {
    this._pickedUp = false;
    this.pos.x = wx;
    this.pos.y = wy;
    this.graphics.isVisible = true;
  }

  distanceTo(wx: number, wy: number): number {
    return vec(wx, wy).distance(this.pos);
  }
}
