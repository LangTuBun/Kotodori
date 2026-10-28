import type { ConnectionRule, PosType } from "@/types"
import { useTranslation } from "@/lib/useTranslation"

interface FormationMatrixProps {
  rules: ConnectionRule[]
}

// POS badge colors mirror PosTag.tsx's palette so a rule's part-of-speech
// reads consistently with the rest of the app.
const POS_COLOR: Record<PosType, string> = {
  verb: 'var(--color-blue)',
  'i-adj': 'var(--color-green)',
  'na-adj': 'var(--color-green)',
  noun: 'var(--color-yellow)',
  phrase: 'var(--color-muted)',
}
const POS_LABEL: Record<'vi' | 'en', Record<PosType, string>> = {
  vi: { verb: 'Động từ', 'i-adj': 'Tính từ い', 'na-adj': 'Tính từ な', noun: 'Danh từ', phrase: 'Cụm từ' },
  en: { verb: 'Verb', 'i-adj': 'i-adjective', 'na-adj': 'na-adjective', noun: 'Noun', phrase: 'Phrase' },
}

// What each label in the table means, with a verb and an adjective you already
// know, so "Thể thường" / "Vます bỏ ます" are never left as jargon.
const GLOSSARY: { term: { vi: string; en: string }; meaning: { vi: string; en: string }; example: string }[] = [
  { term: { vi: 'Thể từ điển', en: 'Dictionary form' }, meaning: { vi: 'Dạng gốc trong từ điển', en: 'The base form in a dictionary' }, example: '食べる / 飲む / 高い' },
  { term: { vi: 'Thể thường', en: 'Plain form' }, meaning: { vi: 'Dạng không có ます / です: từ điển, ない, た, なかった', en: 'The form without ます / です: dictionary, ない, た, なかった' }, example: '食べる・食べない・食べた・食べなかった' },
  { term: { vi: 'Vます bỏ ます', en: 'Masu-stem' }, meaning: { vi: 'Lấy dạng ます rồi bỏ ます', en: 'Take the ます form and remove ます' }, example: '食べます → 食べ / 飲みます → 飲み' },
  { term: { vi: 'Vない bỏ い', en: 'Nai-stem' }, meaning: { vi: 'Lấy dạng ない rồi bỏ い', en: 'Take the ない form and remove い' }, example: '食べない → 食べな' },
  { term: { vi: 'Thể て / Thể た / Thể ない', en: 'て-form / た-form / ない-form' }, meaning: { vi: 'Dạng nối câu / quá khứ / phủ định của động từ', en: 'The connecting / past / negative form of a verb' }, example: '食べて / 食べた / 食べない' },
  { term: { vi: 'Tính từ い bỏ い', en: 'i-adjective (drop い)' }, meaning: { vi: 'Tính từ い bỏ chữ い cuối', en: 'An い-adjective without its final い' }, example: '高い → 高' },
]

/** Neo-Brutalist grid showing how a grammar pattern connects to different
 * parts of speech (ConnectionRule[]). Sticky left POS column so the table
 * stays legible while scrolling wide formation strings horizontally. */
export function FormationMatrix({ rules }: FormationMatrixProps) {
  const { t, lang } = useTranslation()
  if (!rules || rules.length === 0) return null

  return (
    <div>
    <div className="border-3 border-structural overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-surface text-ink">
            <th className="sticky left-0 bg-surface text-ink text-left px-3 py-2 text-xs font-black uppercase tracking-wider border-r-2 border-structural whitespace-nowrap">
              {t('grammar.formation.pos')}
            </th>
            <th className="text-left px-3 py-2 text-xs font-black uppercase tracking-wider border-r-2 border-structural whitespace-nowrap">
              {t('grammar.formation.form')}
            </th>
            <th className="text-left px-3 py-2 text-xs font-black uppercase tracking-wider whitespace-nowrap">
              {t('grammar.formation.example')}
            </th>
          </tr>
        </thead>
        <tbody>
          {rules.map((rule, i) => (
            <tr key={i} className={i > 0 ? 'border-t-2 border-structural' : ''}>
              <td className="sticky left-0 bg-paper px-3 py-2.5 border-r-2 border-structural whitespace-nowrap">
                <span
                  className="tint inline-block text-xs font-semibold px-2 py-0.5 border rounded-full"
                  style={{ '--tint': POS_COLOR[rule.pos] } as React.CSSProperties}
                >
                  {POS_LABEL[lang][rule.pos]}
                </span>
              </td>
              <td className="px-3 py-2.5 border-r-2 border-structural font-bold whitespace-nowrap">
                {(lang === 'vi' ? rule.formVi : rule.formEn) ?? rule.form}
                {rule.particle && (
                  <span className="ml-1.5 text-muted font-normal">+ {rule.particle}</span>
                )}
              </td>
              <td className="px-3 py-2.5 jp font-medium whitespace-nowrap">
                {rule.exampleStr}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <details className="mt-3 border border-structural bg-surface">
      <summary className="cursor-pointer select-none px-3 py-2 text-xs font-black">
        {lang === 'vi' ? 'Giải thích các thuật ngữ trong bảng' : 'What the labels in this table mean'}
      </summary>
      <dl className="px-3 pb-3 pt-1 space-y-2 text-sm">
        {GLOSSARY.map(g => (
          <div key={g.term.en}>
            <dt className="font-black">{g.term[lang]}</dt>
            <dd className="text-muted">{g.meaning[lang]} <span className="jp text-ink font-bold">({g.example})</span></dd>
          </div>
        ))}
      </dl>
    </details>
    </div>
  )
}
