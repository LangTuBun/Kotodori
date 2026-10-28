import { useCallback, useEffect, useMemo, useState } from "react"
import radicalsJson from "@/data/radicals.json"
import { KanjiDrawer } from "@/components/kanji/KanjiDrawer"
import { Watermark } from "@/components/ui/ScreenHeader"
import { useTranslation } from "@/lib/useTranslation"
import { useKanjiVg } from "@/lib/kanji-vg"
import { KANJI_INDEX } from "@/lib/kanji"
import kanjiReadingsJson from "@/data/kanji-readings.json"

const KNOWN_KANJI = new Set([
  ...KANJI_INDEX.keys(),
  ...Object.keys(kanjiReadingsJson as Record<string, unknown>),
])

interface Radical { glyph: string; hanviet: string; meaning: string; strokes: number }
const RADICALS = radicalsJson as Radical[]

// bothu.pdf draws a few radicals in their traditional glyph; KanjiVG (and so
// the example kanji below) uses the Japanese form.
const JAPANESE_FORM: Record<string, string> = { "黑": "黒", "黃": "黄", "龍": "竜", "龜": "亀" }

const STORAGE_KEY = "tori.radicals.known"
function loadKnown(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return new Set(raw ? (JSON.parse(raw) as string[]) : [])
  } catch {
    return new Set()
  }
}
function saveKnown(known: Set<string>) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...known])) } catch { /* storage unavailable */ }
}

function shuffled<T>(items: T[]): T[] {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

type Tab = "cards" | "table"
type Direction = "glyph" | "name"

export function Radicals() {
  const { localize } = useTranslation()
  const L = (vi: string, en: string) => localize({ vi, en })
  const vg = useKanjiVg()
  const [tab, setTab] = useState<Tab>("cards")
  const [direction, setDirection] = useState<Direction>("glyph")
  const [known, setKnown] = useState<Set<string>>(loadKnown)
  const [onlyUnknown, setOnlyUnknown] = useState(false)
  const [order, setOrder] = useState<number[]>(() => RADICALS.map((_, i) => i))
  const [pos, setPos] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [drawerChar, setDrawerChar] = useState<string | null>(null)

  const deck = useMemo(
    () => order.filter(i => !onlyUnknown || !known.has(RADICALS[i].glyph)),
    [order, onlyUnknown, known],
  )
  const card = deck.length > 0 ? RADICALS[deck[Math.min(pos, deck.length - 1)]] : null

  // Kanji built from each radical, for the "example kanji" row on the card back.
  const examples = useMemo(() => {
    const map = new Map<string, string[]>()
    if (!vg) return map
    for (const [char, entry] of Object.entries(vg)) {
      if (!KNOWN_KANJI.has(char)) continue
      for (const el of new Set(entry.components.map(c => c.element))) {
        if (el === char) continue
        const list = map.get(el) ?? []
        list.push(char)
        map.set(el, list)
      }
    }
    return map
  }, [vg])

  const move = useCallback((delta: number) => {
    setFlipped(false)
    setPos(p => (deck.length === 0 ? 0 : (p + delta + deck.length) % deck.length))
  }, [deck.length])

  const mark = (isKnown: boolean) => {
    if (!card) return
    const next = new Set(known)
    if (isKnown) next.add(card.glyph)
    else next.delete(card.glyph)
    setKnown(next)
    saveKnown(next)
    // In "only unknown" mode the marked card leaves the deck, so the next one
    // slides into this position; otherwise step forward.
    if (!(onlyUnknown && isKnown)) move(1)
    else setFlipped(false)
  }

  useEffect(() => {
    if (tab !== "cards" || drawerChar !== null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return
      if (e.key === "ArrowRight") move(1)
      else if (e.key === "ArrowLeft") move(-1)
      else if (e.key === " " || e.key === "Enter") { e.preventDefault(); setFlipped(f => !f) }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [tab, drawerChar, move])

  const byStrokes = useMemo(() => {
    const groups = new Map<number, Radical[]>()
    for (const r of RADICALS) groups.set(r.strokes, [...(groups.get(r.strokes) ?? []), r])
    return [...groups.entries()].sort((a, b) => a[0] - b[0])
  }, [])

  const showGlyphFront = direction === "glyph"
  const cardExamples = card ? (examples.get(card.glyph) ?? examples.get(JAPANESE_FORM[card.glyph] ?? "") ?? []).slice(0, 8) : []

  return (
    <div className="relative p-4 sm:p-8 max-w-5xl overflow-hidden">
      <Watermark char="部" />
      <div className="border-b-3 border-structural pb-6 mb-6">
        <div className="text-xs font-bold uppercase tracking-widest text-muted mb-2">部首 · 214</div>
        <h1 className="text-[clamp(2rem,8vw,3rem)] font-black tracking-tighter">{L("Bộ thủ", "Radicals")}</h1>
        <p className="text-muted font-bold text-sm mt-2 max-w-2xl leading-relaxed">
          {L(
            "Ôn tập 214 bộ thủ tiếng Nhật. Lật thẻ để xem tên Hán Việt, ý nghĩa và các chữ Hán ví dụ.",
            "Master the 214 Japanese radicals. Flip cards to review Hán Việt names, meanings, and example kanji.",
          )}
        </p>
        <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
          <div className="inline-flex bg-surface rounded-[9px] p-0.5 gap-0.5">
            {(["cards", "table"] as const).map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`px-3.5 py-1.5 rounded-[7px] text-xs cursor-pointer transition-[color,background-color,box-shadow,transform] duration-200 active:scale-95 ${tab === id ? "bg-[var(--tori-seg-pill)] text-ink font-semibold shadow-[0_1px_3px_rgb(0_0_0/0.12)]" : "font-medium text-muted hover:text-ink"}`}
              >
                {id === "cards" ? "Flashcard" : L("Bảng 214 bộ", "All 214")}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-muted">
              {L(`Đã thuộc ${known.size}/${RADICALS.length}`, `Known ${known.size}/${RADICALS.length}`)}
            </span>
            <div className="w-28 sm:w-36 h-2 border border-structural bg-card overflow-hidden">
              <div className="h-full bg-green transition-all" style={{ width: `${(known.size / RADICALS.length) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>

      {tab === "cards" && (
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <button
              type="button"
              onClick={() => { setDirection(d => (d === "glyph" ? "name" : "glyph")); setFlipped(false) }}
              className="px-3.5 py-1.5 rounded-full border border-structural bg-card hover:bg-surface text-xs font-semibold cursor-pointer transition-[background-color,transform] active:scale-95"
            >
              {showGlyphFront ? L("Chiều: Chữ → Tên", "Mode: Glyph → Name") : L("Chiều: Tên → Chữ", "Mode: Name → Glyph")}
            </button>
            <button
              type="button"
              onClick={() => { setOrder(o => shuffled(o)); setPos(0); setFlipped(false) }}
              className="px-3.5 py-1.5 rounded-full border border-structural bg-card hover:bg-surface text-xs font-semibold cursor-pointer transition-[background-color,transform] active:scale-95"
            >
              {L("Xáo trộn", "Shuffle")}
            </button>
            <button
              type="button"
              aria-pressed={onlyUnknown}
              onClick={() => { setOnlyUnknown(v => !v); setPos(0); setFlipped(false) }}
              className={`px-3.5 py-1.5 rounded-full border text-xs font-semibold cursor-pointer transition-[background-color,transform] active:scale-95 ${
                onlyUnknown ? "border-accent bg-accent text-accent-fg" : "border-structural bg-card hover:bg-surface"
              }`}
            >
              {L("Chỉ bộ chưa thuộc", "Unknown only")}
            </button>
          </div>

          {card ? (
            <>
              <div
                role="button"
                tabIndex={0}
                onClick={() => setFlipped(f => !f)}
                className="glass-card glass-lift min-h-[22rem] p-6 flex flex-col items-center justify-center text-center select-none"
              >
                <div className="text-[10px] font-black uppercase tracking-widest text-muted mb-3">
                  {Math.min(pos, deck.length - 1) + 1} / {deck.length}
                </div>
                {showGlyphFront !== flipped ? (
                  <div className="jp text-[clamp(6rem,24vw,10rem)] leading-none font-black">{card.glyph}</div>
                ) : (
                  <div>
                    <div className="text-[clamp(2rem,8vw,3.5rem)] font-black leading-tight">{card.hanviet}</div>
                    {card.meaning && <div className="text-lg font-bold text-muted mt-2">{card.meaning}</div>}
                  </div>
                )}
                {flipped && (
                  <div className="mt-5 text-sm font-bold text-muted">
                    {showGlyphFront ? null : <span className="jp text-4xl font-black text-ink mr-3">{card.glyph}</span>}
                    {L(`${card.strokes} nét`, `${card.strokes} strokes`)}
                  </div>
                )}
                {!flipped && <div className="mt-6 text-xs font-bold text-muted">{L("Bấm hoặc nhấn Space để lật", "Tap or press Space to flip")}</div>}
              </div>

              {flipped && cardExamples.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-muted">{L("Chữ ví dụ", "Examples")}</span>
                  {cardExamples.map(ch => (
                    <button
                      key={ch}
                      onClick={() => setDrawerChar(ch)}
                      className="jp w-10 h-10 border border-structural bg-card text-xl font-black cursor-pointer"
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 mt-5">
                <div className="flex items-center gap-2">
                  <button onClick={() => move(-1)} aria-label={L("Trước", "Previous")} className="size-11 rounded-full glass-card glass-lift flex items-center justify-center text-xl leading-none font-medium">‹</button>
                  <button onClick={() => setFlipped(f => !f)} className="h-11 px-5 rounded-full glass-card glass-lift text-sm font-semibold">{L("Lật", "Flip")}</button>
                  <button onClick={() => move(1)} aria-label={L("Sau", "Next")} className="size-11 rounded-full glass-card glass-lift flex items-center justify-center text-xl leading-none font-medium">›</button>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => mark(false)} className="h-11 px-5 rounded-full bg-red/15 text-red text-sm font-semibold cursor-pointer transition-transform active:scale-95">{L("Chưa thuộc", "Not yet")}</button>
                  <button onClick={() => mark(true)} className="h-11 px-5 rounded-full bg-green text-white text-sm font-semibold cursor-pointer transition-transform active:scale-95 shadow-[0_4px_14px_color-mix(in_srgb,var(--tori-jade)_35%,transparent)]">{L("Đã thuộc", "Known")}</button>
                </div>
              </div>
            </>
          ) : (
            <div className="border-3 border-structural bg-card p-8 text-center font-black">{L("Bạn đã thuộc hết 214 bộ!", "You know all 214 radicals!")}</div>
          )}
        </div>
      )}

      {tab === "table" && (
        <div className="space-y-6">
          {byStrokes.map(([strokes, list]) => (
            <section key={strokes}>
              <h2 className="text-xs font-black uppercase tracking-widest text-muted mb-2">{L(`${strokes} nét`, `${strokes} strokes`)}</h2>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(5.5rem,1fr))] gap-2">
                {list.map(r => (
                  <button
                    key={r.glyph + r.hanviet}
                    onClick={() => setDrawerChar(r.glyph)}
                    title={r.meaning}
                    className={`border border-structural p-2 text-center cursor-pointer ${known.has(r.glyph) ? "bg-green/20" : "bg-card"}`}
                  >
                    <div className="jp text-3xl font-black leading-tight">{r.glyph}</div>
                    <div className="text-[11px] font-bold leading-tight mt-1">{r.hanviet}</div>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <KanjiDrawer char={drawerChar} onClose={() => setDrawerChar(null)} />
    </div>
  )
}
