import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import verbFormsData from "@/data/n5/verb-forms.json"
import grammarData from "@/data/n5/grammar.json"
import type { VerbFormsData, GrammarPoint } from "@/types"
import { Ruby } from "@/components/ui/Ruby"

const data = verbFormsData as unknown as VerbFormsData
const grammar = grammarData as GrammarPoint[]

const HEADER_RUBY = '<ruby>動詞<rp>(</rp><rt>どうし</rt><rp>)</rp></ruby>の<ruby>形<rp>(</rp><rt>かたち</rt><rp>)</rp></ruby>'

const GROUP_ACCENT: Record<string, string> = {
  "1": "#ffe600", "2": "#0057ff", "3": "#ff2d2d", all: "#00cc66", neg: "#6b6b6b",
}
function groupAccent(g: number | string) {
  return GROUP_ACCENT[String(g)] ?? "#0a0a0a"
}
function groupLabel(g: number | string) {
  if (g === "all") return "Mọi nhóm"
  if (g === "neg") return "Phủ định"
  return `Nhóm ${g}`
}

export function VerbForms() {
  const navigate = useNavigate()
  const [activeForm, setActiveForm] = useState(data.forms[0].id)
  const [showCheatSheet, setShowCheatSheet] = useState(true)
  const form = data.forms.find(f => f.id === activeForm)!

  const relatedGrammar = useMemo(
    () => grammar.filter(g => g.requiredVerbForm?.includes(activeForm)),
    [activeForm]
  )

  return (
    <div className="h-screen overflow-y-auto">
      <div className="max-w-5xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="text-4xl font-black leading-tight">
            <Ruby text="動詞の形" html={HEADER_RUBY} />
          </div>
          <div className="text-sm font-bold uppercase tracking-wider text-muted mt-1">Thể động từ — Verb Conjugation Cheat Sheet</div>
        </div>

        {/* Group overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {data.groups.map(g => (
            <div key={g.id} className="border-3 border-ink bg-paper shadow-[4px_4px_0px_#0a0a0a]">
              <div className="p-3 border-b-3 border-ink flex items-center gap-2" style={{ backgroundColor: groupAccent(g.id) }}>
                <span className="font-black text-sm">{g.name}</span>
              </div>
              <div className="p-3">
                <p className="text-xs text-muted mb-2">{g.note}</p>
                <div className="flex flex-wrap gap-1.5">
                  {g.sample.map((s, i) => (
                    <span key={i} className="text-xs font-bold border-2 border-ink px-1.5 py-0.5" title={s.vi}>
                      <Ruby text={s.masu} html={s.masuRuby} />
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Form tab navigator */}
        <div className="flex gap-2 flex-wrap mb-6 border-b-3 border-ink pb-4">
          {data.forms.map(f => (
            <button
              key={f.id}
              onClick={() => setActiveForm(f.id)}
              className={`px-3 py-2 border-3 border-ink font-black text-xs uppercase tracking-wider cursor-pointer transition-all ${
                activeForm === f.id ? 'bg-ink text-paper' : 'bg-paper hover:shadow-[3px_3px_0px_#0a0a0a] hover:-translate-x-0.5 hover:-translate-y-0.5'
              }`}
            >
              <div className="text-sm"><Ruby text={f.titleJa} html={f.titleJaRuby} /></div>
              <div className="opacity-70 text-[10px]">{f.title}</div>
            </button>
          ))}
        </div>

        {/* Active form detail */}
        <div className="mb-10">
          <div className="mb-4">
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-black"><Ruby text={form.titleJa} html={form.titleJaRuby} /></span>
              <span className="text-lg font-black">{form.title}</span>
            </div>
            <p className="text-sm text-muted mt-1">{form.meaning}</p>
          </div>

          {/* Rules per group */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
            {form.rules.map((r, i) => (
              <div key={i} className="border-3 border-ink bg-paper p-3" style={{ borderLeftWidth: '6px', borderLeftColor: groupAccent(r.group) }}>
                <div className="text-[10px] font-black uppercase tracking-wider text-muted mb-1">{groupLabel(r.group)}</div>
                <div className="font-bold text-sm"><Ruby text={r.rule} html={r.ruleRuby} /></div>
                {r.note && <div className="text-xs text-muted mt-1"><Ruby text={r.note} html={r.noteRuby} /></div>}
              </div>
            ))}
          </div>

          {/* Group 1 special endings table (て/た forms) */}
          {form.group1Endings && (
            <div className="border-3 border-ink bg-paper mb-5 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-3 border-ink bg-surface">
                    <th className="text-left p-2 font-black text-xs uppercase">Đuôi ます</th>
                    <th className="text-left p-2 font-black text-xs uppercase">→</th>
                    <th className="text-left p-2 font-black text-xs uppercase">Ví dụ</th>
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
                <div key={i} className="border-2 border-ink p-2 bg-paper" style={{ borderLeftWidth: '4px', borderLeftColor: groupAccent(ex.group) }}>
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
            <div className="border-3 border-ink bg-yellow/20 p-4 mb-5">
              <div className="text-xs font-black uppercase tracking-wider mb-3">Ví dụ câu</div>
              {form.sentenceExamples.map((s, i) => (
                <div key={i} className="mb-3 last:mb-0">
                  <div className="font-bold"><Ruby text={s.ja} html={s.jaRuby} /></div>
                  <div className="text-sm text-muted">{s.vi}</div>
                </div>
              ))}
            </div>
          )}

          {/* Exceptions */}
          {form.exceptions.length > 0 && (
            <div className="border-3 border-red bg-red/5 p-4 mb-5">
              <div className="text-xs font-black uppercase tracking-wider mb-2 text-red">Ngoại lệ</div>
              {form.exceptions.map((e, i) => (
                <div key={i} className="text-sm font-bold">
                  <Ruby text={e} html={form.exceptionsRuby?.[i]} />
                </div>
              ))}
            </div>
          )}

          {/* Related grammar — cross-links into the Grammar tab */}
          {relatedGrammar.length > 0 && (
            <div>
              <div className="text-xs font-black uppercase tracking-wider mb-3 text-muted">Ngữ pháp áp dụng</div>
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
                {relatedGrammar.map(g => (
                  <button
                    key={g.id}
                    onClick={() => navigate(`/grammar?point=${g.id}`)}
                    className="group shrink-0 w-56 text-left border-3 border-ink bg-paper p-3 cursor-pointer transition-all hover:shadow-[4px_4px_0px_#0a0a0a] hover:-translate-x-0.5 hover:-translate-y-0.5"
                    style={{ borderLeftWidth: '6px', borderLeftColor: '#0057ff' }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="jp font-bold text-sm leading-snug">
                        <Ruby text={g.pattern} html={g.patternRuby} />
                      </div>
                      <span className="shrink-0 mt-0.5 text-muted group-hover:text-ink group-hover:translate-x-0.5 transition-all">
                        →
                      </span>
                    </div>
                    <div className="text-xs mt-2 leading-relaxed text-muted">{g.meaning.vi}</div>
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
            className="w-full flex items-center gap-3 mb-3 text-left cursor-pointer group"
          >
            <span className="font-black text-base flex-1 group-hover:underline">Cheat Sheet cực ngắn</span>
            <span className="text-sm font-black text-muted w-4 text-center">{showCheatSheet ? '−' : '+'}</span>
          </button>
          {showCheatSheet && (
            <div className="border-3 border-ink bg-paper overflow-x-auto shadow-[4px_4px_0px_#0a0a0a]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-3 border-ink bg-ink text-paper">
                    {data.cheatSheet.headers.map((h, i) => (
                      <th key={i} className="text-left p-3 font-black text-xs uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.cheatSheet.rows.map((row, i) => (
                    <tr key={i} className="border-b border-ink/20 last:border-0 hover:bg-surface">
                      {row.map((cell, j) => (
                        <td key={j} className={`p-3 ${j === 0 ? 'font-black' : 'font-bold'}`}>
                          <Ruby text={cell} html={data.cheatSheet.rowsRuby?.[i]?.[j]} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Key exceptions */}
        <div className="border-3 border-ink bg-surface p-4 mb-6">
          <div className="text-xs font-black uppercase tracking-wider mb-3">Ngoại lệ cần nhớ</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {data.keyExceptions.map((e, i) => (
              <div key={i} className="text-sm font-bold border-2 border-ink bg-paper px-3 py-2">
                <Ruby text={e} html={data.keyExceptionsRuby?.[i]} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
