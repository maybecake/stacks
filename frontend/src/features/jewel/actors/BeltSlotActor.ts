import { Actor, Color, Font, GraphicsGroup, Text, vec } from 'excalibur';
import type { ColorId } from '../config/constants';
import { JEWEL_IMAGES } from './jewelImages';

const ICON_SIZE = 32;
const GEM_NATIVE_SIZE = 64;
const COUNT_FONT = new Font({ size: 14, color: Color.White });

/** Renders one belt stack's jewel icon + count badge at its current position on the ring. */
export class BeltSlotActor extends Actor {
  constructor(size = ICON_SIZE) {
    super({ width: size, height: size, z: 3 });
  }

  /** Shows this slot's jewel+count; hide() is used instead when the slot is empty. */
  show(color: ColorId, count: number): void {
    const sprite = JEWEL_IMAGES[color].toSprite();
    const scale = this.width / GEM_NATIVE_SIZE;
    sprite.scale = vec(scale, scale);

    const badge = new Text({ text: String(count), font: COUNT_FONT });

    this.graphics.use(
      new GraphicsGroup({
        members: [
          { offset: vec(0, 0), graphic: sprite },
          { offset: vec(this.width * 0.3, this.height * 0.3), graphic: badge, useBounds: false },
        ],
      }),
    );
    this.graphics.visible = true;
  }

  hide(): void {
    this.graphics.visible = false;
  }

  moveTo(x: number, y: number): void {
    this.pos = vec(x, y);
  }
}
