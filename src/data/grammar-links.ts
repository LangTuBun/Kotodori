// Lightweight grammar lookup for cross-link chips (Verb Forms, Transitivity,
// Usage). Reads the slim build-time index instead of @/data/grammar, which
// carries every enriched grammar point (~1.2MB) -- only the Grammar page
// itself needs that. See grammarIndex() in vite.config.ts.
import type { GrammarLink } from "@/types"
import type { Level } from "@/store/settings-store"
import { n5, n4 } from "virtual:grammar-index"

const all: GrammarLink[] = [...n5, ...n4]

export function getGrammarLinks(level: Level): GrammarLink[] {
  if (level === "N5") return n5
  if (level === "N4") return n4
  return all
}
