// One-off helper that produces scripts/source-images/duck-pond.png, the source image for
// level2.ts (a 48x48 "duck on a pond" scene). Not part of the app or its build — kept only for
// provenance, same role as generate-sample-source-image.mjs for level1's gem image.
//
// Drawn directly at the target 48x48 grid size (not scaled down from something larger) using
// exact palette RGB values, so pixelate-image.mjs's resize-to-gridSize step is a lossless no-op
// and its nearest-color quantization has zero error.
import { Jimp, rgbaToInt } from 'jimp';

const SIZE = 48;
const image = new Jimp({ width: SIZE, height: SIZE, color: 0xffffffff });

const PALETTE = {
  red: { r: 226, g: 71, b: 59 },
  blue: { r: 59, g: 111, b: 226 },
  green: { r: 59, g: 191, b: 110 },
  yellow: { r: 226, g: 197, b: 59 },
  purple: { r: 155, g: 59, b: 226 },
};

function setPixel(x, y, color) {
  if (x < 0 || x >= SIZE || y < 0 || y >= SIZE) return;
  image.setPixelColor(rgbaToInt(color.r, color.g, color.b, 255), x, y);
}

function fillEllipse(cx, cy, rx, ry, color) {
  const minX = Math.max(0, Math.floor(cx - rx));
  const maxX = Math.min(SIZE - 1, Math.ceil(cx + rx));
  const minY = Math.max(0, Math.floor(cy - ry));
  const maxY = Math.min(SIZE - 1, Math.ceil(cy + ry));
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const dx = (x - cx) / rx;
      const dy = (y - cy) / ry;
      if (dx * dx + dy * dy <= 1) setPixel(x, y, color);
    }
  }
}

// Small deterministic PRNG (mulberry32) so re-running this script reproduces the same image.
function mulberry32(seed) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(20261027);

// 1. Reed/grass border framing the pond, then open water filling the interior.
for (let y = 0; y < SIZE; y++) {
  for (let x = 0; x < SIZE; x++) {
    const onBorder = x < 3 || x >= SIZE - 3 || y < 3 || y >= SIZE - 3;
    setPixel(x, y, onBorder ? PALETTE.green : PALETTE.blue);
  }
}

// 2. A scatter of small purple "sparkle" highlights across the open water.
for (let i = 0; i < 26; i++) {
  const x = 4 + Math.floor(rng() * (SIZE - 8));
  const y = 4 + Math.floor(rng() * (SIZE - 8));
  setPixel(x, y, PALETTE.purple);
}

// 3. Lily pads (green) scattered across the water, avoiding where the duck will sit.
const lilyPads = [
  [9, 9, 3.2, 2.2],
  [38, 8, 3.5, 2.4],
  [8, 36, 3.8, 2.6],
  [39, 37, 3.2, 2.3],
  [8, 23, 2.6, 2],
  [40, 24, 2.8, 2],
  [23, 40, 3, 2],
  [14, 15, 2, 1.6],
];
for (const [cx, cy, rx, ry] of lilyPads) fillEllipse(cx, cy, rx, ry, PALETTE.green);

// 4. A few tiny red flower accents tucked into the reed border.
const flowers = [
  [5, 5],
  [42, 6],
  [6, 42],
  [43, 43],
  [24, 4],
];
for (const [x, y] of flowers) setPixel(x, y, PALETTE.red);

// 5. The duck: body + head (yellow), a beak (red), an eye (purple).
fillEllipse(23, 31, 10, 7, PALETTE.yellow); // body
fillEllipse(30, 19, 6, 6, PALETTE.yellow); // head
for (let dy = -2; dy <= 2; dy++) {
  const width = 5 - Math.abs(dy);
  for (let dx = 0; dx < width; dx++) {
    setPixel(30 + 6 + dx, 19 + dy, PALETTE.red); // beak, tapering to a point
  }
}
setPixel(32, 17, PALETTE.purple); // eye
setPixel(33, 17, PALETTE.purple);

await image.write(new URL('./source-images/duck-pond.png', import.meta.url).pathname);
console.log('wrote duck-pond.png');
