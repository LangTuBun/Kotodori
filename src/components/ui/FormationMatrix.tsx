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
const POS_LABEL: Record<PosType, string> = {
  verb: 'V', 'i-adj': 'i-Adj', 'na-adj': 'na-Adj', noun: 'N', phrase: 'Phr',
}

/** Neo-Brutalist grid showing how a grammar pattern connects to different
 * parts of speech (ConnectionRule[]). Sticky left POS column so the table
 * stays legible while scrolling wide formation strings horizontally. */
export function FormationMatrix({ rules }: FormationMatrixProps) {
  const { t } = useTranslation()
  if (!rules || rules.length === 0) return null

  return (
    <div className="border-3 border-structural overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-ink text-paper">
            <th className="sticky left-0 bg-ink text-paper text-left px-3 py-2 text-xs font-black uppercase tracking-wider border-r-2 border-paper/20 whitespace-nowrap">
              {t('grammar.formation.pos')}
            </th>
            <th className="text-left px-3 py-2 text-xs font-black uppercase tracking-wider border-r-2 border-paper/20 whitespace-nowrap">
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
                  className="font-mono inline-block text-xs font-bold uppercase tracking-widest px-2 py-0.5 border-2 border-structural rounded-[var(--radius-sm)]"
                  style={{ backgroundColor: POS_COLOR[rule.pos], color: rule.pos === 'noun' ? 'var(--color-ink)' : 'var(--color-paper)' }}
                >
                  {POS_LABEL[rule.pos]}
                </span>
              </td>
              <td className="px-3 py-2.5 border-r-2 border-structural font-bold whitespace-nowrap">
                {rule.form}
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
  )
}
