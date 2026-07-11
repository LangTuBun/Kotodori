# KOTODORI — Build Status

> Japanese JLPT N5 personal learning platform  
> Stack: React 19 + Vite 8 + TypeScript + Tailwind CSS v4 + React Router v7 + Zustand

---

## What's Done

### Data Pipeline
- [x] Extracted ~964 vocab entries from `vocab_n5.pdf` via PyMuPDF
- [x] Merged ~152 additional unique entries from `TuVung_N5_DungMori.md`
- [x] **1116 total VocabEntry** objects with: kanji, kana, meanings.vi, POS, verbGroup, adjType, chapter (1–14), homophones[], examples[]
- [x] **New `kanji.json`** — parsed programmatically (`scripts/build-kanji.mjs`, Node) out of `kanjis.tex` (the user's own 14-chapter LaTeX kanji tables, one `longtable` per chapter, columns: 漢字/kana/Hán Việt/nghĩa/On-Kun). 425 words → **170 "leading kanji" groups** across 14 chapters. Grouping algorithm: walk rows in source order; a row joins the current group if it contains the current anchor kanji character; otherwise close the group and open a new one anchored on whichever kanji the row shares with the *next* row (falls back to the row's own first kanji if no overlap) — this correctly threads e.g. 切手/歌手 into the 手 group (anchor isn't the word's first character) and reproduces the source's own pedagogical clustering (e.g. 三百/六百/八百 cluster under 百, not under the number). Validated against advisor-flagged discriminating cases (Ch2 火 group, Ch8 手 group) before building the UI. One kana typo fixed during parsing (しんぶん社 → しんぶんしゃ).
- [x] **`scripts/add-readings.mjs`** — enriches `kanji.json` with real On'yomi/Kun'yomi kana readings (e.g. 多 → On タ, Kun おお.い/まさ.に/まさ.る) fetched from the public `kanjiapi.dev` API, one call per unique anchor kanji (158 total). Run after `build-kanji.mjs` any time the tex source changes.
- [x] **Vocabulary expansion for sparse groups (93 groups, 219 new words)** — groups that only had 1-2 words (e.g. singleton kanji like 秋/氷/雨/暗/耳) backfilled to 4-6 words each. Pipeline: `scripts/fetch-candidates.mjs` pulls real candidate words + readings + JLPT level from the Jisho API (grounds word/reading in a real dictionary, not invented); `scripts/vocab-additions.mjs` is a hand-curated selection from those candidates with Hán Việt + Vietnamese meaning + On/Kun classification supplied by the agent (no automated source exists for Hán Việt); `scripts/merge-additions.mjs` applies them into `kanji.json`, tagging each with `curated: true` and sanity-checking onkun-token-count vs kanji-char-count. Curated words render with a small yellow dot marker in the UI (tooltip: "Từ bổ sung thêm") so they're visually distinguishable from the original textbook words — **flagged for user spot-check**, since Hán Việt/meaning correctness for these 219 words isn't cross-verified against a second source the way the original 425 textbook-sourced words implicitly are. This was a scoped pilot (sparse groups only, per user's choice); the remaining ~65 groups with 3+ words were left alone, and ~65 of the 93 backfilled groups still land at 3-5 words (a few kanji like 耳 genuinely don't have many common N5-level compounds).
- [x] **Rebuilt `grammar.json` from scratch (135 GrammarPoint entries)** — parsed programmatically out of `ngu-phap-N5-tong-hop.md` (the user's own cleaned-up summary doc), replacing the old 96-entry PDF-extracted version. Grouped into **14 categories (I–XIV)** tracked in `grammar-categories.json` (roman numeral, slug, title, count, plus the doc's review tips)
- [x] **New `verb-forms.json`** — hand-built from `The_dong_tu.md`: 3 verb groups (Godan/Ichidan/Irregular) × 8 conjugation forms (dictionary, ない, た, て, potential, potential-past, volitional, ば), each with per-group rules, worked examples, sentence examples, and exceptions, plus a condensed cheat-sheet table
- [x] Auto-detected **homophone groups** from vocab (identical kana → 14 groups in JSON)
- [x] All data lives in `src/data/n5/` as UTF-8 JSON — no backend needed
- [x] **`scripts/add-chapters.mjs`** — backfills the `chapter` field on `vocabulary.json` entries from the "Chương" column added to `../TuVung_N5_DungMori.md`. The MD word column mixes three formats (`Kanji (kana)`, fused kanji+furigana with no separator, pure kana) so rather than re-deriving kanji/kana splits from ambiguous fused text, it matches each MD row to an existing entry via a kanji-only "skeleton" key (invariant to furigana-grouping/okurigana placement) + reading/meaning as tie-breakers, and only fills entries that were still `chapter: 0` (never overwrites an existing non-zero chapter, even when MD suggests a different one — logged as a "mismatch" instead, since a word can legitimately reappear across chapters). Result: 152 → 68 remaining `chapter: 0` entries; of those 68, 56 turned out to be the pre-existing corrupted entries noted below (couldn't confidently match on top of already being malformed).

### Core Infrastructure
- [x] Vite config with `@tailwindcss/vite` plugin and `@` path alias
- [x] Tailwind v4 `@theme` tokens: ink, paper, yellow, red, green, blue, surface, muted
- [x] Custom `@utility border-3` / `border-{side}-3` (not in Tailwind v4 defaults)
- [x] Fonts: Space Grotesk (UI) + Noto Sans JP (Japanese) via `index.html` `<link>`
- [x] TypeScript types: `VocabEntry`, `GrammarPoint`, `GrammarCategory`, `VerbGroup`, `VerbForm`, `VerbFormsData`, `HomophoneGroup`, `SRSCard`, `SRSState`
- [x] FSRS-inspired SRS algorithm in `src/lib/srs.ts` (stability × difficulty → interval, 4 ratings)
- [x] Zustand store with `persist` middleware (localStorage key: `kotodori-vocab`) — streak, cards, totalReviewed
- [x] **Furigana data pipeline (build-time only, not shipped to the app)** — used `kuroshiro` + `kuromoji` (Node-side) to batch-generate per-kanji `<ruby>` HTML for every grammar pattern/example and verb-form field, stored as sibling `*Ruby` fields (`patternRuby`, `jaRuby`, `titleJaRuby`, etc.) alongside the original plain-text fields (kept for search). Hand-corrected known analyzer mistakes (形 read がた/かたち instead of けい in technical form names; 何の read なにの instead of idiomatic なんの)

### UI Components
- [x] `Button` — brutalist, 6 variants (primary / secondary / yellow / red / green / ghost), 3 sizes, hover lift + active press
- [x] `Card` — brutalist, optional colored accent border/shadow, clickable hover lift
- [x] `Furigana` — **rewritten**: splits `kanji` into alternating kanji/non-kanji runs and aligns each kanji run against only its matching slice of `kana`, so `<rt>` attaches strictly to the kanji (e.g. `（～を）描[か]きます` — the auxiliary note and okurigana stay outside the ruby). Falls back to a plain span when there's no kanji or no kana given
- [x] `Ruby` — renders pre-generated furigana HTML (the `kuroshiro`-produced `*Ruby` fields) via `dangerouslySetInnerHTML`, with a plain-text fallback
- [x] `PosTag` — colored badge per POS (verb=blue, adj=green, noun=yellow, adverb=red…)
- [x] `Sidebar` — fixed 256px, JP+EN nav labels (now with furigana, e.g. 動詞の形どうしのかたち), streak badge, due-card alert, mini stats grid
- [x] `Layout` — Sidebar + `<Outlet />` via React Router nested routes

### Pages
- [x] **Dashboard** (`/`) — streak, stats row (total/mastered/reviewed), due/new/grammar queue cards, N5 progress bar, SRS breakdown, furigana'd greeting heading (今日きょうも頑張がんばろう)
- [x] **Vocabulary Browser** (`/vocab`) — searchable list with chapter + POS filters, side detail panel with furigana + SRS rating buttons + examples + homophones (homophone chips now furigana'd too). List is **grouped and sorted by chapter** (sticky "Chương N" header per group, ascending; any still-unmatched `chapter: 0` entries collect in a trailing "Chưa rõ chương" group instead of being silently scattered)
- [x] **Review** (`/review`) — setup screen before every session (chip filters for chapter 1–14, and for vocab mode a POS/"category" filter; count presets 10/20/30/50/all; live "N due · M in scope · will review K" summary), then the flashcard session, then a done screen with an "Ôn tiếp" button that returns to setup (filters preserved) rather than blindly restarting the same queue. Two modes sharing the same setup shell: **Vocabulary** (unchanged card behavior: tap-to-flip, AGAIN/HARD/GOOD/EASY rating; furigana shown on the front for `meaning`-type cards but deliberately withheld for `reading`-type cards so it doesn't give away the answer) and **Kanji** (**reworked from group-level to word-level** — each flashcard is now one `KanjiWord` from a leading-kanji group's `words[]`, not the anchor kanji alone: front shows the full word with small furigana above via `<Furigana>`'s native `<rt>` sizing, back reveals Hán Việt/On-Kun tag/meaning plus a "Từ cùng nhóm" list of sibling words in the same kanji family for context — real example sentences aren't used because `vocabulary.json`'s `examples[]` is empty for all 1116 entries app-wide, a pre-existing data gap, not something this feature could fabricate around). Queue selection prioritizes due cards, then new, then already-scheduled-but-not-due cards from the chosen scope, sliced to the requested count and shuffled for display order. `×` button mid-session bails back to setup without losing progress already rated. **Anki-style keyboard shortcuts**: Space flips the card (shown as a "(Space)" hint on the button), then 1/2/3/4 trigger Again/Hard/Good/Easy while the answer is showing — only one of the two is ever live at a time, since the rating buttons don't exist pre-flip. Guarded against firing while `document.activeElement` is an input/textarea/contenteditable; pressing a key flashes the matching button with the same pressed-state styling as a real click (`shadow-none`/translate) for 150ms before the card advances/flips, so the feedback is visible — mouse clicks still act instantly, only the keyboard path adds the flash delay. Extracted `cleanReadings`/`onkunTone` out of `Kanji.tsx` into `src/lib/kanji.ts` so both pages share the same On/Kun-pill logic. Store gained generic `getDueCardsFor`/`getNewCardsFor`/`getScheduledCardsFor(ids)` helpers (scope-aware, used by both modes) alongside the original global `getDueCards`/`getNewCards` used by Dashboard/Sidebar. Note: kanji-word SRS cards are keyed `${group.id}::w${wordIndex}` in the same `cards` map as vocab (no collision with `n5_XXXX` ids) but aren't counted in the Sidebar "due" badge or Dashboard stats tiles, which still scan `vocabulary.json` only; they do count toward `totalReviewed`.
- [x] **Grammar** (`/grammar`) — categorized, collapsible card grid grouped by the 14 roman-numeral categories (color-coded accents), category filter chips + free-text search, hover preview tooltip on each card (first example), click-to-pin detail drawer with full pattern/meaning/examples, "Mẹo ôn tập" tips toggle. **Added**: a "Lọc theo thể động từ" pill-filter row (same square-chip brutalist style as the category chips, active state `bg-blue text-paper`) that filters the grid to grammar points whose `requiredVerbForm[]` includes the selected conjugation form, with a fade-in transition on the results grid keyed by `cat|verbForm|search`; matching cards get small square corner badges (`border-ink bg-blue text-paper`) naming their required form(s). Reads `?point=<id>` on mount (via `useSearchParams`) to auto-open that point's detail drawer and expand its category — the landing side of the Verb Forms deep link below — then strips the param.
- [x] **Verb Forms** (`/verb-forms`) — verb-group overview (Godan/Ichidan/Irregular with sample words), tab navigator across all 8 conjugation forms, per-group conjugation rules, worked examples, sentence examples, exceptions, and a condensed cheat-sheet table. **Added**: a "Ngữ pháp áp dụng" horizontal-scroll row of brutalist mini cards (`border-3 border-ink`, blue left accent, hover lift — matching the page's existing "rules per group" card style) under each form's detail, listing grammar points tagged with that form (via `requiredVerbForm`); each card's arrow navigates to `/grammar?point=<id>` to open full detail. See `scripts/tag-verb-forms.mjs` below for how the tagging was derived — 43/135 grammar points matched (the rest are noun/adjective/particle grammar, or masu-form patterns, which don't map onto the 8 tracked forms and are intentionally left untagged rather than guessed).
- [x] **Homophones** (`/homophones`) — **expanded pool + fixed normalizer**. Pool now merges `vocabulary.json` with `kanji.json`'s per-group `words[]` (deduped by kanji+kana, filtered for source-data placeholders like empty-bracket or bare-dash kanji fields) — vocabulary.json alone is too sparse for whole-word exact-string reading collisions to surface much (only ~15 real groups); pulling in kanji.json's supplementary words nearly doubles that. Also **fixed two real bugs** found while investigating a user-reported undercount: (1) the old `おう→おお`/`えい→ええ` long-vowel folding could fire across an accidental cross-boundary seam — e.g. いえ+いえ (`いえいえ`, "no sweat") has an え|い seam that got folded onto 家/いいえ (`いえ`), a false match; dropped that substitution (N5 dictionary kana already spell long vowels consistently, so it wasn't catching any real variant-spelling case) and kept only same-character doubled-vowel collapse (あ/い/う/え/お runs — not consonant kana, so いつつ ≠ いつ stays correctly distinct). (2) note-variant duplicates of the *same* word — e.g. `(メモを)取る` vs `(コピーを)取る`, or `～時間` vs `時間` — were being counted as separate "homophones"; added a `coreKanji()` step that strips bracketed usage-notes and a leading ～/∼ prefix before comparing identity, so only genuinely distinct kanji forms count. Net: 21 (partly-bogus) groups → 24 clean groups (16 exact + 8 sound-alike), all pedagogically real pairs (紙/髪, 鼻/花, います/言います, 好き/スキー…). Synthesized kanji.json-sourced entries get a full `VocabEntry` shape (stable `kj_<kanji>_<kana>` id, `pos:'unknown'`, empty examples) so `PosTag`/React keys behave like real vocab. Still split into "Exact homophones" + "Sound-alikes" sections with reveal challenge mode.
- [x] **Kanji** (`/kanji`) — chapter chips (1–14 + "Tất cả") + search, grid of "leading kanji" group cards (see Data Pipeline above). Card header: big anchor kanji, Hán Việt badge, and real On'yomi (blue pills)/Kun'yomi (green pills) kana readings from `kanjiapi.dev` — capped at 4 shown per type with a "+N" overflow indicator (some kanji like 上/下 have a dozen+ okurigana variants). Below the header: every word containing that kanji, listed with live `Furigana` (per-word real kana, no kuroshiro needed), meaning, Hán Việt, and a per-word On/Kun-colored tag (green=Kun, blue=On, gray=mixed, purple=Juku/Ate). Words still carry a `curated: true` data flag for the AI-added ones (see Data Pipeline above) but there's no UI marker for it per user request — it's available if a review view is added later.
- [x] **Counters** (`/counters`) — **new page**: renders `src/data/n5/counters.json` (hand-transcribed from the user's `Cach_dem_tieng_Nhat.md`, one level above `kotodori/`) as a Bento grid of brutalist cards — `border-3 border-ink`, hard offset shadow, rotating yellow/blue/red/green left-accent border (same pattern as the Kanji page's group cards) — each rendering a reusable `<CounterTable>` off a `columns[]` spec so irregular sections (e.g. 本/枚/台/冊, which skip numbers with sound-change gaps) don't need a fixed column count. Question-word rows (何人, いくつ, いくら…) get a `bg-yellow/20` row highlight with bold green kanji/meaning cells. Basic-numbers table spans the full grid width; a separate "Ví dụ thực tế ghép số lớn" block below the grid (yellow info panel, same style as the Verb Forms sentence-example box) holds the doc's large-number compound examples. (An earlier pass styled this page — plus the Verb Forms/Grammar linkage below — in a separate dark "Kanagawa" palette per an early iteration of this spec; reverted to brutalist after user feedback that it didn't match the rest of the app. `src/lib/kanagawa.ts` was deleted.)

### Design
- [x] Brutalism: 3px solid borders, 3–6px offset box-shadows, hover lift (`-translate-x-0.5 -translate-y-0.5`), active press
- [x] High-contrast palette on paper (#fafaf7) background
- [x] No emojis or pictographic symbols anywhere (audited and stripped: ▲ ★ ✕ ✓ ⚠ 📌 ⭐) — only plain typographic marks (×, •, +/−)
- [x] Furigana correctly scoped app-wide: attached per-kanji (not per-phrase) everywhere kanji appears — vocab words, nav labels, logo, dashboard heading, homophone chips, grammar patterns/examples, verb-form titles/rules/examples

---

## What's NOT Done (Further Plan)

### High Priority
- [ ] **Audio pronunciation** — hook up Web Speech API or a free TTS (e.g. `speechSynthesis` with `ja-JP` voice) on word cards and review — one button to hear the word
- [ ] **Kanji stroke count / stroke order** — neither `/kanji` nor the vocab detail panel has this (kanjis.tex has no stroke data); could enrich from `kanjiapi.dev` or link to jisho.org
- [ ] **Dexie.js / IndexedDB** — currently SRS data is in localStorage via Zustand persist; with 1100+ cards, localStorage is fine now but Dexie gives more headroom and query flexibility if review history logging is added
- [ ] **Review history log** — record each review event (timestamp, rating, card) so the dashboard can show a heatmap / accuracy chart

### Medium Priority
- [ ] **Stats / Analytics page** (`/stats`) — daily review counts, accuracy per POS, retention curve, weak-word list, streak calendar heatmap
- [ ] **Vocab detail as full page** (`/vocab/:id`) — currently a side panel; a dedicated page gives more room for stroke order, full example sentences, audio, related words
- [ ] **Grammar examples with vocab links** — clickable words inside grammar examples that open the matching VocabEntry
- [ ] **Search across all sections** — global search bar (⌘K command palette style) that finds vocab, grammar, and homophones simultaneously
- [ ] **Chapter view** — browse vocab strictly by chapter (1–14) with progress per chapter shown as a fill bar

### Low Priority / Nice to Have
- [ ] **Dark mode** — toggle stored in Zustand; Tailwind `dark:` variants already supported
- [ ] **Furigana toggle** — hide/show furigana globally (good for intermediate practice)
- [ ] **Export progress** — download SRS state as JSON for backup; import to restore
- [ ] **Knowledge graph visualization** — originally planned; a force-directed graph showing vocab → grammar → homophone relationships (would need a library like `react-force-graph` or `d3`)
- [ ] **N4 expansion** — data pipeline already generalized; adding a new JLPT level is mostly a data task

---

## Known Issues / Tech Debt
- Vocab meanings are Vietnamese only (`meanings.vi`); `meanings.en` field exists but is empty — could fill from a free dictionary API
- `pos: 'unknown'` on 152 MD-sourced entries (POS not in source file)
- **`chapter: 0` on 68 remaining MD-sourced entries** (down from 152 — see `scripts/add-chapters.mjs` below). Of those 68, **56 have visibly corrupted `kanji`/`kana` fields** from the original (pre-repo) MD ingestion, e.g. `n5_0974`: `kanji: "（～）出"`, `kana: "をでる"` — the real word is `出る`/`でる`, but the parser that first split "（～を）出でる" (particle-note + fused kanji/furigana) put the split point in the wrong place. This is a distinct, pre-existing bug from a different class of entries than the single `n5_1051` duplicate noted below — worth a dedicated cleanup pass since it affects ~56 verb/adjective entries, not yet done.
- **One duplicate/malformed vocab entry**: `id: n5_1051` (`kanji: "（～）描"`, `kana: "をかきます"`) is a corrupted duplicate of `n5_0652` (`（～を）描きます` / `かきます`, "vẽ"). Should be deleted.
- SRS cards stored by vocabId only (one card per word); originally designed for multi-type cards (word / reading / meaning) but not yet implemented
- **~17 `vocabulary.json` entries have a corrupted `kana` field** — a doubled/concatenated reading instead of the plain one (e.g. 名前 → `おなまえなまえ` instead of `なまえ`; 仕事 → `しごとおしごと` instead of `しごと`). Pre-existing PDF-extraction artifact, surfaced while testing the furigana alignment fix, not yet cleaned up.
- `verb-forms.json` furigana overrides (形→けい, 何の→なんの, 来られる→こられる) were hand-corrected for the specific strings hit during generation — if new verb-form content is added later, re-run the `kuroshiro` annotation script and re-check for the same class of misreadings
- **[Fixed] 72 `meanings.vi` entries had missing spaces** (another PDF-extraction artifact, e.g. `n5_0057`: `"chữhiragana"` instead of `"chữ hiragana"`) — found by scanning for long no-space tokens and for common Vietnamese connector words glued onto a preceding word, hand-verified against full field context, applied via `scripts/fix-glued-meanings.mjs` (kept for reference/re-audit; not meant to be re-run since vocabulary.json is now fixed). Two related-but-separate issues surfaced during that same audit and were **left alone** (out of scope — no source text to recover a correct fix from): (1) a handful of entries are genuinely **truncated mid-sentence** in `meanings.vi`, e.g. `n5_0711`: `"xin lỗi đã để anh/chị/bạn chờ (lưu"` just stops — spacing was fixed within the existing text but the sentence itself is incomplete; (2) a few entries contain **`￿` placeholder characters** (e.g. `n5_0941`, `n5_0126`, `n5_0356`, `n5_0675`, `n5_0632`, `n5_0701`) where the source PDF extraction lost a glyph (likely a Japanese character or symbol) — both would need the original PDF/MD to fix properly, not a re-run of the spacing script.

---

## File Map

```
kotodori/
  index.html                  ← Google Fonts <link> lives here
  src/
    index.css                 ← Tailwind v4 @theme + @utility border-3
    App.tsx                   ← BrowserRouter + Routes
    main.tsx
    types/index.ts            ← VocabEntry, GrammarPoint (incl. requiredVerbForm),
                                 GrammarCategory, VerbGroup, VerbForm, VerbFormsData,
                                 HomophoneGroup, SRSCard, CounterCategory/CounterRow/CountersData
    lib/
      srs.ts                  ← FSRS-inspired scheduler
      japanese.ts             ← hasKanji, getPosLabel, getPosColor, formatReading
      kanji.ts                ← cleanReadings, onkunTone (shared by Kanji.tsx + Review.tsx)
    store/
      vocab-store.ts          ← Zustand + persist: cards, streak, reviewCard, getStats,
                                 getDueCardsFor/getNewCardsFor/getScheduledCardsFor(ids)
    data/n5/
      vocabulary.json         ← 1116 entries
      grammar.json            ← 135 points (rebuilt from ngu-phap-N5-tong-hop.md), each with
                                 patternRuby / examples[].jaRuby furigana HTML, requiredVerbForm[]
      grammar-categories.json ← 14 roman-numeral categories (I–XIV) + review tips
      verb-forms.json         ← 3 groups × 8 conjugation forms + cheat sheet, with
                                 *Ruby furigana fields throughout
      homophones.json         ← 14 groups (exact matches); currently unused —
                                 Homophones.tsx computes groups live from vocabulary.json
      kanji.json               ← 170 leading-kanji groups / 425 words across 14 chapters,
                                 built by scripts/build-kanji.mjs from ../kanjis.tex
      counters.json            ← 9 counter categories, hand-transcribed from
                                 ../Cach_dem_tieng_Nhat.md
    components/
      layout/
        Layout.tsx            ← Sidebar + Outlet
        Sidebar.tsx           ← nav (furigana'd labels), streak, due alert, stats
      ui/
        Button.tsx
        Card.tsx
        Furigana.tsx          ← per-run kanji/kana alignment (kanji+okurigana pairs)
        Ruby.tsx               ← renders pre-generated furigana HTML (kuroshiro output)
        PosTag.tsx
    pages/
      Dashboard.tsx
      VocabBrowser.tsx
      Review.tsx              ← setup screen + vocab/kanji-word flashcard session +
                                 1/2/3/4 keyboard shortcuts (see Pages above)
      Grammar.tsx             ← categorized card grid, hover preview, detail drawer,
                                 verb-form pill filter + badges, ?point= deep link
      VerbForms.tsx           ← conjugation-form tab navigator + related-grammar mini bento
      Kanji.tsx               ← chapter chips + leading-kanji group card grid
      Counters.tsx            ← new: Bento grid of Kanagawa CounterTable cards
      Homophones.tsx
  scripts/
    build-kanji.mjs           ← parses kanjis.tex -> src/data/n5/kanji.json (rerun after
                                 editing kanjis.tex)
    add-readings.mjs          ← fetches On/Kun kana readings from kanjiapi.dev into
                                 kanji.json (run after build-kanji.mjs)
    fetch-candidates.mjs      ← pulls real candidate words/readings/JLPT level from
                                 Jisho for sparse (<=2 word) kanji groups
    vocab-additions.mjs       ← hand-curated word selections (Han Viet + meaning +
                                 On/Kun) for the sparse groups, keyed by group id
    merge-additions.mjs       ← applies vocab-additions.mjs into kanji.json,
                                 tags new words `curated: true`
    add-chapters.mjs          ← backfills vocabulary.json chapter field from
                                 ../TuVung_N5_DungMori.md's "Chương" column
    tag-verb-forms.mjs        ← hand-curated id -> requiredVerbForm[] mapping (derived by
                                 reading every pattern for an explicit conjugation marker,
                                 since tags/relatedGrammar are empty for all 135 entries);
                                 applies into grammar.json. Re-run after grammar.json is
                                 rebuilt from the source doc; re-verify the mapping by hand
                                 since it's tied to the exact g_### ids in the current file.
    fix-glued-meanings.mjs    ← one-time fix for 72 missing-space bugs in vocabulary.json's
                                 meanings.vi (exact-match id -> [old, new] pairs); already
                                 applied and vocabulary.json committed with the fix — kept
                                 for reference, not meant to be re-run.
```
