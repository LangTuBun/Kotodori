import { useState } from "react"
import vocabData from "@/data/n5/vocabulary.json"
import type { VocabEntry } from "@/types"
import { Button } from "@/components/ui/Button"
import { Furigana } from "@/components/ui/Furigana"
import { PosTag } from "@/components/ui/PosTag"

const vocab = vocabData as VocabEntry[]

// Normalize kana for similarity matching:
// 1. Katakana → hiragana
// 2. Same-pronunciation subs (ぢ→じ, づ→ず)
// 3. Remove long vowel mark ー
// 4. Collapse long vowels: おう→おお, えい→ええ
// 5. Collapse double vowels to single
function normalizeReading(kana: string): string {
  let s = ''
  for (const c of kana) {
    const code = c.charCodeAt(0)
    if (code >= 0x30A1 && code <= 0x30F6) {
      // katakana → hiragana
      s += String.fromCharCode(code - 0x60)
    } else if (c === 'ー') {
      // long vowel mark: skip (treat elongated and short as same)
    } else {
      s += c
    }
  }
  // same-sound substitutions (modern Japanese pronunciation)
  s = s.replace(/ぢ/g, 'じ').replace(/づ/g, 'ず')
  // long vowel patterns in hiragana
  s = s.replace(/おう/g, 'おお')
  s = s.replace(/えい/g, 'ええ')
  // collapse doubled vowels
  s = s.replace(/([あいうえお])\1+/g, '$1')
  return s
}

interface SoundGroup {
  id: string
  normalizedReading: string
  readings: string[]          // distinct original readings in this group
  entries: VocabEntry[]
  difficultyScore: number
}

// Compute groups at module load — cheap, runs once
const groups: SoundGroup[] = (() => {
  const map = new Map<string, VocabEntry[]>()
  for (const v of vocab) {
    if (!v.kana || v.kana.length < 2) continue
    const key = normalizeReading(v.kana)
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(v)
  }
  const result: SoundGroup[] = []
  let i = 1
  for (const [norm, entries] of map) {
    if (entries.length < 2) continue
    const readings = Array.from(new Set(entries.map(e => e.kana)))
    result.push({
      id: `g${i++}`,
      normalizedReading: norm,
      readings,
      entries,
      difficultyScore: Math.min(entries.length, 5),
    })
  }
  // sort: groups with distinct readings (true sound-alikes) first, then by count desc
  return result.sort((a, b) => {
    const aDistinct = a.readings.length > 1 ? 1 : 0
    const bDistinct = b.readings.length > 1 ? 1 : 0
    if (aDistinct !== bDistinct) return bDistinct - aDistinct
    return b.entries.length - a.entries.length
  })
})()

function WordCard({ entry, revealed }: { entry: VocabEntry; revealed: boolean }) {
  return (
    <div className="border-3 border-ink shadow-[3px_3px_0px_#0a0a0a] p-4 flex-1 min-w-[140px] bg-paper">
      <PosTag pos={entry.pos} verbGroup={entry.verbGroup} />
      <div className="text-2xl font-black jp mt-3 mb-2">
        {revealed
          ? <Furigana kanji={entry.kanji} kana={entry.kana} />
          : <span className="opacity-0 select-none">████</span>}
      </div>
      <div className={`text-sm font-bold transition-opacity duration-200 ${revealed ? 'opacity-100' : 'opacity-0'}`}>
        {entry.meanings.vi}
      </div>
      {revealed && entry.kana && (
        <div className="text-xs text-muted jp mt-1">{entry.kana}</div>
      )}
    </div>
  )
}

export function Homophones() {
  const [selected, setSelected] = useState<SoundGroup | null>(null)
  const [revealed, setRevealed] = useState(false)

  const trueHomophones = groups.filter(g => g.readings.length === 1)
  const soundAlikes = groups.filter(g => g.readings.length > 1)

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="border-b-3 border-ink pb-8 mb-8">
        <h1 className="text-5xl font-black tracking-tighter">Homophones</h1>
        <p className="text-muted font-bold text-sm uppercase tracking-widest mt-2">
          Words that sound the same or similar
        </p>
      </div>

      {/* Challenge mode */}
      {selected ? (
        <div>
          <Button variant="ghost" size="sm" className="mb-6" onClick={() => { setSelected(null); setRevealed(false) }}>
            Back to list
          </Button>

          <div className="border-3 border-ink shadow-[6px_6px_0px_#ffe600] p-8 mb-6">
            <div className="text-center mb-6">
              <div className="text-xs font-bold uppercase tracking-widest text-muted mb-2">
                {selected.readings.length > 1 ? 'Similar sound' : 'Identical reading'}
              </div>
              {/* Show all distinct readings */}
              <div className="flex gap-3 justify-center flex-wrap mb-2">
                {selected.readings.map(r => (
                  <div key={r} className="text-5xl font-black jp">{r}</div>
                ))}
              </div>
              {selected.readings.length > 1 && (
                <div className="text-xs text-muted font-bold">
                  (normalized: {selected.normalizedReading})
                </div>
              )}
            </div>

            <div className="text-xs font-bold uppercase tracking-wider text-muted mb-4 text-center">
              {selected.entries.length} words share this sound
            </div>

            <div className="flex gap-4 flex-wrap justify-center mb-6">
              {selected.entries.map(e => (
                <WordCard key={e.id} entry={e} revealed={revealed} />
              ))}
            </div>

            <div className="flex gap-3 justify-center">
              {!revealed ? (
                <Button variant="yellow" onClick={() => setRevealed(true)}>Reveal all</Button>
              ) : (
                <Button variant="green" onClick={() => {
                  const others = groups.filter(g => g.id !== selected.id)
                  setSelected(others[Math.floor(Math.random() * others.length)])
                  setRevealed(false)
                }}>
                  Next group
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Stats + random */}
          <div className="border-3 border-ink p-6 shadow-[5px_5px_0px_#ffe600] mb-8 flex items-center justify-between gap-4">
            <div className="flex gap-8">
              <div>
                <div className="font-black text-2xl">{trueHomophones.length}</div>
                <div className="text-xs text-muted font-bold uppercase tracking-wider">Exact homophones</div>
              </div>
              <div>
                <div className="font-black text-2xl">{soundAlikes.length}</div>
                <div className="text-xs text-muted font-bold uppercase tracking-wider">Sound-alikes</div>
              </div>
            </div>
            <Button variant="yellow" onClick={() => {
              setSelected(groups[Math.floor(Math.random() * groups.length)])
              setRevealed(false)
            }}>
              Random challenge
            </Button>
          </div>

          {/* Exact homophones */}
          {trueHomophones.length > 0 && (
            <>
              <div className="text-xs font-black uppercase tracking-widest mb-3 flex items-center gap-3">
                <span>Exact homophones</span>
                <div className="flex-1 border-t-3 border-ink" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                {trueHomophones.map((g, i) => (
                  <GroupCard key={g.id} group={g} idx={i} onSelect={() => { setSelected(g); setRevealed(false) }} />
                ))}
              </div>
            </>
          )}

          {/* Sound-alikes */}
          {soundAlikes.length > 0 && (
            <>
              <div className="text-xs font-black uppercase tracking-widest mb-3 flex items-center gap-3">
                <span>Sound-alikes (long vowel variants)</span>
                <div className="flex-1 border-t-3 border-ink" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {soundAlikes.map((g, i) => (
                  <GroupCard key={g.id} group={g} idx={i} onSelect={() => { setSelected(g); setRevealed(false) }} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}

function GroupCard({ group, idx, onSelect }: { group: SoundGroup; idx: number; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className="border-3 border-ink p-4 text-left shadow-[3px_3px_0px_#0a0a0a] hover:shadow-[5px_5px_0px_#ffe600] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all bg-paper"
    >
      <div className="flex items-start gap-3">
        <div className="text-xs font-black text-muted w-6 shrink-0 pt-1">{idx + 1}</div>
        <div className="flex-1">
          <div className="flex flex-wrap gap-2 mb-2">
            {group.readings.map(r => (
              <span key={r} className="text-2xl font-black jp leading-none">{r}</span>
            ))}
          </div>
          <div className="text-xs font-bold uppercase tracking-wider text-muted mb-2">
            {group.entries.length} words
          </div>
          <div className="flex flex-wrap gap-1.5">
            {group.entries.map(e => (
              <span key={e.id} className="text-xs border border-ink px-2 py-0.5 font-bold">
                <Furigana kanji={e.kanji || e.kana} kana={e.kana} />
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          {Array.from({ length: group.difficultyScore }).map((_, i) => (
            <div key={i} className="w-1.5 h-5 bg-ink" />
          ))}
          {Array.from({ length: 5 - group.difficultyScore }).map((_, i) => (
            <div key={i} className="w-1.5 h-5 bg-surface border border-ink/30" />
          ))}
        </div>
      </div>
    </button>
  )
}
