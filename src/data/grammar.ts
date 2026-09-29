// Central level-aware loader for grammar data, mirroring vocab.ts. Each JLPT
// level is its own dynamic-import chunk (~900KB each), so the Grammar page
// only downloads the level being viewed. Pages read it through useGrammar().
// Cross-link chips elsewhere use the slim ./grammar-links index instead.
import type { GrammarPoint, GrammarCategory } from "@/types"
import type { Level } from "@/store/settings-store"
import { useLevelData } from "@/lib/useLevelData"

export interface GrammarData {
  grammar: GrammarPoint[]
  categories: GrammarCategory[]
  tips: { vi: string; en: string }[]
}

const loaded = new Map<Level, GrammarData>()
const inflight = new Map<Level, Promise<GrammarData>>()

async function importLevel(level: 'N5' | 'N4'): Promise<GrammarData> {
  const [g, c] = level === 'N5'
    ? await Promise.all([import("@/data/n5/grammar.json"), import("@/data/n5/grammar-categories.json")])
    : await Promise.all([import("@/data/n4/grammar.json"), import("@/data/n4/grammar-categories.json")])
  return {
    grammar: g.default as GrammarPoint[],
    categories: c.default.categories as GrammarCategory[],
    tips: c.default.tips as { vi: string; en: string }[],
  }
}

export function loadGrammar(level: Level): Promise<GrammarData> {
  const hit = loaded.get(level)
  if (hit) return Promise.resolve(hit)
  let p = inflight.get(level)
  if (!p) {
    p = (level === 'all'
      ? Promise.all([loadGrammar('N5'), loadGrammar('N4')]).then(([a, b]): GrammarData => ({
          grammar: [...a.grammar, ...b.grammar],
          categories: [...a.categories, ...b.categories],
          tips: [...a.tips, ...b.tips],
        }))
      : importLevel(level)
    ).then(data => {
      loaded.set(level, data)
      inflight.delete(level)
      return data
    }, err => {
      inflight.delete(level)
      throw err
    })
    inflight.set(level, p)
  }
  return p
}

function peekGrammar(level: Level): GrammarData | null {
  return loaded.get(level) ?? null
}

/** Grammar data for `level`; null until its chunk has arrived. */
export function useGrammar(level: Level): GrammarData | null {
  return useLevelData(level, peekGrammar, loadGrammar)
}
