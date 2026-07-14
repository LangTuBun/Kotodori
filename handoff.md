# KOTODORI — Build Status

> Japanese JLPT N5 personal learning platform
> Stack: React 19 + Vite 8 + TypeScript + Tailwind CSS v4 + React Router v7 + Zustand

---

## What's Done

### Data Pipeline
- [x] **1031 total VocabEntry** objects (kanji, kana, meanings.vi/en, POS, verbGroup, adjType, chapter 1–14, homophones[], examples[]) — merged from `vocab_n5.pdf` (~964, via PyMuPDF) + `TuVung_N5_DungMori.md` (~152 unique), then de-duplicated/repaired (see **Known Issues** for the full corruption-cleanup history). Lives in `src/data/n5/`, UTF-8 JSON, no backend.
- [x] **`kanji.json`** (`scripts/build-kanji.mjs` for the original textbook chapters + `scripts/add-n5-supplement.mjs` for chapter 15) — **15 chapters, 179 leading-kanji groups, 167 unique anchor kanji, 1159 words**. Originally 425 words / 170 groups / 158 anchors (14 kanjis.tex chapters); grown in two later passes:
  - **Sparse-group expansion** (93 groups, 219 words): `fetch-candidates.mjs` (Jisho API, grounds real words) → `vocab-additions.mjs` (hand-curated Hán Việt/meaning, tagged `curated: true`) → `merge-additions.mjs`. Brought the total to 644 words.
  - **N5 completeness + vocabulary enrichment** (this session): cross-referenced the 158 existing anchors against a standard ~103-character JLPT N5 kanji list (union of two independently-sourced, mutually-consistent lists — there's no single official list post-2010). Only 9 characters were missing (駅 空 語 校 国 週 天 店 道); added as a new **chapter 15** ("N5 supplement") rather than folded into the 14 textbook chapters, so the original structure stays intact. Every anchor (all 179 groups) was then brought toward a ~7-word target using real Jisho-grounded candidates filtered to `common: true` only, bringing the total to **1159 words**. See the **N5 Enrichment Pipeline** section below for the full methodology (classifier validation, multi-reading-character handling, etc.) — this is the part most likely to need re-running if new anchors are ever added again.
- [x] **`scripts/add-readings.mjs`** — real On/Kun kana readings per anchor from `kanjiapi.dev`. Re-run after `build-kanji.mjs`/`add-n5-supplement.mjs` if the anchor set changes.
- [x] **`grammar.json`** (135 points) + **`grammar-categories.json`** (14 roman-numeral categories) — rebuilt from `ngu-phap-N5-tong-hop.md`.
- [x] **`verb-forms.json`** — 3 verb groups × 8 conjugation forms, hand-built from `The_dong_tu.md`, plus a cheat-sheet table.
- [x] **`scripts/add-chapters.mjs`** — backfilled `chapter` on 152→68 remaining `chapter: 0` vocab entries via kanji-skeleton matching against the MD source.
- [x] **`scripts/fix-corrupted-suru-kanji.mjs`** — fixed a data-only bug (not a component bug — `VocabBrowser`/`Review`/`Flashcard` all read `kanji`/`kana`/`meanings.vi` directly, no concatenation logic anywhere) where 31 する-verb/expression entries had their `kanji` field replaced by a stray tail fragment of the source PDF's Hán Việt gloss + the parenthesized conjugation marker, e.g. `n5_0934` (営業する, "kinh doanh, buôn bán") stored `kanji: "Nghiệp)（する）"` instead of `営業する` (the extractor grabbed the end of "(...Nghiệp)" instead of the real kanji). Found by scanning for the `)（する）`/`)です`/`)でした`/`)ってください` signature; each of the 31 corrected values was cross-verified against kana reading + Vietnamese meaning + the Hán Việt reading of the trailing kanji before being applied. Also fixed 4 glued-space typos in `meanings.vi` on the same entries (same bug class as `fix-glued-meanings.mjs`, just missed by its original id list). **Note:** there is no `sino_vietnamese`/`hanviet` field on `VocabEntry` at all (that only exists on the separate Kanji-page types) — the bug report's premise that Hán Việt and meaning fields were "concatenating" was actually this kanji-field corruption, not a field-mixing bug.
- [x] **`scripts/fix-corrupted-vi-meanings.mjs`** — fixed 30 `vocabulary.json` entries (+2 mirrored in `homophones.json`) that had literal **`U+FFFF` "noncharacter" codepoints** baked into `meanings.vi` (renders as tofu/`□` in any font — never a display/encoding bug, the bad codepoints were embedded in the JSON by the original `vocab_n5.pdf` extraction pipeline, which no longer exists on disk to re-derive the corruption from). Fix is a hardcoded `id -> [oldExact, newFixed, confidence]` map — each replacement is checked against the *exact* current string before writing (idempotent, fails loudly rather than silently mis-patching if source data changes shape). Confidence tiered and logged: 14 **high**-confidence (corrupted char = a wave dash `～`, recoverable from the entry's own kanji field + the file's `～word` gloss convention), 2 **medium-high** + 6 **medium** (reconstructed from `TuVung_N5_DungMori.md` source rows or kana-count matching), 8 **low-medium** (best-effort, source PDF is gone so unverifiable — flagged in-script for a human spot-check if ever questioned).
- [x] **Furigana pipeline** (build-time, `kuroshiro`+`kuromoji`) — generates `*Ruby` HTML fields for grammar/verb-form content; hand-corrected known analyzer misreadings.
- [x] **KanjiVG stroke-animation data** (`scripts/fetch-kanjivg.mjs`) — extracts stroke paths in document order (regex, not a DOM parser, to guarantee stroke order) and a recursive component/radical decomposition → `kanjivg.json`. Decomposition rules (see script comments for the full reasoning): surfaces genuine repeated components (森 → 木×3, 三 → 一×3) while stopping at the pedagogically-natural level for phonetic compounds (語 → 言+吾, not shredded into 五+二+口); separately resolves `kvg:part`-tagged fragments (KanjiVG splits one component into non-contiguous stroke groups, sometimes across different nesting depths — e.g. 母, 午) into a single merged occurrence via a whole-tree pass, so they don't get double-counted as a false repeat. **Coverage grown twice this session**: originally covered only the 158 anchor kanji; rewritten to source its character list from *every* kanji appearing anywhere in the app's data (not just anchors) and to **merge into** the existing file rather than overwrite it (skips characters already present, safe to re-run). Now covers all **745 unique characters** across `vocabulary.json` + `kanji.json` (635 after the first re-fetch, +110 more after the N5 enrichment pass introduced new secondary characters) — **zero gaps** as of this session.
- [x] **`scripts/radical-names-curated.mjs` + `build-radical-names.mjs`** — Hán Việt names for every decomposition component → `radical-names.json`. 51 auto-filled from existing anchor `hanviet` data, 65 hand-curated (flagged for spot-check), 7 obscure KanjiVG private-use glyphs left unlabeled (UI shows the bare character rather than a guess).
- [x] **`src/data/hanviet-dictionary.json`** (new this session) — flat `{character: "Hán Việt reading"}` map, independent of which word a kanji appears in. Built in two stages: (1) `kanji.json` only stores Hán Việt per *word* (e.g. "四日" → "Tứ Nhật"), not per character — since each word's `hanviet` string is a space-separated reading aligned 1:1 against that word's kanji-only characters, zipping the two recovers a per-character index (`src/lib/kanji.ts`'s `buildHanVietIndex()`), covering ~355/635 characters this way; (2) the remaining characters were filled from a 2136-character Jouyou kanji table (a public Vietnamese JLPT-prep reference, cross-validated against a second independent 80-character list — a strict subset of the first, good corroborating evidence — before being trusted), with the one holdout (濡, not a Jouyou character) verified individually against `hvdic.thivien.net`. **Explicit exclusions** (deliberate, not missed): **込** (kokuji — invented in Japan, no Chinese-origin reading exists to assign) and **々** (the iteration/repeat mark, not a real character — an early pass falsely resolved it to "Thiểu" via coincidental character/syllable-count alignment in one word, 少々; excluded from the dictionary and handled in code instead, see below). **One transcription error found and fixed**: the source table had `礁` as "tiều" (phonetically inconsistent with its ショウ on'yomi and the real term "ám tiêu" 暗礁) — confirmed as an isolated typo in the source and corrected to "Tiêu". Coverage: 633/635 of the app's core character set right after the initial build; **737 total entries currently**, since the later N5 vocabulary-enrichment pass pulled in ~104 more secondary characters beyond the original 635 and extended this same file (`scripts/fetch-secondary-kanji-data.mjs`) rather than starting a new one. 9 characters still lack an entry — see **Known Issues**.
- [x] **N5 completeness + enrichment classifier pipeline** (new this session, see full detail below) — `scripts/onkun-classifier.mjs` + `scripts/validate-classifier.mjs`: an on/kun reading classifier and Hán Việt concatenator, both *measured against the existing hand-labeled corpus* before being trusted on new data (97.5% / 97.2% final agreement on the full 1159-word corpus). Caught a real bug this way (voicing transform only checked rendaku は→ば, not han-dakuten は→ぱ, silently failing words like 電報 でんぽう — fixed, took accuracy from 52.8%→95.7% on the pre-enrichment corpus).

### N5 Enrichment Pipeline (methodology reference)
For future re-runs (e.g. if more anchors or a higher per-anchor word target are ever wanted), the pipeline is:
1. `scripts/fetch-enrichment-candidates.mjs` — Jisho candidate words for every anchor group (not just sparse ones).
2. `scripts/build-enrichment-draft.mjs` — selects candidates per anchor (filtered to `common: true` only — an unfiltered pass let obscure/irregular readings through, e.g. 二 read as Mahjong-tile loanwords リャン/アル), auto-fills `hanviet` (dictionary concatenation) and `onkun` (classifier), flags anything uncertain (unresolved classification, characters missing from the Hán Việt dictionary, or known multi-reading characters).
3. `scripts/resolve-flagged.mjs` — hand-resolves every flagged case: multi-reading characters where Hán Việt depends on the specific compound (長 Trường/Trưởng, 読 Đọc/Độc, 買 Mãi/Mại, 少 Thiểu/Thiếu), genuine jukujikun/irregular readings retagged `Juku`/`Ate` instead of left as a bad guess (大人, 土産, 今日, お父さん, etc.), and a handful of obscure ateji candidates dropped entirely (champagne/Oxford/karuta phonetic kanji spellings — not real N5 content).
4. `scripts/fetch-secondary-kanji-data.mjs` — backfills on/kun + Hán Việt for secondary characters the wider candidate pool pulls in beyond the current character set.
5. Vietnamese `meaning` glosses hand-translated into `scripts/enrichment-meanings.json` (positional, same group-then-item order as the draft).
6. `scripts/assemble-enrichment.mjs` — zips the meanings onto the resolved draft; **hard-fails on any count mismatch** rather than silently misaligning a translation to the wrong word (caught one missing translation this session — 午前中 — before merging).
7. `scripts/merge-enrichment.mjs` — merges into `kanji.json` with the same sanity checks as `merge-additions.mjs` (onkun token count vs. kanji character count, duplicate-within-group skip).
8. `node scripts/validate-classifier.mjs` — re-run after any of the above to confirm agreement hasn't regressed.

### Core Infrastructure
- [x] Vite + `@tailwindcss/vite` + `@` path alias; Tailwind v4 `@theme` tokens (ink/paper/yellow/red/green/blue/surface/muted) + custom `border-3` utilities
- [x] Fonts: Space Grotesk (UI) + Noto Sans JP (Japanese)
- [x] FSRS-inspired SRS in `src/lib/srs.ts`; Zustand store with `persist` (localStorage `kotodori-vocab`) — cards, streak, totalReviewed, scope-aware `getDueCardsFor`/`getNewCardsFor`/`getScheduledCardsFor`
- [x] **EN/VI i18n toggle** — `useSettingsStore` (Zustand + `persist`, localStorage key `kotodori-settings`) holds `lang: 'vi' | 'en'` (default `'vi'`) plus a `theme` field (`brutalism`/`neobrutalism`, unrelated to language). `t(lang, key, vars)` (`src/lib/i18n.ts`) does a dot-path lookup into `src/locales/{en,vi}.json`, falling back to Vietnamese (the only fully-populated locale) then to the raw key if a translation is missing, so gaps are visible rather than silently blank. `LanguageSwitcher.tsx` (in the sidebar) flips it. **Important**: this only localizes UI chrome (nav, buttons, headers) — `meanings.en` is still `""` on all 1031 `vocabulary.json` entries (see Known Issues); `localize()` uses a truthy `meanings[lang] || meanings.vi` fallback so English mode degrades to the Vietnamese gloss instead of rendering blank.

### UI Components
- [x] `Button`, `Card` — brutalist (3px borders, offset shadows, hover lift)
- [x] `Furigana` — per-kanji-run `<ruby>` alignment against a kana string (handles fused notes/okurigana correctly); **each kanji character is individually clickable** (`onKanjiClick` prop, opt-in) opening the stroke-order drawer, while kana stays plain text — reuses the same `KANJI_RE` the alignment logic already uses, so clickability can't drift out of sync with what's rendered as a ruby run.
- [x] `Ruby` — renders pre-generated `kuroshiro` furigana HTML
- [x] `PosTag`, `Sidebar` (furigana'd nav, streak, due alert), `Layout`
- [x] `LanguageSwitcher` — EN/VI toggle, see Core Infrastructure above
- [x] `AnimatedKanjiSvg` / `KanjiDrawer` (`src/components/kanji/`) — see Kanji page below

### Pages
- [x] **Dashboard** (`/`) — streak, stats, due/new/grammar queues, N5 progress bar
- [x] **Vocabulary Browser** (`/vocab`) — search + chapter/POS filters, grouped-by-chapter list. **Detail view is a centered modal popup** (not a side panel): `bg-ink/30 backdrop-blur-sm` backdrop matching `KanjiDrawer`'s treatment, layered at `z-30` (deliberately below `KanjiDrawer`'s `z-40`/`z-50`, since clicking a kanji inside the modal opens the stroke drawer *on top of* it — Escape closes whichever layer is topmost first). SRS status bar (`TRẠNG THÁI` header + LẠI/KHÓ/TỐT/DỄ rating buttons) was **removed** from this view — a deliberate scope cut, SRS review belongs in `/review` not idle browsing. **List navigation**: `‹ n / total ›` strip inside the modal steps through the *currently filtered* word list (state: `selectedIndex` into the filtered array, Prev/Next clamp to bounds, no wraparound) without closing the modal; also bound to Left/Right arrow keys (guarded against firing while typing in the search box). Navigating to a different word resets any open stroke drawer so it can't linger showing a stale character.
- [x] **Review** (`/review`) — setup screen (chapter/POS/category filters, count presets, live scope summary) → flashcard session → done screen. Two modes: **Vocabulary** (tap-to-flip, AGAIN/HARD/GOOD/EASY) and **Kanji** (word-level cards from `kanji.json` groups, front = word + furigana, back = Hán Việt/On-Kun + sibling words). Anki-style keyboard shortcuts (Space to flip, 1–4 to rate). Kanji-word SRS cards share the vocab `cards` map (`${group.id}::w${wordIndex}` keys) but aren't counted in Sidebar/Dashboard "due" stats, which only scan `vocabulary.json`.
- [x] **Grammar** (`/grammar`) — categorized card grid, hover preview, detail drawer, verb-form pill filter, `?point=` deep link (used by Verb Forms cross-nav)
- [x] **Verb Forms** (`/verb-forms`) — conjugation tab navigator + "Ngữ pháp áp dụng" related-grammar mini bento (`scripts/tag-verb-forms.mjs`, 43/135 grammar points matched)
- [x] **Homophones** (`/homophones`) — pool merges `vocabulary.json` + `kanji.json` words (deduped); fixed a false-match bug in long-vowel folding and a note-variant double-count bug. 24 clean groups (16 exact + 8 sound-alike)
- [x] **Kanji** (`/kanji`) — chapter chips (now 1–15, see chapter 15 above) + search, grid of leading-kanji group cards (anchor, Hán Việt, On/Kun pills, member words with furigana + per-word On/Kun tag). **Click-to-view stroke animation** — clicking the anchor kanji (hover: scale + ring) opens a right-side slide-over drawer (backdrop blur, `bg-[rgb(255,255,255)]` literal white on both the drawer and SVG container per spec) showing the stroke-order animation (guide strokes `#627d9a` static under `#2e3257` sequential dasharray/dashoffset draw, ~0.5s/stroke, replay button) plus a component/radical breakdown as compact pill tags below it, formatted `[ 字 - Hán Việt ]`, deduped with a `×N` multiplier for repeats (e.g. `[ 木 - Mộc ] ×3`), Kanagawa-colored (`#627d9a` idle → `#2e3257` hover). Same drawer is now reused from the Vocab Browser modal (see above) — it's a plain `{char, onClose}` component with no page-specific coupling. **Hán Việt badge**: renders directly below the stroke SVG (and below the "no animation available" fallback text too, so it still surfaces for characters without stroke data) — `bg-white`/`rgb(255,255,255)` container, `border-2` in the Kanagawa accent `#627d9a`, label in that same blue-gray, the reading itself in `#2e3257`; renders nothing (no empty box) when the character has no Hán Việt entry.
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
- [ ] **Kanji stroke *count*** (distinct from stroke-order *animation*, which is done) — no stroke-count field anywhere yet
- [ ] **Dexie.js / IndexedDB** — SRS is fine in localStorage now, but would need this for review-history logging
- [ ] **Review history log** — per-event log for a future accuracy/heatmap view
- [ ] **English vocab meanings** — `meanings.en` is still empty on all 1031 entries; the EN/VI toggle only affects UI chrome today (see Core Infrastructure)

### Medium Priority
- [ ] **Stats / Analytics page** (`/stats`)
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
- [ ] **Remaining Hán Việt gaps** — 7 obscure characters (雀 檎 鹸 垣 丼 碗 瓜) encountered during N5 enrichment aren't in the 2136-Jouyou reference table used to build `hanviet-dictionary.json`. A few *words* containing them already have a hand-written partial gloss (e.g. 茶碗 → "Trà Oản", 牛丼 → "Ngưu"), but the bare characters aren't in the standalone dictionary. Low priority — would need a second reference source or manual lookup.

---

## Known Issues / Tech Debt
- `pos: 'unknown'` on remaining MD-sourced vocab entries
- **`vocabulary.json` data-corruption cleanup — fully resolved across three sessions.** Root cause (sessions 1–2): the whole `TuVung_N5_DungMori.md` source had been imported into `vocabulary.json` *twice* — once correctly, once through a broken kanji/kana extractor that dropped okurigana and left bare `（～）` placeholders. Session 1 (`scripts/fix-corrupted-suru-kanji.mjs`, `fix-vocab-audit-2.mjs`, `rebuild-dungmori-block.mjs`): 37 kanji-field repairs, 82 confirmed duplicate rows deleted (each superseded by an already-correct sibling — nothing lost), 5 unique-but-corrupted entries rebuilt, 7 glued-space/truncation typos in `meanings.vi` fixed, plus a `Furigana.tsx` alignment fix (falls back to plain text instead of dumping a whole reading onto one kanji run when a mid-string literal has no counterpart in `kana`). Session 2 (`scripts/fix-chapter-zero.mjs`, `fix-doubled-kana.mjs`) cleared the remaining **`chapter: 0`** cluster (down to 12 entries by then — most of the original ~56 were already resolved as a side effect of session 1; 9 got their chapter fixed via the MD source, 3 were malformed duplicates and were deleted) and the **doubled-kana** cluster (a fresh scan found only 4 genuine bugs, not ~17 — most of the original estimate turned out to be legitimate reduplicated words like もしもし/そろそろ/色々, or had already been resolved in session 1). Session 3 (`scripts/fix-corrupted-vi-meanings.mjs`, see Data Pipeline above): a separate, unrelated corruption class — 30 entries + 2 mirrored homophones with literal `U+FFFF` noncharacter codepoints in `meanings.vi`. `vocabulary.json` is now **1031 entries**. Verified: zero `chapter: 0`, zero real doubled-kana, zero dangling `homophones`/`relatedWords` refs, zero duplicate ids, zero `U+FFFF` codepoints.
- SRS cards are keyed by vocabId only; multi-type cards (word/reading/meaning) were planned but not built
- `verb-forms.json` furigana overrides were hand-corrected only for strings hit during generation — re-check if new verb-form content is added
- **KanjiVG radical names**: 7 obscure private-use variant glyphs (⺕ 𠦝 𠂇 冋 𠂉 圣 𠂊) have no Hán Việt gloss in `radical-names.json` — low enough confidence that they were deliberately left blank rather than guessed
- **Hán Việt dictionary gaps**: 9 characters have no entry in `hanviet-dictionary.json` — 々 and 込 (deliberate, see Data Pipeline), plus 7 obscure characters not in the reference table used to build it (see Further Plan above)
- **English vocab meanings empty** — see Further Plan above
- Neither the Vocab Browser modal, the Kanji click-through, nor the EN/VI toggle has been checked in a live browser this session (no browser tool available) — worth a manual pass, especially: Prev/Next at list boundaries, Escape behavior with a stroke drawer open on top of the vocab modal, and the EN/VI toggle against a few Kanji-mode review cards

---

## File Map

```
kotodori/
  handoff.md                  ← this file
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
      srs.ts / japanese.ts / kanji.ts   ← FSRS scheduler / POS+reading helpers /
                                           On-Kun pill logic + hanVietForChar()/buildHanVietIndex()
      i18n.ts / useTranslation.ts        ← EN/VI dot-path lookup + interpolation
    store/
      vocab-store.ts           ← Zustand + persist (SRS)
      settings-store.ts        ← Zustand + persist (lang, theme)
    data/
      hanviet-dictionary.json   ← flat {char: Hán Việt reading} map, 737 entries
      n5/
        vocabulary.json          ← 1031 entries
        grammar.json / grammar-categories.json
        verb-forms.json
        homophones.json          ← unused; Homophones.tsx computes live from vocabulary.json
        kanji.json                ← 15 chapters / 179 leading-kanji groups / 1159 words / 167 unique anchors
        kanjivg.json               ← per-character stroke paths + component decomposition, 745 characters
        radical-names.json         ← Hán Việt names for decomposition components
        counters.json
    components/
      layout/     Layout.tsx, Sidebar.tsx
      ui/         Button.tsx, Card.tsx, Furigana.tsx, Ruby.tsx, PosTag.tsx, LanguageSwitcher.tsx
      kanji/      AnimatedKanjiSvg.tsx, KanjiDrawer.tsx
    pages/
      Dashboard.tsx, VocabBrowser.tsx, Review.tsx, Grammar.tsx,
      VerbForms.tsx, Kanji.tsx, Counters.tsx, Homophones.tsx
  scripts/
    build-kanji.mjs             ← kanjis.tex -> kanji.json (original 158-anchor build)
    add-readings.mjs            ← kanjiapi.dev On/Kun readings -> every current anchor
    add-n5-supplement.mjs       ← adds the 9 missing N5 anchors as chapter 15
    fetch-candidates.mjs / vocab-additions.mjs / merge-additions.mjs
                                 ← sparse-group vocab expansion pipeline (pre-N5-enrichment)
    fetch-enrichment-candidates.mjs / build-enrichment-draft.mjs / resolve-flagged.mjs /
    assemble-enrichment.mjs / merge-enrichment.mjs
                                 ← N5 completeness + vocabulary-enrichment pipeline (see above)
    enrichment-candidates.json / enrichment-draft.json / enrichment-meanings.json /
    enrichment-additions.json  ← intermediate artifacts from the pipeline above, kept for provenance
    onkun-classifier.mjs        ← reusable on/kun reading classifier (rendaku/han-dakuten/gemination-aware)
    validate-classifier.mjs     ← measures the classifier + Hán Việt concatenator against kanji.json
    all-readings.json           ← cached kanjiapi.dev on/kun readings for all app characters
    saroma-map.json              ← parsed 2136-Jouyou-kanji -> Hán Việt table, cached for reuse
    fetch-secondary-kanji-data.mjs ← backfills readings/Hán Việt for characters beyond the core set
    add-chapters.mjs            ← backfills vocabulary.json chapter field
    tag-verb-forms.mjs          ← hand-curated grammar.json <-> requiredVerbForm[] mapping
    fix-glued-meanings.mjs      ← one-time fix, already applied, kept for reference
    fix-corrupted-suru-kanji.mjs / fix-vocab-audit-2.mjs / rebuild-dungmori-block.mjs /
    fix-chapter-zero.mjs / fix-doubled-kana.mjs / fix-corrupted-vi-meanings.mjs
                                 ← one-time vocabulary.json corruption fixes, already applied, kept for reference
    fetch-kanjivg.mjs           ← KanjiVG SVGs -> kanjivg.json (strokes + components); merge-safe,
                                   sources its character list from all app data, not just anchors
    radical-names-curated.mjs   ← hand-curated Hán Việt names for non-anchor components
    build-radical-names.mjs     ← merges anchor + curated names -> radical-names.json
```
