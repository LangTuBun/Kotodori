import countersData from "@/data/n5/counters.json"
import type { CountersData, CounterCategory, CounterColumn } from "@/types"
import { useTranslation } from "@/lib/useTranslation"

const data = countersData as CountersData

const ACCENTS = ['yellow', 'blue', 'red', 'green'] as const
const ACCENT_HEX: Record<string, string> = {
  yellow: '#ffe600', blue: '#0057ff', red: '#ff2d2d', green: '#00cc66',
}
function accentFor(i: number) {
  return ACCENTS[i % ACCENTS.length]
}

export function Counters() {
  const { t } = useTranslation()
  const COLUMN_LABELS: Record<CounterColumn, string> = {
    number: t('counters.columns.number'),
    kanji: t('counters.columns.kanji'),
    kana: t('counters.columns.kana'),
    romaji: t('counters.columns.romaji'),
    meaning: t('counters.columns.meaning'),
    note: t('counters.columns.note'),
  }
  return (
    <div className="p-8 max-w-6xl">
      {/* Header */}
      <div className="border-b-3 border-ink pb-8 mb-8">
        <div className="text-xs font-bold uppercase tracking-widest text-muted mb-2">N5 · 助数詞</div>
        <h1 className="text-5xl font-black tracking-tighter">{data.title}</h1>
        <p className="text-muted font-bold text-sm mt-3 max-w-2xl leading-relaxed">{data.intro}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {data.categories.map((cat, i) => (
          <div key={cat.id} className={cat.wide ? 'md:col-span-2 xl:col-span-3' : ''}>
            <CounterTable category={cat} accent={accentFor(i)} columnLabels={COLUMN_LABELS} />
          </div>
        ))}
      </div>

      {data.bigNumberExamples.length > 0 && (
        <div className="mt-6 border-3 border-ink bg-yellow/20 shadow-[5px_5px_0px_#0a0a0a] p-6">
          <div className="text-xs font-black uppercase tracking-widest mb-4">
            {t('counters.bigExamplesTitle')}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {data.bigNumberExamples.map((ex, i) => (
              <div key={i} className="border-2 border-ink bg-paper p-4">
                <div className="jp text-xl font-black">{ex.kanji}</div>
                <div className="jp text-sm mt-1 text-muted">{ex.kana}</div>
                <div className="text-xs mt-1 italic text-muted">{ex.romaji}</div>
                <div className="text-sm mt-2 font-bold text-green">{ex.meaning}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function CounterTable({ category, accent, columnLabels }: { category: CounterCategory; accent: string; columnLabels: Record<CounterColumn, string> }) {
  return (
    <div
      className="h-full border-3 border-ink bg-paper shadow-[4px_4px_0px_#0a0a0a] overflow-hidden flex flex-col"
      style={{ borderLeftWidth: '6px', borderLeftColor: ACCENT_HEX[accent] }}
    >
      <div className="px-4 py-3 border-b-3 border-ink bg-surface">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-black text-sm uppercase tracking-wide">{category.shortTitle}</h3>
          {category.counter && (
            <span className="jp text-sm font-black shrink-0 border-2 border-ink bg-paper px-1.5 py-0.5">
              {category.counter}{category.counterKana ? ` ・ ${category.counterKana}` : ''}
            </span>
          )}
        </div>
        {category.usage && (
          <p className="text-xs mt-1.5 leading-relaxed text-muted font-bold">{category.usage}</p>
        )}
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b-3 border-ink bg-surface">
              {category.columns.map(col => (
                <th
                  key={col}
                  className="text-left px-3 py-2 text-[10px] font-black uppercase tracking-wider whitespace-nowrap text-muted"
                >
                  {columnLabels[col]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {category.rows.map((row, i) => (
              <tr
                key={i}
                className={`border-b border-ink/20 last:border-0 transition-colors ${row.isQuestion ? 'bg-yellow/20' : 'hover:bg-surface'}`}
              >
                {category.columns.map(col => {
                  const value = row[col]
                  const isJp = col === 'kanji' || col === 'kana'
                  const emphasize = row.isQuestion && (col === 'kanji' || col === 'meaning')
                  return (
                    <td
                      key={col}
                      className={`px-3 py-2.5 whitespace-nowrap ${isJp ? 'jp' : ''} ${
                        emphasize ? 'font-black text-green' :
                        col === 'kanji' ? 'font-bold' :
                        col === 'kana' ? 'text-muted' :
                        'text-muted text-xs'
                      }`}
                    >
                      {value ?? '—'}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {category.footnote && (
        <div className="px-4 py-2.5 text-xs border-t-3 border-ink bg-surface leading-relaxed text-muted font-bold">
          {category.footnote}
        </div>
      )}
    </div>
  )
}
