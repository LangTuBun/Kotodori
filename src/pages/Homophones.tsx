import { useMemo, useState } from "react"
import { vocabForLevel } from "@/data/vocab"
import kanjiData from "@/data/n5/kanji.json"
import type { VocabEntry, KanjiChapter } from "@/types"
import { Button } from "@/components/ui/Button"
import { Furigana } from "@/components/ui/Furigana"
import { PosTag } from "@/components/ui/PosTag"
import { useTranslation } from "@/lib/useTranslation"
import { useSettingsStore, type Level } from "@/store/settings-store"
import { Watermark } from "@/components/ui/ScreenHeader"

const kanjiChapters = kanjiData.chapters as KanjiChapter[]

// Vowel each hiragana mora ends on, keyed by the mora's own kana (used to
// expand the katakana long-vowel mark ー below).
const MORA_VOWEL: Record<string, string> = {
  あ: 'あ', か: 'あ', さ: 'あ', た: 'あ', な: 'あ', は: 'あ', ま: 'あ', や: 'あ', ら: 'あ', わ: 'あ',
  が: 'あ', ざ: 'あ', だ: 'あ', ば: 'あ', ぱ: 'あ', ゃ: 'あ',
  い: 'い', き: 'い', し: 'い', ち: 'い', に: 'い', ひ: 'い', み: 'い', り: 'い', ゐ: 'い',
  ぎ: 'い', じ: 'い', ぢ: 'い', び: 'い', ぴ: 'い',
  う: 'う', く: 'う', す: 'う', つ: 'う', ぬ: 'う', ふ: 'う', む: 'う', ゆ: 'う', る: 'う', ゔ: 'う',
  ぐ: 'う', ず: 'う', づ: 'う', ぶ: 'う', ぷ: 'う', ゅ: 'う',
  え: 'え', け: 'え', せ: 'え', て: 'え', ね: 'え', へ: 'え', め: 'え', れ: 'え', ゑ: 'え',
  げ: 'え', ぜ: 'え', で: 'え', べ: 'え', ぺ: 'え',
  お: 'お', こ: 'お', そ: 'お', と: 'お', の: 'お', ほ: 'お', も: 'お', よ: 'お', ろ: 'お', を: 'お',
  ご: 'お', ぞ: 'お', ど: 'お', ぼ: 'お', ぽ: 'お', ょ: 'お',
}

// Words whose kana genuinely contains a doubled vowel as two separate
// morphemes (いい+え, 言(い)+い+ます), not a stylistic long-vowel spelling of
// one syllable (ええっ ~ えっ, ん ~ ううん) -- collapsing these specific two
// would falsely merge いいえ ("no") onto 家 ("house", read いえ) and 言います
// ("say") onto います ("to be/exist"). Found by diffing computeGroups()'s
// output with the collapse on vs. off and checking every group the collapse
// alone produced.
const DOUBLED_VOWEL_COLLAPSE_EXCEPTIONS = new Set(['いいえ', 'いいます'])

// Normalize kana for similarity matching:
// 1. Katakana → hiragana
// 2. Same-pronunciation subs (ぢ→じ, づ→ず)
// 3. Expand the long vowel mark ー to the vowel it elongates (コーヒー →
//    こおひい), rather than dropping it. Dropping it used to collapse
//    unrelated loanwords onto short native words that merely share a
//    prefix -- ステーキ ("suteeki") lost its ー entirely and normalized to
//    すてき, colliding with 素敵 (a real, unrelated word) -- so every
//    loanword ending in a vowel mark was silently falsely paired with
//    whatever short word happened to share its first mora.
// 4. Collapse doubled VOWEL kana only (long-vowel spelling variants, e.g.
//    ええっ ~ えっ, ううん ~ うん). Deliberately does NOT fold おう→おお or
//    えい→ええ — N5/N4 dictionary kana already spell long vowels
//    consistently, so there's no real variant-spelling collision for that
//    substitution to catch, and folding those seams merges unrelated words
//    that merely straddle a vowel boundary. See the exceptions set above for
//    the two words this general collapse still gets wrong.
function normalizeReading(kana: string): string {
  let s = ''
  for (const c of kana) {
    const code = c.charCodeAt(0)
    if (code >= 0x30A1 && code <= 0x30F6) s += String.fromCharCode(code - 0x60)
    else if (c === 'ー') {
      const vowel = MORA_VOWEL[s[s.length - 1]]
      if (vowel) s += vowel
    } else s += c
  }
  s = s.replace(/ぢ/g, 'じ').replace(/づ/g, 'ず')
  if (!DOUBLED_VOWEL_COLLAPSE_EXCEPTIONS.has(s)) s = s.replace(/([あいうえお])\1+/g, '$1')
  return s
}

// Pairs that collapse to the same normalized reading but are the same word
// spelled two ways (kanji vs. an alternate kana/mixed spelling), not two
// distinct words that happen to sound alike -- grouping them as "homophones"
// would be misleading. Keyed by the pair's kanji fields, found by manually
// auditing computeGroups()'s full output.
const SPELLING_VARIANTS: [string, string][] = [
  ['子供', '子ども'],
  ['もの', '物'],
  ['朝ご飯', '朝ごはん'],
  ['石けん', '石鹸'],
  ['牛どん', '牛丼'],
  ['できる', '出来る'],
  ['嘘', 'うそ'],
  ['恥ずかしい', 'はずかしい'],
  ['故郷', 'ふるさと'],
  ['色々', 'いろいろ'],
]
const SPELLING_VARIANT_KEYS = new Set(SPELLING_VARIANTS.map(([a, b]) => [a, b].sort().join('|')))
function isSpellingVariantPair(a: string, b: string): boolean {
  return SPELLING_VARIANT_KEYS.has([a, b].sort().join('|'))
}

// Two entries are the "same word" (not a homophone pair) if they differ only
// by a bracketed usage-note ((～を), (メモを)…) or a leading ～/∼ particle
// prefix (～時間 vs 時間) — strip those before comparing kanji identity so
// note-variants of one word don't get double-counted as distinct words.
function coreKanji(kanji: string): string {
  return kanji.replace(/[（(][^）)]*[）)]/g, '').replace(/^[～∼]/, '').trim()
}

// Source-data placeholders (empty brackets, bare dashes) aren't real words.
function hasRealKanjiField(kanji: string | undefined): kanji is string {
  if (!kanji) return false
  if (/[（(]\s*[）)]/.test(kanji)) return false
  return /[一-龯ぁ-んァ-ヶA-Za-z0-9]/.test(kanji)
}

// Expand the candidate pool beyond vocabulary.json with kanji.json's
// supplementary words[] (per-chapter leading-kanji groups) — this is a
// separate, larger word list with limited overlap, so it surfaces real
// same-reading/different-kanji pairs that vocabulary.json alone is too
// sparse to catch. Synthesized entries get a full VocabEntry shape (stable
// id, pos:'unknown', empty examples/tags) so WordCard/PosTag/keys behave
// exactly like a real vocab entry.
function buildPool(level: Level): VocabEntry[] {
  const seen = new Set<string>()
  const pool: VocabEntry[] = []
  for (const v of vocabForLevel(level)) {
    if (!hasRealKanjiField(v.kanji)) continue
    const key = v.kanji + '|' + v.kana
    if (seen.has(key)) continue
    seen.add(key)
    pool.push(v)
  }
  // kanji.json's supplementary words are N5-only (synthesized jlptLevel
  // 'N5' below) -- skip them entirely in N4-only scope so the pool doesn't
  // silently leak N5 content into a supposedly-N4 view.
  if (level === 'N4') return pool
  for (const chapter of kanjiChapters) {
    for (const group of chapter.groups) {
      for (const w of group.words) {
        if (!hasRealKanjiField(w.kanji)) continue
        const key = w.kanji + '|' + w.kana
        if (seen.has(key)) continue
        seen.add(key)
        pool.push({
          id: `kj_${w.kanji}_${w.kana}`,
          kanji: w.kanji,
          kana: w.kana,
          meanings: w.meaning,
          pos: 'unknown',
          verbGroup: null,
          adjType: null,
          jlptLevel: 'N5',
          chapter: chapter.chapter,
          tags: [],
          homophones: [],
          relatedWords: [],
          examples: [],
        })
      }
    }
  }
  return pool
}

interface SoundGroup {
  id: string
  normalizedReading: string
  readings: string[]          // distinct original readings in this group
  entries: VocabEntry[]
  difficultyScore: number
}

// Recomputed per level (see useMemo in Homophones()) rather than once at
// module load, since the pool it's built from now depends on the level
// toggle -- still cheap enough to redo on a level switch.
function computeGroups(level: Level): SoundGroup[] {
  const pool = buildPool(level)
  const map = new Map<string, VocabEntry[]>()
  for (const v of pool) {
    if (!v.kana || v.kana.length < 2) continue
    const key = normalizeReading(v.kana)
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(v)
  }
  const result: SoundGroup[] = []
  let i = 1
  for (const [norm, list] of map) {
    if (list.length < 2) continue
    // De-dupe note-variants of the same underlying word before counting —
    // only genuinely distinct kanji forms count as separate homophones.
    const byCore = new Map<string, VocabEntry>()
    for (const v of list) {
      const core = coreKanji(v.kanji) || v.kana
      if (!byCore.has(core)) byCore.set(core, v)
    }
    // Further merge known spelling-variant pairs (できる/出来る, 子供/子ども...)
    // — same word, two scripts, not two homophones.
    const entries: VocabEntry[] = []
    for (const v of byCore.values()) {
      const isDupe = entries.some(e => isSpellingVariantPair(coreKanji(e.kanji) || e.kana, coreKanji(v.kanji) || v.kana))
      if (!isDupe) entries.push(v)
    }
    if (entries.length < 2) continue
    const readings = Array.from(new Set(entries.map(e => e.kana)))
    result.push({
      id: `g${i++}`,
      normalizedReading: norm,
      readings,
      entries,
      difficultyScore: Math.min(entries.length, 5),
    })
  }
  // sort: groups with distinct readings (true sound-alikes) first, then by count desc
  return result.sort((a, b) => {
    const aDistinct = a.readings.length > 1 ? 1 : 0
    const bDistinct = b.readings.length > 1 ? 1 : 0
    if (aDistinct !== bDistinct) return bDistinct - aDistinct
    return b.entries.length - a.entries.length
  })
}

function WordCard({ entry }: { entry: VocabEntry }) {
  const { localize } = useTranslation()
  return (
    <div className="border-3 border-structural shadow-[var(--shadow-brutal)] p-4 flex-1 min-w-[140px] bg-paper">
      <PosTag pos={entry.pos} verbGroup={entry.verbGroup} />
      <div className="text-2xl font-black jp mt-3 mb-2">
        <Furigana kanji={entry.kanji} kana={entry.kana} />
      </div>
      <div className="text-sm font-bold">{localize(entry.meanings)}</div>
      {entry.kana && (
        <div className="text-xs text-muted jp mt-1">{entry.kana}</div>
      )}
    </div>
  )
}

export function Homophones() {
  const { t } = useTranslation()
  const level = useSettingsStore(s => s.level)
  const [selected, setSelected] = useState<SoundGroup | null>(null)

  const groups = useMemo(() => computeGroups(level), [level])
  const trueHomophones = groups.filter(g => g.readings.length === 1)
  const soundAlikes = groups.filter(g => g.readings.length > 1)

  return (
    <div className="relative p-4 sm:p-8 max-w-4xl overflow-hidden">
      <Watermark char="音" />
      {/* Header */}
      <div className="border-b-3 border-structural pb-8 mb-8">
        <h1 className="text-[clamp(2rem,8vw,3rem)] font-black tracking-tighter">{t('homophones.title')}</h1>
        <p className="text-muted font-bold text-sm uppercase tracking-widest mt-2">
          {t('homophones.subtitle')}
        </p>
      </div>

      {/* Group detail -- lists the exact homophones/sound-alikes directly,
          no reveal/guessing step. */}
      {selected ? (
        <div>
          <Button variant="ghost" size="sm" className="mb-6" onClick={() => setSelected(null)}>
            {t('homophones.backToList')}
          </Button>

          <div className="border-3 border-structural shadow-[6px_6px_0px_var(--color-yellow)] p-4 sm:p-8 mb-6">
            <div className="text-center mb-6">
              <div className="text-xs font-bold uppercase tracking-widest text-muted mb-2">
                {selected.readings.length > 1 ? t('homophones.similarSound') : t('homophones.identicalReading')}
              </div>
              {/* Show all distinct readings */}
              <div className="flex gap-3 justify-center flex-wrap mb-2">
                {selected.readings.map(r => (
                  <div key={r} className="text-4xl sm:text-5xl font-black jp">{r}</div>
                ))}
              </div>
              {selected.readings.length > 1 && (
                <div className="text-xs text-muted font-bold">
                  {t('homophones.normalized', { reading: selected.normalizedReading })}
                </div>
              )}
            </div>

            <div className="text-xs font-bold uppercase tracking-wider text-muted mb-4 text-center">
              {t('homophones.wordsShareSound', { n: selected.entries.length })}
            </div>

            <div className="flex gap-4 flex-wrap justify-center">
              {selected.entries.map(e => (
                <WordCard key={e.id} entry={e} />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="border-3 border-structural p-6 shadow-[5px_5px_0px_var(--color-yellow)] mb-8 flex items-center gap-8">
            <div>
              <div className="font-black text-2xl">{trueHomophones.length}</div>
              <div className="text-xs text-muted font-bold uppercase tracking-wider">{t('homophones.exactHomophones')}</div>
            </div>
            <div>
              <div className="font-black text-2xl">{soundAlikes.length}</div>
              <div className="text-xs text-muted font-bold uppercase tracking-wider">{t('homophones.soundAlikes')}</div>
            </div>
          </div>

          {/* Exact homophones */}
          {trueHomophones.length > 0 && (
            <>
              <div className="text-xs font-black uppercase tracking-widest mb-3 flex items-center gap-3">
                <span>{t('homophones.exactHomophones')}</span>
                <div className="flex-1 border-t-3 border-structural" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                {trueHomophones.map((g, i) => (
                  <GroupCard key={g.id} group={g} idx={i} onSelect={() => setSelected(g)} />
                ))}
              </div>
            </>
          )}

          {/* Sound-alikes */}
          {soundAlikes.length > 0 && (
            <>
              <div className="text-xs font-black uppercase tracking-widest mb-3 flex items-center gap-3">
                <span>{t('homophones.soundAlikes')}</span>
                <div className="flex-1 border-t-3 border-structural" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {soundAlikes.map((g, i) => (
                  <GroupCard key={g.id} group={g} idx={i} onSelect={() => setSelected(g)} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}

function GroupCard({ group, idx, onSelect }: { group: SoundGroup; idx: number; onSelect: () => void }) {
  const { t } = useTranslation()
  return (
    <button
      onClick={onSelect}
      className="border-3 border-structural p-4 text-left shadow-[var(--shadow-brutal)] hover:shadow-[5px_5px_0px_var(--color-yellow)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all bg-paper"
    >
      <div className="flex items-start gap-3">
        <div className="text-xs font-black text-muted w-6 shrink-0 pt-1">{idx + 1}</div>
        <div className="flex-1">
          <div className="flex flex-wrap gap-2 mb-2">
            {group.readings.map(r => (
              <span key={r} className="text-2xl font-black jp leading-none">{r}</span>
            ))}
          </div>
          <div className="text-xs font-bold uppercase tracking-wider text-muted mb-2">
            {t('homophones.wordsCount', { n: group.entries.length })}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {group.entries.map(e => (
              <span key={e.id} className="text-xs border border-structural px-2 py-0.5 font-bold">
                <Furigana kanji={e.kanji || e.kana} kana={e.kana} />
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          {Array.from({ length: group.difficultyScore }).map((_, i) => (
            <div key={i} className="w-1.5 h-5 bg-ink" />
          ))}
          {Array.from({ length: 5 - group.difficultyScore }).map((_, i) => (
            <div key={i} className="w-1.5 h-5 bg-surface border border-ink/30" />
          ))}
        </div>
      </div>
    </button>
  )
}
