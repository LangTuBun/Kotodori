# TORI — Project Status

> Japanese JLPT N5 + N4 personal learning platform (renamed from Kotodori).
> Stack: React 19 + Vite 8 + TypeScript + Tailwind CSS v4 + React Router v7 + Zustand.
> Static SPA, no backend — all state (SRS progress, settings) lives in browser `localStorage`.
> Self-hosted via Docker (nginx serving the static build) — see **Self-Hosting** below.

This file is a **current-state snapshot**, not a session log. It describes what
exists today and what's genuinely open. For the archaeology of *how* specific
data got built (multi-pass corruption fixes, translation pipelines, etc.), see
the compressed **Data Pipeline Provenance** section at the bottom — that part
is safe to skip unless you're about to touch a `scripts/*.mjs` build script and
want to know what already went wrong once.

---

## Current State

### Data
- **N5**: 1031 vocab entries, 135 grammar points (14 categories), verb-forms
  (3 groups × 8 conjugations + cheat sheet), 15 kanji chapters (179 groups /
  1159 words / 167 anchors), 11 counter categories, 24 homophone groups.
- **N4**: 759 vocab entries, 68 grammar points (10 categories), 110 kanji
  groups / 268 words across 10 chapters. No verb-forms or counters source
  material exists for N4 — those two pages stay N5-only.
- Every bilingual field (`{vi, en}`) is filled **except** `meanings.en` on all
  1031 N5 vocab entries — see **Known Gaps**, this is deliberate and deferred,
  not forgotten.
- `hanviet-dictionary.json`: 944 characters. Deliberately missing 々 (iteration
  mark, not a real character) and 込 (kokuji, no Chinese-origin reading) — see
  **Gotchas**.

### Core infrastructure
- **SRS**: classic SM-2 (`src/lib/srs.ts`) — `interval`/`repetition`/`easeFactor`
  fields, 4-button AGAIN/HARD/GOOD/EASY UI mapped to SM-2's quality scale.
  Replaced an earlier FSRS-inspired scheduler; the swap was a deliberate,
  user-approved reset of all persisted SRS progress (not a migration).
- **Level switch**: global `N5 | N4 | all` toggle (`useSettingsStore`), affects
  every page that has level-aware data.
- **i18n**: EN/VI toggle, `t()`/`localize()` via `useTranslation()`. UI chrome
  is fully bilingual; content bilinguality is per-field (see Data above).
- **Theming**: 9 paper themes (5 light: Washi/Paper/Matcha/Sakura/Sumi; 4 dark:
  Dusk/Ink/Indigo/Gold) × RAW/NEO structural mode × density × typeface, all in
  `InkCabinet.tsx`, persisted to `localStorage` (`tori-settings`).
- **Mobile / responsive**: `Layout.tsx`/`Sidebar.tsx` collapse to an off-canvas
  hamburger drawer below `lg` (1024px); two-pane pages (Grammar) become a
  full-screen overlay below `lg` instead of a cramped side panel; `h-dvh`
  throughout instead of `h-screen` (iOS URL-bar-safe); inputs forced to 16px
  on mobile (prevents iOS Safari's auto-zoom-on-focus); touch targets bumped
  to 44px on nav controls.
- **PWA-lite / "Add to Home Screen"**: `public/manifest.webmanifest` +
  `apple-touch-icon.png`/`icon-192.png`/`icon-512.png` (generated from the
  favicon's bird mark, see `.gitignore`'d scratch script if regeneration is
  ever needed — there's no source PSD/SVG-at-scale, just the 32×32 favicon
  vector) + safe-area-inset padding on the mobile header/drawer for the
  iPhone notch/Dynamic Island.

### Pages
`/` Dashboard · `/vocab` VocabBrowser · `/review` Review (vocab + kanji SM-2
modes) · `/grammar` Grammar · `/verb-forms` VerbForms (N5-only) · `/kanji`
Kanji (stroke-order drawer, group modal) · `/counters` Counters (N5-only) ·
`/homophones` Homophones · `/settings` Settings · `/welcome` Landing (about
page, linked from the Sidebar logo).

### Self-Hosting
`Dockerfile` (multi-stage: `node:22-alpine` build → `nginx:1.27-alpine`
serve) + `docker-compose.yml` + `docker/nginx.conf` (SPA fallback, gzip,
cache headers matched to Vite's hashed-asset output). `docker compose up -d
--build`, port via `.env`'s `TORI_PORT` (default 8080). No server-side
data/volumes — all user data is per-browser `localStorage`, so there's
nothing to back up on the host beyond the repo itself. **Not yet build-tested
against a real Docker daemon** (none available in the dev sandbox that wrote
it) — validated by hand (path/config correctness against actual `dist/`
output) but worth watching the first real build for surprises.

---

## Known Gaps (not done, not forgotten)

- **N5 vocab `meanings.en`** — empty on all 1031 entries. Explicitly deferred
  twice by the user ("skip for now, do everything else"). Don't just do this
  unprompted — it's a large translation job, ask first.
- **N4 counters** — no source material exists; `/counters` stays N5-only.
- **N4 chapter numbers** — N4 vocab carries `category` (thematic section)
  only, no real textbook chapter (source isn't chaptered).
- **N4 `verbGroup`** — heuristic (pattern-based), not textbook-verified like
  N5's. Probably fine for casual use, not verified for a "conjugate this"
  drill.
- **Audio pronunciation**, **kanji stroke-count field**, **review history
  log / stats page**, **global search** — none built.
- **Remaining Hán Việt / radical-name long-tail gaps** — a handful of obscure
  characters/decomposition-components still have no name; UI already
  tolerates this (shows the bare character). Not worth chasing without a
  better reference source.
- **Docker self-host** — see note above, wants one real `docker compose up
  --build` on the actual Proxmox host to be considered fully verified.

---

## Gotchas (read before touching these areas)

- **`<Ruby text={x} html={xRuby}/>` ignores `text` entirely whenever `html`
  is set** (renders `html` via `dangerouslySetInnerHTML`). Any translation
  pass on ruby-marked-up data must translate the `*Ruby` sibling field too,
  or the translation has zero visible effect.
- **N5 chapter 15 and N4 chapter 15 are different chapters that collide on
  id** (`k15_g1..k15_gN` in both). Always key by `${src}-${id}` /
  `${src}:${id}` (`src: 'N5'|'N4'`) wherever N5 and N4 kanji chapters can
  appear together (`level === 'all'`), including SRS card ids in Review's
  kanji mode.
- **localStorage keys are `tori-settings` / `tori-vocab`** (not
  `kotodori-*`). The settings key was migrated forward once (old blob copied
  in `index.html`'s boot script); the vocab/SRS key was deliberately
  **not** migrated — it was intentionally reset when the SM-2 swap happened,
  so old FSRS-shaped cards are cleanly abandoned rather than corrupted.
- **々 and 込 are deliberately excluded** from `hanviet-dictionary.json` — 々
  is the iteration mark (not a real character, was once falsely resolved to
  a reading via coincidental syllable-count alignment); 込 is kokuji with no
  Chinese-origin reading. Don't re-add either without a real source.
- **Dark-theme borders**: use `border-structural` (theme-aware opacity), not
  raw `border-ink`, on any card/container border. `border-ink` (full
  opacity) is correct *only* on genuinely inverted surfaces (`bg-ink
  text-paper` — active nav/tabs/chips) or a few deliberate exceptions (e.g.
  InkCabinet's "selected" swatch ring, which should stand out regardless of
  theme). Getting this backwards makes borders blaze white on dark papers.
- **Tailwind v4 unlayered-CSS gotcha**: custom classes in `index.css` (like
  `.jp`) are unlayered and always beat `@layer utilities` classes (like
  `font-sans`) regardless of source order in a class string. If a `font-sans`
  override isn't working, check for a stray `.jp`/similar custom class first.
- **`h-screen`/`vh` vs `h-dvh`/`dvh`**: use the `d`-prefixed variants for
  anything that needs to actually fit the visible viewport on iOS Safari —
  plain `vh` includes the space behind the collapsible URL bar.

---

## File Map

```
tori/
  handoff.md              ← this file
  index.html               ← title, favicon, manifest link, apple-mobile-web-app
                              meta tags, viewport-fit=cover, boot script (theme
                              class + localStorage migration, runs pre-paint)
  Dockerfile / docker-compose.yml / docker/nginx.conf / .env.example
                            ← self-host (see Self-Hosting above)
  public/
    favicon.svg             ← brutalist card + bird (鳥) glyph
    apple-touch-icon.png, icon-192.png, icon-512.png, manifest.webmanifest
                            ← generated from favicon.svg for "Add to Home Screen"
  src/
    index.css               ← Tailwind v4 @theme, 9 paper themes as CSS custom
                               properties, iOS/touch fixes (16px input font on
                               mobile, tap-highlight, touch-action)
    types/index.ts           ← VocabEntry, GrammarPoint/Category, VerbGroup/Form(s),
                                HomophoneGroup, SRSCard (SM-2 shape), CounterCategory/
                                Row/Data, KanjiGroup/Word/Chapter, KanjiVg*, RadicalNamesData
    lib/
      srs.ts                 ← SM-2 scheduler
      japanese.ts / kanji.ts ← POS+reading helpers / On-Kun pill logic + hanviet index
      i18n.ts / useTranslation.ts
    store/
      vocab-store.ts         ← Zustand + persist ('tori-vocab') — SRS cards, streak,
                               level-aware get*/getStats via cross-store read
      settings-store.ts      ← Zustand + persist ('tori-settings') — lang, theme,
                               level, paper, density, typeSans
    data/
      vocab.ts, kanji.ts, grammar.ts  ← per-domain n5X/n4X/allX/XForLevel(level) helpers
      hanviet-dictionary.json         ← flat {char: Hán Việt reading}, 944 entries
      n5/  vocabulary.json, grammar.json + grammar-categories.json, verb-forms.json,
           kanji.json, kanjivg.json, radical-names.json, counters.json, homophones.json (unused)
      n4/  vocabulary.json, grammar.json + grammar-categories.json, kanji.json
    components/
      layout/   Layout.tsx (mobile drawer shell), Sidebar.tsx (drawer + safe-area)
      ui/       Button, Card, Furigana, Ruby, PosTag, LanguageSwitcher, LevelSwitcher,
                InkCabinet, Reveal, ScreenHeader (+ Watermark)
      kanji/    AnimatedKanjiSvg, KanjiDrawer, KanjiGroupModal
    pages/
      Dashboard, VocabBrowser, Review, Grammar, VerbForms, Kanji, Counters,
      Homophones, Settings, Landing
  scripts/                  ← one-off/re-runnable data-pipeline scripts, see
                               Data Pipeline Provenance below for what each does
```

---

## Data Pipeline Provenance (compressed)

How the data files actually got built, for when something looks wrong and
you need to know which script to re-run or distrust. Kept short — this is a
map, not the full story; read the named script's own header comments for
detail if you need to actually touch it.

- **N5 vocab** (`n5/vocabulary.json`): merged from a PDF extraction + a
  Dungmori markdown list, then went through three separate corruption-cleanup
  passes across earlier sessions (garbled kanji fields, `chapter: 0`
  stragglers, doubled kana, `U+FFFF` noncharacter codepoints baked into
  `meanings.vi`). All resolved; zero known corruption remaining as of now.
- **N5 kanji** (`n5/kanji.json`): built from a LaTeX source (`build-kanji.mjs`),
  then grown twice — a "chapter 15" of 9 missing-but-standard N5 anchors
  (`add-n5-supplement.mjs`), then an enrichment pass bringing every anchor
  toward ~7 words each via Jisho-grounded candidates (`fetch-enrichment-*`
  → `build-enrichment-draft.mjs` → `resolve-flagged.mjs` →
  `assemble-enrichment.mjs` → `merge-enrichment.mjs`), validated by an
  on/kun classifier (`onkun-classifier.mjs`, ~97.5% agreement against the
  hand-labeled corpus) rather than trusted blind.
- **N4 vocab** (`n4/vocabulary.json`): built from a different-shaped Dungmori
  markdown source with fused kanji+furigana strings (no separator between
  the kanji and its reading) — `split-n4-fused.mjs` is the parser, run via
  `build-n4-draft.mjs` → `assemble-n4-vocab.mjs`. POS/verbGroup assigned by
  pattern heuristic (no source data for this at all). Every override table
  in this pipeline is id-stability-guarded (validates against the exact
  source string it was written for, aborts on mismatch) after an earlier
  near-miss where a source-row shift would have silently mis-applied fixes
  to the wrong word.
- **N4 kanji** (`n4/kanji.json`): built from `N4_Grammar_and_Kanji_Summary-
  Final.md`'s tables (`scripts/n4-kanji-source.mjs` + `build-n4-kanji.mjs`),
  110 groups keyed one-per-anchor. `meaning.vi` was backfilled later by
  re-parsing the same source markdown directly (`backfill-n4-kanji-vi.mjs`).
- **KanjiVG stroke data** (`n5/kanjivg.json`): sources its character list
  from *all* app data (not just anchors), merge-safe to re-run. Currently
  covers every character used anywhere in the app.
- **Hán Việt dictionary**: built from `kanji.json`'s per-word readings
  (zipped against each word's kanji-only characters) plus a cached
  2136-character Jouyou reference table (`saroma-map.json`), extended
  several times as new characters were introduced (N5 enrichment, N4 vocab,
  N4 kanji). 944 entries currently; 々/込 deliberately excluded (see
  Gotchas).
- **Furigana Ruby HTML** (`*Ruby` fields on grammar/verb-forms): generated
  build-time via `kuroshiro`+`kuromoji`, hand-corrected for known analyzer
  misreadings. Neither package is an active runtime dependency — this was a
  one-time generation step, not a live pipeline.
- **Translations** (`meaning.en`/`meanings.en` fields across grammar,
  kanji, counters, verb-forms — everywhere except N5 vocab): hand-translated
  via positional (not id-keyed) scripts, each paired with a hard-fail
  validation script that checks length/anchor-set match before writing —
  this pattern replaced an earlier id-keyed approach after an id-alignment
  bug was found in the N4 vocab translation pass (gapped ids from dropped
  rows silently drifted a naive "row N = id n4_{N}" mapping).

For deeper detail on any specific pipeline (exact bug counts, script-by-script
order, classifier accuracy numbers), check git history/blame on the relevant
`scripts/*.mjs` file — the scripts themselves have the full reasoning in their
header comments.
