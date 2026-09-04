// Regenerates apple-touch-icon.png / icon-192.png / icon-512.png from
// favicon.svg's card+bird mark.
//
// Unlike favicon.svg (which floats the bordered card on a transparent
// canvas with a drop shadow — fine for a small browser-tab icon), these are
// Home Screen / PWA icons. Apple's HIG says such icons must have NO
// transparency, NO drop shadow, and NO border/rounded-corners baked in —
// iOS applies its own squircle mask + shading, and anything you bake in
// yourself (padding, a square border under a round mask) shows through as
// visible artifacts: a "too small" icon floating in blank space, or a hard
// 90° corner poking out from under the rounded mask. So this variant drops
// the shadow AND the border, and rescales the flat card fill to bleed to
// the full canvas edge.
//
// Run with: node scripts/generate-touch-icons.mjs
import { Resvg } from '@resvg/resvg-js';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

// Same card (32,32,384,384) + hanko stamp + kanji as favicon.svg, minus the
// shadow rect, remapped so the card fills the full 0..512 canvas
// (scale = 512/384, translate = -32*scale) instead of floating inset.
const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <g transform="translate(-42.666667,-42.666667) scale(1.333333)">
    <rect x="32" y="32" width="384" height="384" fill="#efe7d8"/>
    <rect x="330" y="330" width="52" height="52" fill="#be4327" rx="10"/>
    <circle cx="356" cy="356" r="14" fill="none" stroke="#efe7d8" stroke-width="3"/>
    <circle cx="356" cy="356" r="4" fill="#efe7d8"/>
    <g transform="translate(100, 85) scale(2.4)" fill="none" stroke="#221b12" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M49.72,10.68c0.03,0.27,0.07,0.7-0.06,1.08c-0.76,2.28-5.15,7.3-11.15,10.37"/>
      <path d="M32.88,23.32c0.96,0.8,1.57,2.55,1.57,3.69c0,6.86,0.02,24.01-0.12,35.24c-0.03,2.27-0.06,4.3-0.11,5.95"/>
      <path d="M35.8,25.86c9.2-1.73,23.7-4.36,29.64-4.87c3.06-0.26,4.32,2.26,4.04,3.99c-0.15,0.92-1.49,7.58-3.2,14.78c-0.26,1.09-0.52,2.18-0.78,3.24"/>
      <path d="M35.86,35.44c3.64-0.69,26.27-4.19,30.87-4.38"/>
      <path d="M35.49,45.53c7.01-1.03,21.26-3.53,29.23-4.2"/>
      <path d="M35.78,56.05c11.22-1.3,37.15-4.84,41.97-5.55c1.68-0.25,4.53-0.28,5.38-0.1"/>
      <path d="M34.75,68.27c15.75-2.64,42-5.64,49.75-6.27c4.51-0.36,6.81,2.33,6,5.75c-2.25,9.5-5.82,18.96-9.5,25C77.5,98.5,74.75,96,71,93"/>
      <path d="M20.81,80.25c0.44,6-0.31,13.25-1.6,17"/>
      <path d="M34.38,78.38c2.97,1.96,5.79,7.37,6.54,10.43"/>
      <path d="M48.88,75.12c2.34,1.57,6.04,6.44,6.62,8.88"/>
      <path d="M62.88,72c2.69,1.68,6.95,6.89,7.62,9.5"/>
    </g>
  </g>
</svg>
`.trim();

writeFileSync(join(publicDir, 'icon-touch-source.svg'), svg + '\n');

const targets = [
  { file: 'apple-touch-icon.png', size: 180 },
  { file: 'icon-192.png', size: 192 },
  { file: 'icon-512.png', size: 512 },
];

for (const { file, size } of targets) {
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: size } });
  const png = resvg.render().asPng();
  writeFileSync(join(publicDir, file), png);
  console.log(`wrote ${file} (${size}x${size})`);
}
