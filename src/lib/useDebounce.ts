import { useState, useEffect } from "react"

/**
 * Returns a debounced copy of `value` that only updates after `delayMs`
 * of silence. Keeps the expensive filter from firing on every single
 * keystroke – especially important on mobile where JS is slower.
 */
export function useDebounce<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(id)
  }, [value, delayMs])
  return debounced
}
