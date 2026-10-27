import { ImageSource } from 'excalibur';
import type { ColorId } from '../config/constants';
import { COLOR_HEX, DEFAULT_PALETTE } from '../config/constants';

function gemSvg(fillHex: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
    <polygon points="32,4 56,24 46,60 18,60 8,24" fill="${fillHex}" stroke="rgba(0,0,0,0.35)" stroke-width="2" stroke-linejoin="round" />
    <polygon points="32,4 56,24 32,30 8,24" fill="#ffffff" fill-opacity="0.28" />
  </svg>`;
}

function svgDataUri(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/** One shared faceted-gem SVG template, recolored per palette color — no external asset files. */
export const JEWEL_IMAGES: Record<ColorId, ImageSource> = Object.fromEntries(
  DEFAULT_PALETTE.map((color) => [color, new ImageSource(svgDataUri(gemSvg(COLOR_HEX[color])))]),
) as Record<ColorId, ImageSource>;

export const JEWEL_LOADABLES = Object.values(JEWEL_IMAGES);
