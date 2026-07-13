// Fetches KanjiVG stroke-order SVGs for every unique "leading kanji" anchor in
// kanji.json and distills each into: ordered stroke path data (document order
// == stroke order) + a recursive radical/component decomposition (walks the
// full <g> nesting so repeated components hidden behind an intermediate
// sub-group — e.g. 森's three 木 — aren't lost; see collectComponents below
// for the expand-vs-leaf rule). Components may repeat in the output array;
// grouping/counting duplicates for display (e.g. "木 ×3") is a UI concern.
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

function attrVal(attrs, name) {
  const m = attrs.match(new RegExp(`kvg:${name}="([^"]+)"`))
  return m ? m[1] : null
}

// Full stack-based tag walker building the nested <g> tree under the root
// `kvg:<hex>` group (unlike a depth-1 scan, this doesn't lose components
// hidden behind an intermediate wrapper — e.g. 森's second and third 木 live
// two levels down, inside a `林` sub-group).
function parseGroupTree(svg, hex) {
  const rootOpenRe = new RegExp(`<g id="kvg:${hex}"([^>]*)>`)
  const rootOpen = svg.match(rootOpenRe)
  if (!rootOpen) return null

  const tagRe = /<g\b([^>]*)>|<\/g>/g
  tagRe.lastIndex = rootOpen.index + rootOpen[0].length
  const makeNode = attrs => ({
    element: attrVal(attrs, "element"),
    position: attrVal(attrs, "position"),
    isRadical: attrVal(attrs, "radical") !== null,
    hasPart: attrVal(attrs, "part") !== null,
    children: [],
  })
  const root = makeNode(rootOpen[1])
  const stack = [root]
  let m
  while ((m = tagRe.exec(svg))) {
    if (m[0] === "</g>") {
      stack.pop()
      if (stack.length === 0) break
    } else {
      const node = makeNode(m[1])
      stack[stack.length - 1].children.push(node)
      stack.push(node)
    }
  }
  return root
}

// `kvg:part` fragments of one split component aren't always adjacent
// siblings — KanjiVG can bury one fragment inside an intervening positional
// wrapper while its other half sits at the parent level (e.g. 午 = [top
// wrapper: 丿 + 干(part1)] + 干(part2)[bottom]). A per-level sibling scan
// would treat those as two unrelated nodes. So: walk the WHOLE tree once
// up front, bucket every kvg:part node by element name regardless of depth,
// and remember which exact node objects are part-fragments — collapsing a
// node's own children into leaves then just skips fragment nodes it meets
// (a global emitted-set stops duplicates) instead of resolving them locally.
function collectPartFragments(node, byElement) {
  for (const child of node.children) {
    if (child.element && child.hasPart) {
      if (!byElement.has(child.element)) byElement.set(child.element, [])
      byElement.get(child.element).push(child)
    }
    collectPartFragments(child, byElement)
  }
}

// Decides what a set of siblings (a node's children, or the whole kanji's
// top-level children) resolves to. A part-fragment sibling contributes its
// merged (whole-tree) component once, at its first occurrence in document
// order; every other sibling is processed individually via collectComponents,
// which is what surfaces genuine adjacent repetition (e.g. 林 = 木 + 木) as
// separate leaves.
function expandChildren(children, inheritedPosition, results, ctx) {
  for (const child of children) {
    if (child.element && child.hasPart) {
      if (ctx.emitted.has(child.element)) continue
      ctx.emitted.add(child.element)
      const frags = ctx.partsByElement.get(child.element)
      results.push({
        element: child.element,
        position: frags.find(f => f.position)?.position ?? inheritedPosition,
        isRadical: frags.some(f => f.isRadical),
      })
    } else {
      collectComponents(child, results, inheritedPosition, ctx)
    }
  }
}

// Collapses a single node into the component(s) a learner would actually
// recognize. A named node is treated as a leaf at its own name UNLESS its
// children are all the same element (a repetition group, e.g. 森's 林
// sub-group = 木 + 木) — in which case it hands off to its children instead
// of contributing its own (composite) name. An unnamed positional wrapper
// (KanjiVG groups some sibling pairs under a bare `<g>` with no kvg:element
// — e.g. 品's bottom two 口) always hands off too. A node with 1 child, or
// 2+ *different*-element children (e.g. 語's 吾 = 五 + 口), is a leaf:
// further splitting a phonetic compound into its individual strokes isn't a
// meaningful "radical" for a learner, even though KanjiVG's markup goes
// that deep.
function collectComponents(node, results, inheritedPosition, ctx) {
  const position = node.position ?? inheritedPosition
  const named = node.children.filter(c => c.element)
  const allSameName = named.length >= 2 && named.every(c => c.element === named[0].element)

  if (node.element && !allSameName) {
    results.push({ element: node.element, position, isRadical: node.isRadical })
    return
  }
  expandChildren(node.children, position, results, ctx)
}

function extractComponents(svg, char, hex) {
  const tree = parseGroupTree(svg, hex)
  if (!tree) return [{ element: char, position: null, isRadical: true }]

  const partsByElement = new Map()
  collectPartFragments(tree, partsByElement)
  const ctx = { partsByElement, emitted: new Set() }

  // The root node IS the whole kanji (kvg:element == the character itself);
  // its own name is never a candidate component, so expand straight into
  // its children rather than running it through collectComponents.
  const results = []
  expandChildren(tree.children, null, results, ctx)
  if (results.length === 0) return [{ element: char, position: null, isRadical: true }]
  return results
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
