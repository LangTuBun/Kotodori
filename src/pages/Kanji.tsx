import { useEffect, useMemo, useState } from "react"
import type { KanjiGroup } from "@/types"
import { n5KanjiChapters, n4KanjiChapters } from "@/data/kanji"
import { Furigana } from "@/components/ui/Furigana"
import { ACCENT_HEX, accentFor, cleanReadings, onkunTone } from "@/lib/kanji"
import { KanjiDrawer } from "@/components/kanji/KanjiDrawer"
import { KanjiGroupModal } from "@/components/kanji/KanjiGroupModal"
import { useTranslation } from "@/lib/useTranslation"
import { useSettingsStore, type Level } from "@/store/settings-store"
import { Watermark } from "@/components/ui/ScreenHeader"
import { CollapsibleFilters } from "@/components/ui/CollapsibleFilters"

// N5's textbook chapters run 1-15 and N4's run 15-24 (both numbered after
// their own curriculum's Bai/chapter, per their own source material) -- so
// "chapter 15" exists in both. Every chapter/group is tagged with its
// source level below so 'all' scope never collides the two under one key.
type Src = 'N5' | 'N4'
interface TaggedChapter { src: Src; chapter: number; wordCount: number; groups: KanjiGroup[] }

function taggedChapters(level: Level): TaggedChapter[] {
  const n5 = n5KanjiChapters.map(c => ({ src: 'N5' as const, chapter: c.chapter, wordCount: c.wordCount, groups: c.groups }))
  const n4 = n4KanjiChapters.map(c => ({ src: 'N4' as const, chapter: c.chapter, wordCount: c.wordCount, groups: c.groups }))
  if (level === 'N5') return n5
  if (level === 'N4') return n4
  return [...n5, ...n4]
}

const LEVELS: { value: Level; label: string }[] = [
  { value: 'N5', label: 'N5' },
  { value: 'N4', label: 'N4' },
  { value: 'all', label: 'N5+N4' },
]

export function Kanji() {
  const { t } = useTranslation()
  const level = useSettingsStore(s => s.level)
  const setLevel = useSettingsStore(s => s.setLevel)
  const chapters = useMemo(() => taggedChapters(level), [level])
  const [chapterKey, setChapterKey] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [selectedAnchor, setSelectedAnchor] = useState<string | null>(null)
  const [selectedGroupIndex, setSelectedGroupIndex] = useState<number | null>(null)

  // A chapter selection from before a level switch may no longer exist in
  // the new chapter set -- reset to "all chapters" rather than filtering to
  // nothing (or, worse, matching an unrelated chapter of the same number).
  useEffect(() => {
    setChapterKey(null)
  }, [level])

  const totalWords = useMemo(() => chapters.reduce((a, c) => a + c.wordCount, 0), [chapters])

  const visibleChapters = chapterKey === null ? chapters : chapters.filter(c => `${c.src}-${c.chapter}` === chapterKey)

  const filteredGroups = useMemo(() => {
    const q = search.trim().toLowerCase()
    const result: Array<{ src: Src; chapterNum: number; group: KanjiGroup }> = []
    for (const c of visibleChapters) {
      for (const g of c.groups) {
        if (!q) {
          result.push({ src: c.src, chapterNum: c.chapter, group: g })
          continue
        }
        const hit =
          g.anchor.includes(q) ||
          g.words.some(w =>
            w.kanji.toLowerCase().includes(q) ||
            w.kana.toLowerCase().includes(q) ||
            w.meaning.vi.toLowerCase().includes(q) ||
            w.meaning.en.toLowerCase().includes(q) ||
            w.hanviet.toLowerCase().includes(q)
          )
        if (hit) result.push({ src: c.src, chapterNum: c.chapter, group: g })
      }
    }
    return result
  }, [visibleChapters, search])

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
        <Watermark char="字" />
        {/* Toolbar */}
        <div className="p-4 border-b-3 border-structural flex gap-3 bg-surface flex-wrap items-center">
          <div role="group" aria-label="JLPT level" className="inline-flex border-2 border-structural rounded-[var(--radius-sm)] overflow-hidden shrink-0">
            {LEVELS.map(({ value, label }, i) => (
              <button
                key={value}
                type="button"
                aria-pressed={level === value}
                onClick={() => setLevel(value)}
                className={`px-2.5 py-1 font-mono text-xs font-black uppercase tracking-wider cursor-pointer transition-colors ${
                  i > 0 ? 'border-l-2 border-structural' : ''
                } ${level === value ? 'bg-ink text-paper' : 'bg-paper hover:bg-surface'}`}
              >
                {label}
              </button>
            ))}
          </div>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('kanji.searchPlaceholder')}
            className="flex-1 min-w-[200px] px-4 py-2 border-3 border-structural font-bold text-sm bg-paper focus:outline-none"
          />
          <div className="w-full text-xs font-bold uppercase tracking-wider text-muted">
            {t('common.wordsCount', { n: chapterKey === null ? totalWords : (visibleChapters[0]?.wordCount ?? 0) })} · {t('kanji.groupsCount', { n: filteredGroups.length })}
          </div>
        </div>

        {/* Chapter chips */}
        <CollapsibleFilters
          label={t('common.chapterN', { n: '' }).replace(/\s*$/, '')}
          activeLabel={
            chapterKey === null
              ? t('common.all')
              : (() => {
                  const ch = chapters.find(c => `${c.src}-${c.chapter}` === chapterKey)
                  if (!ch) return t('common.all')
                  return `${level === 'all' ? ch.src + ' ' : ''}${t('common.chapterN', { n: ch.chapter })} (${ch.wordCount})`
                })()
          }
          isFiltered={chapterKey !== null}
        >
          <button
            onClick={() => setChapterKey(null)}
            className={`px-3 py-1.5 border-2 rounded-[var(--radius-sm)] font-black text-xs cursor-pointer transition-all ${chapterKey === null ? 'border-ink bg-ink text-paper' : 'border-structural hover:bg-surface'}`}
          >
            {t('common.all')}
          </button>
          {chapters.map(c => {
            const key = `${c.src}-${c.chapter}`
            return (
              <button
                key={key}
                onClick={() => setChapterKey(prev => prev === key ? null : key)}
                className={`px-3 py-1.5 border-2 rounded-[var(--radius-sm)] font-black text-xs cursor-pointer transition-all ${chapterKey === key ? 'border-ink bg-ink text-paper' : 'border-structural hover:bg-surface'}`}
              >
                {level === 'all' && <span className="opacity-60">{c.src} </span>}
                {t('common.chapterN', { n: c.chapter })} <span className="opacity-60">({c.wordCount})</span>
              </button>
            )
          })}
        </CollapsibleFilters>

        {/* Groups grid */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 pb-[calc(2.5rem+env(safe-area-inset-bottom))]">
          {filteredGroups.length === 0 && (
            <div className="text-center text-muted py-12 font-bold">{t('kanji.noResults')}</div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {filteredGroups.map(({ src, chapterNum, group }, i) => (
              <KanjiGroupCard
                key={`${src}-${group.id}`}
                group={group}
                chapterLabel={level === 'all' ? `${src} ${chapterNum}` : `${chapterNum}`}
                accent={accentFor(i)}
                onAnchorClick={() => setSelectedAnchor(group.anchor)}
                onCardClick={() => setSelectedGroupIndex(i)}
              />
            ))}
          </div>
        </div>
      </div>

      <KanjiDrawer char={selectedAnchor} onClose={() => setSelectedAnchor(null)} />

      {selectedGroupIndex !== null && filteredGroups[selectedGroupIndex] && (
        <KanjiGroupModal
          items={filteredGroups}
          index={selectedGroupIndex}
          onIndexChange={setSelectedGroupIndex}
          onClose={() => setSelectedGroupIndex(null)}
          onAnchorClick={setSelectedAnchor}
          strokeDrawerOpen={selectedAnchor !== null}
        />
      )}
    </div>
  )
}

function KanjiGroupCard({ group, chapterLabel, accent, onAnchorClick, onCardClick }: { group: KanjiGroup; chapterLabel: string; accent: string; onAnchorClick: () => void; onCardClick: () => void }) {
  const { t, localize } = useTranslation()
  const on = cleanReadings(group.onyomi)
  const kun = cleanReadings(group.kunyomi)

  return (
    <div
      onClick={onCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onCardClick() } }}
      className="bg-paper border-3 border-structural p-3 cursor-pointer transition-shadow hover:shadow-[var(--shadow-brutal)]"
      style={{ borderLeftWidth: '6px', borderLeftColor: ACCENT_HEX[accent] }}
    >
      {/* Header: leading kanji */}
      <div className="flex items-start gap-3 mb-2 pb-2 border-b-2 border-ink/10">
        <button
          onClick={e => { e.stopPropagation(); onAnchorClick() }}
          title={t('kanji.viewStrokeAnim')}
          className="appearance-none bg-transparent border-0 p-0 m-0 text-4xl font-black jp leading-none shrink-0 pt-0.5 cursor-pointer transition-transform hover:scale-110 hover:ring-2 hover:ring-offset-2 hover:ring-ink/40 rounded-sm"
        >
          {group.anchor}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            {group.hanviet && (
              <span className="text-xs font-black px-1.5 py-0.5 border-2 border-structural rounded-[var(--radius-sm)] bg-surface shrink-0">{group.hanviet}</span>
            )}
            <span className="text-[10px] font-bold text-muted shrink-0">Ch. {chapterLabel}</span>
          </div>

          {/* Real On'yomi / Kun'yomi kana readings */}
          <div className="flex flex-wrap items-center gap-1 mt-1.5">
            {on.shown.length > 0 && (
              <span className="text-[9px] font-black uppercase tracking-wider text-blue/70">On</span>
            )}
            {on.shown.map(r => (
              <span key={`on-${r}`} className="jp text-[11px] font-bold px-1.5 py-0.5 border border-blue/30 bg-blue/10 text-blue">
                {r}
              </span>
            ))}
            {on.extra > 0 && <span className="text-[10px] text-muted">+{on.extra}</span>}

            {kun.shown.length > 0 && (
              <span className="text-[9px] font-black uppercase tracking-wider text-green/70 ml-1">Kun</span>
            )}
            {kun.shown.map(r => (
              <span key={`kun-${r}`} className="jp text-[11px] font-bold px-1.5 py-0.5 border border-green/30 bg-green/10 text-green">
                {r}
              </span>
            ))}
            {kun.extra > 0 && <span className="text-[10px] text-muted">+{kun.extra}</span>}

            {on.shown.length === 0 && kun.shown.length === 0 && (
              <span className="text-[10px] text-muted italic">{t('kanji.unknownReading')}</span>
            )}
          </div>

          {group.meaning && (
            <div className="text-sm text-muted mt-1">{localize(group.meaning)}</div>
          )}
        </div>
      </div>

      {/* Words containing the leading kanji */}
      <ul className="space-y-1.5">
        {group.words.map((w, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <span className="jp font-bold leading-snug shrink-0 min-w-[3.5rem]">
              <Furigana kanji={w.kanji} kana={w.kana} />
            </span>
            <span className="flex-1 min-w-0 leading-snug">
              <span>{localize(w.meaning)}</span>
              <span className="text-muted text-xs ml-1.5">({w.hanviet})</span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider shrink-0 pt-0.5" style={{ color: onkunTone(w.onkun) }}>
              {w.onkun}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
