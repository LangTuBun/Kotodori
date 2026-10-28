import { useDeferredValue, useEffect, useMemo, useState } from "react"
import { KanjiDrawer } from "@/components/kanji/KanjiDrawer"
import { DrawPad } from "@/components/kanji/DrawPad"
import { Watermark } from "@/components/ui/ScreenHeader"
import { useTranslation } from "@/lib/useTranslation"
import { useKanjiVg } from "@/lib/kanji-vg"
import { buildCandidatesAsync, recognize, type Candidate, type Stroke } from "@/lib/kanji-recognizer"
import { kanjiRecords, searchKanji, type KanjiRecord } from "@/lib/kanji-search"

type Mode = "search" | "draw"

function KanjiTile({ record, onOpen }: { record: KanjiRecord; onOpen: (c: string) => void }) {
  const { localize } = useTranslation()
  return (
    <button
      onClick={() => onOpen(record.char)}
      className="border border-structural bg-card p-2 text-left cursor-pointer hover:shadow-[var(--shadow-brutal)] transition-shadow"
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="jp text-3xl font-black leading-none">{record.char}</span>
        {record.hanviet && <span className="text-sm font-black">{record.hanviet}</span>}
      </div>
      <div className="text-[11px] font-bold text-muted mt-1 line-clamp-2 min-h-[2.2em]">{localize(record.meaning)}</div>
      {record.on.length > 0 && <div className="jp text-[11px] font-bold text-blue mt-1 truncate">{record.on.slice(0, 3).join("・")}</div>}
    </button>
  )
}

export function KanjiLookup() {
  const { localize } = useTranslation()
  const L = (vi: string, en: string) => localize({ vi, en })
  const vg = useKanjiVg()
  const [mode, setMode] = useState<Mode>("search")
  const [query, setQuery] = useState("")
  const deferredQuery = useDeferredValue(query)
  const [strokes, setStrokes] = useState<Stroke[]>([])
  const [candidates, setCandidates] = useState<Candidate[] | null>(null)
  const [drawerChar, setDrawerChar] = useState<string | null>(null)

  const records = useMemo(() => kanjiRecords(), [])
  const byChar = useMemo(() => new Map(records.map(r => [r.char, r])), [records])
  const results = useMemo(() => searchKanji(deferredQuery), [deferredQuery])

  // Feature maps for ~960 glyphs are built in the background as soon as the
  // stroke data is in (not on the first tap of the drawing pad), a slice at a
  // time so the page never stalls.
  useEffect(() => {
    if (!vg || candidates) return
    let cancelled = false
    const kanjiOnlyVg = Object.fromEntries(
      Object.entries(vg).filter(([ch]) => byChar.has(ch)),
    )
    buildCandidatesAsync(kanjiOnlyVg).then(c => { if (!cancelled) setCandidates(c) })
    return () => { cancelled = true }
  }, [vg, candidates, byChar])

  const guesses = useMemo(
    () => (candidates && strokes.length > 0 ? recognize(strokes, candidates) : []),
    [candidates, strokes],
  )

  return (
    <div className="relative p-4 sm:p-8 max-w-5xl overflow-hidden">
      <Watermark char="字" />
      <div className="border-b-3 border-structural pb-6 mb-6">
        <div className="text-xs font-bold uppercase tracking-widest text-muted mb-2">字引 · {L("Tra cứu", "Lookup")}</div>
        <h1 className="text-[clamp(2rem,8vw,3rem)] font-black tracking-tighter">{L("Tra Kanji", "Kanji Lookup")}</h1>
        <p className="text-muted font-bold text-sm mt-3 max-w-2xl leading-relaxed">
          {L(
            "Tìm bằng chữ Hán, âm Hán Việt (gõ có hoặc không dấu: “minh”, “đại”), cách đọc kana hoặc nghĩa; hoặc vẽ tay chữ bạn đang thấy.",
            "Search by kanji, Hán Việt (with or without tones), kana reading or meaning, or draw the character you're looking at.",
          )}
        </p>
        <div className="flex gap-2 mt-4">
          {(["search", "draw"] as const).map(id => (
            <button
              key={id}
              onClick={() => setMode(id)}
              className={`px-3 py-1.5 border border-structural text-xs font-black uppercase tracking-wider cursor-pointer ${mode === id ? "bg-surface text-ink" : "bg-card"}`}
            >
              {id === "search" ? L("Tìm kiếm", "Search") : L("Vẽ tay", "Draw")}
            </button>
          ))}
        </div>
      </div>

      {mode === "search" && (
        <div>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={L("Kanji, Hán Việt (minh), kana hoặc nghĩa…", "Kanji, Hán Việt (minh), kana or meaning…")}
            className="w-full max-w-xl border-3 border-structural bg-card px-4 py-3 font-medium"
            autoFocus
          />
          <div className="text-xs font-bold text-muted mt-2">
            {deferredQuery.trim()
              ? L(`${results.length} kết quả`, `${results.length} results`)
              : L(`${records.length} chữ Hán trong app`, `${records.length} kanji in the app`)}
          </div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(8.5rem,1fr))] gap-2 mt-4">
            {results.map(r => <KanjiTile key={r.char} record={r} onOpen={setDrawerChar} />)}
          </div>
        </div>
      )}

      {mode === "draw" && (
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-80 shrink-0">
            <DrawPad strokes={strokes} onChange={setStrokes} className="w-full aspect-square" />
            <div className="flex gap-2 mt-3">
              <button onClick={() => setStrokes(s => s.slice(0, -1))} disabled={strokes.length === 0} className="px-3 py-1.5 border border-structural bg-card text-xs font-black disabled:opacity-40 cursor-pointer">
                {L("Hoàn tác nét", "Undo stroke")}
              </button>
              <button onClick={() => setStrokes([])} disabled={strokes.length === 0} className="px-3 py-1.5 border border-structural bg-card text-xs font-black disabled:opacity-40 cursor-pointer">
                {L("Xóa hết", "Clear")}
              </button>
              <span className="text-xs font-bold text-muted self-center">{L(`${strokes.length} nét`, `${strokes.length} strokes`)}</span>
            </div>
            <p className="text-[11px] font-bold text-muted mt-3 leading-relaxed">
              {L(
                "Vẽ đúng thứ tự nét sẽ cho kết quả chính xác nhất. Chỉ tìm được các chữ có sẵn dữ liệu nét trong app.",
                "Drawing the strokes in the correct order works best. Only kanji with stroke data in the app can be found.",
              )}
            </p>
          </div>
          <div className="flex-1">
            {!candidates && <div className="text-sm font-bold text-muted">{L("Đang tải dữ liệu nét…", "Loading stroke data…")}</div>}
            {candidates && strokes.length === 0 && <div className="text-sm font-bold text-muted">{L("Hãy vẽ một chữ vào khung bên cạnh.", "Draw a character in the box.")}</div>}
            <div className="grid grid-cols-[repeat(auto-fill,minmax(8.5rem,1fr))] gap-2">
              {guesses.map(c => {
                const rec = byChar.get(c)
                return rec ? (
                  <KanjiTile key={c} record={rec} onOpen={setDrawerChar} />
                ) : (
                  <button key={c} onClick={() => setDrawerChar(c)} className="border border-structural bg-card p-2 cursor-pointer">
                    <span className="jp text-3xl font-black">{c}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      <KanjiDrawer char={drawerChar} onClose={() => setDrawerChar(null)} />
    </div>
  )
}
