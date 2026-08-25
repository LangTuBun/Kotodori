import { Fragment } from "react"

// Content authored for grammar points routinely cross-references another
// point inline (e.g. "...xem g_150" / "...see g_150") rather than only
// through the structured relatedGrammarId/relatedGrammar fields. Left as
// plain text, that reads as a meaningless internal id to a reader. This
// scans for that id shape and turns each occurrence into a clickable jump
// button showing the *pattern* (not the id) -- every id used this way is
// validated to resolve (see scripts/validate-grammar.mjs), so a lookup
// miss here would indicate a data bug, not an expected case.
const GRAMMAR_ID_RE = /g_\d+(?:_\d+)*/g

interface LinkifiedTextProps {
  text: string
  patternById: Record<string, string>
  onJumpTo?: (grammarId: string) => void
  className?: string
}

export function LinkifiedText({ text, patternById, onJumpTo, className }: LinkifiedTextProps) {
  const matches = [...text.matchAll(GRAMMAR_ID_RE)]
  if (matches.length === 0) return <span className={className}>{text}</span>

  const nodes: React.ReactNode[] = []
  let cursor = 0
  matches.forEach((match, i) => {
    const id = match[0]
    const index = match.index ?? 0
    const pattern = patternById[id]
    if (index > cursor) nodes.push(<Fragment key={`t${i}`}>{text.slice(cursor, index)}</Fragment>)
    if (pattern) {
      nodes.push(
        <button
          key={`l${i}`}
          type="button"
          onClick={() => onJumpTo?.(id)}
          disabled={!onJumpTo}
          className="jp font-bold underline decoration-dotted underline-offset-2 cursor-pointer disabled:cursor-default disabled:no-underline hover:opacity-70"
        >
          {pattern}
        </button>
      )
    } else {
      // Shouldn't happen (validated at data-authoring time), but never
      // regress to showing a raw id if a future edit slips one past validation.
      nodes.push(<Fragment key={`l${i}`}>{id}</Fragment>)
    }
    cursor = index + id.length
  })
  if (cursor < text.length) nodes.push(<Fragment key="tail">{text.slice(cursor)}</Fragment>)

  return <span className={className}>{nodes}</span>
}
