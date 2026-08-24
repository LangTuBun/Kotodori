# TORI — Build Status

> Japanese JLPT N5 + N4 personal learning platform (renamed from Kotodori this session)
> Stack: React 19 + Vite 8 + TypeScript + Tailwind CSS v4 + React Router v7 + Zustand

---

## Session: Dark-theme border audit (most recent)

The Chrome extension reconnected after the batch below was written, so the
"no live browser verification" caveat that used to sit here no longer applies
-- watermarks and the localization work were checked live in Gold and confirmed
correct (see the "Final migration & polish batch" section right below).

Separately, a border-token migration (`--tori-structural`/`border-structural`,
replacing raw `border-ink` on structural card/container borders so they don't
blaze full-opacity cream/white on dark papers) had **already been done** in the
original Tori-rebrand session -- `index.css`'s tokens and `Card.tsx`/
`Button.tsx`/`Sidebar.tsx`/`Dashboard.tsx`/`Grammar.tsx`/`Kanji.tsx`/
`Review.tsx`/`VocabBrowser.tsx` already used it before this pass started. A
second report (from what looked like a separate/duplicate session, pasted into
chat) claimed to have just done that exact migration across those same 8
files -- checked byte-for-byte against disk and `git status`, and none of it
was new; the files matched what was already committed. Worth knowing that
report wasn't describing real new work.

What *was* real: even the "already migrated" files had gaps (Grammar.tsx's
`STUDY TIPS` button and hover-preview shadow), and several pages were never
touched by that original pass at all -- `VerbForms.tsx` (11 instances, entirely
unmigrated), `Counters.tsx` (9, entirely unmigrated), `Homophones.tsx` (8),
`KanjiGroupModal.tsx` (7), `InkCabinet.tsx` (6 of 8 -- the swatch-picker's own
"selected" ring deliberately kept `border-ink`, see below), `LevelSwitcher.tsx`
+ `LanguageSwitcher.tsx` (rendered in the Sidebar header on every page),
`PosTag.tsx` (rendered on nearly every word/vocab card app-wide), `Landing.tsx`
footer, and more gaps in `Review.tsx`/`VocabBrowser.tsx` beyond what the first
pass covered. Caught by loading Gold theme live and zooming into a cheat-sheet
table on `/verb-forms` that had an obviously bright white border where every
other border on the page was correctly muted -- then grepped the whole `src`
tree for `border-ink[^/]` and `shadow-[...var(--color-ink)...]` and fixed every
real hit, file by file, verified in the browser after.

**Rule applied throughout**: `border-ink` (full ink, no opacity modifier) stays
correct only when the surface is genuinely inverted (`bg-ink text-paper`) --
active nav items, active filter chips, selected tab/mode buttons, the cheat-
sheet's own header row. Everywhere else (plain `bg-paper`/`bg-surface`/accent-
tinted structural cards) it became `border-structural`, and any
`shadow-[Npx_Npx_0px_var(--color-ink)]` alongside it became `var(--shadow-brutal)`
/ `var(--shadow-brutal-hover)`. Existing `border-ink/NN` (already-dimmed via a
Tailwind opacity suffix, e.g. `border-ink/15`, `border-ink/20`) was left alone
-- that's a pre-existing, working pattern for subtle dividers, not the "blazing
neon strip" bug. One deliberate exception: `InkCabinet.tsx`'s paper-swatch
"currently selected" ring stays full `border-ink` even though its background
isn't inverted -- a selection indicator's job is to stand out regardless of
theme (same reasoning as the app's `:focus-visible` outline always using the
accent color), and dimming it to `border-structural` would make it barely
distinguishable from the unselected `border-ink/20` swatches, actively making
the picker harder to use.

Also fixed in passing: `Kanji.tsx`'s chapter-label chip read `Ch.N5 1` (no
space) instead of `Ch. N5 1` -- a hardcoded `Ch.{chapterLabel}` string, unrelated
to this bug class, noticed while zoomed in on an unrelated screenshot.

Files touched this pass: `VerbForms.tsx`, `Counters.tsx`, `Homophones.tsx`,
`KanjiGroupModal.tsx`, `InkCabinet.tsx`, `LevelSwitcher.tsx`,
`LanguageSwitcher.tsx`, `PosTag.tsx`, `Landing.tsx`, `Grammar.tsx`, `Review.tsx`,
`VocabBrowser.tsx`, `Kanji.tsx` (label fix only). `npm run build` green
throughout; `oxlint` shows only the same pre-existing warnings from before this
pass. Live-verified in Gold across Dashboard, VocabBrowser, Review (setup +
detail drawer), Grammar (list + category-title localization + detail drawer),
Kanji (N5/N4/all + group modal + chapter-15 collision labels), VerbForms
(cheat sheet + key exceptions), Counters, Homophones (list + challenge mode),
and Settings (InkCabinet full mode). Not separately re-checked on the other 8
themes -- Gold was the one flagged as broken, and the fix is a single shared
CSS token, so the other 3 dark themes (Dusk/Ink/Indigo) should benefit
identically, but that's inference, not a screenshot.

---

## Session: Final migration & polish batch

Executed the "Tori App — Final Migration & Polish" plan. `npm run build` is green
throughout.

- **Font-mixing bug fixed**: `index.css`'s font strategy was inverted from
  "Zen first, Be Vietnam Pro fallback" (per-glyph mixing whenever Vietnamese
  and Japanese shared a line) to `--font-sans` (Be Vietnam Pro, handles VI
  diacritics natively) as the default body font everywhere, with `--font-jp`
  (Zen) reserved for `.jp`-tagged elements only. Swept every `.jp` call site
  app-wide to confirm none wrap non-Japanese text; found and fixed one
  (`Landing.tsx`'s English tagline had a stray `jp` class that was silently
  winning over a `font-sans` override, because Tailwind v4 utilities live in
  `@layer utilities` and unlayered custom CSS like `.jp` always beats layered
  utilities regardless of source order).
- **`GrammarCategory.title` + grammar `tips` localized**: was a plain
  `string` (the one field in `grammar-categories.json` that never got the
  `{vi,en}` treatment) -- broken in *both* directions, since N5's 14 titles/
  4 tips were Vietnamese-only and N4's 10 titles/5 tips (authored this
  session) were English-only. Schema-changed to `{vi,en}`, translated both
  directions, updated all 4 render sites in `Grammar.tsx`.
- **`verb-forms.json` + `Counters.tsx`/`counters.json` fully localized** to
  `{vi,en}`: groups, forms, rules, sentence examples, exceptions, cheat
  sheet, key exceptions (verb-forms) and title/intro/category
  title-shortTitle-usage-footnote/row meaning-note/big-number examples
  (counters). verb-forms.json was the harder of the two: most of its fields
  render through `<Ruby text={x} html={xRuby}/>`, which renders `html`
  verbatim via `dangerouslySetInnerHTML` and **ignores `text` entirely**
  whenever `html` is set -- so translating only the plain field would have
  had zero visible effect wherever a `*Ruby` sibling existed. Every such
  sibling got its own EN translation too (`scripts/localize-verb-forms.mjs`),
  with the embedded `<ruby>` tags (language-neutral Japanese conjugation
  examples) left byte-identical between languages. `VerbGroupSample.vi` and
  `VerbFormSentenceExample.vi` were renamed to `meaning: {vi,en}` (a field
  literally named `vi` whose value became `{vi,en}` would have been
  confusing). See `scripts/localize-counters.mjs` for the simpler,
  non-Ruby-coupled counters.json pass.
- **`hanviet-dictionary.json` backfilled** (16 new entries, 928→944):
  9 N4 characters (嘘 咳 掛 叶 淹 甥 姪 叱 剥) + 7 remaining N5 gaps
  (雀 檎 鹸 垣 丼 碗 瓜). **Deliberately did NOT add** 々 or 込 despite the
  plan listing both -- both were already investigated and excluded on
  purpose in an earlier session (々 is the iteration mark, not a real
  character, and was once falsely resolved to "Thiểu"; 込 is kokuji with no
  Chinese-origin reading to assign). Re-adding them would have reintroduced
  an already-fixed bug. Readings sourced from `scripts/saroma-map.json`
  where present (掛/垣/丼 confirmed that way) and hand-supplied from
  Sino-Vietnamese phonetic-series knowledge otherwise -- 甥 ("Sanh") and 檎
  ("Cầm") are flagged lower-confidence in the script's own comments.
- **N4 kanji `meaning.vi` backfilled** (110 groups / 268 words, was `""`
  throughout). Re-parsed `../../N4_Grammar_and_Kanji_Summary-Final.md`'s
  original markdown table directly (`scripts/backfill-n4-kanji-vi.mjs`) --
  110 rows in the source, matched 1:1 against `n4/kanji.json`'s 110 groups
  by anchor character (all 110 anchors confirmed unique first), with each
  word matched within its group by kanji+kana pair. Hard-fails on any
  unmatched group/word or on clobbering an already-non-empty `meaning.vi`;
  ran clean on the first attempt, all 110+268 matched.
- **Watermarks added to the 4 two-pane pages** that skipped them last
  session (`VocabBrowser` 語, `Grammar` 法, `Kanji` 字, `Review` 復) by
  wrapping each page's left/main panel in `relative overflow-hidden` and
  reusing the existing `Watermark` component. **Grammar deliberately uses 法
  instead of the plan's suggested 文** -- `Grammar.tsx`'s empty-state right
  panel (nothing selected) already shows a giant 文; using it again for the
  toolbar watermark would double up whenever nothing's selected. 法 pairs
  with the existing 文 to spell 文法 (bunpou, "grammar"). **Not visually
  verified** -- see the top-of-section note.
- **N4 kanji review mode enabled** in `Review.tsx` (previously hard-gated
  `N5`-only). The real risk here, flagged before writing any code: N5's
  chapter 15 ("N5 supplement") and N4's chapter 15 (Bai 15) both use the
  identical `k15_g1..k15_gN` group-id scheme (8 real collisions, confirmed
  by set-intersecting both files' group ids) -- Kanji.tsx already worked
  around this at the UI layer with `${src}-${id}` keys, but kanji-mode SRS
  review card ids (`${group.id}::w${wordIndex}`) would have inherited the
  same collision the moment N4 became reachable. Fixed by tagging every
  kanji chapter with its source level (`taggedKanjiChapters(level)`) and
  keying review cards `${src}:${group.id}::w${wordIndex}`. **This changes
  every existing kanji-mode card id** -- acceptable only because it landed
  in the same batch as the SM-2 reset below (see there for why that's fine).
  Removed the now-dead `kanjiModeAvailable`/N5-only gating UI.
- **SRS algorithm swapped from FSRS-inspired to classic SM-2** (`srs.ts`,
  `SRSCard` type, `vocab-store.ts`). The plan called this "switching back to
  SM-2," but the app never had SM-2 -- `srs.ts` was FSRS-inspired
  (stability/difficulty) from the start; flagged this to the user before
  touching anything (`AskUserQuestion`) since persisted SRS cards use those
  fields and a silent schema change would corrupt every card. User's answer:
  personal project, fine to reset every schedule, wanted SM-2 specifically
  because they're not familiar with FSRS ("more like the OG enjoyer").
  Implemented straight SM-2 (`interval`/`repetition`/`easeFactor`,
  2.5 starting ease, floor 1.3), with the app's 4-button AGAIN/HARD/GOOD/EASY
  UI mapped onto SM-2's 0-5 quality scale as 0/3/4/5 (same mapping Anki's own
  SM-2-derived scheduler uses) for the ease-factor formula specifically --
  the interval-branching logic itself still keys off the raw 4-button rating
  per the plan's literal spec. **Persist key renamed** `kotodori-vocab` ->
  `tori-vocab` (not `tori-settings`-style migrated-forward) so old
  stability/difficulty-shaped cards are cleanly abandoned rather than
  silently merged into the new field shape -- this was the deliberate,
  approved reset, not an accident. Sanity-tested the scheduler standalone
  (Node, outside the app) before trusting it: intervals grow 1→6→15→38→95 on
  repeated GOOD, an AGAIN mid-sequence correctly drops repetition to 0 and
  the ease factor by exactly 0.8 (matches the SM-2 quality=0 formula by
  hand), and recovery afterward behaves sanely.
- **N5 vocabulary `meanings.en` (1031/1031) intentionally NOT translated**
  this batch -- the plan said "verify and fill any missing meanings.en";
  checking first (before writing anything) found N4's 759 already fully
  filled (done in the prior session) but N5's genuinely 100% empty, not a
  stale doc claim. Flagged to the user as a translation job bigger than
  everything else in this plan combined; user chose to skip it for now and
  do the rest of the plan. **Still open** -- see below.
- **Not done / explicitly out of scope this batch**: "Paper Brutalism
  polish across all tabs" (the plan's own vaguest item -- "match the
  Dashboard" isn't independently checkable; left alone rather than guessing
  at a redesign) and any further theme/typeface visual QA beyond what's
  already documented lower in this file.

---

## Session: Tori rebrand + Paper Brutalism + N4 grammar/kanji (this session)

Executed `implementation_plan_2.md` (Kotodori → Tori rename + Paper Brutalism reskin
+ N4 grammar/kanji integration) end to end. **`npm run build` is green** after every
phase, and this session ended with an actual browser pass (Chrome via
Playwright/CDP) once the tool became available -- Dashboard, Kanji (N5+N4+all,
including opening `KanjiDrawer` on a dark theme), Grammar (N4 level + detail
drawer), VocabBrowser (N4 English meanings), Landing (`/welcome`), and Settings
were all visually checked in both **Gold** (the user's stated favorite, dark) and
**Sakura** (light) papers, plus the RAW/NEO structural toggle. Everything rendered
correctly; the only real bug the pass caught was the `KanjiDrawer` dark-theme
legibility issue described below, which is fixed and was re-verified live in Gold
after the fix. (One tooling quirk, not an app bug: the screenshot tool intermittently
returned a blank/stale frame or timed out on the first capture after a navigation --
confirmed via direct DOM/computed-style inspection each time that the page was
actually rendered correctly; a second screenshot after a short wait always showed
it. Not investigated further since it's a CDP capture issue, not application code.)
Not checked: the other 7 papers (Paper/Matcha/Sumi/Dusk/Ink/Indigo -- Washi and
Sakura and Gold were), density/typeface toggles' visual effect (wired and clickable,
outcome not screenshotted), and the two-pane pages this session skipped watermarks
on (Review, and the un-scrolled parts of VocabBrowser/Grammar/Kanji).

### Rename (Part A)
- `package.json` name, `index.html` `<title>`, boot script, Sidebar logo (`鳥`/`とり`,
  `[ TORI ]`), favicon (new bird-motif SVG, same brutalist-card construction as the
  old 言 glyph).
- Settings persist key renamed `kotodori-settings` → `tori-settings`, with a one-time
  localStorage migration in `index.html`'s boot script (copies the old blob forward
  if the new key doesn't exist yet, before Zustand's `persist` middleware reads it).
- **`kotodori-vocab` (the SRS persist key, in `vocab-store.ts`) was deliberately left
  unrenamed.** It holds real review history, not settings; a blind rename would
  orphan every user's SRS progress on next load. Not a "Kotodori" text leak since
  it's never user-visible — just a localStorage key.
- Default `lang` flipped `'vi'` → `'en'` in `settings-store.ts` (Part F1).

### Paper Brutalism (Part B/C)
- `src/index.css` fully rewritten: 9 paper themes ported **verbatim** from
  `../../Tori/src/app/globals.css` (Washi/Paper/Matcha/Sakura/Sumi light, Dusk/Ink/
  Indigo/Gold-leaf dark) as `:root`/`.theme-*` CSS custom properties, remapped into
  Kotodori's existing Tailwind v4 `@theme` color/font tokens (`--color-ink` →
  `var(--tori-text)`, etc.) so every pre-existing `bg-paper`/`text-ink`/`bg-yellow`
  call site picked up the new palette with **zero changes at those call sites**.
  Structural tokens (`--border-w`/`--radius`/`--tilt`) kept RAW (2px, sharp) vs NEO
  (3px, rounded, slight tilt) exactly as before, just re-scaled per the plan.
  Paper-grain SVG texture + ambient glow gradients, all 16 keyframes, and the
  brutalist utility classes (`.card-lift`, `.reveal`, `.acc-island`, etc.) ported too.
- **`.reveal` was changed from Tori's auto-animate-on-mount behavior to an
  IntersectionObserver-gated `.reveal.in` pattern** (matches the plan's C4 spec more
  than Tori's own CSS, which the plan's spec text actually contradicts slightly --
  see `src/components/ui/Reveal.tsx`). `--i` (inline per instance) staggers the
  delay.
- New components: `Reveal.tsx`, `ScreenHeader.tsx` (+ `Watermark`), `InkCabinet.tsx`
  (9 paper swatches + RAW/NEO toggle, compact mode for the Sidebar / full mode with
  density + typeface toggle for Settings) -- all ported from Tori's equivalents but
  rewritten against this app's Zustand store instead of Tori's raw-localStorage
  `src/lib/settings.ts`, and with no `lucide-react`/`cn`/shadcn dependency (none of
  those are installed here; used inline SVG + the same conditional-class-string
  style as the existing `Button`/`Card`).
- `settings-store.ts` gained `paper`/`density`/`typeSans` (persisted, same
  `tori-settings` blob) with setters that also apply/remove the corresponding
  `<html>` classes directly (mirroring Tori's imperative `applyTheme`/etc.). The
  boot script in `index.html` reads all of these **out of the parsed `tori-settings`
  blob** (not separate top-level localStorage keys, which the plan's own B9 sketch
  and Files-Summary section disagreed on) -- this was a deliberate fix flagged
  before implementation, avoiding a FOUC bug.
- `Card.tsx`/`Button.tsx`/`Sidebar.tsx`/`Layout.tsx` reskinned per the plan (C1-C3,
  C7): `--shadow-brutal`/`--shadow-brutal-hover` (ink-tinted via `color-mix`)
  replace the old flat `var(--color-ink)` shadow; accent cards get a tinted shadow
  instead. `ThemeSwitcher.tsx` **deleted** (its RAW/NEO toggle is now inside
  `InkCabinet`, which replaced it in the Sidebar; nothing else referenced it).
  `Layout.tsx` wraps `<Outlet>` in `.view-enter`, keyed on `location.pathname`, for
  the page-transition animation.
- **`KanjiDrawer.tsx` fix (found post-hoc, not in the original plan):** this panel is
  deliberately theme-independent (always a hardcoded white Kanagawa-styled surface,
  predates the paper-theme system). Before this session that was safe because
  Kotodori only had light themes; introducing 4 dark papers meant its `text-muted`/
  `border-ink`/etc. Tailwind classes (which now resolve to near-white on dark
  papers) rendered **white-on-white** against its hardcoded white background. Fixed
  by pinning every text/border color inside the drawer to fixed literals
  (`DRAWER_INK`/`DRAWER_MUTED`/`DRAWER_ACCENT`/`DRAWER_HAIRLINE` constants at the
  top of the file) decoupled from the theme cascade entirely, same treatment the
  Hán Việt badge already had. **`KanjiGroupModal.tsx` did NOT need this fix** -- it
  already used theme-reactive `bg-paper`/`border-ink`/`text-muted` throughout (no
  hardcoded white), so it already adapts correctly across all 9 themes.
- New pages: `Landing.tsx` (route `/welcome`, reachable via the Sidebar logo link --
  wasn't linked from anywhere in the first pass, fixed) -- hero with a live
  `AnimatedKanjiSvg` stroke-order draw of 鳥, feature grid, a **live, functional**
  `InkCabinet` as the theme-picker demo (not a decorative mockup), footer with the
  `minh khang` signature. `Settings.tsx` (route `/settings`, linked from Sidebar
  nav) -- full `InkCabinet` + language + level switchers.
- Per-page watermarks (Part C8) were only added to the **single-column** pages
  (`Dashboard` 今, `Counters` 数, `Homophones` 音, `VerbForms` 動) where a fixed-
  position giant kanji is safe to eyeball-place without a browser. **Skipped on the
  two-pane list+detail pages** (`VocabBrowser`, `Grammar`, `Kanji`, `Review`) --
  `Watermark`'s `absolute`/`right-0` positioning could plausibly collide with the
  detail panel on those layouts, and that couldn't be verified without a browser.
  Dashboard also got `Reveal`-wrapped sections (staggered load-in); the other three
  did not (time-boxed).

### N4 Grammar (Part D) -- `src/data/n4/grammar.json` + `grammar-categories.json`
- **68 grammar points** (`g_136`-`g_203`), 10 categories (Roman numerals XV-XXIV),
  chapters 15-24 -- transcribed from `../../N4_Grammar_and_Kanji_Summary-Final.md`
  and validated: id sequence, category counts (6/6/7/6/4/7/7/7/11/7 = 68), and every
  `jaRuby`/`patternRuby` string checked (ruby tags balanced, and the plain-text
  reconstruction after stripping `<ruby>/<rt>/<rp>` tags exactly equals `examples[0].ja`)
  via a one-off Node script before considering the file done.
- The source MD has **no example sentences** (only a pattern + Vietnamese gloss per
  point) -- every `examples[0]` (`ja`/`kana`/`vi`/`en`/`jaRuby`) is **authored
  content**, written to match N5's own convention of exactly 1 example per point
  (`kana` left `""` throughout, matching every N5 entry). `jaRuby`/`patternRuby` are
  hand-marked-up `<ruby>` HTML, not run through kuroshiro/kuromoji (neither package
  is installed in this repo -- handoff's "Furigana pipeline" section describes a
  one-time N5-era script, not a live dependency).
- `meaning.en`/`explanation.en` are translations of the hand-authored
  `meaning.vi`/`explanation.vi` (the latter pulled from the MD's own numbered
  Vietnamese descriptions where available).

### N4 Kanji (Part E) -- `src/data/n4/kanji.json`
- **110 groups / 268 words / 10 chapters** (15-24), one group per anchor kanji
  (matching N5's convention -- the MD's own `15.1`/`15.2` sub-numbering is a
  different, unrelated axis and was **not** used as the grouping key). The plan's
  own "~108" kanji-count estimate was wrong for 4 chapters; recounting directly from
  the MD's tables gives 110, confirmed by chapter-by-chapter tally
  (8/10/11/9/11/13/11/12/14/11).
- **Script-built, not hand-typed** (`scripts/n4-kanji-source.mjs` -> hand-transcribed
  `[kanji, meaningEn, [[word, kana, wordMeaningEn], ...]]` per anchor, translated
  from the MD's Vietnamese inline -->
  `scripts/build-n4-kanji.mjs` computes everything else):
  - **hanviet** (per word): joins `hanviet-dictionary.json` per kanji character.
  - **onyomi/kunyomi** (per anchor): looked up from `scripts/all-readings.json`
    (kanjiapi.dev cache).
  - **onkun tag** (per word, e.g. `"On--Kun"`): `scripts/onkun-classifier.mjs`'s
    `classifyWord`, same classifier N5's kanji pipeline uses.
  - **group-level onkun**: the classified type of the *anchor character's own
    token* within `words[0]` (verified against real N5 examples first, e.g. anchor
    土 in 土曜日 classifies "On" because 土 itself reads ど there -- not just
    "words[0].onkun as a whole string").
  - Hard-fails (throws) if any word doesn't classify, rather than writing a
    placeholder -- caught 9 real cases (時計/腕時計/切符/切手/色んな/景色/風邪,
    true jukujikun the classifier can't derive character-by-character, plus 係の人
    and お姉さん, which are a classifier limitation -- bare-vs-implied-okurigana
    kun reading and an honorific kun variant, respectively -- not irregular
    readings). All 9 hand-resolved in `ONKUN_OVERRIDES` in the build script, each
    keyed by the exact `[kanji, kana]` pair so a source-data edit can't silently
    misapply the wrong override.
  - **`all-readings.json` and `hanviet-dictionary.json` both extended** (8 new
    characters each: 係協承政芋血谷辺) -- these 8 were missing from both caches
    entirely; readings/Hán Việt supplied from general knowledge (no network access
    this session to hit kanjiapi.dev directly), same "additive backfill" pattern as
    the existing `backfill-n4-hanviet.mjs`/`fetch-secondary-kanji-data.mjs`.
- **Real collision found and fixed, not in the plan:** N5's chapter 15 (the
  "N5 supplement" chapter added in an earlier session) and N4's chapter 15 (Bài 15,
  this session) are **both legitimately numbered 15** -- each numbered after its own
  curriculum, not a shared sequence. Worse, both chapters' groups use the identical
  `k15_g1`...`k15_gN` id scheme, so N5 chapter 15 and N4 chapter 15 fully collide on
  both `chapter` number *and* group `id` prefix. This only matters when `level ===
  'all'` combines both datasets. Fixed in `Kanji.tsx` (not in the data -- the ids
  stay as computed, changing them would ripple into SRS card keys) by tagging every
  chapter/group with its source level (`src: 'N5' | 'N4'`) at the page-state layer,
  keying chapter chips and the group-card React `key` by `${src}-${chapter}` /
  `${src}-${group.id}` instead of the raw number/id, and labelling chips `N5 15` /
  `N4 15` in `'all'` scope so they're visually distinguishable too. **Kanji-mode SRS
  review is still N5-only** (per the pre-existing scope cut), so this collision
  never reaches `vocab-store.ts`'s card keys today -- but if N4 kanji review is ever
  added, the same `${src}-${id}` discipline will be needed there too.
- `src/data/kanji.ts` (new, mirrors `data/vocab.ts`'s pattern):
  `n5KanjiChapters`/`n4KanjiChapters`/`allKanjiChapters`/`getKanjiChapters(level)`.
  `src/data/grammar.ts` (new, same pattern) for grammar + categories + tips.
  `Grammar.tsx` and `Kanji.tsx` both gained the N5/N4/All level switcher (Part D3/E2)
  reading/writing the *global* `useSettingsStore` level (same store Sidebar's
  `LevelSwitcher` and Vocab/Review/Homophones already used) -- switching level on
  any page now affects all of them consistently. A stale category/chapter selection
  is reset on level switch (was pointing at a slug/number that may not exist in the
  new level's data).
- **Verb Forms / Counters stay N5-only** (no N4 source for either exists) --
  unchanged from before this session. Grammar's verb-form pill filter still only
  cross-references N5's `requiredVerbForm` data; it's simply inert (never matches)
  on N4/all-scope points rather than hidden.

### Translations (Part F) -- what got done and what deliberately didn't
- **N5 grammar `meaning.en` + `examples[0].en` (135/135 + 130/135)** -- filled via
  `scripts/n5-grammar-en.mjs` (hand-translated, keyed by id) +
  `scripts/apply-n5-grammar-en.mjs` (hard-fails on any id set mismatch, or on
  clobbering an already-non-empty field). The 5 examples left blank
  (`g_061_1`/`g_069`/`g_073`/`g_076`/`g_091`) are conjugation-table rows with no
  real Vietnamese example sentence to translate either -- not a gap, matches the
  source. `explanation.vi`/`.en` were left empty on all 135 (they always were; no
  Vietnamese explanation text exists anywhere to translate from for N5).
- **N4 vocabulary `meanings.en` (759/759)** -- filled via `scripts/n4-vocab-en.mjs` +
  `scripts/apply-n4-vocab-en.mjs`, same hard-fail-on-id-mismatch discipline.
  **Found and fixed a real id-alignment bug while building this list**: the source
  has 6 gapped/dropped ids (`n4_0587`, `n4_0673`-`4`, `n4_0726`, `n4_0735`,
  `n4_0748`, `n4_0750` -- rows dropped earlier for lost headwords/duplicates, see
  the pre-existing N4 vocab pipeline notes below), so a naive "translate row N as
  id n4_{N}" assumption silently drifts by one past each gap. Caught by a
  post-hoc script that diffed the translation list's keys against
  `vocabulary.json`'s real ids (`node -e` one-liner, not kept) *before* running the
  apply script -- the apply script's own hard-fail on id-set mismatch would also
  have caught it, just less precisely (whole-file failure vs. exact key names).
- **N5 + N4 kanji `meaning` schema change + full translation -- DONE, in a follow-up
  pass after the section above was originally written.** This was flagged as a
  decision needing the user's input (translating in place would have destroyed the
  Vietnamese gloss, paired with `hanviet` in the UI); asked via `AskUserQuestion`,
  user picked the schema-change option. What happened:
  - `KanjiWord.meaning` / `KanjiGroup.meaning` in `src/types/index.ts` changed from
    `string` / `string | null` to `{ vi: string; en: string }` / `{...} | null`
    (matching `GrammarPoint.meaning` / `VocabEntry.meanings`, which were always
    `{vi,en}` -- the plain string was the odd one out).
  - `scripts/migrate-kanji-meaning-schema.mjs` (idempotent) reshaped both
    `n5/kanji.json` (1159 word + 58 group meanings, existing string treated as
    `vi`, `en` seeded `""`) and `n4/kanji.json` (268 word + 110 group meanings,
    existing string treated as `en` since N4 kanji was authored English-only per
    the implementation plan -- **N4's `meaning.vi` is deliberately left `""`**,
    not backfilled from the source MD; out of scope of the decision this migration
    was for).
  - Every consumer updated to read `{vi,en}` via `localize()` instead of the raw
    string: `Kanji.tsx` (2 render sites + the search-filter, which now checks both
    `.vi` and `.en`), `KanjiGroupModal.tsx` (2 sites), `Review.tsx`'s
    `KanjiCardView` (2 sites, needed adding `localize` to its `useTranslation()`
    destructure), `Homophones.tsx` (its kanji.json-merge line built a *fake*
    `{vi: w.meaning, en: ''}` wrapper before the migration -- now `w.meaning` already
    *is* that shape, so it's just `meanings: w.meaning`).
  - **N5's English translated in full**: `scripts/n5-kanji-en.mjs` (1217
    hand-translated strings, positional -- not id-keyed, learned from the N4
    vocab id-alignment bug above -- array order matches a
    chapters→groups→[group-meaning-if-any, then words] traversal) +
    `scripts/apply-n5-kanji-en.mjs` (walks the same traversal, hard-fails on any
    length mismatch or on clobbering an already-filled `.en`). 58 group meanings +
    1159 word meanings, all filled, zero left empty.
  - Browser-verified (Chrome via CDP) after the fact: `/kanji` in EN shows e.g.
    "Alone, by oneself (Nhất Nhân)" -- English meaning + Hán Việt badge, exactly the
    pairing the schema change was meant to preserve -- and toggling to VI shows the
    original Vietnamese unchanged, confirming no data was lost in the migration.
- `en.json`/`vi.json` gained one new key (`nav.settings`) for the new Settings page;
  no other locale gaps were found (`grep`-checked, none of the "Kotodori" rename
  touched locale content since neither file ever mentioned the app name).

### Not done this session (still open)
- Watermarks/reveals on `VocabBrowser`/`Grammar`/`Kanji`/`Review` (two-pane layouts,
  skipped pending visual verification -- see Part C8 above; the level switchers and
  data on these pages *were* browser-verified, just not the watermark placement
  since none was added).
- 6 of the 9 papers (Paper/Matcha/Sumi/Dusk/Ink/Indigo) and the density/typeface
  toggles' visual effect were not screenshotted (Washi, Sakura, and Gold were, plus
  RAW/NEO) -- wired correctly and clicking them works, just not eyeballed.
- **N4 kanji `meaning.vi` is empty** (see the schema-change entry above) -- N4
  kanji was never authored with Vietnamese in this app's data, only in the
  original source MD. Backfilling it would mean re-deriving from
  `N4_Grammar_and_Kanji_Summary-Final.md`, same class of work as the N5 pass
  above, just not done this round.

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
- [x] **Kanji** (`/kanji`) — chapter chips (now 1–15, see chapter 15 above) + search, grid of leading-kanji group cards (anchor, Hán Việt, On/Kun pills, member words with furigana + per-word On/Kun tag). **Whole-card click opens a group detail modal** (`src/components/kanji/KanjiGroupModal.tsx`) — centered, `bg-ink/30 backdrop-blur-sm` overlay, `border-3 border-ink shadow-[6px_6px_0px_var(--color-ink)] bg-paper` card, same brutalist tokens as the rest of the app (an earlier pass styled this as a soft-rounded Vercel-style bento box with a custom Kanagawa hex palette — replaced after review for not matching the app's actual design system; `ACCENTS`/`ACCENT_HEX`/`accentFor` were promoted from `Kanji.tsx` into `src/lib/kanji.ts` so the modal can echo the same yellow/blue/red/green left-border accent stripe as its originating grid card). Header shows the anchor kanji (clickable → stroke drawer), the same Hán Việt badge style as the grid card, and full (uncapped) On/Kun reading lists reusing the card's blue/green pill styling (`cleanReadings(readings, Infinity)`); body shows the complete vocabulary list as a spacious 2-column grid of bordered cells (`border-2 border-ink/15`, hover → `border-ink` + hard offset shadow), with each word's kanji individually clickable (`Furigana`'s `onKanjiClick`) to also open the stroke drawer. **List navigation**: `‹ n / total ›` header (identical markup/classes to the Vocab Browser modal's nav bar) + Left/Right arrow keys step through the currently *filtered* group list (`filteredGroups`, clamped, no wraparound); arrow/Escape handling is suppressed while the stroke drawer is open on top (`strokeDrawerOpen` prop), so its own Escape closes first — same layered-modal pattern as the Vocab Browser. **Click-to-view stroke animation** — clicking the anchor kanji on the grid card (`e.stopPropagation()` so it doesn't also trigger the card's group-modal click) or inside the group modal opens the shared right-side slide-over drawer (backdrop blur, `bg-[rgb(255,255,255)]` literal white on both the drawer and SVG container per spec) showing the stroke-order animation (guide strokes `#627d9a` static under `#2e3257` sequential dasharray/dashoffset draw, ~0.5s/stroke, replay button) plus a component/radical breakdown as compact pill tags below it, formatted `[ 字 - Hán Việt ]`, deduped with a `×N` multiplier for repeats (e.g. `[ 木 - Mộc ] ×3`), Kanagawa-colored (`#627d9a` idle → `#2e3257` hover) — this one drawer is the sole surviving Kanagawa-styled element in the app, kept as-is since it predates this session and wasn't part of the redesign scope. Same drawer is reused from the Vocab Browser modal and the Kanji group modal (see above) — it's a plain `{char, onClose}` component with no page-specific coupling. **Hán Việt badge (drawer)**: renders directly below the stroke SVG (and below the "no animation available" fallback text too, so it still surfaces for characters without stroke data) — `bg-white`/`rgb(255,255,255)` container, `border-2` in the Kanagawa accent `#627d9a`, label in that same blue-gray, the reading itself in `#2e3257`; renders nothing (no empty box) when the character has no Hán Việt entry.
- [x] **Counters** (`/counters`) — Bento grid of brutalist `CounterTable` cards from `counters.json`, now **11 categories** covering the full N5 phonetic-exception surface (grown this session from 9): basic numbers (+hundreds/thousands exceptions), people, generic objects, small animals, flat/thin objects, long/cylindrical objects, machines/vehicles, books, money, **days of the month** (new, `wide: true`, full 1–31), **months of the year** (new), **hours** (new), **minutes** (new), **age** (new). Added a generic `CounterRow.isException` flag (alongside the existing `isQuestion`) rendered as a red-highlighted row (`bg-red/10` + `text-red font-black` on kanji/kana) in `CounterTable`, with a legend chip under the page intro explaining it — used to flag: 300/600/800/3,000/8,000 (百/千 phonetic shifts) in the basic-numbers table; 1st–10th + 14th/20th/24th in the days table; 4/7/9 in months and hours; 1/3/4/6/8/10 in minutes (ふん→ぷん); 1/8/10/**20 (二十歳/はたち)** in age.

### Design / Branding
- [x] Brutalism: 3px borders, hard offset shadows (no blur), hover lift, high-contrast paper background, no emojis
- [x] Furigana scoped correctly app-wide (per-kanji, not per-phrase)
- [x] Document `<title>` is `KOTODORI` (dropped the `— N5` suffix)
- [x] Custom favicon (`public/favicon.svg`) — brutalist card (paper bg, 3px black border, hard offset shadow, matching the `Card` component) containing a blocky 言 (koto, "word") glyph built from flat rects rather than `<text>`/a font (renders identically regardless of installed fonts, stays legible at 16px) — dot in `#627d9a`, bars + mouth box in `#2e3257`

### N4 Integration (originally vocab-only this section describes; grammar+kanji added in the Tori-rebrand session above)
Split the app from N5-only into a level-aware N5/N4 platform. **Update:** N4 grammar (68 points) and kanji (110 groups) were added in the later "Tori rebrand" session at the top of this file — `/grammar` and `/kanji` are now level-aware. `/verb-forms` and `/counters` still have no N4 source material and remain N5-only.

- [x] **`src/data/n4/vocabulary.json`** — **759 entries**, built from `../../TuVung_N4_DungMori.md` (a single Dungmori word list, 10 thematic sections — note the doc's own section numbering is non-sequential, "10. Khác" appears second — 765 raw rows after parsing). **No PDF source this time** (unlike N5's PDF+MD merge) and no textbook-chapter structure — see schema notes below.
- [x] **Fused-furigana-string splitting pipeline** (the hard part) — the source glues kanji directly to its reading with no separator (`給料きゅうりょう`, `入いり口ぐち`, `（～を）出でる`), unlike anything the N5 pipeline had to parse. Key insight: annotation is per contiguous-kanji-*run* (a jukugo with no okurigana between characters gets one combined trailing reading block, e.g. 給料+きゅうりょう; a kanji broken up by real okurigana gets its own reading right where it sits, e.g. 入+いり+口+ぐち) — so `kana` is nearly free (strip kanji + scaffolding) and `kanji` is reading-match consumption per run, reusing `onkun-classifier.mjs`'s rendaku/han-dakuten/gemination-tolerant `matchesPrefix` (newly exported for reuse, previously internal-only). Scaffolding (`（...）` usage-notes at any nesting depth, a leading `～`/`∼`) is excluded from `kana` but kept — with its own internal furigana equally stripped — in `kanji`, matching the existing N5 convention (verified against real `n5/vocabulary.json` rows like `（～を）描きます` before trusting the rule). Pipeline, in order:
  1. `scripts/parse-n4-md.mjs` → `scripts/n4-raw-rows.json` (mechanical table extraction + noise cleanup: strips zero-width-space corruption — same corruption *class* as N5's embedded U+FFFF bug, different codepoint — `★` decoration markers, half/full-width paren normalization; per-section STT contiguity as a free integrity check).
  2. `scripts/fetch-n4-readings.mjs` — extends `scripts/all-readings.json` (kanjiapi.dev on/kun cache) with the 192 kanji the N4 word list introduces beyond N5's set.
  3. `scripts/split-n4-fused.mjs` (the splitter module) + `scripts/build-n4-draft.mjs` (runs every row through it, assigns POS — see below — writes `scripts/n4-draft.json`) — went through two real bugs before landing at 3.3% flagged (down from an initial 28%): (a) matching reading per-individual-kanji instead of per-contiguous-run broke every 2+-kanji compound with no internal okurigana (給料 etc.); (b) alternate-spelling rows (`入れる/淹いれる`, `甥おい/甥おいっ子`) duplicated the reading into `kana` until a `/`／`・`-triggered suppression flag was added.
  4. `scripts/assemble-n4-vocab.mjs` — applies 24 hand-resolved overrides (irregular/jukujikun readings no on-kun lookup can derive: 二日酔い ふつかよい, 世界中 せかいじゅう *(documented kanjiapi gap — see onkun-classifier.mjs's own header comment, which names 日本 に as exactly this class)*, 相撲 すもう, 息子 むすこ, 火傷 やけど, 真面目 まじめ; a couple of source typos: じゅん→じゅう for 充電; 3 rows whose fused string used a *different*, non-furigana encoding the splitter can't handle at all — reconstructed from the meaning + real dictionary form; plus 5 more found by the bare-vs-dotted-kun scan below), drops 5 rows where the source literally lost the headword (only `（する）` scaffolding survived — unrecoverable without guessing, so dropped rather than invented) plus 1 exact duplicate row, shapes everything into `VocabEntry`, and cross-checks against N5 for same-kanji+kana overlaps (8 found, kept — legitimate cross-level review words, not corruption).
  5. **Independent cross-validation** (`onkun-classifier.mjs`'s `classifyWord`, the *other* direction — verify a finished kanji/kana pair rather than derive one) caught one more real bug the splitter's own flags missed (真面目 partially matched then got stuck, leaving a stray `じめ` suffix) — same "don't trust one pass" discipline as N5's `assemble-enrichment.mjs` hard-fail. This validator shares a blind spot with the splitter (see next point), so it didn't catch everything either.
  6. **Bare-vs-dotted-kun bug class** (found post-assembly, via a separate advisor-flagged review pass, not the checks above) — kanjiapi sometimes lists a kun reading twice for one character: a dotted form marking exactly where okurigana starts (`う.まれる`, core `う`) *and* a bare dot-less form that's really an alternate/compound-only spelling (`うまれ`). Naive longest-match prefers the bare one whenever it scores longer, swallowing real okurigana into the "reading" and dropping it from `kanji` (生うまれる → `生る` instead of `生まれる`). First fix attempt was a blanket "always prefer dotted" rule in `bestMatch` — measured against every row before trusting it (a throwaway `diff-dotted-fix.mjs` script), and it was a **net regression**: 4 genuine fixes vs. 8 newly-broken previously-correct words (入り口 → 入り口ち, 彼 → 彼れ, etc.), and it still didn't fully fix 生 (produced "生れる"). Reverted. Replaced with a precise, evidence-based detector (`detect-bare-over-dotted.mjs`, deleted after use) that instruments the *actual* shipped matching logic and logs only the specific decision points where a bare candidate outscored an available dotted one — 14 across all 765 rows, of which 9 were already correct as shipped (咳, 次, 彼, 最悪, 交換, 勝手に, 支度, 刺身 ×2 — single-kanji or fully-kanji words where the bare reading was actually right) and only 5 were genuine bugs (生まれる, 折り紙, 話し合う, （～に）勝つ, お見舞い) — now hand-overridden.
  7. **ID-stability guard** added to both override tables (`assemble-n4-vocab.mjs`'s `OVERRIDES`/`DROP_IDS`, `build-n4-draft.mjs`'s `POS_OVERRIDES`) after the fix above made clear how easy the tables were to silently mis-apply: ids are assigned by row position in `n4-raw-rows.json`, so a source row added/removed/reordered would shift every id downstream and land an override on the wrong word with no error — and `n4_XXXX` is also the persisted SRS card key, so a silent shift orphans review history too. Each override now carries the exact `fused` string it was written against; both scripts validate every entry before running and `process.exit(1)` on any mismatch (verified working by deliberately tampering a row and confirming the abort, then restoring) — same discipline as N5's `rebuild-dungmori-block.mjs` ("STALE ids not found (aborting)").
- [x] **POS classification** (no source data for this at all, unlike N5's textbook-derived groups) — per-word pattern heuristic (verb godan/ichidan/suru-conjugation shape, adjective `-i` ending, katakana-loanword → noun) layered under each section's bias, replacing an initial per-section-only assignment once cross-checking surfaced real nouns/verbs mixed into every section including the "noun" ones (叶う, 掛ける, 込む were section-labeled "Danh từ" but are verbs). `verbGroup` (1/2/3) is a **heuristic call** for anything not already `する`-conjugating — standard -iru/-eru-is-ichidan rule with a small hardcoded godan-exception list (いる/要る, しゃべる, etc.) — not textbook-verified like N5's groups; flagged as a lower-confidence dimension below. Zero `pos: 'unknown'` in the final set (down from 101 mid-pipeline) via a small hand-classified override table for the pure-kana words the pattern heuristics can't safely resolve (adverbs like だいぶ/まっすぐ that coincidentally end in a verb-shaped mora).
- [x] **Schema**: `VocabEntry.chapter` is now **optional** (was required `number`) and a new optional `category?: string` was added. N4's source isn't a chaptered textbook (just 10 thematic sections, and the doc's own section order doesn't match a real curriculum sequence) — rather than force real N4 `chapter` numbers with nothing to source them from (and risk manufacturing the exact kind of fake-structure corruption N5's cleanup history spent three sessions unwinding), N4 entries carry `category` (the section title) and omit `chapter` entirely. Real textbook chapters can be added later as a non-destructive pass (same pattern as `add-n5-supplement.mjs` bolting on chapter 15 without touching the original 14) once/if a chaptered N4 source shows up.
- [x] **Level-aware app wiring** — `useSettingsStore` gained `level: 'N5' | 'N4' | 'all'` (global, persisted, next to `lang`/`theme`) + `<LevelSwitcher>` (`src/components/ui/LevelSwitcher.tsx`, same 3-segment-toggle pattern as `LanguageSwitcher`) in the Sidebar header. New `src/data/vocab.ts` is the single place that knows about both `n5/vocabulary.json` and `n4/vocabulary.json` (`n5Vocab`/`n4Vocab`/`allVocab`/`vocabForLevel(level)`) — every page that used to `import vocabData from "@/data/n5/vocabulary.json"` now imports from here instead, so the split stays a one-place concern.
  - `vocab-store.ts`'s no-arg `getDueCards()`/`getNewCards()`/`getStats()` (what Sidebar's due-badge/mini-stats and Dashboard read) now resolve the current level via a direct `useSettingsStore.getState()` read inside the store (a plain cross-store function call, not a subscription — settings-store never imports vocab-store back, so no cycle) rather than requiring every caller to thread a level param through. The existing scope-aware `*For(ids)` variants (Review's chapter/POS-filtered pools) are untouched.
  - **Review** (`/review`): pool now derives from `vocabForLevel(level)`; chapter filter (N5 textbook chapters) and a new category filter (N4 thematic sections) are mutually exclusive on the level, both hidden in `'all'` scope (reconciling two taxonomies into one filter axis was out of scope this pass — `'all'` just skips both and filters on POS only). **Kanji-mode review is forced to vocab-mode outside N5 scope** (`kanjiData`/`kanji.json` has no N4 counterpart) — the Kanji tab is visibly disabled rather than silently producing an empty pool.
  - **VocabBrowser** (`/vocab`): grouping switches axis with the entry's own `jlptLevel` (chapter number for N5 rows, `category` string for N4 rows) via a `groupKey()` helper, so `'all'` scope's mixed list groups each word correctly regardless of which level it's from; group-filter dropdown resets across a level switch (a stale chapter number or category name from the old level has no meaning in the new one).
  - **Homophones** (`/homophones`): its group computation (previously a module-level `const groups = (() => {...})()` IIFE run once at import) is now a `computeGroups(level)` function called through `useMemo` inside the component, since the candidate pool it builds from depends on the level toggle. `kanji.json`'s supplementary words (all synthesized as `jlptLevel: 'N5'`) are excluded from the pool entirely in N4-only scope rather than silently leaking N5 content into what should be an N4-only view.
  - **Dashboard**'s progress-bar label is now `"{level} Progress"` (interpolated `dashboard.progress` key) instead of hardcoded "N5 Progress" — the rest of Dashboard needed zero code changes since it already reads through the now-level-aware `vocab-store` methods.
  - `/kanji`, `/grammar`, `/verb-forms`, `/counters` are unchanged and stay N5-only (no N4 source data exists for any of them) — the level switcher stays visible globally (simpler than conditionally hiding it per-page) but has no effect there since those pages never read `level`.
- [x] **Kanji-asset backfill for N4-only characters** — `fetch-kanjivg.mjs` now also scans `n4/vocabulary.json` for its character list (previously N5-only sources); re-run added **192 newly-fetched stroke-order entries** (937 total, up from 745). New `scripts/backfill-n4-hanviet.mjs` (same lookup logic as `fetch-secondary-kanji-data.mjs` — the cached 2136-Jouyou table in `saroma-map.json` — just pointed at N4 instead of the N5 enrichment draft) added **183 new Hán Việt entries** (9 obscure characters still unresolved: 嘘 咳 掛 叶 淹 甥 姪 叱 剥 — same class of gap as N5's existing 7, not in the reference table). `build-radical-names.mjs` was re-run too (component-decomposition Hán Việt names); coverage dropped in *percentage* terms (153/531 named, was denser at the old ~167-anchor scale) simply because 937 characters decompose into far more distinct components than 167 did — the UI already tolerates an unnamed component by showing the bare character, so this is a known, expected, non-blocking gap rather than a regression.

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
- [x] **N4 grammar/kanji-anchor-groups** — DONE, see the "Tori rebrand" session at the top of this file (`n4/grammar.json`, `n4/kanji.json`). `/grammar` and `/kanji` are level-aware now.
- [ ] **N4 counters** — still no N4 counters source material; `/counters` stays N5-only.
- [ ] **N4 `chapter` numbers** — N4 entries currently carry only `category` (thematic section), no real textbook chapter (see schema note above) — needs an actual chaptered N4 source to map words against.
- [ ] **N4 `verbGroup` accuracy** — unlike N5's textbook-sourced groups, N4's group1/2/3 is a heuristic call (standard -iru/-eru-is-ichidan pattern + a small hardcoded exception list) with no ground truth to verify against. Probably fine for casual use; worth a spot-check pass before trusting it for a "conjugate this" drill.
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
- **N4 integration (this session) — browser-verified via Playwright** across N5/N4/all-level scopes (Sidebar level switcher, Dashboard progress label, Review's chapter-vs-category filter swap, VocabBrowser's group-axis switch). This is *how* the Sidebar reactivity bug (stats not updating on level switch — see Data Pipeline / `vocab-store.ts`) was actually found and fixed, not caught by reading the code. One honest residual: the screenshots were taken *before* the 5 bare-vs-dotted-kun word corrections below landed, so they show slightly earlier data — not re-verified after, but those 5 changes only affect `kanji`/`kana` string content on specific entries, not any rendering path, so this is low-risk.
- **N4 `meanings.en`** — same gap as N5, empty on all 759 entries.
- **N4 Hán Việt dictionary gaps** — 9 characters (嘘 咳 掛 叶 淹 甥 姪 叱 剥) have no entry, same class as N5's pre-existing 7 (not in the 2136-Jouyou reference table).
- **N4 `verbGroup` is heuristic, not textbook-verified** — see Further Plan above.
- **`n4_0307` (`（点/～点）を取る`) kana is `をとる`** — looks odd (starts with a particle) but is faithful to the source: unlike every other `（～を）verb` scaffolding row in this dataset, this one writes the を *outside* the closing paren, so it's genuinely core content, not excluded scaffolding. Left as-is rather than special-cased.

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
    types/index.ts             ← VocabEntry (chapter?: optional, category?: new), GrammarPoint,
                                  GrammarCategory, VerbGroup, VerbForm, VerbFormsData,
                                  HomophoneGroup, SRSCard, CounterCategory/Row/Data,
                                  KanjiGroup/Word/Chapter, KanjiVgComponent/Entry/Data, RadicalNamesData
    lib/
      srs.ts / japanese.ts / kanji.ts   ← FSRS scheduler / POS+reading helpers /
                                           On-Kun pill logic + hanVietForChar()/buildHanVietIndex()
      i18n.ts / useTranslation.ts        ← EN/VI dot-path lookup + interpolation
    store/
      vocab-store.ts           ← Zustand + persist (SRS); no-arg get*/getStats() now level-aware
                                  (reads useSettingsStore.getState().level internally)
      settings-store.ts        ← Zustand + persist (lang, theme, level: N5|N4|all — new this session)
    data/
      vocab.ts                  ← NEW this session: n5Vocab/n4Vocab/allVocab/vocabForLevel(level) —
                                   the one place that knows about both level's vocabulary.json
      hanviet-dictionary.json   ← flat {char: Hán Việt reading} map, 920 entries (+183 this session)
      n5/
        vocabulary.json          ← 1031 entries
        grammar.json / grammar-categories.json
        verb-forms.json
        homophones.json          ← unused; Homophones.tsx computes live from vocabulary.json
        kanji.json                ← 15 chapters / 179 leading-kanji groups / 1159 words / 167 unique anchors
        kanjivg.json               ← per-character stroke paths + component decomposition,
                                     937 characters (+192 this session, now covers N4 too — see note)
        radical-names.json         ← Hán Việt names for decomposition components (153/531, sparser now)
        counters.json
      n4/                         ← NEW this session
        vocabulary.json            ← 759 entries, vocab-only (no grammar/kanji/counters yet)
    components/
      layout/     Layout.tsx, Sidebar.tsx
      ui/         Button.tsx, Card.tsx, Furigana.tsx, Ruby.tsx, PosTag.tsx,
                   LanguageSwitcher.tsx, LevelSwitcher.tsx (new this session)
      kanji/      AnimatedKanjiSvg.tsx, KanjiDrawer.tsx, KanjiGroupModal.tsx
    pages/
      Dashboard.tsx, VocabBrowser.tsx, Review.tsx, Grammar.tsx,
      VerbForms.tsx, Kanji.tsx, Counters.tsx, Homophones.tsx
                 ← Dashboard/VocabBrowser/Review/Homophones are level-aware now (see N4 Integration);
                   Grammar/VerbForms/Kanji/Counters unchanged, still N5-only
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
    build-radical-names.mjs     ← merges anchor + curated names -> radical-names.json; re-run after
                                   fetch-kanjivg.mjs changes the component set (N4 added ~380 new ones)

    --- N4 vocab pipeline (this session) ---
    parse-n4-md.mjs             ← ../../TuVung_N4_DungMori.md -> n4-raw-rows.json (mechanical extraction)
    fetch-n4-readings.mjs       ← extends all-readings.json with N4's ~192 new kanji
    split-n4-fused.mjs          ← reusable module: splits one fused kanji+furigana string into {kanji,kana}
    build-n4-draft.mjs          ← runs every row through split-n4-fused.mjs, assigns POS/verbGroup,
                                   flags anything uncertain -> n4-draft.json
    assemble-n4-vocab.mjs       ← applies 24 hand-resolved overrides (each id-stability-guarded
                                   against the exact source string it was written against) + drops
                                   6 rows, shapes into VocabEntry, cross-checks vs N5
                                   -> ../src/data/n4/vocabulary.json
    n4-raw-rows.json / n4-draft.json  ← intermediate artifacts, kept for provenance (same convention
                                        as the N5 enrichment-*.json files above)
    backfill-n4-hanviet.mjs     ← extends hanviet-dictionary.json for N4-introduced characters
                                   (same saroma-map.json lookup as fetch-secondary-kanji-data.mjs,
                                   just pointed at n4/vocabulary.json instead of the N5 enrichment draft)
```
