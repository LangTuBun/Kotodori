import { useEffect, useRef, useState } from "react"

/**
 * Responsive collapsible filter panel.
 *
 * - Desktop (≥ lg / 1024px): renders children in a normal flex-wrap container,
 *   no toggle bar, no collapse behavior — identical to the old layout.
 * - Mobile (< lg): collapses to a compact summary bar showing the active
 *   filter label + a chevron toggle. Tapping expands the chip grid.
 *   Auto-collapses when `activeLabel` changes (= user made a selection).
 *
 * Animation uses the same `grid-template-rows: 0fr → 1fr` trick as the
 * existing `.acc-body` accordion in index.css — smooth, no JS measurement.
 */

interface CollapsibleFiltersProps {
  /** Shown as the bar label on mobile, e.g. "Chapter" or "Filters" */
  label: string
  /** Describes the current active selection, e.g. "Chapter 5" or "All" */
  activeLabel: string
  /** Whether any non-default filter is active (shows accent dot) */
  isFiltered?: boolean
  /** The filter chip buttons */
  children: React.ReactNode
  /** Extra class for the chip container (both mobile expanded & desktop) */
  className?: string
}

export function CollapsibleFilters({
  label,
  activeLabel,
  isFiltered = false,
  children,
  className = "",
}: CollapsibleFiltersProps) {
  const [open, setOpen] = useState(false)
  const initialLabel = useRef(activeLabel)

  // Auto-collapse when the user makes a selection (activeLabel changes).
  // Skip the initial mount so it doesn't flash closed on first render.
  useEffect(() => {
    if (activeLabel !== initialLabel.current) {
      setOpen(false)
    }
    initialLabel.current = activeLabel
  }, [activeLabel])

  return (
    <>
      {/* ── Desktop: always-visible flat layout (unchanged from before) ── */}
      <div
        className={`hidden lg:flex px-4 py-3 border-b-3 border-structural bg-paper gap-2 flex-wrap ${className}`}
      >
        {children}
      </div>

      {/* ── Mobile: collapsible panel ── */}
      <div className="lg:hidden border-b-3 border-structural bg-paper">
        {/* Toggle bar */}
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className="w-full flex items-center gap-3 px-4 py-3 cursor-pointer active:bg-surface transition-colors"
          aria-expanded={open}
        >
          {/* Filter icon (funnel) */}
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0 opacity-50"
          >
            <path d="M1.5 1.5h13l-5 6v5l-3 2v-7z" />
          </svg>

          <span className="text-xs font-black uppercase tracking-wider shrink-0">
            {label}
          </span>

          {/* Active filter label */}
          <span className="flex-1 text-xs font-bold text-muted truncate text-left">
            {activeLabel}
          </span>

          {/* Filtered indicator dot */}
          {isFiltered && (
            <span className="w-2 h-2 rounded-full bg-accent shrink-0" />
          )}

          {/* Chevron */}
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          >
            <path d="M2 4l4 4 4-4" />
          </svg>
        </button>

        {/* Expandable chip area — grid-rows animation (same as acc-body) */}
        <div
          className="grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.2,0.7,0.2,1)]"
          style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
        >
          <div className="overflow-hidden">
            <div
              className={`px-4 pb-3 gap-2 flex flex-wrap max-h-[45dvh] overflow-y-auto ${className}`}
            >
              {children}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
