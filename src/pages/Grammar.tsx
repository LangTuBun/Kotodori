import { useState, useMemo } from "react"
import grammarData from "@/data/n5/grammar.json"
import type { GrammarPoint } from "@/types"

const grammar = grammarData as GrammarPoint[]
const CATS = Array.from(new Set(grammar.map(g => g.category))).sort()

export function Grammar() {
  const [search, setSearch] = useState("")
  const [cat, setCat] = useState<string | null>(null)
  const [selected, setSelected] = useState<GrammarPoint | null>(null)

  const filtered = useMemo(() => {
    return grammar.filter(g => {
      if (cat && g.category !== cat) return false
      if (search) {
        const q = search.toLowerCase()
        return g.pattern.toLowerCase().includes(q) || g.meaning.vi.toLowerCase().includes(q)
      }
      return true
    })
  }, [search, cat])

  return (
    <div className="flex h-screen overflow-hidden">
      {/* List */}
      <div className="flex-1 flex flex-col overflow-hidden border-r-3 border-ink">
        {/* Toolbar */}
        <div className="p-4 border-b-3 border-ink flex gap-3 bg-surface flex-wrap">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search grammar pattern or meaning..."
            className="flex-1 min-w-[200px] px-4 py-2 border-3 border-ink font-bold text-sm bg-paper focus:outline-none"
          />
          <select
            value={cat ?? ""}
            onChange={e => setCat(e.target.value || null)}
            className="px-3 py-2 border-3 border-ink font-bold text-sm bg-paper cursor-pointer"
          >
            <option value="">All categories</option>
            {CATS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="px-4 py-2 border-b-3 border-ink text-xs font-bold uppercase tracking-wider text-muted">
          {filtered.length} patterns
        </div>

        <div className="flex-1 overflow-y-auto">
          {filtered.map((g, idx) => (
            <button
              key={g.id}
              onClick={() => setSelected(g)}
              className={`w-full text-left px-4 py-3 border-b border-ink/20 hover:bg-surface transition-colors ${selected?.id === g.id ? 'bg-ink text-paper' : ''}`}
            >
              <div className="flex items-start gap-3">
                <div className="text-xs font-black text-muted w-8 shrink-0 text-right pt-1">{idx + 1}</div>
                <div className="flex-1">
                  <div className="font-black jp text-lg leading-tight">{g.pattern}</div>
                  <div className={`text-sm mt-0.5 ${selected?.id === g.id ? 'text-paper/70' : 'text-muted'}`}>
                    {g.meaning.vi.slice(0, 60)}
                  </div>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 border-2 shrink-0 ${
                  selected?.id === g.id ? 'border-paper/50 text-paper' : 'border-ink/30 text-muted'
                }`}>
                  {g.category}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Detail */}
      {selected ? (
        <div className="w-96 flex-shrink-0 overflow-y-auto bg-paper">
          <div className="p-6 border-b-3 border-ink">
            <button onClick={() => setSelected(null)} className="text-muted hover:text-red font-black mb-4">✕ Close</button>
            <div className="text-xs font-bold uppercase tracking-wider text-muted mb-2">{selected.category}</div>
            <div className="text-4xl font-black jp leading-tight mb-3">{selected.pattern}</div>
            <div className="text-xl font-bold">{selected.meaning.vi}</div>
          </div>

          {selected.explanation?.vi && (
            <div className="p-6 border-b-3 border-ink">
              <div className="text-xs font-black uppercase tracking-wider mb-3">Explanation</div>
              <p className="text-sm leading-relaxed">{selected.explanation.vi}</p>
            </div>
          )}

          {selected.nuances && selected.nuances.length > 0 && (
            <div className="p-6 border-b-3 border-ink">
              <div className="text-xs font-black uppercase tracking-wider mb-3">Notes</div>
              {selected.nuances.map((n, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <span className="text-yellow font-black">★</span>
                  <span className="text-sm">{n}</span>
                </div>
              ))}
            </div>
          )}

          {selected.examples && selected.examples.length > 0 && (
            <div className="p-6">
              <div className="text-xs font-black uppercase tracking-wider mb-4">Examples</div>
              {selected.examples.map((ex, i) => (
                <div key={i} className="mb-5 last:mb-0 border-l-3 border-yellow pl-4">
                  <div className="jp font-bold">{ex.ja}</div>
                  {ex.kana && <div className="jp text-sm text-muted">{ex.kana}</div>}
                  <div className="text-sm text-muted mt-1">{ex.vi}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="w-80 hidden lg:flex items-center justify-center text-muted">
          <div className="text-center p-8">
            <div className="text-6xl jp mb-4">文</div>
            <div className="font-bold text-sm uppercase tracking-wider">Select a pattern</div>
          </div>
        </div>
      )}
    </div>
  )
}
