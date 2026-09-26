import { useEffect, useLayoutEffect, useMemo, useRef, useState, type RefObject } from "react"

/**
 * Renders a long list in pages instead of all at once. Only the first
 * `pageSize` items are returned; a sentinel element placed after them grows
 * the window by another page as it scrolls near the bottom of `rootRef`.
 *
 * Mounting ~1000 furigana/pitch-accent rows in one go took long enough on an
 * iPhone to block the main thread -- keystrokes in the search box queued up
 * behind the render, and clearing the search (every row coming back at once)
 * was the worst case. Capping the first paint keeps each keystroke's render
 * small no matter how many items match.
 *
 * The window resets to one page whenever `items` changes identity. That reset
 * happens during render (not in an effect) so a new search never commits the
 * old, deeply-scrolled window size against the new result set first.
 */
export function useProgressiveList<T>(
  items: readonly T[],
  pageSize: number,
  rootRef: RefObject<HTMLElement | null>,
) {
  const [shown, setShown] = useState({ items, count: pageSize })
  let count = shown.count
  if (shown.items !== items) {
    count = pageSize
    setShown({ items, count })
  }

  // New results start at the top. Otherwise an old deep scrollTop gets clamped
  // to the bottom of the fresh one-page window, landing mid-results with the
  // sentinel already in view.
  useLayoutEffect(() => {
    rootRef.current?.scrollTo(0, 0)
  }, [items, rootRef])

  const sentinelRef = useRef<HTMLDivElement>(null)
  const hasMore = count < items.length

  // `count` is a dependency on purpose: a fresh observer fires its initial
  // callback, so if the sentinel is still in view after a page is added
  // (short rows, tall screen) the next page loads without needing a scroll.
  // `items` is too: a caller that remounts its list (Grammar keys it on the
  // filter chips) replaces the sentinel node even when `count` stays the same.
  useEffect(() => {
    const el = sentinelRef.current
    if (!hasMore || !el) return
    const io = new IntersectionObserver(
      entries => {
        if (entries.some(e => e.isIntersecting)) {
          setShown(w => ({ ...w, count: w.count + pageSize }))
        }
      },
      // The list scrolls inside its own overflow pane, not the viewport --
      // without an explicit root the pane clips the sentinel before the
      // margin applies and there's no lookahead.
      { root: rootRef.current, rootMargin: "0px 0px 800px 0px" },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [items, count, hasMore, pageSize, rootRef])

  const visible = useMemo(() => items.slice(0, count), [items, count])
  return { visible, sentinelRef, hasMore }
}
