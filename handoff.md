# KOTODORI — Build Status

> Japanese JLPT N5 personal learning platform
> Stack: React 19 + Vite 8 + TypeScript + Tailwind CSS v4 + React Router v7 + Zustand

---

## What's Done

### Data Pipeline
- [x] **1116 total VocabEntry** objects (kanji, kana, meanings.vi, POS, verbGroup, adjType, chapter 1–14, homophones[], examples[]) — merged from `vocab_n5.pdf` (~964, via PyMuPDF) + `TuVung_N5_DungMori.md` (~152 unique). Lives in `src/data/n5/`, UTF-8 JSON, no backend.
- [x] **`kanji.json`** (`scripts/build-kanji.mjs`) — parsed from the user's `kanjis.tex` (14 chapters). 425 words → 170 "leading kanji" groups / **158 unique anchor kanji**, grouped by a same-anchor-threading algorithm (validated against advisor-flagged edge cases before use).
- [x] **`scripts/add-readings.mjs`** — real On/Kun kana readings per anchor from `kanjiapi.dev`. Re-run after `build-kanji.mjs` if `kanjis.tex` changes.
- [x] **Sparse-group vocab expansion** (93 groups, 219 words) — `fetch-candidates.mjs` (Jisho API, grounds real words) → `vocab-additions.mjs` (hand-curated Hán Việt/meaning, tagged `curated: true`) → `merge-additions.mjs`. Curated words get a small UI dot marker; **flagged for spot-check**, not cross-verified like the original 425.
- [x] **`grammar.json`** (135 points) + **`grammar-categories.json`** (14 roman-numeral categories) — rebuilt from `ngu-phap-N5-tong-hop.md`.
- [x] **`verb-forms.json`** — 3 verb groups × 8 conjugation forms, hand-built from `The_dong_tu.md`, plus a cheat-sheet table.
- [x] **`scripts/add-chapters.mjs`** — backfilled `chapter` on 152→68 remaining `chapter: 0` vocab entries via kanji-skeleton matching against the MD source.
- [x] **`scripts/fix-corrupted-suru-kanji.mjs`** — fixed a data-only bug (not a component bug — `VocabBrowser`/`Review`/`Flashcard` all read `kanji`/`kana`/`meanings.vi` directly, no concatenation logic anywhere) where 31 する-verb/expression entries had their `kanji` field replaced by a stray tail fragment of the source PDF's Hán Việt gloss + the parenthesized conjugation marker, e.g. `n5_0934` (営業する, "kinh doanh, buôn bán") stored `kanji: "Nghiệp)（する）"` instead of `営業する` (the extractor grabbed the end of "(...Nghiệp)" instead of the real kanji). Found by scanning for the `)（する）`/`)です`/`)でした`/`)ってください` signature; each of the 31 corrected values was cross-verified against kana reading + Vietnamese meaning + the Hán Việt reading of the trailing kanji before being applied. Also fixed 4 glued-space typos in `meanings.vi` on the same entries (same bug class as `fix-glued-meanings.mjs`, just missed by its original id list). **Note:** there is no `sino_vietnamese`/`hanviet` field on `VocabEntry` at all (that only exists on the separate Kanji-page types) — the bug report's premise that Hán Việt and meaning fields were "concatenating" was actually this kanji-field corruption, not a field-mixing bug.
- [x] **Furigana pipeline** (build-time, `kuroshiro`+`kuromoji`) — generates `*Ruby` HTML fields for grammar/verb-form content; hand-corrected known analyzer misreadings.
- [x] **KanjiVG stroke-animation data** (`scripts/fetch-kanjivg.mjs`) — fetches SVGs for all 158 anchor kanji, extracts stroke paths in document order (regex, not a DOM parser, to guarantee stroke order) and a recursive component/radical decomposition → `kanjivg.json`. Decomposition rules (see script comments for the full reasoning): surfaces genuine repeated components (森 → 木×3, 三 → 一×3) while stopping at the pedagogically-natural level for phonetic compounds (語 → 言+吾, not shredded into 五+二+口); separately resolves `kvg:part`-tagged fragments (KanjiVG splits one component into non-contiguous stroke groups, sometimes across different nesting depths — e.g. 母, 午) into a single merged occurrence via a whole-tree pass, so they don't get double-counted as a false repeat.
- [x] **`scripts/radical-names-curated.mjs` + `build-radical-names.mjs`** — Hán Việt names for every decomposition component → `radical-names.json`. 51 auto-filled from existing anchor `hanviet` data, 65 hand-curated (flagged for spot-check), 7 obscure KanjiVG private-use glyphs left unlabeled (UI shows the bare character rather than a guess).

### Core Infrastructure
- [x] Vite + `@tailwindcss/vite` + `@` path alias; Tailwind v4 `@theme` tokens (ink/paper/yellow/red/green/blue/surface/muted) + custom `border-3` utilities
- [x] Fonts: Space Grotesk (UI) + Noto Sans JP (Japanese)
- [x] FSRS-inspired SRS in `src/lib/srs.ts`; Zustand store with `persist` (localStorage `kotodori-vocab`) — cards, streak, totalReviewed, scope-aware `getDueCardsFor`/`getNewCardsFor`/`getScheduledCardsFor`

### UI Components
- [x] `Button`, `Card` — brutalist (3px borders, offset shadows, hover lift)
- [x] `Furigana` — per-kanji-run `<ruby>` alignment against a kana string (handles fused notes/okurigana correctly)
- [x] `Ruby` — renders pre-generated `kuroshiro` furigana HTML
- [x] `PosTag`, `Sidebar` (furigana'd nav, streak, due alert), `Layout`
- [x] `AnimatedKanjiSvg` / `KanjiDrawer` (`src/components/kanji/`) — see Kanji page below

### Pages
- [x] **Dashboard** (`/`) — streak, stats, due/new/grammar queues, N5 progress bar
- [x] **Vocabulary Browser** (`/vocab`) — search + chapter/POS filters, side detail panel, grouped-by-chapter list
- [x] **Review** (`/review`) — setup screen (chapter/POS/category filters, count presets, live scope summary) → flashcard session → done screen. Two modes: **Vocabulary** (tap-to-flip, AGAIN/HARD/GOOD/EASY) and **Kanji** (word-level cards from `kanji.json` groups, front = word + furigana, back = Hán Việt/On-Kun + sibling words). Anki-style keyboard shortcuts (Space to flip, 1–4 to rate). Kanji-word SRS cards share the vocab `cards` map (`${group.id}::w${wordIndex}` keys) but aren't counted in Sidebar/Dashboard "due" stats, which only scan `vocabulary.json`.
- [x] **Grammar** (`/grammar`) — categorized card grid, hover preview, detail drawer, verb-form pill filter, `?point=` deep link (used by Verb Forms cross-nav)
- [x] **Verb Forms** (`/verb-forms`) — conjugation tab navigator + "Ngữ pháp áp dụng" related-grammar mini bento (`scripts/tag-verb-forms.mjs`, 43/135 grammar points matched)
- [x] **Homophones** (`/homophones`) — pool merges `vocabulary.json` + `kanji.json` words (deduped); fixed a false-match bug in long-vowel folding and a note-variant double-count bug. 24 clean groups (16 exact + 8 sound-alike)
- [x] **Kanji** (`/kanji`) — chapter chips + search, grid of leading-kanji group cards (anchor, Hán Việt, On/Kun pills, member words with furigana + per-word On/Kun tag). **New: click-to-view stroke animation** — clicking the anchor kanji (hover: scale + ring) opens a right-side slide-over drawer (backdrop blur, `bg-[rgb(255,255,255)]` literal white on both the drawer and SVG container per spec) showing the stroke-order animation (guide strokes `#627d9a` static under `#2e3257` sequential dasharray/dashoffset draw, ~0.5s/stroke, replay button) plus a component/radical breakdown as compact pill tags below it, formatted `[ 字 - Hán Việt ]`, deduped with a `×N` multiplier for repeats (e.g. `[ 木 - Mộc ] ×3`), Kanagawa-colored (`#627d9a` idle → `#2e3257` hover). **Not manually verified in a live browser** (no browser-automation tool available this session) — worth a sanity check on 森 (repetition) and 午 (cross-depth `kvg:part` merge) specifically.
- [x] **Counters** (`/counters`) — Bento grid of brutalist `CounterTable` cards from `counters.json`

### Design / Branding
- [x] Brutalism: 3px borders, hard offset shadows (no blur), hover lift, high-contrast paper background, no emojis
- [x] Furigana scoped correctly app-wide (per-kanji, not per-phrase)
- [x] Document `<title>` is `KOTODORI` (dropped the `— N5` suffix)
- [x] Custom favicon (`public/favicon.svg`) — brutalist card (paper bg, 3px black border, hard offset shadow, matching the `Card` component) containing a blocky 言 (koto, "word") glyph built from flat rects rather than `<text>`/a font (renders identically regardless of installed fonts, stays legible at 16px) — dot in `#627d9a`, bars + mouth box in `#2e3257`

---

## What's NOT Done (Further Plan)

### High Priority
- [ ] **Audio pronunciation** — `speechSynthesis` (`ja-JP`) on word cards and review
- [ ] **Kanji stroke *count*** (distinct from the new stroke-order *animation*, which is done) — no stroke-count field anywhere yet
- [ ] **Dexie.js / IndexedDB** — SRS is fine in localStorage now, but would need this for review-history logging
- [ ] **Review history log** — per-event log for a future accuracy/heatmap view

### Medium Priority
- [ ] **Stats / Analytics page** (`/stats`)
- [ ] **Vocab detail as full page** (`/vocab/:id`) instead of side panel
- [ ] **Grammar examples with clickable vocab links**
- [ ] **Global search** (⌘K style, across vocab/grammar/homophones)
- [ ] **Chapter view** — vocab browsable strictly by chapter with a progress fill bar

### Low Priority / Nice to Have
- [ ] **Dark mode** (Tailwind `dark:` already supported)
- [ ] **Furigana toggle** (global hide/show)
- [ ] **Export/import progress** (SRS state as JSON)
- [ ] **Knowledge graph visualization** (vocab → grammar → homophone, `d3`/`react-force-graph`)
- [ ] **N4 expansion** (data pipeline already generalizes)
- [ ] **Radical breakdown click-through** — component tags in the Kanji drawer are currently display-only; could later jump to that component's own anchor group if one exists

---

## Known Issues / Tech Debt
- `meanings.en` field exists but is empty everywhere (vi-only)
- `pos: 'unknown'` on remaining MD-sourced vocab entries
- **`vocabulary.json` data-corruption cleanup — fully resolved across two sessions.** Root cause: the whole `TuVung_N5_DungMori.md` source had been imported into `vocabulary.json` *twice* — once correctly, once through a broken kanji/kana extractor that dropped okurigana and left bare `（～）` placeholders. Session 1 (`scripts/fix-corrupted-suru-kanji.mjs`, `fix-vocab-audit-2.mjs`, `rebuild-dungmori-block.mjs`): 37 kanji-field repairs, 82 confirmed duplicate rows deleted (each superseded by an already-correct sibling — nothing lost), 5 unique-but-corrupted entries rebuilt, 7 glued-space/truncation typos in `meanings.vi` fixed, plus a `Furigana.tsx` alignment fix (falls back to plain text instead of dumping a whole reading onto one kanji run when a mid-string literal has no counterpart in `kana`). Session 2 (`scripts/fix-chapter-zero.mjs`, `fix-doubled-kana.mjs`) cleared the remaining **`chapter: 0`** cluster (down to 12 entries by then — most of the original ~56 were already resolved as a side effect of session 1; 9 got their chapter fixed via the MD source, 3 were malformed duplicates and were deleted) and the **doubled-kana** cluster (a fresh scan found only 4 genuine bugs, not ~17 — most of the original estimate turned out to be legitimate reduplicated words like もしもし/そろそろ/色々, or had already been resolved in session 1). `vocabulary.json` is now **1031 entries** (was 1116). Verified: zero `chapter: 0`, zero real doubled-kana, zero dangling `homophones`/`relatedWords` refs, zero duplicate ids.
- SRS cards are keyed by vocabId only; multi-type cards (word/reading/meaning) were planned but not built
- `verb-forms.json` furigana overrides were hand-corrected only for strings hit during generation — re-check if new verb-form content is added
- **KanjiVG radical names**: 7 obscure private-use variant glyphs (⺕ 𠦝 𠂇 冋 𠂉 圣 𠂊) have no Hán Việt gloss in `radical-names.json` — low enough confidence that they were deliberately left blank rather than guessed
- Neither the Kanji stroke-animation drawer nor the new favicon/title change has been checked in a live browser this session (no browser tool available) — worth a once-over

---

## File Map

```
kotodori/
  index.html                  ← title, favicon link, Google Fonts <link>
  public/
    favicon.svg                ← brutalist card + blocky 言 glyph
  src/
    index.css                 ← Tailwind v4 @theme + @utility border-3
    App.tsx / main.tsx
    types/index.ts             ← VocabEntry, GrammarPoint, GrammarCategory, VerbGroup,
                                  VerbForm, VerbFormsData, HomophoneGroup, SRSCard,
                                  CounterCategory/Row/Data, KanjiGroup/Word/Chapter,
                                  KanjiVgComponent/Entry/Data, RadicalNamesData
    lib/
      srs.ts / japanese.ts / kanji.ts   ← FSRS scheduler / POS+reading helpers / On-Kun pill logic
    store/
      vocab-store.ts           ← Zustand + persist
    data/n5/
      vocabulary.json          ← 1116 entries
      grammar.json / grammar-categories.json
      verb-forms.json
      homophones.json          ← unused; Homophones.tsx computes live from vocabulary.json
      kanji.json                ← 170 leading-kanji groups / 425 words / 158 unique anchors
      kanjivg.json               ← per-anchor stroke paths + component decomposition
      radical-names.json         ← Hán Việt names for decomposition components
      counters.json
    components/
      layout/     Layout.tsx, Sidebar.tsx
      ui/         Button.tsx, Card.tsx, Furigana.tsx, Ruby.tsx, PosTag.tsx
      kanji/      AnimatedKanjiSvg.tsx, KanjiDrawer.tsx
    pages/
      Dashboard.tsx, VocabBrowser.tsx, Review.tsx, Grammar.tsx,
      VerbForms.tsx, Kanji.tsx, Counters.tsx, Homophones.tsx
  scripts/
    build-kanji.mjs             ← kanjis.tex -> kanji.json
    add-readings.mjs            ← kanjiapi.dev On/Kun readings -> kanji.json
    fetch-candidates.mjs / vocab-additions.mjs / merge-additions.mjs
                                 ← sparse-group vocab expansion pipeline
    add-chapters.mjs            ← backfills vocabulary.json chapter field
    tag-verb-forms.mjs          ← hand-curated grammar.json <-> requiredVerbForm[] mapping
    fix-glued-meanings.mjs      ← one-time fix, already applied, kept for reference
    fetch-kanjivg.mjs           ← KanjiVG SVGs -> kanjivg.json (strokes + components)
    radical-names-curated.mjs   ← hand-curated Hán Việt names for non-anchor components
    build-radical-names.mjs     ← merges anchor + curated names -> radical-names.json
```
