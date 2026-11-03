// Builds the app icons from the shared 鳥 glyph in the Apple-style glass look:
// system blue → indigo gradient, soft top highlight, white strokes.
//   public/favicon.svg          rounded tile for browser tabs
//   public/apple-touch-icon.png 180px, full-bleed (iOS applies its own mask)
//   public/icon-192.png, icon-512.png  full-bleed, glyph inside the maskable safe zone
// Run: node scripts/build-icons.mjs
import { writeFileSync } from 'node:fs'
import { Resvg } from '@resvg/resvg-js'
import { TORI_STROKES } from '../src/components/ui/tori-glyph.ts'

function svg({ rounded }) {
  // The glyph occupies roughly x 18–92, y 10–98 of its 109 box; scale it to ~58% of the tile, centred.
  const strokes = TORI_STROKES.map(d => `<path d="${d}"/>`).join('')
  const shape = rounded ? '<rect width="512" height="512" rx="115" fill="url(#bg)"/>' : '<rect width="512" height="512" fill="url(#bg)"/>'
  const clip = rounded ? ' clip-path="url(#tile)"' : ''
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2f8cff"/><stop offset="0.55" stop-color="#4f6bf2"/><stop offset="1" stop-color="#6e5ce6"/></linearGradient>
    <radialGradient id="glow" cx="0.3" cy="0.12" r="0.75"><stop offset="0" stop-color="#fff" stop-opacity="0.42"/><stop offset="0.6" stop-color="#fff" stop-opacity="0"/></radialGradient>
    <linearGradient id="sheen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.22"/><stop offset="0.45" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#1b1464" flood-opacity="0.35"/></filter>
    ${rounded ? '<clipPath id="tile"><rect width="512" height="512" rx="115"/></clipPath>' : ''}
  </defs>
  ${shape}
  <g${clip}><rect width="512" height="512" fill="url(#glow)"/><rect width="512" height="260" fill="url(#sheen)"/></g>
  <g filter="url(#shadow)" transform="translate(256 262) scale(3.05) translate(-55 -54.5)" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">${strokes}</g>
</svg>
`
}

const png = (source, size) => new Resvg(source, { fitTo: { mode: 'width', value: size } }).render().asPng()
writeFileSync(new URL('../public/favicon.svg', import.meta.url), svg({ rounded: true }))
const square = svg({ rounded: false })
writeFileSync(new URL('../public/apple-touch-icon.png', import.meta.url), png(square, 180))
writeFileSync(new URL('../public/icon-192.png', import.meta.url), png(square, 192))
writeFileSync(new URL('../public/icon-512.png', import.meta.url), png(square, 512))
console.log('Icons written')
