import { useEffect, useMemo, useState } from "react"
import { Link, NavLink, useLocation } from "react-router-dom"
import { useVocabStore } from "@/store/vocab-store"
import { isDue } from "@/lib/srs"
import { useSettingsStore } from "@/store/settings-store"
import { Furigana } from "@/components/ui/Furigana"
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher"
import { LevelSwitcher } from "@/components/ui/LevelSwitcher"
import { InkCabinet } from "@/components/ui/InkCabinet"
import { useTranslation } from "@/lib/useTranslation"

const nav = [
  { to: "/",           label: "ホーム",     kana: "ホーム",         key: "home" },
  { to: "/vocab",      label: "単語",       kana: "たんご",         key: "vocabulary" },
  { to: "/review",     label: "復習",       kana: "ふくしゅう",      key: "review" },
  { to: "/grammar",    label: "文法",       kana: "ぶんぽう",        key: "grammar" },
  { to: "/kaiwa",      label: "会話練習",   kana: "かいわれんしゅう", key: "kaiwa" },
  { to: "/verb-forms", label: "動詞の形",   kana: "どうしのかたち",   key: "verbForms" },
  { to: "/transitivity", label: "自他動詞", kana: "じたどうし",      key: "transitivity" },
  { to: "/usage",      label: "使い方",     kana: "つかいかた",      key: "usage" },
  { to: "/kanji",      label: "漢字",       kana: "かんじ",          key: "kanji" },
  { to: "/counters",   label: "数え方",     kana: "かぞえかた",      key: "counters" },
  { to: "/homophones", label: "同音語",     kana: "どうおんご",      key: "homophones" },
  { to: "/settings",   label: "設定",       kana: "せってい",        key: "settings" },
]

interface SidebarProps {
  /** Mobile-drawer open state. Ignored at `lg`+ where the sidebar is always visible. */
  open: boolean
  onClose: () => void
}

type VocabModule = typeof import("@/data/vocab")

export function Sidebar({ open, onClose }: SidebarProps) {
  const cards = useVocabStore(s => s.cards)
  const level = useSettingsStore(s => s.level)
  const { pathname } = useLocation()
  const { t } = useTranslation()

  // The stats below need the full vocabulary, but the Sidebar is part of the
  // startup bundle -- a static import put ~700KB of vocab JSON in front of
  // the first paint. Fetch it right after mount instead; it's the same chunk
  // the Vocab/Review pages use, so it's a one-time load either way.
  const [vocabData, setVocabData] = useState<VocabModule | null>(null)
  useEffect(() => {
    let cancelled = false
    import("@/data/vocab").then(m => { if (!cancelled) setVocabData(m) }, () => {})
    return () => { cancelled = true }
  }, [])

  // One pass over the level's vocab for both the stat tiles and the due
  // count. `pathname` is a deliberate extra dependency: due-ness depends on
  // the clock, so recount on each navigation the way the old per-render
  // version did, without recounting on every unrelated re-render.
  const { stats, due } = useMemo(() => {
    void pathname
    if (!vocabData) return { stats: null, due: 0 }
    const all = vocabData.vocabForLevel(level)
    const counts = { total: all.length, new: 0, learning: 0, review: 0, mastered: 0 }
    let dueCount = 0
    for (const v of all) {
      const c = cards[v.id]
      if (!c || c.state === 'new') { counts.new++; continue }
      if (c.state === 'learning') counts.learning++
      else if (c.state === 'review') counts.review++
      else if (c.state === 'mastered') counts.mastered++
      if (isDue(c)) dueCount++
    }
    // Capped at 50, matching the old getDueCards() batch size.
    return { stats: counts, due: Math.min(dueCount, 50) }
  }, [vocabData, level, cards, pathname])

  return (
    <aside
      className={[
        "fixed lg:static inset-y-0 left-0 z-40 w-64 max-w-[85vw] h-dvh overflow-y-auto border-r-3 flex flex-col",
        // will-change keeps the drawer on its own compositor layer, so its
        // slide-out keeps running smoothly while the page being navigated to
        // is still mounting on the main thread.
        "transition-transform duration-300 ease-out lg:translate-x-0 will-change-transform lg:will-change-auto",
        open ? "translate-x-0" : "-translate-x-full",
      ].join(" ")}
      style={{
        background: 'var(--tori-bg-sidebar)',
        borderColor: 'var(--tori-sb-border)',
        // Landscape on a notched iPhone can put the notch/rounded corner
        // over the drawer's left edge -- no-op in portrait (inset is 0).
        paddingLeft: 'env(safe-area-inset-left)',
      }}
    >
      {/* Logo -- extra top padding on mobile covers the drawer sitting flush
          against the top edge, under the iPhone notch/Dynamic Island. */}
      <div
        className="border-b-3 border-structural p-5"
        style={{ paddingTop: "max(1.25rem, env(safe-area-inset-top))" }}
      >
        <div className="flex items-center justify-between gap-2">
          <Link
            to="/"
            onClick={onClose}
            title="About Tori"
            className="flex items-center gap-3 group hover:opacity-80 transition-opacity min-w-0"
          >
            <span className="text-3xl font-display leading-none shrink-0">
              <Furigana kanji="鳥" kana="とり" />
            </span>
            <div className="flex flex-col min-w-0">
              <span className="font-mono text-xs font-black uppercase tracking-widest text-ink group-hover:text-accent transition-colors whitespace-nowrap">
                [ TORI ]
              </span>
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-muted opacity-70 whitespace-nowrap">
                JLPT N5 / N4
              </span>
            </div>
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="lg:hidden w-8 h-8 border-2 border-structural flex items-center justify-center shrink-0 cursor-pointer font-mono text-base font-bold leading-none hover:bg-surface"
          >
            ×
          </button>
        </div>
        <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-structural/20">
          <LevelSwitcher />
          <LanguageSwitcher />
        </div>
      </div>

      {/* Ink cabinet — compact theme picker + RAW/NEO toggle */}
      <div className="border-b-3 border-structural p-3">
        <InkCabinet compact />
      </div>

      {/* Due alert */}
      {due > 0 && (
        <div className="border-b-3 border-structural p-3 bg-accent text-accent-fg flex items-center gap-2">
          <span className="font-display text-lg">{due}</span>
          <span className="font-mono text-xs font-bold uppercase tracking-wider">{t('sidebar.cardsDueNow')}</span>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 p-4 flex flex-col gap-1">
        {nav.map(({ to, label, kana, key }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            onClick={onClose}
            className={({ isActive }) =>
              [
                "nav-item flex items-center gap-3 px-4 py-2.5 border-3 transition-all duration-100",
                isActive
                  ? "border-ink bg-ink text-paper shadow-none translate-x-0.5 translate-y-0.5"
                  : "border-transparent hover:border-structural hover:shadow-[var(--shadow-brutal)] hover:-translate-x-0.5 hover:-translate-y-0.5",
              ].join(" ")
            }
          >
            <div>
              <div className="font-black text-sm leading-tight">
                <Furigana kanji={label} kana={kana} />
              </div>
              <div className="font-mono text-xs font-bold uppercase tracking-wider opacity-60">{t(`nav.${key}`)}</div>
            </div>
          </NavLink>
        ))}
      </nav>

      {/* Mini stats */}
      <div className="border-t-3 border-structural p-4 grid grid-cols-2 gap-2">
        {[
          { label: t('common.stats.total'), val: stats?.total ?? '–' },
          { label: t('common.stats.mastered'), val: stats?.mastered ?? '–' },
          { label: t('common.stats.review'), val: stats?.review ?? '–' },
          { label: t('common.stats.new'), val: stats?.new ?? '–' },
        ].map(({ label, val }) => (
          <div key={label} className="bg-card border-2 border-structural rounded-[var(--radius-sm)] p-2 text-center">
            <div className="font-display text-lg">{val}</div>
            <div className="font-mono text-xs uppercase tracking-wider text-muted">{label}</div>
          </div>
        ))}
      </div>
    </aside>
  )
}
