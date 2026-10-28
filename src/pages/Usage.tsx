import { memo, useCallback, useDeferredValue, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { synonymGroups, collocationGroups, auxiliaryVerbs } from "@/data/usage"
import { getGrammarLinks } from "@/data/grammar-links"
import type {
  AuxiliaryVerb, CollocationEntry, CollocationGroup, GrammarLink, SynonymGroup, SynonymWord,
} from "@/types"
import { Furigana } from "@/components/ui/Furigana"
import { Card } from "@/components/ui/Card"
import { PosTag } from "@/components/ui/PosTag"
import { SpeakButton } from "@/components/ui/SpeakButton"
import { Watermark } from "@/components/ui/ScreenHeader"
import { useTranslation } from "@/lib/useTranslation"
import { useSettingsStore } from "@/store/settings-store"

// For the "compare with" link: resolves a contrastId to its partner's display
// pattern regardless of which group (or filtered subset) is rendering.
const collocationPatternById: Record<string, string> = Object.fromEntries(
  collocationGroups.flatMap(g => g.entries.map(e => [e.id, e.pattern]))
)

type Localize = (m: { vi: string; en: string } | undefined | null) => string
type T = (key: string, vars?: Record<string, string | number>) => string
type L = (vi: string, en: string) => string
type Tab = "synonyms" | "particles" | "auxiliary"

const PARTICLE_COLOR: Record<string, string> = {
  に: "var(--color-blue)",
  を: "var(--color-red)",
  が: "var(--color-green)",
  と: "var(--color-yellow)",
}

// Short, plain chip labels (the full group titles are long glosses).
const SYNONYM_SHORT: Record<string, { vi: string; en: string }> = {
  wear: { vi: "Mặc, đội, đeo", en: "Wear" },
  play: { vi: "Chơi", en: "Play" },
  "see-hear": { vi: "Nhìn, nghe", en: "See, hear" },
  "know-understand": { vi: "Biết, hiểu", en: "Know, understand" },
  "borrow-lend": { vi: "Mượn, cho mượn", en: "Borrow, lend" },
  "teach-learn": { vi: "Dạy, học", en: "Teach, learn" },
  "bring-take": { vi: "Mang, dẫn đi", en: "Bring, take" },
  "say-speak": { vi: "Nói", en: "Say, speak" },
  return: { vi: "Về, quay lại", en: "Return" },
  think: { vi: "Nghĩ", en: "Think" },
}
const PARTICLE_SHORT: Record<string, { vi: string; en: string }> = {
  transport: { vi: "Lên, xuống phương tiện", en: "Vehicles" },
  "feelings-relationships": { vi: "Cảm xúc, quan hệ", en: "Feelings, people" },
  "motion-through-space": { vi: "Đi qua nơi nào đó (を)", en: "Moving through (を)" },
  "phone-everyday": { vi: "Điện thoại, sinh hoạt", en: "Phone, daily life" },
}

// Fast path for the biggest "which verb?" question: pick by body part.
const WEAR_QUICK: { part: { vi: string; en: string }; verbs: string[] }[] = [
  { part: { vi: "Thân trên, cả người (áo, váy liền)", en: "Torso, whole body (shirt, dress)" }, verbs: ["着る"] },
  { part: { vi: "Chân, dưới eo (quần, váy, giày, tất)", en: "Legs, feet (pants, skirt, shoes, socks)" }, verbs: ["履く"] },
  { part: { vi: "Đầu (mũ, nón)", en: "Head (hat, cap)" }, verbs: ["被る"] },
  { part: { vi: "Mắt (kính)", en: "Eyes (glasses)" }, verbs: ["かける"] },
  { part: { vi: "Cổ (khăn quàng)", en: "Neck (scarf)" }, verbs: ["巻く"] },
  { part: { vi: "Cà vạt, thắt lưng", en: "Tie, belt" }, verbs: ["締める", "する"] },
  { part: { vi: "Tay, ngón tay (găng, nhẫn)", en: "Hands, fingers (gloves, ring)" }, verbs: ["はめる", "する"] },
  { part: { vi: "Phụ kiện (khuyên tai, khẩu trang, đồng hồ)", en: "Accessories (earrings, mask, watch)" }, verbs: ["つける", "する"] },
  { part: { vi: "Khoác hờ lên vai (áo ngoài)", en: "Draped over shoulders (outer layer)" }, verbs: ["羽織る"] },
  { part: { vi: "Cởi quần áo, giày, mũ", en: "Taking off clothes, shoes, hat" }, verbs: ["脱ぐ"] },
  { part: { vi: "Tháo kính, nhẫn, đồng hồ, khẩu trang", en: "Taking off glasses, ring, watch, mask" }, verbs: ["外す"] },
]

function haystackOf(parts: (string | undefined)[]) {
  return parts.filter(Boolean).join(" ").toLowerCase()
}
const synonymWordHaystack = (w: SynonymWord) => haystackOf([w.kanji, w.kana, w.meaning.vi, w.meaning.en, w.nuance.vi, w.nuance.en])
const collocationHaystack = (e: CollocationEntry) => haystackOf([e.pattern, e.verb.kanji, e.verb.kana, e.verb.meaning.vi, e.verb.meaning.en, e.explanation.vi, e.explanation.en])
const auxiliaryHaystack = (a: AuxiliaryVerb) => haystackOf([a.pattern, a.colloquial, a.meaning.vi, a.meaning.en, a.nuance.vi, a.nuance.en])

function scrollToEntry(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({ behavior: "smooth", block: "center" })
  el.style.transition = "box-shadow 150ms ease"
  const prev = el.style.boxShadow
  el.style.boxShadow = "0 0 0 3px var(--color-accent)"
  window.setTimeout(() => { el.style.boxShadow = prev }, 900)
}

export function Usage() {
  const routerNavigate = useNavigate()
  // Stable identity so the memoized cards below don't re-render when the
  // router hands back a new navigate function.
  const navigate = useCallback((to: string) => { routerNavigate(to) }, [routerNavigate])
  const { t, localize } = useTranslation()
  const l: L = (vi, en) => localize({ vi, en })
  const level = useSettingsStore(s => s.level)
  const [tab, setTab] = useState<Tab>("synonyms")
  const [synonymId, setSynonymId] = useState(synonymGroups[0].id)
  const [particleId, setParticleId] = useState(collocationGroups[0].id)
  const [search, setSearch] = useState("")
  // The input reads `search`; the lists read the deferred copy so typing is
  // painted first and the card re-render never blocks the next keystroke.
  const query = useDeferredValue(search).trim().toLowerCase()

  // AuxiliaryVerb.grammarIds cross-links into grammar.ts, whose /grammar route
  // only resolves points inside the CURRENTLY selected level's list, so scope
  // the lookup the same way: a chip only shows when its target exists.
  const grammarById = useMemo(
    () => Object.fromEntries(getGrammarLinks(level).map(g => [g.id, g])) as Record<string, GrammarLink>,
    [level]
  )

  // Searching looks across every group; browsing shows the chosen group only.
  const synonymsShown = useMemo<SynonymGroup[]>(() => {
    if (query) {
      return synonymGroups
        .map(g => ({ ...g, words: g.words.filter(w => synonymWordHaystack(w).includes(query)) }))
        .filter(g => g.words.length > 0)
    }
    return synonymGroups.filter(g => g.id === synonymId)
  }, [query, synonymId])

  const collocationsShown = useMemo<CollocationGroup[]>(() => {
    if (query) {
      return collocationGroups
        .map(g => ({ ...g, entries: g.entries.filter(e => collocationHaystack(e).includes(query)) }))
        .filter(g => g.entries.length > 0)
    }
    return collocationGroups.filter(g => g.id === particleId)
  }, [query, particleId])

  const auxiliariesShown = useMemo(
    () => (query ? auxiliaryVerbs.filter(a => auxiliaryHaystack(a).includes(query)) : auxiliaryVerbs),
    [query]
  )

  const noResults =
    (tab === "synonyms" && synonymsShown.length === 0) ||
    (tab === "particles" && collocationsShown.length === 0) ||
    (tab === "auxiliary" && auxiliariesShown.length === 0)

  const TABS: { id: Tab; glyph: string; title: string; hint: string; example: string }[] = [
    {
      id: "synonyms", glyph: "類",
      title: l("Từ gần nghĩa", "Similar words"),
      hint: l("Tiếng Việt chỉ có một từ (mặc, chơi, nghe…) nhưng tiếng Nhật có nhiều từ. Chọn từ nào?", "One word in English or Vietnamese, several in Japanese. Which one do you pick?"),
      example: "着る / 履く / 被る",
    },
    {
      id: "particles", glyph: "助",
      title: l("Động từ đi với trợ từ nào", "Which particle goes with the verb"),
      hint: l("Mỗi động từ đòi một trợ từ cố định, và tiếng Việt không giúp bạn đoán được.", "Each verb demands a fixed particle, and your own language will not help you guess."),
      example: "電車に乗る / 電車を降りる",
    },
    {
      id: "auxiliary", glyph: "補",
      title: l("Thêm nghĩa cho động từ (〜て…)", "Adding meaning to a verb (〜て…)"),
      hint: l("Gắn thêm vào thể て để nói lỡ làm, thử làm, làm sẵn, đang dần thay đổi…", "Added after the て-form to say: did it by accident, tried it, did it in advance, is gradually changing…"),
      example: "食べてしまう / 食べてみる",
    },
  ]

  return (
    <div className="h-full overflow-y-auto pb-[env(safe-area-inset-bottom)]">
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-5 overflow-hidden">
        <Watermark char="別" />

        {/* Header */}
        <div className="mb-5">
          <div className="text-xs font-bold uppercase tracking-widest text-muted mb-2">N5 · N4 · 使い方</div>
          <h1 className="text-3xl sm:text-4xl font-black leading-tight">{t("nav.usage")}</h1>
          <p className="text-sm text-muted mt-2 max-w-2xl">{t("usage.subtitle")}</p>
        </div>

        {/* What do you want to learn? */}
        <div role="tablist" aria-label={l("Chọn nội dung", "Choose a topic")} className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
          {TABS.map(tb => {
            const active = tab === tb.id
            return (
              <button
                key={tb.id}
                role="tab"
                aria-selected={active}
                onClick={() => setTab(tb.id)}
                className={`text-left border-3 p-3 cursor-pointer transition-[background-color,border-color,box-shadow] ${
                  active ? "border-accent bg-accent text-accent-fg shadow-none" : "border-structural bg-paper hover:shadow-[var(--shadow-brutal-hover)]"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="jp font-black text-xl leading-none">{tb.glyph}</span>
                  <span className="font-black text-sm leading-tight">{tb.title}</span>
                </div>
                <p className={`text-xs leading-relaxed ${active ? "opacity-80" : "text-muted"}`}>{tb.hint}</p>
                <div className={`jp text-xs font-bold mt-2 ${active ? "opacity-90" : ""}`}>{tb.example}</div>
              </button>
            )
          })}
        </div>

        {/* Search */}
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={t("usage.searchPlaceholder")}
          aria-label={t("usage.searchPlaceholder")}
          className="w-full px-4 py-2.5 mb-5 border-3 border-structural font-sans font-bold text-sm bg-card focus:outline-none focus:border-accent focus:shadow-[0_0_0_4px_var(--tori-accent-soft)] transition-[border-color,box-shadow]"
        />

        {/* Topic chips: one group at a time keeps the page short */}
        {!query && tab === "synonyms" && (
          <ChipRow
            items={synonymGroups.map(g => ({ id: g.id, label: localize(SYNONYM_SHORT[g.id]) || g.glossJa, count: g.words.length }))}
            active={synonymId}
            onPick={setSynonymId}
          />
        )}
        {!query && tab === "particles" && (
          <ChipRow
            items={collocationGroups.map(g => ({ id: g.id, label: localize(PARTICLE_SHORT[g.id]) || localize(g.title), count: g.entries.length }))}
            active={particleId}
            onPick={setParticleId}
          />
        )}

        {tab === "synonyms" && (
          <div className="space-y-8 mb-8">
            {synonymsShown.map(g => (
              <SynonymGroupBlock key={g.id} group={g} t={t} l={l} localize={localize} showQuick={!query && g.id === "wear"} />
            ))}
          </div>
        )}

        {tab === "particles" && (
          <div className="space-y-8 mb-8">
            {collocationsShown.map(g => (
              <CollocationGroupBlock key={g.id} group={g} t={t} localize={localize} />
            ))}
          </div>
        )}

        {tab === "auxiliary" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8 items-start">
            {auxiliariesShown.map(a => (
              <AuxiliaryVerbCard key={a.id} entry={a} t={t} localize={localize} navigate={navigate} grammarById={grammarById} />
            ))}
          </div>
        )}

        {noResults && <p className="text-sm text-muted text-center py-8">{t("usage.noResults")}</p>}
      </div>
    </div>
  )
}

function ChipRow({ items, active, onPick }: { items: { id: string; label: string; count: number }[]; active: string; onPick: (id: string) => void }) {
  return (
    <div className="-mx-4 sm:-mx-6 px-4 sm:px-6 mb-5">
      <div className="flex gap-2 overflow-x-auto pb-1 snap-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map(it => (
          <button
            key={it.id}
            onClick={() => onPick(it.id)}
            aria-pressed={active === it.id}
            className={`snap-start shrink-0 border px-3 py-1.5 text-sm font-bold cursor-pointer whitespace-nowrap ${
              active === it.id ? "border-accent bg-accent text-accent-fg" : "border-structural bg-paper"
            }`}
          >
            {it.label} <span className="opacity-60 text-xs">{it.count}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function TrapBox({ label, text }: { label: string; text: string }) {
  return (
    <div className="px-4 py-2.5 border-t-3 border-structural bg-red/5">
      <div className="text-[10px] font-black uppercase tracking-wider text-red mb-1">{label}</div>
      <p className="text-xs text-red font-bold leading-relaxed">{text}</p>
    </div>
  )
}

// - Similar words ---------------------------------------------------------

function WearQuickPick({ l, localize }: { l: L; localize: Localize }) {
  return (
    <div className="border-3 border-structural bg-card mb-4">
      <div className="px-3 py-2 border-b-3 border-structural bg-surface font-black text-sm">
        {l("Chọn nhanh theo vị trí trên cơ thể", "Quick pick by body part")}
      </div>
      <ul className="divide-y-2 divide-structural/20">
        {WEAR_QUICK.map(row => (
          <li key={row.part.en} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
            <span className="font-bold">{localize(row.part)}</span>
            <span className="flex gap-1.5 shrink-0">
              {row.verbs.map(v => (
                <button
                  key={v}
                  onClick={() => scrollToEntry(`word-${v}`)}
                  className="jp border border-structural bg-card px-2.5 py-0.5 font-black cursor-pointer"
                >
                  {v}
                </button>
              ))}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

const SynonymGroupBlock = memo(function SynonymGroupBlock({
  group, t, l, localize, showQuick,
}: { group: SynonymGroup; t: T; l: L; localize: Localize; showQuick: boolean }) {
  return (
    <section>
      <div className="flex items-baseline justify-between gap-3 mb-3 border-b-2 border-structural pb-1.5">
        <div className="flex flex-wrap items-baseline gap-x-2 min-w-0">
          <span className="jp font-black text-lg text-accent">{group.glossJa}</span>
          <span className="font-bold text-sm text-muted">{localize(group.title)}</span>
        </div>
        <span className="font-mono text-xs font-bold text-muted shrink-0">{t("common.wordsCount", { n: group.words.length })}</span>
      </div>

      {group.note && (
        <div className="border-3 border-structural bg-yellow/20 p-3 mb-4">
          <div className="text-[10px] font-black uppercase tracking-wider mb-1">{l("Mẹo nhớ", "Rule of thumb")}</div>
          <p className="text-sm text-ink font-bold leading-relaxed">{localize(group.note)}</p>
        </div>
      )}

      {showQuick && <WearQuickPick l={l} localize={localize} />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {group.words.map(w => (
          <div key={w.kanji} id={`word-${w.kanji}`} className="scroll-mt-24 transition-shadow">
            <Card className="cv-auto p-0 overflow-hidden h-full flex flex-col">
              <div className="p-4 flex-1">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="inline-flex items-center gap-1.5">
                    <Furigana className="text-xl font-black" kanji={w.kanji} kana={w.kana} />
                    <SpeakButton text={w.kana} />
                  </span>
                  <PosTag pos={w.pos} verbGroup={w.verbGroup} />
                </div>
                <div className="text-sm font-bold text-muted mb-2">{localize(w.meaning)}</div>
                <p className="text-sm leading-relaxed mb-3">{localize(w.nuance)}</p>
                <div className="border border-structural rounded-[var(--radius-sm)] bg-surface px-3 py-2">
                  <div className="flex items-start gap-1.5">
                    <Furigana className="text-sm font-bold" kanji={w.example.ja} kana={w.example.kana} />
                    <SpeakButton text={w.example.ja} />
                  </div>
                  <div className="text-xs font-normal text-muted mt-1">{localize(w.example)}</div>
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>
    </section>
  )
})

// - Verb + particle pairs -------------------------------------------------

const CollocationGroupBlock = memo(function CollocationGroupBlock({
  group, t, localize,
}: { group: CollocationGroup; t: T; localize: Localize }) {
  return (
    <section>
      <div className="mb-3">
        <div className="font-black text-base">{localize(group.title)}</div>
        <p className="text-sm text-muted leading-relaxed mt-1">{localize(group.description)}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {group.entries.map(e => (
          <div key={e.id} id={e.id} className="scroll-mt-24 transition-shadow">
            <Card className="cv-auto p-0 overflow-hidden h-full flex flex-col">
              <div className="p-4 flex-1">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="jp font-mono font-black text-base">{e.pattern}</span>
                  <span
                    className="shrink-0 text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full tint jp"
                    style={{ '--tint': PARTICLE_COLOR[e.particle] ?? "var(--color-muted)" } as React.CSSProperties}
                  >
                    {e.particle}
                  </span>
                </div>
                <div className="text-sm font-bold mb-1 flex flex-wrap items-center gap-x-1.5">
                  <Furigana kanji={e.verb.kanji} kana={e.verb.kana} /> <SpeakButton text={e.verb.kana} />
                  <span className="text-muted font-normal">{localize(e.verb.meaning)}</span>
                </div>
                <p className="text-sm leading-relaxed mt-2 mb-3">{localize(e.explanation)}</p>
                <div className="border border-structural rounded-[var(--radius-sm)] bg-surface px-3 py-2">
                  <div className="flex items-start gap-1.5">
                    <Furigana className="text-sm font-bold" kanji={e.example.ja} kana={e.example.kana} />
                    <SpeakButton text={e.example.ja} />
                  </div>
                  <div className="text-xs font-normal text-muted mt-1">{localize(e.example)}</div>
                </div>
                {e.contrastId && collocationPatternById[e.contrastId] && (
                  <button
                    onClick={() => scrollToEntry(e.contrastId!)}
                    className="mt-3 text-xs font-bold text-accent hover:underline cursor-pointer"
                  >
                    ⇄ {t("usage.compareWith")} <span className="jp">{collocationPatternById[e.contrastId]}</span>
                  </button>
                )}
              </div>
              {e.trap && <TrapBox label={t("usage.trapLabel")} text={localize(e.trap)} />}
            </Card>
          </div>
        ))}
      </div>
    </section>
  )
})

// - Adding meaning to a verb (補助動詞) -----------------------------------

const AuxiliaryVerbCard = memo(function AuxiliaryVerbCard({
  entry, t, localize, navigate, grammarById,
}: {
  entry: AuxiliaryVerb
  t: T
  localize: Localize
  navigate: (to: string) => void
  grammarById: Record<string, GrammarLink>
}) {
  const linkedGrammar = (entry.grammarIds ?? []).map(id => grammarById[id]).filter((g): g is GrammarLink => !!g)
  return (
    <Card className="cv-auto p-0 overflow-hidden h-full flex flex-col">
      <div className="p-4 flex-1">
        <div className="flex items-baseline justify-between gap-2 mb-1.5">
          <span className="jp font-black text-2xl">{entry.pattern}</span>
          {entry.colloquial && <span className="jp text-xs text-muted font-bold shrink-0">{entry.colloquial}</span>}
        </div>
        <div className="text-sm font-bold text-muted mb-2">{localize(entry.meaning)}</div>
        <p className="text-sm leading-relaxed mb-3">{localize(entry.nuance)}</p>
        <div className="space-y-2">
          {entry.examples.map((ex, i) => (
            <div key={i} className="border border-structural rounded-[var(--radius-sm)] bg-surface px-3 py-2">
              <div className="flex items-start gap-1.5">
                <Furigana className="text-sm font-bold" kanji={ex.ja} kana={ex.kana} />
                <SpeakButton text={ex.ja} />
              </div>
              <div className="text-xs font-normal text-muted mt-1">{localize(ex)}</div>
            </div>
          ))}
        </div>

        {linkedGrammar.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 mt-3">
            {linkedGrammar.map(g => (
              <button
                key={g.id}
                onClick={() => navigate(`/grammar?point=${g.id}`)}
                className="group shrink-0 w-48 text-left border-3 border-structural bg-card p-2.5 cursor-pointer transition-[box-shadow,transform] hover:shadow-[var(--shadow-brutal-hover)]"
                style={{ borderLeftWidth: "3px", borderLeftColor: "var(--color-blue)" }}
              >
                <div className="flex items-start justify-between gap-1.5">
                  <div className="jp font-bold text-xs leading-snug">{g.pattern}</div>
                  <span className="shrink-0 mt-0.5 text-muted group-hover:text-ink group-hover:translate-x-0.5 transition-transform text-xs">→</span>
                </div>
                <div className="text-[11px] mt-1.5 leading-relaxed text-muted">{localize(g.meaning)}</div>
              </button>
            ))}
          </div>
        )}
      </div>
      {entry.trap && <TrapBox label={t("usage.trapLabel")} text={localize(entry.trap)} />}
    </Card>
  )
})
