// One-off helper that produced scripts/source-images/gem.png, the sample source image used to
// generate the MVP's level1.ts. Not part of the app or its build — kept only for provenance.
import { Jimp, rgbaToInt } from 'jimp';

const SIZE = 256;
const image = new Jimp({ width: SIZE, height: SIZE, color: 0xffffffff });

const PALETTE = {
  red: { r: 226, g: 71, b: 59 },
  blue: { r: 59, g: 111, b: 226 },
  green: { r: 59, g: 191, b: 110 },
  yellow: { r: 226, g: 197, b: 59 },
  purple: { r: 155, g: 59, b: 226 },
};

const cx = SIZE / 2;
const cy = SIZE / 2;
const SLICE_COLORS = [PALETTE.red, PALETTE.yellow, PALETTE.green, PALETTE.blue, PALETTE.purple];

// Five equal 72-degree angular wedges from the center, pinwheel-style — keeps all 5 palette
// colors represented in roughly equal area (unlike concentric rings, where the outermost ring
// dominates the total area and can crowd out the inner colors after downsampling).
for (let y = 0; y < SIZE; y++) {
  for (let x = 0; x < SIZE; x++) {
    const dx = x - cx;
    const dy = y - cy;
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI; // -180..180
    const normalized = (angle + 360) % 360; // 0..360
    const slice = Math.floor(normalized / 72) % SLICE_COLORS.length;
    const color = SLICE_COLORS[slice];

    image.setPixelColor(rgbaToInt(color.r, color.g, color.b, 255), x, y);
  }
}

await image.write(new URL('./source-images/gem.png', import.meta.url).pathname);
console.log('wrote gem.png');
