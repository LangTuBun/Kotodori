// Central level-aware selector for verb-form data, mirroring grammar.ts's
// pattern. Verb group classification (godan/ichidan/irregular) and the
// basic cheat sheet/exceptions are level-agnostic reference material that
// stays the same regardless of level, so only `forms` -- and each level's
// own cheat sheet/key-exceptions table -- are actually split by level.
// n4/verb-forms.json intentionally has no `groups` of its own: it's an
// additive file (passive/causative/causative-passive), not a parallel
// N5-shaped file like grammar.json's n4 counterpart.
import type { VerbForm, VerbGroup } from "@/types"
import type { Level } from "@/store/settings-store"
import n5Json from "@/data/n5/verb-forms.json"
import n4Json from "@/data/n4/verb-forms.json"

type CheatSheet = { headers: { vi: string; en: string }[]; rows: { vi: string; en: string }[][]; rowsRuby?: { vi: string; en: string }[][] }
type KeyExceptions = { vi: string; en: string }[]

const n5 = n5Json as unknown as {
  groups: VerbGroup[]
  forms: VerbForm[]
  cheatSheet: CheatSheet
  keyExceptions: KeyExceptions
  keyExceptionsRuby?: KeyExceptions
}
const n4 = n4Json as unknown as {
  forms: VerbForm[]
  cheatSheet: CheatSheet
  keyExceptions: KeyExceptions
  keyExceptionsRuby?: KeyExceptions
}

// Verb group classification never changes by level -- always shown as-is.
export const verbGroups: VerbGroup[] = n5.groups

export const n5Forms: VerbForm[] = n5.forms
export const n4Forms: VerbForm[] = n4.forms
export const allForms: VerbForm[] = [...n5Forms, ...n4Forms]

export function getVerbForms(level: Level): VerbForm[] {
  if (level === "N5") return n5Forms
  if (level === "N4") return n4Forms
  return allForms
}

// Each level's cheat sheet/key-exceptions cover only that level's own forms
// (N4's table doesn't repeat N5's dictionary/nai/ta/te/... rows) -- "all"
// shows both tables back to back rather than trying to merge two
// differently-scoped tables into one.
export function getCheatSheets(level: Level): { label: "N5" | "N4"; table: CheatSheet }[] {
  const n5Sheet = { label: "N5" as const, table: n5.cheatSheet }
  const n4Sheet = { label: "N4" as const, table: n4.cheatSheet }
  if (level === "N5") return [n5Sheet]
  if (level === "N4") return [n4Sheet]
  return [n5Sheet, n4Sheet]
}

export function getKeyExceptions(level: Level): { plain: KeyExceptions; ruby?: KeyExceptions } {
  if (level === "N5") return { plain: n5.keyExceptions, ruby: n5.keyExceptionsRuby }
  if (level === "N4") return { plain: n4.keyExceptions, ruby: n4.keyExceptionsRuby }
  return {
    plain: [...n5.keyExceptions, ...n4.keyExceptions],
    ruby: n5.keyExceptionsRuby && n4.keyExceptionsRuby ? [...n5.keyExceptionsRuby, ...n4.keyExceptionsRuby] : undefined,
  }
}
