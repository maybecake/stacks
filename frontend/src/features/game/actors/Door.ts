import { Actor, CollisionType, Sprite, Color } from 'excalibur';
import { Resources } from '../engine/resources';
import { TILE_SIZE } from '../config/sprites';

export class Door extends Actor {
  readonly doorId: string;

  constructor(tileX: number, tileY: number, id: string) {
    super({
      x: tileX * TILE_SIZE + TILE_SIZE / 2,
      y: tileY * TILE_SIZE + TILE_SIZE,       // anchor bottom
      width: TILE_SIZE,
      height: TILE_SIZE * 2,
      collisionType: CollisionType.Fixed,
      color: Color.fromHex('#8b5a2b'),
    });
    this.doorId = id;
  }

  onInitialize(): void {
    const scaled = new Sprite({ image: Resources.door, sourceView: { x: 0, y: 0, width: 32, height: 48 } });
    this.graphics.use(scaled);
  }

  open(): void {
    this.scene?.remove(this);
  }
}
