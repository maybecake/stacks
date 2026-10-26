import { Actor, Color, Rectangle } from 'excalibur';
import type { ColorId } from '../config/constants';
import { COLOR_HEX } from '../config/constants';

const LOCK_BORDER_COLOR = Color.fromHex('#ffffff');
const BLOCKED_FLASH_COLOR = Color.fromHex('#ff3b3b');
const BLOCKED_FLASH_MS = 300;

/** Renders one board cell's pastel target-color background and its locked-cell highlight. */
export class BoardCellActor extends Actor {
  readonly row: number;
  readonly col: number;
  private readonly _baseColor: Color;
  private _locked = false;
  private _flashTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(row: number, col: number, targetColor: ColorId, size: number, onPick: (row: number, col: number) => void) {
    const baseColor = Color.fromHex(COLOR_HEX[targetColor]).lighten(0.6); // pastel tint so the jewel on top stays legible
    super({ width: size, height: size, z: 0, color: baseColor });
    this.row = row;
    this.col = col;
    this._baseColor = baseColor;

    this.on('pointerup', () => onPick(row, col));
  }

  setLocked(locked: boolean): void {
    if (this._locked === locked) return;
    this._locked = locked;
    this._redraw();
  }

  /** Brief visible rejection feedback for a blocked pick — no underlying state changes. */
  flashBlocked(): void {
    if (this._flashTimeout) clearTimeout(this._flashTimeout);
    this.graphics.use(new Rectangle({ width: this.width, height: this.height, color: BLOCKED_FLASH_COLOR }));
    this._flashTimeout = setTimeout(() => {
      this._flashTimeout = null;
      this._redraw();
    }, BLOCKED_FLASH_MS);
  }

  private _redraw(): void {
    this.graphics.use(
      new Rectangle({
        width: this.width,
        height: this.height,
        color: this._baseColor,
        strokeColor: this._locked ? LOCK_BORDER_COLOR : undefined,
        lineWidth: this._locked ? 3 : 0,
      }),
    );
  }

  onInitialize(): void {
    this._redraw();
  }
}
