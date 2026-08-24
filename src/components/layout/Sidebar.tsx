import { Link, NavLink } from "react-router-dom"
import { useVocabStore } from "@/store/vocab-store"
import { useSettingsStore } from "@/store/settings-store"
import { Furigana } from "@/components/ui/Furigana"
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher"
import { LevelSwitcher } from "@/components/ui/LevelSwitcher"
import { InkCabinet } from "@/components/ui/InkCabinet"
import { useTranslation } from "@/lib/useTranslation"

const nav = [
  { to: "/dashboard",  label: "ホーム",     kana: "ホーム",         key: "home" },
  { to: "/vocab",      label: "単語",       kana: "たんご",         key: "vocabulary" },
  { to: "/review",     label: "復習",       kana: "ふくしゅう",      key: "review" },
  { to: "/grammar",    label: "文法",       kana: "ぶんぽう",        key: "grammar" },
  { to: "/verb-forms", label: "動詞の形",   kana: "どうしのかたち",   key: "verbForms" },
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

export function Sidebar({ open, onClose }: SidebarProps) {
  const { streak, getStats } = useVocabStore()
  // getStats()/getDueCards() read the current level internally
  // (vocab-store.ts's currentLevelVocab()), but that's a plain read, not a
  // subscription -- without subscribing to `level` here too, Sidebar never
  // re-renders on a level switch (it's mounted once in Layout, not per
  // route) and these numbers go stale until something else happens to
  // re-render it. The subscription's only job is forcing that re-render.
  useSettingsStore(s => s.level)
  const stats = getStats()
  const getDueCards = useVocabStore(s => s.getDueCards)
  const due = getDueCards().length
  const { t } = useTranslation()

  return (
    <aside
      className={[
        "fixed lg:static inset-y-0 left-0 z-40 w-64 max-w-[85vw] h-dvh overflow-y-auto border-r-3 flex flex-col",
        "transition-transform duration-300 ease-out lg:translate-x-0",
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

      {/* Streak */}
      <div className="border-b-3 border-structural p-4 flex items-center gap-3 bg-yellow tilt-card">
        <div>
          <div className="font-display text-xl">{streak}</div>
          <div className="font-mono text-xs font-bold uppercase tracking-wider">{t('sidebar.dayStreak')}</div>
        </div>
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
            end={to === "/dashboard"}
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
          { label: t('common.stats.total'), val: stats.total },
          { label: t('common.stats.mastered'), val: stats.mastered },
          { label: t('common.stats.review'), val: stats.review },
          { label: t('common.stats.new'), val: stats.new },
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
