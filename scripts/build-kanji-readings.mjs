// Builds src/data/kanji-readings.json: a fallback on/kun/meaning lookup for
// every kanji character that appears anywhere in N5+N4 vocab but is NOT one
// of kanji.json's anchor characters (those already have richer, textbook-
// verified data — see KANJI_INDEX in src/lib/kanji.ts, which is checked
// first by KanjiDrawer).
//
// Sources, cheapest/most-trusted first:
//   1. scripts/all-readings.json (kanjiapi.dev-sourced, on/kun only, already
//      cached from an earlier pipeline pass — see build-furigana-map.mjs).
//   2. https://kanjiapi.dev/v1/kanji/{char} live fetch, for:
//      a. on/kun for the handful of characters not in all-readings.json
//      b. English meanings for EVERY non-anchor character (all-readings.json
//         has no meanings field at all)
//
// Output schema: Record<string, { on: string[], kun: string[], meanings: { vi: string, en: string } }>
// meanings.en is always the live kanjiapi.dev gloss (joined ", "). kanjiapi.dev
// has no Vietnamese, so meanings.vi is carried over from the *existing* output
// file when a character was already hand-translated there (by
// translate-kanji-meanings.mjs — see that script), and otherwise falls back
// to the English gloss (matching translate-kanji-meanings.mjs's own
// fallback for anything it doesn't cover). A re-run that only adds new vocab
// kanji therefore keeps every prior Vietnamese translation intact; re-run
// translate-kanji-meanings.mjs afterward to fill in vi for any newly
// introduced characters it lists as fallen-back-to-English.
//
// Re-run after adding vocab that introduces a genuinely new kanji character.
// Polite ~250ms delay between live fetches; a full run against ~560
// characters takes a few minutes. Safe to re-run — always rebuilds from
// scratch (aside from preserving existing vi translations as above) rather
// than diffing.
import { readFileSync, writeFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import path from "node:path"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, "..")

const readJson = p => JSON.parse(readFileSync(p, "utf8"))

const n5Vocab = readJson(path.join(root, "src/data/n5/vocabulary.json"))
const n4Vocab = readJson(path.join(root, "src/data/n4/vocabulary.json"))
const n5Kanji = readJson(path.join(root, "src/data/n5/kanji.json"))
const n4Kanji = readJson(path.join(root, "src/data/n4/kanji.json"))
const allReadings = readJson(path.join(root, "scripts/all-readings.json"))

const outPath = path.join(root, "src/data/kanji-readings.json")
// Preserve hand-translated `vi` meanings across re-runs -- see the header
// comment above and translate-kanji-meanings.mjs.
let existingViByChar = {}
try {
  const existing = readJson(outPath)
  for (const [char, entry] of Object.entries(existing)) {
    if (entry.meanings?.vi) existingViByChar[char] = entry.meanings.vi
  }
} catch {
  // No prior output (first run) -- nothing to preserve.
}

const KANJI_CHAR_RE = /[一-鿿㐀-䶿々]/

// 1. Collect every unique kanji character appearing anywhere in vocab.
const allChars = new Set()
for (const entry of [...n5Vocab, ...n4Vocab]) {
  for (const ch of entry.kanji ?? "") {
    if (KANJI_CHAR_RE.test(ch)) allChars.add(ch)
  }
}
console.log(`Found ${allChars.size} unique kanji characters across N5+N4 vocab.`)

// 2. Drop characters already covered by kanji.json anchors (KanjiDrawer
// prefers KANJI_INDEX for those — richer, bilingual, textbook-sourced).
const anchors = new Set()
for (const chapter of [...n5Kanji.chapters, ...n4Kanji.chapters]) {
  for (const group of chapter.groups) {
    if (group.anchor) anchors.add(group.anchor)
  }
}
const nonAnchorChars = [...allChars].filter(ch => !anchors.has(ch))
console.log(`${nonAnchorChars.length} characters need fallback data (not kanji.json anchors).`)

const sleep = ms => new Promise(r => setTimeout(r, ms))

async function fetchFromApi(char) {
  const url = `https://kanjiapi.dev/v1/kanji/${encodeURIComponent(char)}`
  const res = await fetch(url)
  if (!res.ok) {
    console.warn(`  kanjiapi.dev miss for ${char}: HTTP ${res.status}`)
    return null
  }
  const data = await res.json()
  return {
    on: data.on_readings ?? [],
    kun: data.kun_readings ?? [],
    meanings: data.meanings ?? [],
  }
}

// kanjiapi.dev has no Vietnamese -- carry over an existing hand translation
// for this char if the prior output had one, else fall back to the English
// gloss itself (same fallback translate-kanji-meanings.mjs uses for
// anything it doesn't cover, so the schema/shape stays consistent either
// way this field got populated).
function buildMeanings(char, englishMeanings) {
  const en = (englishMeanings ?? []).join(", ")
  return { vi: existingViByChar[char] ?? en, en }
}

async function main() {
  const result = {}
  let fromCache = 0
  let fromApi = 0
  let failed = []

  for (let i = 0; i < nonAnchorChars.length; i++) {
    const char = nonAnchorChars[i]
    const cached = allReadings[char]

    if (cached) {
      // all-readings.json has on/kun but no meanings -- still need a live
      // fetch for the English gloss.
      const api = await fetchFromApi(char)
      await sleep(250)
      result[char] = {
        on: cached.on ?? [],
        kun: cached.kun ?? [],
        meanings: buildMeanings(char, api?.meanings),
      }
      fromCache++
    } else {
      const api = await fetchFromApi(char)
      await sleep(250)
      if (api) {
        result[char] = {
          on: api.on,
          kun: api.kun,
          meanings: buildMeanings(char, api.meanings),
        }
        fromApi++
      } else {
        failed.push(char)
      }
    }

    if ((i + 1) % 50 === 0) {
      console.log(`  ...${i + 1}/${nonAnchorChars.length} processed`)
    }
  }

  writeFileSync(outPath, JSON.stringify(result, null, 2) + "\n", "utf8")

  const newlyIntroduced = Object.keys(result).filter(ch => !existingViByChar[ch]).length
  console.log(`\nWrote ${Object.keys(result).length}/${nonAnchorChars.length} entries to ${path.relative(root, outPath)}`)
  console.log(`  on/kun from all-readings.json cache (meanings fetched live): ${fromCache}`)
  console.log(`  fully fetched live from kanjiapi.dev: ${fromApi}`)
  if (failed.length > 0) console.log(`  failed entirely (no data found): ${failed.join(" ")}`)
  if (newlyIntroduced > 0) console.log(`  ${newlyIntroduced} entries have no prior Vietnamese translation (meanings.vi fell back to English) -- re-run translate-kanji-meanings.mjs`)
}

main()
