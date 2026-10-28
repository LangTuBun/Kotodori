import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getVerbForms, getCheatSheets, getKeyExceptions } from "@/data/verb-forms"
import { getGrammarLinks } from "@/data/grammar-links"
import { CONFUSING_PAIRS, GODAN_LOOKING_ICHIDAN, ICHIDAN_LOOKING_GODAN, type TrapVerb } from "@/data/verb-traps"
import { checkVerb, conjugate, type CheckResult, type VerbGroupId } from "@/lib/verb-conjugation"
import { Furigana } from "@/components/ui/Furigana"
import { Ruby } from "@/components/ui/Ruby"
import { SpeakButton } from "@/components/ui/SpeakButton"
import { useTranslation } from "@/lib/useTranslation"
import { useSettingsStore } from "@/store/settings-store"
import { Watermark } from "@/components/ui/ScreenHeader"

const HEADER_RUBY = '<ruby>動詞<rp>(</rp><rt>どうし</rt><rp>)</rp></ruby>の<ruby>形<rp>(</rp><rt>かたち</rt><rp>)</rp></ruby>'
const LEVEL_LABEL: Record<string, string> = { N5: 'N5', N4: 'N4', all: 'N5+N4' }

const GROUP_ACCENT: Record<string, string> = {
  "1": "var(--color-yellow)", "2": "var(--color-blue)", "3": "var(--color-red)", all: "var(--color-green)", neg: "var(--color-muted)",
}
function groupAccent(g: number | string) {
  return GROUP_ACCENT[String(g)] ?? "var(--color-ink)"
}

type L = (vi: string, en: string) => string

const EXAMPLES = ["帰る", "かえる", "着る", "きる", "起きます", "食べる", "勉強します"]

// - Group checker ---------------------------------------------------------

function GroupBadge({ group, l }: { group: VerbGroupId; l: L }) {
  const names: Record<VerbGroupId, string> = {
    1: l("Nhóm 1 (ngũ đoạn)", "Group 1 (godan)"),
    2: l("Nhóm 2 (nhất đoạn)", "Group 2 (ichidan)"),
    3: l("Nhóm 3 (bất quy tắc)", "Group 3 (irregular)"),
  }
  return (
    <span className="inline-block border border-structural px-2 py-0.5 text-xs font-black" style={{ backgroundColor: groupAccent(group) }}>
      {names[group]}
    </span>
  )
}

function ConjugationGrid({ dict, group, l }: { dict: string; group: VerbGroupId; l: L }) {
  const c = conjugate(dict, group)
  if (!c) return null
  const rows: [string, string][] = [
    [l("ます (lịch sự)", "ます (polite)"), c.masu],
    [l("ない (phủ định)", "ない (negative)"), c.nai],
    [l("て", "て"), c.te],
    [l("た (quá khứ)", "た (past)"), c.ta],
    [l("ば (nếu)", "ば (if)"), c.ba],
    [l("ý chí (〜よう)", "volitional (〜よう)"), c.volitional],
    [l("khả năng", "potential"), c.potential],
  ]
  // The step people get wrong: how a dictionary-form る turns into ます.
  const endsRu = dict.endsWith("る") && group !== 3
  return (
    <div>
      {endsRu && (
        <div className="mb-2 text-sm font-bold border border-structural px-3 py-2" style={{ backgroundColor: group === 1 ? "var(--color-yellow)" : "var(--color-blue)", color: "var(--color-ink)" }}>
          {group === 1
            ? l("Nhóm 1: る → り + ます (thêm り, KHÔNG chỉ bỏ る)", "Group 1: る → り + ます (add り, do NOT just drop る)")
            : l("Nhóm 2: bỏ る rồi thêm ます (không có り)", "Group 2: drop る and add ます (no り)")}
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {rows.map(([label, value]) => (
          <div key={label} className="border border-structural bg-card px-2.5 py-2">
            <div className="text-[10px] font-black uppercase tracking-wider text-muted">{label}</div>
            <div className="jp font-black text-base">{value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function GroupChecker({ l, localize }: { l: L; localize: (m: { vi: string; en: string } | undefined | null) => string }) {
  const [input, setInput] = useState("")
  const result: CheckResult | null = useMemo(() => checkVerb(input), [input])

  return (
    <section className="border-3 border-structural bg-card shadow-[var(--shadow-brutal)] p-4 sm:p-5 mb-8">
      <h2 className="font-black text-lg sm:text-xl">{l("Động từ này thuộc nhóm nào?", "Which group is this verb?")}</h2>
      <p className="text-sm text-muted mt-1 mb-3">
        {l("Gõ dạng từ điển (帰る, かえる) hoặc dạng ます (帰ります). Nên gõ bằng kana nếu bạn không chắc cách đọc chữ Hán.", "Type the dictionary form (帰る, かえる) or the ます form (帰ります). Use kana if you are unsure how a kanji reads.")}
      </p>
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder={l("Ví dụ: 帰る, きる, 起きます…", "e.g. 帰る, きる, 起きます…")}
        aria-label={l("Nhập một động từ", "Enter a verb")}
        className="jp w-full border-3 border-structural bg-card px-4 py-3 text-lg font-bold"
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
      />
      <div className="flex flex-wrap gap-2 mt-3">
        {EXAMPLES.map(ex => (
          <button key={ex} onClick={() => setInput(ex)} className="jp border border-structural bg-card px-3 py-1.5 text-sm font-bold cursor-pointer active:translate-y-px">
            {ex}
          </button>
        ))}
      </div>

      <div aria-live="polite" className="mt-4">
        {result && result.status !== "ambiguous" && result.group && result.dict && (
          <div className="border-3 border-structural bg-card p-3 sm:p-4">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="jp text-2xl font-black">{result.dict}</span>
              <GroupBadge group={result.group} l={l} />
              {result.meaning && <span className="text-sm font-bold text-muted">{localize(result.meaning)}</span>}
            </div>
            <p className="text-sm mb-3">{localize(result.reason)}</p>
            <ConjugationGrid dict={result.dict} group={result.group} l={l} />
          </div>
        )}
        {result && result.status === "ambiguous" && (
          <div className="border-3 border-structural bg-card p-3 sm:p-4">
            <p className="text-sm font-bold mb-3">{localize(result.reason)}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(result.candidates ?? []).map(c => {
                const conj = conjugate(c.dict, c.group)
                return (
                  <div key={c.group + c.dict} className="border border-structural p-3" style={{ borderLeftWidth: 3, borderLeftColor: groupAccent(c.group) }}>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="jp text-xl font-black">{c.dict}</span>
                      <GroupBadge group={c.group} l={l} />
                    </div>
                    {c.meaning && <div className="text-xs text-muted mb-1">{localize(c.meaning)}</div>}
                    {conj && <div className="jp text-sm font-bold">{conj.masu} · {conj.nai} · {conj.te}</div>}
                  </div>
                )
              })}
            </div>
          </div>
        )}
        {result && result.status === "unknown" && (
          <p className="text-sm font-bold border border-structural bg-surface px-3 py-2">{localize(result.reason)}</p>
        )}
      </div>
    </section>
  )
}

// - Rule summary ----------------------------------------------------------

function RuleCards({ l }: { l: L }) {
  const cards: { group: VerbGroupId; title: string; test: string; masu: string; examples: string }[] = [
    {
      group: 1,
      title: l("Nhóm 1 (ngũ đoạn)", "Group 1 (godan)"),
      test: l("Đuôi う く ぐ す つ ぬ ぶ む, hoặc đuôi る mà trước đó là あ / う / お.", "Ends in う く ぐ す つ ぬ ぶ む, or in る after an あ / う / お sound."),
      masu: l("Đổi chữ cuối sang hàng い rồi thêm ます. Đuôi る thì る → り + ます.", "Change the last kana to the い row, add ます. For る: る → り + ます."),
      examples: "行く → 行きます　乗る → 乗ります",
    },
    {
      group: 2,
      title: l("Nhóm 2 (nhất đoạn)", "Group 2 (ichidan)"),
      test: l("Đuôi る mà trước đó là い / え (〜いる, 〜える), trừ danh sách ngoại lệ ở dưới.", "Ends in る after an い / え sound (〜いる, 〜える), except the exceptions below."),
      masu: l("Bỏ る rồi thêm ます.", "Drop る, add ます."),
      examples: "食べる → 食べます　見る → 見ます",
    },
    {
      group: 3,
      title: l("Nhóm 3 (bất quy tắc)", "Group 3 (irregular)"),
      test: l("Chỉ có する và 来る (cùng các từ ghép 〜する).", "Only する and 来る (and 〜する compounds)."),
      masu: l("Học thuộc: する → します, 来る → 来ます (きます).", "Memorise: する → します, 来る → 来ます (きます)."),
      examples: "勉強する → 勉強します",
    },
  ]
  return (
    <section className="mb-8">
      <h2 className="font-black text-lg sm:text-xl mb-3">{l("3 nhóm động từ trong 1 phút", "The 3 verb groups in a minute")}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {cards.map(c => (
          <div key={c.group} className="border-3 border-structural bg-card overflow-hidden">
            <div className="px-3 py-2 border-b-3 border-structural font-black text-sm" style={{ backgroundColor: groupAccent(c.group) }}>{c.title}</div>
            <div className="p-3 space-y-2 text-sm">
              <p><span className="font-black">{l("Nhận biết: ", "Spot it: ")}</span>{c.test}</p>
              <p><span className="font-black">{l("Sang ます: ", "To ます: ")}</span>{c.masu}</p>
              <p className="jp font-bold text-sm border-t-2 border-structural/30 pt-2">{c.examples}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// - Confusion lists -------------------------------------------------------

function VerbChip({ verb, group }: { verb: TrapVerb; group: VerbGroupId }) {
  const { localize } = useTranslation()
  const c = conjugate(verb.kanji === verb.kana ? verb.kana : verb.kanji, group)
  return (
    <div className="border border-structural bg-card px-3 py-2" style={{ borderLeftWidth: 3, borderLeftColor: groupAccent(group) }}>
      <div className="flex items-center gap-1.5">
        <Furigana className="text-lg font-black" kanji={verb.kanji} kana={verb.kana} />
        <SpeakButton text={verb.kana} />
      </div>
      <div className="text-xs text-muted">{localize(verb.meaning)}</div>
      {c && <div className="jp text-xs font-bold mt-0.5">{c.masu} · {c.nai}</div>}
    </div>
  )
}

function VerbList({ verbs, group, l }: { verbs: TrapVerb[]; group: VerbGroupId; l: L }) {
  const [more, setMore] = useState(false)
  const common = verbs.filter(v => !v.rare)
  const rare = verbs.filter(v => v.rare)
  return (
    <div>
      <div className="grid grid-cols-1 min-[420px]:grid-cols-2 md:grid-cols-3 gap-2">
        {common.map(v => <VerbChip key={v.kanji + v.kana} verb={v} group={group} />)}
        {more && rare.map(v => <VerbChip key={v.kanji + v.kana} verb={v} group={group} />)}
      </div>
      {rare.length > 0 && (
        <button onClick={() => setMore(m => !m)} className="mt-3 text-sm font-bold underline cursor-pointer">
          {more ? l("Thu gọn", "Show less") : l(`Xem thêm ${rare.length} từ ít gặp`, `Show ${rare.length} less common`)}
        </button>
      )}
    </div>
  )
}

function Accordion({ title, defaultOpen, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  return (
    <details open={defaultOpen} className="group border-3 border-structural bg-card mb-3">
      <summary className="cursor-pointer select-none list-none flex items-center justify-between gap-3 px-4 py-3 font-black text-base">
        <span>{title}</span>
        <span className="text-xl leading-none transition-transform group-open:rotate-45" aria-hidden>+</span>
      </summary>
      <div className="px-4 pb-4 pt-1 border-t-2 border-structural/30">{children}</div>
    </details>
  )
}

function ConfusionSection({ l, localize }: { l: L; localize: (m: { vi: string; en: string } | undefined | null) => string }) {
  return (
    <section className="mb-8">
      <h2 className="font-black text-lg sm:text-xl mb-1">{l("Những chỗ dễ nhầm", "Easy to confuse")}</h2>
      <p className="text-sm text-muted mb-4">{l("Mở từng mục để xem. Mục đầu trả lời câu hỏi hay gặp nhất: る thì phải làm sao?", "Open each item. The first answers the most common question: what do I do with る?")}</p>

      <Accordion defaultOpen title={l("Đuôi る: chỉ bỏ る hay đổi thành り?", "Ending in る: just drop it, or turn it into り?")}>
        <ol className="list-decimal pl-5 space-y-2 text-sm">
          <li>{l("Nhìn chữ ngay trước る trong dạng từ điển.", "Look at the kana right before る in the dictionary form.")}</li>
          <li>{l("Là あ / う / お (分かる, 乗る, 作る, 終わる): nhóm 1, đổi る → り + ます (分かります).", "It is あ / う / お (分かる, 乗る, 作る, 終わる): group 1, る → り + ます (分かります).")}</li>
          <li>{l("Là い / え (食べる, 見る, 起きる): thường nhóm 2, chỉ bỏ る + ます (食べます).", "It is い / え (食べる, 見る, 起きる): usually group 2, just drop る + ます (食べます).")}</li>
          <li>{l("NHƯNG khoảng 20 từ đuôi い / え vẫn là nhóm 1 (帰る, 入る, 走る, 知る, 切る…): phải đổi る → り + ます (帰ります). Xem danh sách ngay bên dưới.", "BUT about 20 verbs ending in い / え are still group 1 (帰る, 入る, 走る, 知る, 切る…): they need る → り + ます (帰ります). See the list right below.")}</li>
        </ol>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          <div className="border border-structural bg-card px-3 py-2"><span className="jp font-black">帰る → 帰ります</span> <span className="text-muted">{l("(nhóm 1, thêm り)", "(group 1, add り)")}</span></div>
          <div className="border border-red bg-red/5 px-3 py-2"><span className="jp font-black text-red">帰る → ✗帰ます</span> <span className="text-muted">{l("(sai, đây là cách chia của nhóm 2)", "(wrong, that is the group 2 pattern)")}</span></div>
        </div>
      </Accordion>

      <Accordion title={l("Trông như nhóm 2 nhưng là nhóm 1 (đuôi 〜いる / 〜える)", "Looks like group 2 but is group 1 (ends in 〜いる / 〜える)")}>
        <p className="text-sm text-muted mb-3">{l("Mọi từ dưới đây chia như nhóm 1: る → り + ます, て-form là 〜って, ない-form là 〜らない.", "Every verb below conjugates as group 1: る → り + ます, て-form 〜って, ない-form 〜らない.")}</p>
        <VerbList verbs={GODAN_LOOKING_ICHIDAN} group={1} l={l} />
      </Accordion>

      <Accordion title={l("Nhóm 2 nhưng ます trông như nhóm 1 (〜い + ます)", "Group 2 whose ます form looks like group 1 (〜い + ます)")}>
        <p className="text-sm text-muted mb-3">{l("Nhìn 見ます, 起きます, 借ります bạn dễ tưởng là nhóm 1. Thực ra chúng là nhóm 2: bỏ る khi chia (見ない, 起きない, 借りない).", "Seeing 見ます, 起きます, 借ります you may assume group 1. They are group 2: drop る when conjugating (見ない, 起きない, 借りない).")}</p>
        <VerbList verbs={ICHIDAN_LOOKING_GODAN} group={2} l={l} />
      </Accordion>

      <Accordion title={l("Cùng cách đọc, khác nhóm", "Same reading, different group")}>
        <p className="text-sm text-muted mb-3">{l("Cách nhanh nhất để phân biệt là thử chia thể た: 着た (nhóm 2) nhưng 切った (nhóm 1).", "The quickest test is the た form: 着た (group 2) but 切った (group 1).")}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {CONFUSING_PAIRS.map(p => {
            const a = conjugate(p.ichidan.kanji, 2)
            const b = conjugate(p.godan.kanji, 1)
            return (
              <div key={p.kana} className="border border-structural bg-card p-3">
                <div className="jp text-xs font-black text-muted mb-2">{p.kana}</div>
                <div className="space-y-2">
                  <div className="flex items-baseline justify-between gap-2" style={{ borderLeft: `6px solid ${groupAccent(2)}`, paddingLeft: 8 }}>
                    <span><span className="jp text-lg font-black">{p.ichidan.kanji}</span> <span className="text-xs text-muted">{localize(p.ichidan.meaning)}</span></span>
                    <span className="jp text-xs font-bold">{a?.masu} · {a?.ta}</span>
                  </div>
                  <div className="flex items-baseline justify-between gap-2" style={{ borderLeft: `6px solid ${groupAccent(1)}`, paddingLeft: 8 }}>
                    <span><span className="jp text-lg font-black">{p.godan.kanji}</span> <span className="text-xs text-muted">{localize(p.godan.meaning)}</span></span>
                    <span className="jp text-xs font-bold">{b?.masu} · {b?.ta}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </Accordion>
    </section>
  )
}

// - Page ------------------------------------------------------------------

export function VerbForms() {
  const navigate = useNavigate()
  const { t, localize } = useTranslation()
  const l: L = (vi, en) => localize({ vi, en })
  const level = useSettingsStore(s => s.level)
  const forms = useMemo(() => getVerbForms(level), [level])
  const [activeForm, setActiveForm] = useState(forms[0].id)
  const [showCheatSheet, setShowCheatSheet] = useState(() => typeof window === "undefined" || window.innerWidth >= 768)
  const form = forms.find(f => f.id === activeForm) ?? forms[0]

  // Switching level can drop the currently-active form entirely (e.g. N4
  // only has passive/causative/causative-passive) - fall back to the new
  // list's first form rather than rendering a stale/missing one.
  useEffect(() => {
    if (!forms.some(f => f.id === activeForm)) setActiveForm(forms[0].id)
  }, [forms, activeForm])

  function groupLabel(g: number | string) {
    if (g === "all") return t('verbForms.groupAll')
    if (g === "neg") return t('verbForms.groupNeg')
    return t('verbForms.groupN', { n: g })
  }

  const grammar = useMemo(() => getGrammarLinks(level), [level])
  const relatedGrammar = useMemo(
    () => grammar.filter(g => g.requiredVerbForm?.includes(activeForm)),
    [grammar, activeForm]
  )
  const cheatSheets = useMemo(() => getCheatSheets(level), [level])
  const keyExceptions = useMemo(() => getKeyExceptions(level), [level])

  return (
    <div className="h-full overflow-y-auto pb-[env(safe-area-inset-bottom)]">
      {/* overflow-clip (not -hidden): hidden would make this wrapper the scroll
          container of the sticky form chooser below, which then never sticks. */}
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-5 overflow-clip">
        <Watermark char="動" />
        {/* Header */}
        <div className="mb-6">
          <div className="text-xs font-bold uppercase tracking-widest text-muted mb-2">{LEVEL_LABEL[level]} · 動詞の形</div>
          <div className="text-3xl sm:text-4xl font-black leading-tight">
            <Ruby text="動詞の形" html={HEADER_RUBY} />
          </div>
          <div className="text-sm font-bold text-muted mt-1">{t('verbForms.subtitle')}</div>
        </div>

        <GroupChecker l={l} localize={localize} />
        <RuleCards l={l} />
        <ConfusionSection l={l} localize={localize} />

        {/* Form chooser: sticky, one swipeable row, so it stays reachable while reading */}
        <h2 className="font-black text-lg sm:text-xl mb-2">{l("Chia theo từng thể", "Conjugate by form")}</h2>
        <div className="sticky top-0 z-10 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2 mb-4 bg-paper/95 backdrop-blur border-b-3 border-structural">
          <div className="flex gap-2 overflow-x-auto snap-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {forms.map(f => (
              <button
                key={f.id}
                onClick={() => setActiveForm(f.id)}
                aria-pressed={activeForm === f.id}
                className={`snap-start shrink-0 px-3 py-2 border-3 text-left cursor-pointer transition-colors ${
                  activeForm === f.id ? 'border-accent bg-accent text-accent-fg' : 'border-structural bg-paper'
                }`}
              >
                <div className="text-sm font-black"><Ruby text={f.titleJa} html={f.titleJaRuby} /></div>
                <div className="opacity-70 text-[11px] font-bold">{localize(f.title)}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Active form detail */}
        <div className="mb-10">
          <div className="mb-4">
            <div className="flex flex-wrap items-baseline gap-x-3">
              <span className="text-2xl font-black"><Ruby text={form.titleJa} html={form.titleJaRuby} /></span>
              <span className="text-lg font-black">{localize(form.title)}</span>
            </div>
            <p className="text-sm text-muted mt-1">{localize(form.meaning)}</p>
          </div>

          {/* Rules per group */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
            {form.rules.map((r, i) => {
              const note = localize(r.note)
              return (
                <div key={i} className="border-3 border-structural bg-card p-3" style={{ borderLeftWidth: '3px', borderLeftColor: groupAccent(r.group) }}>
                  <div className="text-[10px] font-black uppercase tracking-wider text-muted mb-1">{groupLabel(r.group)}</div>
                  <div className="font-bold text-sm"><Ruby text={localize(r.rule)} html={localize(r.ruleRuby)} /></div>
                  {note && <div className="text-xs text-muted mt-1"><Ruby text={note} html={localize(r.noteRuby)} /></div>}
                </div>
              )
            })}
          </div>

          {/* Group 1 special endings table (て/た forms) */}
          {form.group1Endings && (
            <div className="border-3 border-structural bg-card mb-5 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-3 border-structural bg-surface">
                    <th className="text-left p-2 font-black text-xs uppercase">{t('verbForms.masuEnding')}</th>
                    <th className="text-left p-2 font-black text-xs uppercase">→</th>
                    <th className="text-left p-2 font-black text-xs uppercase">{t('common.examples')}</th>
                  </tr>
                </thead>
                <tbody>
                  {form.group1Endings.map((e, i) => (
                    <tr key={i} className="border-b border-ink/20 last:border-0">
                      <td className="p-2 font-bold"><Ruby text={e.endings} html={e.endingsRuby} /></td>
                      <td className="p-2 font-black"><Ruby text={e.result} html={e.resultRuby} /></td>
                      <td className="p-2 text-muted"><Ruby text={e.example} html={e.exampleRuby} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Conjugation examples */}
          {form.examples.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-5">
              {form.examples.map((ex, i) => (
                <div key={i} className="border border-structural rounded-[var(--radius-sm)] p-2 bg-card" style={{ borderLeftWidth: '3px', borderLeftColor: groupAccent(ex.group) }}>
                  <div className="text-xs text-muted"><Ruby text={ex.masu} html={ex.masuRuby} /></div>
                  <div className="font-black text-sm">→ <Ruby text={ex.result} html={ex.resultRuby} /></div>
                  {ex.resultNeg && (
                    <div className="font-bold text-xs text-red mt-0.5">
                      × <Ruby text={ex.resultNeg} html={ex.resultNegRuby} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Sentence examples */}
          {form.sentenceExamples.length > 0 && (
            <div className="border-3 border-structural bg-yellow/20 p-4 mb-5">
              <div className="text-xs font-black uppercase tracking-wider mb-3">{t('verbForms.sentenceExamples')}</div>
              {form.sentenceExamples.map((s, i) => (
                <div key={i} className="mb-3 last:mb-0">
                  <div className="flex items-start gap-2">
                    <div className="font-bold"><Ruby text={s.ja} html={s.jaRuby} /></div>
                    <SpeakButton text={s.ja} />
                  </div>
                  <div className="text-sm text-muted">{localize(s.meaning)}</div>
                </div>
              ))}
            </div>
          )}

          {/* Exceptions */}
          {form.exceptions.length > 0 && (
            <div className="border-3 border-red bg-red/5 p-4 mb-5">
              <div className="text-xs font-black uppercase tracking-wider mb-2 text-red">{t('verbForms.exceptions')}</div>
              {form.exceptions.map((e, i) => (
                <div key={i} className="text-sm font-bold">
                  <Ruby text={localize(e)} html={localize(form.exceptionsRuby?.[i])} />
                </div>
              ))}
            </div>
          )}

          {/* Related grammar: cross-links into the Grammar tab */}
          {relatedGrammar.length > 0 && (
            <div>
              <div className="text-xs font-black uppercase tracking-wider mb-3 text-muted">{t('verbForms.relatedGrammar')}</div>
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
                {relatedGrammar.map(g => (
                  <button
                    key={g.id}
                    onClick={() => navigate(`/grammar?point=${g.id}`)}
                    className="group shrink-0 w-56 text-left border-3 border-structural bg-card p-3 cursor-pointer transition-[box-shadow,transform] hover:shadow-[var(--shadow-brutal-hover)]"
                    style={{ borderLeftWidth: '3px', borderLeftColor: 'var(--color-blue)' }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="jp font-bold text-sm leading-snug">
                        <Ruby text={g.pattern} html={g.patternRuby} />
                      </div>
                      <span className="shrink-0 mt-0.5 text-muted group-hover:text-ink group-hover:translate-x-0.5 transition-transform">
                        →
                      </span>
                    </div>
                    <div className="text-xs mt-2 leading-relaxed text-muted">{localize(g.meaning)}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Cheat sheet */}
        <div className="mb-8">
          <button
            onClick={() => setShowCheatSheet(s => !s)}
            aria-expanded={showCheatSheet}
            className="w-full flex items-center gap-3 mb-3 text-left cursor-pointer group"
          >
            <span className="font-black text-base flex-1 group-hover:underline">{t('verbForms.cheatSheet')}</span>
            <span className="text-sm font-black text-muted w-4 text-center">{showCheatSheet ? '−' : '+'}</span>
          </button>
          {showCheatSheet && cheatSheets.map(({ label, table }) => (
            <div key={label} className="border-3 border-structural bg-card overflow-x-auto shadow-[var(--shadow-brutal)] mb-4 last:mb-0">
              {cheatSheets.length > 1 && (
                <div className="px-3 py-1.5 border-b-3 border-structural bg-surface text-[10px] font-black uppercase tracking-widest text-muted">{label}</div>
              )}
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-3 border-accent bg-accent text-accent-fg">
                    {table.headers.map((h, i) => (
                      <th key={i} className="text-left p-3 font-black text-xs uppercase tracking-wider whitespace-nowrap">{localize(h)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {table.rows.map((row, i) => (
                    <tr key={i} className="border-b border-ink/20 last:border-0 hover:bg-surface">
                      {row.map((cell, j) => (
                        <td key={j} className={`p-3 ${j === 0 ? 'font-black' : 'font-bold'}`}>
                          <Ruby text={localize(cell)} html={localize(table.rowsRuby?.[i]?.[j])} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>

        {/* Key exceptions */}
        <div className="border-3 border-structural bg-surface p-4 mb-6">
          <div className="text-xs font-black uppercase tracking-wider mb-3">{t('verbForms.keyExceptions')}</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {keyExceptions.plain.map((e, i) => (
              <div key={i} className="text-sm font-bold border border-structural rounded-[var(--radius-sm)] bg-card px-3 py-2">
                <Ruby text={localize(e)} html={localize(keyExceptions.ruby?.[i])} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
