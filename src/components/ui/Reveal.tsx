import { useEffect, useRef, type CSSProperties, type ElementType, type ReactNode } from "react"

interface RevealProps {
  children: ReactNode
  /** stagger position — delay is index * 80ms, see .reveal.in in index.css */
  index?: number
  as?: ElementType
  className?: string
  rootMargin?: string
  threshold?: number
}

/**
 * Scroll-reveal primitive (ported from Tori's `Reveal`). An
 * IntersectionObserver adds `.in` once and then unobserves, so a revealed
 * element stays revealed when scrolling back up. Respects
 * prefers-reduced-motion by revealing immediately with no animation.
 */
export function Reveal({
  children,
  index = 0,
  as: Tag = "div",
  className = "",
  rootMargin = "0px 0px -12% 0px",
  threshold = 0.15,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("in")
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in")
            io.unobserve(entry.target)
          }
        }
      },
      { rootMargin, threshold }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [rootMargin, threshold])

  return (
    <Tag ref={ref} className={["reveal", className].filter(Boolean).join(" ")} style={{ "--i": index } as CSSProperties}>
      {children}
    </Tag>
  )
}
