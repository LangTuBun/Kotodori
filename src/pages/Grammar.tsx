import { useMemo, useState } from "react"
import grammarData from "@/data/n5/grammar.json"
import categoriesData from "@/data/n5/grammar-categories.json"
import type { GrammarPoint, GrammarCategory } from "@/types"
import { Ruby } from "@/components/ui/Ruby"

const grammar = grammarData as GrammarPoint[]
const categories = categoriesData.categories as GrammarCategory[]
const tips = categoriesData.tips as string[]

const ACCENTS = ['yellow', 'blue', 'red', 'green'] as const
const ACCENT_HEX: Record<string, string> = {
  yellow: '#ffe600', blue: '#0057ff', red: '#ff2d2d', green: '#00cc66',
}
function accentFor(order: number) {
  return ACCENTS[(order - 1) % ACCENTS.length]
}

export function Grammar() {
  const [search, setSearch] = useState("")
  const [cat, setCat] = useState<string | null>(null)
  const [selected, setSelected] = useState<GrammarPoint | null>(null)
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const [showTips, setShowTips] = useState(false)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return grammar.filter(g => {
      if (cat && g.category !== cat) return false
      if (q) {
        return (
          g.pattern.toLowerCase().includes(q) ||
          g.meaning.vi.toLowerCase().includes(q) ||
          g.num.includes(q)
        )
      }
      return true
    })
  }, [search, cat])

  const byCategory = useMemo(() => {
    const map = new Map<string, GrammarPoint[]>()
    for (const g of filtered) {
      if (!map.has(g.category)) map.set(g.category, [])
      map.get(g.category)!.push(g)
    }
    return map
  }, [filtered])

  const visibleCategories = categories.filter(c => byCategory.has(c.slug))

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Main list */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b-3 border-ink flex gap-3 bg-surface flex-wrap items-center">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm mẫu câu, nghĩa, số thứ tự..."
            className="flex-1 min-w-[200px] px-4 py-2 border-3 border-ink font-bold text-sm bg-paper focus:outline-none"
          />
          <button
            onClick={() => setShowTips(s => !s)}
            className={`px-3 py-2 border-3 border-ink font-bold text-xs uppercase tracking-wider cursor-pointer transition-all ${showTips ? 'bg-ink text-paper' : 'bg-paper hover:bg-yellow'}`}
          >
            Mẹo ôn tập
          </button>
          <div className="w-full text-xs font-bold uppercase tracking-wider text-muted">
            {filtered.length} / {grammar.length} mẫu câu
          </div>
        </div>

        {/* Category chips */}
        <div className="px-4 py-3 border-b-3 border-ink bg-paper flex gap-2 flex-wrap">
          <button
            onClick={() => setCat(null)}
            className={`px-3 py-1.5 border-2 border-ink font-black text-xs cursor-pointer transition-all ${cat === null ? 'bg-ink text-paper' : 'hover:bg-surface'}`}
          >
            Tất cả
          </button>
          {categories.map(c => (
            <button
              key={c.slug}
              onClick={() => setCat(prev => prev === c.slug ? null : c.slug)}
              className={`px-3 py-1.5 border-2 border-ink font-black text-xs cursor-pointer transition-all ${cat === c.slug ? 'bg-ink text-paper' : 'hover:bg-surface'}`}
              title={c.title}
            >
              {c.romanNumeral} <span className="opacity-60">({c.count})</span>
            </button>
          ))}
        </div>

        {showTips && (
          <div className="px-4 py-3 border-b-3 border-ink bg-yellow/30">
            <ul className="space-y-1.5">
              {tips.map((t, i) => (
                <li key={i} className="text-sm flex gap-2">
                  <span className="font-black">•</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Category sections */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {visibleCategories.length === 0 && (
            <div className="text-center text-muted py-12 font-bold">Không tìm thấy mẫu câu nào.</div>
          )}
          {visibleCategories.map(c => {
            const items = byCategory.get(c.slug) || []
            const accent = accentFor(c.order)
            const isCollapsed = collapsed[c.slug]
            return (
              <div key={c.slug} id={`cat-${c.slug}`}>
                <button
                  onClick={() => setCollapsed(s => ({ ...s, [c.slug]: !s[c.slug] }))}
                  className="w-full flex items-center gap-3 mb-3 text-left cursor-pointer group"
                >
                  <span
                    className="text-xs font-black px-2 py-1 border-2 border-ink shrink-0"
                    style={{ backgroundColor: ACCENT_HEX[accent] }}
                  >
                    {c.romanNumeral}
                  </span>
                  <span className="font-black text-base flex-1 group-hover:underline">{c.title}</span>
                  <span className="text-xs font-bold text-muted">{items.length}</span>
                  <span className="text-sm font-black text-muted w-4 text-center">{isCollapsed ? '+' : '−'}</span>
                </button>

                {!isCollapsed && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                    {items.map(g => (
                      <GrammarCard
                        key={g.id}
                        g={g}
                        accent={accent}
                        selected={selected?.id === g.id}
                        onClick={() => setSelected(g)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Detail drawer */}
      {selected ? (
        <div className="w-96 flex-shrink-0 overflow-y-auto bg-paper border-l-3 border-ink">
          <div className="p-6 border-b-3 border-ink">
            <button onClick={() => setSelected(null)} className="text-muted hover:text-red font-black mb-4 cursor-pointer">× Close</button>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-black px-2 py-0.5 border-2 border-ink" style={{ backgroundColor: ACCENT_HEX[accentFor(categories.find(c => c.slug === selected.category)?.order ?? 1)] }}>
                {categories.find(c => c.slug === selected.category)?.romanNumeral}
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-muted">#{selected.num} · {categories.find(c => c.slug === selected.category)?.title}</span>
            </div>
            <div className="text-3xl font-black leading-tight mb-3">
              <Ruby text={selected.pattern} html={selected.patternRuby} />
            </div>
            <div className="text-lg font-bold">{selected.meaning.vi}</div>
          </div>

          {selected.examples && selected.examples.length > 0 && (
            <div className="p-6">
              <div className="text-xs font-black uppercase tracking-wider mb-4">Ví dụ</div>
              {selected.examples.map((ex, i) => (
                <div key={i} className="mb-5 last:mb-0 border-l-3 pl-4" style={{ borderColor: ACCENT_HEX[accentFor(categories.find(c => c.slug === selected.category)?.order ?? 1)] }}>
                  <div className="font-bold text-lg leading-snug">
                    <Ruby text={ex.ja} html={ex.jaRuby} />
                  </div>
                  {ex.vi && <div className="text-sm text-muted mt-1">{ex.vi}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="w-80 hidden lg:flex items-center justify-center text-muted flex-shrink-0 border-l-3 border-ink">
          <div className="text-center p-8">
            <div className="text-6xl jp mb-4">文</div>
            <div className="font-bold text-sm uppercase tracking-wider">Chọn 1 mẫu câu</div>
            <div className="text-xs mt-1">hoặc di chuột qua thẻ để xem nhanh</div>
          </div>
        </div>
      )}
    </div>
  )
}

function GrammarCard({ g, accent, selected, onClick }: { g: GrammarPoint; accent: string; selected: boolean; onClick: () => void }) {
  const ex = g.examples[0]
  return (
    <div className="relative group">
      <button
        onClick={onClick}
        className={`w-full text-left p-3 border-3 transition-all duration-100 cursor-pointer ${
          selected ? 'border-ink bg-ink text-paper' : 'border-ink bg-paper hover:shadow-[4px_4px_0px_#0a0a0a] hover:-translate-x-0.5 hover:-translate-y-0.5'
        }`}
        style={!selected ? { borderLeftWidth: '6px', borderLeftColor: ACCENT_HEX[accent] } : undefined}
      >
        <div className="flex items-start gap-2">
          <span className={`text-[10px] font-black shrink-0 pt-0.5 ${selected ? 'text-paper/60' : 'text-muted'}`}>#{g.num}</span>
          <div className="flex-1 min-w-0">
            <div className="font-black text-sm leading-snug break-words">
              <Ruby text={g.pattern} html={g.patternRuby} />
            </div>
            <div className={`text-xs mt-1 ${selected ? 'text-paper/70' : 'text-muted'}`}>
              {g.meaning.vi || '—'}
            </div>
          </div>
        </div>
      </button>

      {/* Hover preview */}
      {ex && (
        <div className="pointer-events-none absolute left-0 right-0 top-full mt-1.5 z-30 opacity-0 invisible translate-y-1 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-150">
          <div className="bg-ink text-paper border-3 border-ink shadow-[4px_4px_0px_#0a0a0a] p-3">
            <div className="font-bold text-sm leading-snug">
              <Ruby text={ex.ja} html={ex.jaRuby} />
            </div>
            {ex.vi && <div className="text-xs text-paper/70 mt-1">{ex.vi}</div>}
          </div>
        </div>
      )}
    </div>
  )
}
