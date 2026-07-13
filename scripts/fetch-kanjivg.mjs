// Fetches KanjiVG stroke-order SVGs for every unique "leading kanji" anchor in
// kanji.json and distills each into: ordered stroke path data (document order
// == stroke order) + a one-level radical/component decomposition.
// Source: https://github.com/KanjiVG/kanjivg (CC BY-SA 3.0, Ulrich Apel).
// Re-run after kanji.json's anchor set changes (i.e. after build-kanji.mjs).
import { readFileSync, writeFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import path from "node:path"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, "..")
const kanjiJsonPath = path.join(root, "src/data/n5/kanji.json")
const outPath = path.join(root, "src/data/n5/kanjivg.json")

const KANJIVG_BASE = "https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji"
const CONCURRENCY = 8

function codepointHex(char) {
  return char.codePointAt(0).toString(16).padStart(5, "0")
}

// Stroke order == document order of <path> elements inside the
// kvg:StrokePaths_* group. A plain regex over `d="..."` preserves that order
// exactly (an object/DOM parser risks reordering or deduping siblings); it
// also can't match the `<!ATTLIST path ...>` line in the DOCTYPE since that
// has no `d=` attribute.
function extractStrokes(svg) {
  const strokesBlockMatch = svg.match(/<g id="kvg:StrokePaths_[^"]*"[^>]*>([\s\S]*?)<\/g>\s*<g id="kvg:StrokeNumbers/)
  const block = strokesBlockMatch ? strokesBlockMatch[1] : svg
  const paths = []
  const pathRe = /<path\b[^>]*\bd="([^"]+)"/g
  let m
  while ((m = pathRe.exec(block))) paths.push(m[1])
  return paths
}

// Minimal stack-based tag walker — just enough to find the direct children
// of the root `kvg:<hex>` group (the one-level radical/component split).
// Deeper structure (sub-groups of a component) is intentionally ignored.
function extractComponents(svg, char, hex) {
  const rootOpenRe = new RegExp(`<g id="kvg:${hex}"([^>]*)>`)
  const rootOpen = svg.match(rootOpenRe)
  if (!rootOpen) return [{ element: char, position: null, isRadical: true }]

  const rootStart = rootOpen.index + rootOpen[0].length
  const tagRe = /<g\b([^>]*)>|<\/g>/g
  tagRe.lastIndex = rootStart
  let depth = 1
  const children = []
  let m
  while ((m = tagRe.exec(svg))) {
    const isClose = m[0] === "</g>"
    if (isClose) {
      depth--
      if (depth === 0) break
    } else {
      if (depth === 1) {
        const attrs = m[1]
        const elMatch = attrs.match(/kvg:element="([^"]+)"/)
        if (elMatch) {
          const posMatch = attrs.match(/kvg:position="([^"]+)"/)
          const radicalMatch = attrs.match(/kvg:radical="([^"]+)"/)
          children.push({
            element: elMatch[1],
            position: posMatch ? posMatch[1] : null,
            isRadical: !!radicalMatch,
          })
        }
      }
      depth++
    }
  }

  if (children.length === 0) return [{ element: char, position: null, isRadical: true }]
  return children
}

async function fetchOne(char) {
  const hex = codepointHex(char)
  const url = `${KANJIVG_BASE}/${hex}.svg`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${char} (${hex})`)
  const svg = await res.text()
  const viewBoxMatch = svg.match(/viewBox="([^"]+)"/)
  const strokes = extractStrokes(svg)
  if (strokes.length === 0) throw new Error(`No strokes parsed for ${char} (${hex})`)
  const components = extractComponents(svg, char, hex)
  return {
    viewBox: viewBoxMatch ? viewBoxMatch[1] : "0 0 109 109",
    strokes,
    components,
  }
}

async function main() {
  const kanjiData = JSON.parse(readFileSync(kanjiJsonPath, "utf8"))
  const anchors = new Set()
  for (const chapter of kanjiData.chapters) {
    for (const group of chapter.groups) anchors.add(group.anchor)
  }
  const list = [...anchors]
  console.log(`Fetching KanjiVG data for ${list.length} unique anchor kanji...`)

  const result = {}
  const misses = []
  let i = 0
  async function worker() {
    while (i < list.length) {
      const char = list[i++]
      try {
        result[char] = await fetchOne(char)
      } catch (err) {
        misses.push({ char, error: err.message })
      }
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker))

  writeFileSync(outPath, JSON.stringify(result, null, 2) + "\n", "utf8")
  console.log(`Wrote ${Object.keys(result).length}/${list.length} entries to ${path.relative(root, outPath)}`)
  if (misses.length > 0) {
    console.log(`\n${misses.length} miss(es):`)
    for (const miss of misses) console.log(`  ${miss.char}: ${miss.error}`)
  }
}

main()
