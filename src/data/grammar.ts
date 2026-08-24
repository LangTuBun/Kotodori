// Central level-aware selector for grammar data, mirroring vocab.ts's
// pattern -- pages should import from here instead of reaching into
// src/data/n5/grammar*.json or src/data/n4/grammar*.json directly.
import type { GrammarPoint, GrammarCategory } from "@/types"
import type { Level } from "@/store/settings-store"
import n5GrammarJson from "@/data/n5/grammar.json"
import n5CategoriesJson from "@/data/n5/grammar-categories.json"
import n4GrammarJson from "@/data/n4/grammar.json"
import n4CategoriesJson from "@/data/n4/grammar-categories.json"

export const n5Grammar = n5GrammarJson as GrammarPoint[]
export const n4Grammar = n4GrammarJson as GrammarPoint[]
export const allGrammar: GrammarPoint[] = [...n5Grammar, ...n4Grammar]

export const n5GrammarCategories = n5CategoriesJson.categories as GrammarCategory[]
export const n4GrammarCategories = n4CategoriesJson.categories as GrammarCategory[]
export const allGrammarCategories: GrammarCategory[] = [...n5GrammarCategories, ...n4GrammarCategories]

export const n5GrammarTips = n5CategoriesJson.tips as string[]
export const n4GrammarTips = n4CategoriesJson.tips as string[]

export function getGrammar(level: Level): GrammarPoint[] {
  if (level === "N5") return n5Grammar
  if (level === "N4") return n4Grammar
  return allGrammar
}

export function getGrammarCategories(level: Level): GrammarCategory[] {
  if (level === "N5") return n5GrammarCategories
  if (level === "N4") return n4GrammarCategories
  return allGrammarCategories
}

export function getGrammarTips(level: Level): string[] {
  if (level === "N5") return n5GrammarTips
  if (level === "N4") return n4GrammarTips
  return [...n5GrammarTips, ...n4GrammarTips]
}
