import { useEffect, useState } from "react"
import { OnyomiQuiz } from "@/components/kanji/OnyomiQuiz"
import { useLocation } from "react-router-dom"
import { AnimatedKanjiSvg } from "@/components/kanji/AnimatedKanjiSvg"
import { KanjiDrawer } from "@/components/kanji/KanjiDrawer"
import { Watermark } from "@/components/ui/ScreenHeader"
import { useTranslation } from "@/lib/useTranslation"
import { useKanjiVg } from "@/lib/kanji-vg"
import { ONYOMI_RULES, type OnyomiExample } from "@/lib/onyomi-rules"

interface StrokeRule {
  id: string
  ja: string
  vi: string
  en: string
  noteVi: string
  noteEn: string
  examples: string[]
}

// Examples are shown with KanjiVG's own stroke order (numbers on), so each
// card demonstrates the rule with the same data the rest of the app animates.
const STROKE_RULES: StrokeRule[] = [
  { id: "top-bottom", ja: "上から下へ", vi: "Từ trên xuống dưới", en: "Top to bottom",
    noteVi: "Các phần xếp chồng theo chiều dọc thì viết phần trên trước.", noteEn: "When parts are stacked vertically, write the upper part first.",
    examples: ["三", "言", "思"] },
  { id: "left-right", ja: "左から右へ", vi: "Từ trái sang phải", en: "Left to right",
    noteVi: "Các phần xếp ngang thì viết phần bên trái trước.", noteEn: "When parts sit side by side, write the left part first.",
    examples: ["川", "休", "明"] },
  { id: "horizontal-first", ja: "横画が先", vi: "Nét ngang trước nét sổ", en: "Horizontal before vertical",
    noteVi: "Khi nét ngang và nét sổ cắt nhau, viết nét ngang trước.", noteEn: "When a horizontal and a vertical stroke cross, write the horizontal first.",
    examples: ["十", "土"] },
  { id: "center-first", ja: "中が先", vi: "Nét giữa trước hai bên", en: "Center before the sides",
    noteVi: "Chữ đối xứng có nét giữa thì viết nét giữa trước, rồi trái, rồi phải.", noteEn: "In symmetric characters, write the center stroke first, then left, then right.",
    examples: ["小", "水", "山"] },
  { id: "outside-first", ja: "外側が先", vi: "Khung ngoài trước, nét đóng viết sau cùng", en: "Outside before inside",
    noteVi: "Khung bao quanh viết trước, nét bên trong sau, rồi đóng đáy khung.", noteEn: "Write the enclosing frame first, then what's inside, then close the bottom.",
    examples: ["日", "月", "国"] },
  { id: "left-falling-first", ja: "左払いが先", vi: "Nét phẩy trái trước nét mác phải", en: "Left-falling before right-falling",
    noteVi: "Khi nét phẩy (丿) và nét mác (乀) đối xứng nhau, viết nét phẩy trước.", noteEn: "When a left-falling and a right-falling stroke meet, write the left-falling stroke first.",
    examples: ["人", "文", "父"] },
  { id: "vertical-last", ja: "貫く縦画は最後", vi: "Nét sổ xuyên qua viết sau cùng", en: "Piercing vertical stroke last",
    noteVi: "Nét sổ đi xuyên qua các nét khác thì viết cuối cùng.", noteEn: "A vertical stroke that runs through the other strokes is written last.",
    examples: ["中", "車", "申"] },
  { id: "horizontal-last", ja: "貫く横画は最後", vi: "Nét ngang xuyên qua viết sau cùng", en: "Piercing horizontal stroke last",
    noteVi: "Nét ngang đi xuyên qua các nét khác thì viết cuối cùng.", noteEn: "A horizontal stroke that runs through the other strokes is written last.",
    examples: ["女", "母"] },
  { id: "dot-last", ja: "右上の点は最後", vi: "Chấm bên phải viết sau cùng", en: "Dot at upper right last",
    noteVi: "Chấm nhỏ ở góc phải trên của chữ viết cuối cùng.", noteEn: "A small dot at the upper right of a character is written last.",
    examples: ["犬", "状"] },
  { id: "left-falling-vs-horizontal", ja: "左払いと横画", vi: "Nét phẩy cắt nét ngang", en: "Left-falling vs. horizontal",
    noteVi: "Nét ngang dài hơn → viết nét ngang trước (左, 有). Nét phẩy dài hơn → viết nét phẩy trước (右).", noteEn: "Longer horizontal → write it first (左, 有). Longer left-falling stroke → write it first (右).",
    examples: ["左", "右", "有"] },
  { id: "nyo-last", ja: "にょう（辶・廴）は最後", vi: "Bộ bao đáy (辶, 廴) viết sau cùng", en: "Wrap-around radicals (辶, 廴) last",
    noteVi: "Phần bên trong viết trước, bộ 辶 / 廴 ở dưới và bên trái viết sau cùng.", noteEn: "Write the contents first; the wrap-around 辶 / 廴 radical comes last.",
    examples: ["道", "近", "建"] },
]

function StrokeExample({ char, strokes, viewBox }: { char: string; strokes: string[]; viewBox: string }) {
  const [replayKey, setReplayKey] = useState(0)
  return (
    <button onClick={() => setReplayKey(k => k + 1)} className="text-left cursor-pointer" title="Replay">
      <div className="border border-structural bg-white w-28 sm:w-32">
        <AnimatedKanjiSvg strokes={strokes} viewBox={viewBox} replayKey={replayKey} showNumbers strokeMs={450} className="w-full aspect-square" />
      </div>
      <div className="jp text-center text-sm font-black mt-1">{char}</div>
    </button>
  )
}

function ExampleChip({ ex, onOpen }: { ex: OnyomiExample; onOpen: (c: string) => void }) {
  return (
    <button onClick={() => onOpen(ex.kanji)} className="border border-structural bg-card px-2 py-1 text-left cursor-pointer">
      <span className="jp text-lg font-black">{ex.kanji}</span>
      <span className="text-xs font-bold text-muted ml-1.5">{ex.hanviet}</span>
      <span className="jp text-xs font-bold text-blue ml-1.5">{ex.on.join("・")}</span>
    </button>
  )
}

export function KanjiRules() {
  const { localize } = useTranslation()
  const L = (vi: string, en: string) => localize({ vi, en })
  const vg = useKanjiVg()
  const { hash } = useLocation()
  const [drawerChar, setDrawerChar] = useState<string | null>(null)

  useEffect(() => {
    if (!hash) return
    document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [hash])

  const finals = ONYOMI_RULES.filter(r => r.group === "final")
  const initials = ONYOMI_RULES.filter(r => r.group === "initial")

  return (
    <div className="relative p-4 sm:p-8 max-w-5xl overflow-hidden">
      <Watermark char="則" />
      <div className="border-b-3 border-structural pb-6 mb-8">
        <div className="text-xs font-bold uppercase tracking-widest text-muted mb-2">規則</div>
        <h1 className="text-[clamp(2rem,8vw,3rem)] font-black tracking-tighter">{L("Quy tắc Kanji", "Kanji Rules")}</h1>
        <div className="flex gap-2 mt-4">
          <a href="#stroke-order" className="px-3 py-1.5 border border-structural bg-card text-xs font-black uppercase tracking-wider">{L("Quy tắc thuận bút", "Stroke order")}</a>
          <a href="#on-yomi" className="px-3 py-1.5 border border-structural bg-card text-xs font-black uppercase tracking-wider">{L("Quy tắc chuyển âm", "Sound rules")}</a>
        </div>
      </div>

      <section id="stroke-order" className="scroll-mt-4 mb-14">
        <h2 className="text-2xl font-black tracking-tight">{L("Quy tắc thuận bút (thứ tự nét)", "Stroke order rules")}</h2>
        <p className="text-muted font-bold text-sm mt-2 mb-6 max-w-2xl leading-relaxed">
          {L(
            "Bấm vào từng chữ để xem lại hoạt hình. Số đỏ là thứ tự nét.",
            "Tap a character to replay its animation. Red numbers show the stroke order.",
          )}
        </p>
        <div className="grid grid-cols-1 gap-5">
          {STROKE_RULES.map((rule, i) => (
            <article key={rule.id} className="glass-card p-4 sm:p-5">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="font-display text-2xl text-accent">{i + 1}</span>
                <span className="jp text-lg font-black">{rule.ja}</span>
                <span className="font-black">{L(rule.vi, rule.en)}</span>
              </div>
              <p className="text-sm font-bold text-muted mt-1 mb-4 leading-relaxed">{L(rule.noteVi, rule.noteEn)}</p>
              <div className="flex flex-wrap gap-4">
                {vg
                  ? rule.examples.filter(c => vg[c]).map(c => <StrokeExample key={c} char={c} strokes={vg[c].strokes} viewBox={vg[c].viewBox} />)
                  : <div className="text-xs font-bold text-muted">{L("Đang tải…", "Loading…")}</div>}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="on-yomi" className="scroll-mt-4">
        <h2 className="text-2xl font-black tracking-tight">{L("Quy tắc chuyển âm: Hán Việt → On'yomi", "Sound rules: Hán Việt → on'yomi")}</h2>
        <p className="text-muted font-bold text-sm mt-2 max-w-2xl leading-relaxed">
          {L(
            "Âm Hán Việt và âm On đều bắt nguồn từ tiếng Hán cổ nên có quy luật tương ứng. Biết âm Hán Việt, bạn có thể đoán khá chuẩn âm On. Đây là xu hướng, không phải luật tuyệt đối; tỉ lệ dưới đây được đo trên chính các chữ Hán trong app.",
            "Hán Việt and on'yomi both descend from Middle Chinese, so they correspond regularly. Knowing the Hán Việt lets you predict the on'yomi quite reliably. These are tendencies, not laws; the rates below are measured on the kanji in this app.",
          )}
        </p>

        {([
          [L("Theo phụ âm cuối", "By final consonant"), finals],
          [L("Theo phụ âm đầu", "By initial consonant"), initials],
        ] as const).map(([title, rules]) => (
          <div key={title} className="mt-8">
            <h3 className="text-xs font-black uppercase tracking-widest text-muted mb-3">{title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rules.map(rule => (
                <article key={rule.id} className="glass-card p-4">
                  <div className="flex items-center flex-wrap gap-2 font-black text-lg">
                    <span className="px-2 border border-structural bg-yellow/30">{rule.vi}</span>
                    <span>→</span>
                    <span className="jp px-2 border border-structural bg-blue/20">{rule.ja}</span>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="h-2 flex-1 border border-structural bg-card">
                      <div className="h-full bg-green" style={{ width: `${rule.rate}%` }} />
                    </div>
                    <span className="text-xs font-black">{rule.rate}% ({rule.matched}/{rule.total})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {rule.examples.map(ex => <ExampleChip key={ex.kanji} ex={ex} onOpen={setDrawerChar} />)}
                  </div>
                  {rule.exceptions.length > 0 && (
                    <div className="mt-3">
                      <div className="text-[10px] font-black uppercase tracking-wider text-muted mb-1">{L("Ngoại lệ", "Exceptions")}</div>
                      <div className="flex flex-wrap gap-1.5">
                        {rule.exceptions.map(ex => <ExampleChip key={ex.kanji} ex={ex} onOpen={setDrawerChar} />)}
                      </div>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </div>
        ))}
      </section>

      <OnyomiQuiz />

      <KanjiDrawer char={drawerChar} onClose={() => setDrawerChar(null)} />
    </div>
  )
}
