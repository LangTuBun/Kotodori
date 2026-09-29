import { useEffect, useState } from "react"
import type { Level } from "@/store/settings-store"

/**
 * Subscribes a component to level-scoped data that is fetched lazily (one
 * dynamic-import chunk per JLPT level, see @/data/vocab and @/data/grammar).
 *
 * `peek` returns the data synchronously when it has already been loaded, so
 * revisiting a page or switching back to a level never flashes an empty
 * state. `null` means "still loading". Both callbacks must be module-level
 * (stable) functions.
 */
export function useLevelData<T>(
  level: Level,
  peek: (level: Level) => T | null,
  load: (level: Level) => Promise<T>,
): T | null {
  const [loaded, setLoaded] = useState<{ level: Level; value: T } | null>(null)
  const cached = peek(level)

  useEffect(() => {
    if (cached) return
    let cancelled = false
    load(level).then(
      value => { if (!cancelled) setLoaded({ level, value }) },
      () => {},
    )
    return () => { cancelled = true }
  }, [level, cached, load])

  if (cached) return cached
  return loaded?.level === level ? loaded.value : null
}
