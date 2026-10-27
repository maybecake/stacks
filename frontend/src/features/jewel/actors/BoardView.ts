import { Actor, Canvas, Color } from 'excalibur';
import type { PointerEvent } from 'excalibur';
import type { ColorId } from '../config/constants';
import { COLOR_HEX, CANVAS_WIDTH, CANVAS_HEIGHT } from '../config/constants';
import { JEWEL_IMAGES } from './jewelImages';

const LOCK_BORDER_COLOR = '#ffffff';
const BLOCKED_FLASH_COLOR = '#ff3b3b';
const BLOCKED_FLASH_MS = 300;
const GEM_SCALE = 0.7;

const pastelHexCache = new Map<ColorId, string>();
function pastelHex(color: ColorId): string {
  let hex = pastelHexCache.get(color);
  if (!hex) {
    hex = Color.fromHex(COLOR_HEX[color]).lighten(0.6).toHex();
    pastelHexCache.set(color, hex);
  }
  return hex;
}

export interface BoardViewCell {
  targetColor: ColorId;
  jewelColor: ColorId | null;
  locked: boolean;
}

/**
 * Renders the whole board grid (pastel cell backgrounds, lock borders, jewel icons) as a single
 * rasterized Canvas graphic, instead of one Actor per cell plus one per jewel. That per-cell
 * actor approach made Excalibur's per-frame update/draw pipeline the dominant cost on large
 * grids (e.g. a 48x48 level is 2,304 cells — 4,600+ actors once jewels are counted), tanking
 * frame rate even while idle. This only re-rasterizes when `redraw()` is called after a real
 * board change, so steady-state frame cost no longer scales with grid size.
 */
export class BoardView extends Actor {
  private readonly rows: number;
  private readonly cols: number;
  private readonly cellSize: number;
  private readonly canvas: Canvas;
  private readonly onPick: (row: number, col: number) => void;
  private cells: BoardViewCell[][];
  private flashCell: [number, number] | null = null;
  private flashTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(
    rows: number,
    cols: number,
    cellSize: number,
    cells: BoardViewCell[][],
    onPick: (row: number, col: number) => void,
  ) {
    const width = cols * cellSize;
    const height = rows * cellSize;
    super({ width, height, z: 1 });
    this.rows = rows;
    this.cols = cols;
    this.cellSize = cellSize;
    this.cells = cells;
    this.onPick = onPick;

    this.canvas = new Canvas({
      width,
      height,
      cache: true,
      draw: (ctx) => this._render(ctx),
    });
    this.graphics.use(this.canvas);

    this.on('pointerup', (evt) => this._handlePointer(evt));
  }

  /** Call after any change to the underlying cell data to re-rasterize on the next draw. */
  redraw(cells: BoardViewCell[][]): void {
    this.cells = cells;
    this.canvas.flagDirty();
  }

  /** Brief visible rejection feedback for a blocked pick at one cell — no state change. */
  flashBlocked(row: number, col: number): void {
    if (this.flashTimeout) clearTimeout(this.flashTimeout);
    this.flashCell = [row, col];
    this.canvas.flagDirty();
    this.flashTimeout = setTimeout(() => {
      this.flashTimeout = null;
      this.flashCell = null;
      this.canvas.flagDirty();
    }, BLOCKED_FLASH_MS);
  }

  /**
   * Recomputes world position from the raw page coordinates and the canvas's actual rendered
   * size, instead of trusting `evt.worldPos`. Excalibur's own screen->world transform assumes the
   * canvas's CSS size matches its configured resolution (DisplayMode.Fixed), but JewelPage.css
   * intentionally scales the canvas down to fit narrow/mobile viewports (`width/height: 100%` on
   * a responsive container) — a mismatch Excalibur never re-measures, so its worldPos drifts
   * toward the top-left as the real rendered size shrinks below the configured resolution.
   */
  private _handlePointer(evt: PointerEvent): void {
    let worldX = evt.worldPos.x;
    let worldY = evt.worldPos.y;

    const canvas = this.scene?.engine.canvas;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        const canvasRelativeX = evt.pagePos.x - rect.left - window.scrollX;
        const canvasRelativeY = evt.pagePos.y - rect.top - window.scrollY;
        worldX = (canvasRelativeX / rect.width) * CANVAS_WIDTH;
        worldY = (canvasRelativeY / rect.height) * CANVAS_HEIGHT;
      }
    }

    const localX = worldX - (this.pos.x - this.width / 2);
    const localY = worldY - (this.pos.y - this.height / 2);
    const col = Math.floor(localX / this.cellSize);
    const row = Math.floor(localY / this.cellSize);
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return;
    this.onPick(row, col);
  }

  private _render(ctx: CanvasRenderingContext2D): void {
    const size = this.cellSize;

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const cell = this.cells[r][c];
        const x = c * size;
        const y = r * size;

        ctx.fillStyle = pastelHex(cell.targetColor);
        ctx.fillRect(x, y, size, size);

        if (cell.locked) {
          const lineWidth = Math.max(1, size * 0.08);
          ctx.strokeStyle = LOCK_BORDER_COLOR;
          ctx.lineWidth = lineWidth;
          ctx.strokeRect(x + lineWidth / 2, y + lineWidth / 2, size - lineWidth, size - lineWidth);
        }

        if (cell.jewelColor) {
          const gemSize = size * GEM_SCALE;
          const offset = (size - gemSize) / 2;
          ctx.drawImage(JEWEL_IMAGES[cell.jewelColor].image, x + offset, y + offset, gemSize, gemSize);
        }
      }
    }

    if (this.flashCell) {
      const [r, c] = this.flashCell;
      ctx.fillStyle = BLOCKED_FLASH_COLOR;
      ctx.fillRect(c * size, r * size, size, size);
    }
  }
}
