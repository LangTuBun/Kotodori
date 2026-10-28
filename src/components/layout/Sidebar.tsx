import { useMemo } from "react"
import { Link, NavLink, useLocation } from "react-router-dom"
import { useVocabStore } from "@/store/vocab-store"
import { isDue } from "@/lib/srs"
import { useSettingsStore } from "@/store/settings-store"
import { Furigana } from "@/components/ui/Furigana"
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher"
import { LevelSwitcher } from "@/components/ui/LevelSwitcher"
import { InkCabinet } from "@/components/ui/InkCabinet"
import { useTranslation } from "@/lib/useTranslation"
import { useVocab } from "@/data/vocab"
import { prefetchRoute } from "@/lib/routes"

interface NavItem { to: string; label: string; kana: string; key: string }

// Grouped so the 14 destinations read as four areas instead of one long list.
// Home stands alone above the groups.
const HOME: NavItem = { to: "/", label: "ホーム", kana: "ホーム", key: "home" }
const navGroups: { id: string; items: NavItem[] }[] = [
  { id: "learn", items: [
    { to: "/vocab",        label: "単語",     kana: "たんご",       key: "vocabulary" },
    { to: "/review",       label: "復習",     kana: "ふくしゅう",    key: "review" },
  ] },
  { id: "grammar", items: [
    { to: "/grammar",      label: "文法",     kana: "ぶんぽう",      key: "grammar" },
    { to: "/verb-forms",   label: "動詞の形", kana: "どうしのかたち", key: "verbForms" },
    { to: "/transitivity", label: "自他動詞", kana: "じたどうし",    key: "transitivity" },
    { to: "/usage",        label: "使い方",   kana: "つかいかた",    key: "usage" },
  ] },
  { id: "kanji", items: [
    { to: "/kanji",        label: "漢字",     kana: "かんじ",       key: "kanji" },
    { to: "/radicals",     label: "部首",     kana: "ぶしゅ",       key: "radicals" },
    { to: "/lookup",       label: "字引",     kana: "じびき",       key: "lookup" },
    { to: "/rules",        label: "規則",     kana: "きそく",       key: "rules" },
  ] },
  { id: "more", items: [
    { to: "/accent",       label: "音",       kana: "アクセント",    key: "accent" },
    { to: "/counters",     label: "数え方",   kana: "かぞえかた",    key: "counters" },
    { to: "/homophones",   label: "同音語",   kana: "どうおんご",    key: "homophones" },
    { to: "/settings",     label: "設定",     kana: "せってい",      key: "settings" },
  ] },
]

interface SidebarProps {
  /** Mobile-drawer open state. Ignored at `lg`+ where the sidebar is always visible. */
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const cards = useVocabStore(s => s.cards)
  const level = useSettingsStore(s => s.level)
  const { pathname } = useLocation()
  const { t } = useTranslation()

  // The stats below need the level's vocabulary, but the Sidebar is part of
  // the startup bundle. useVocab() fetches only the selected level's chunk
  // right after mount (the same one the Vocab/Review pages use), so the JSON
  // stays off the first paint's critical path.
  const vocab = useVocab(level)

  // One pass over the level's vocab for both the stat tiles and the due
  // count. `pathname` is a deliberate extra dependency: due-ness depends on
  // the clock, so recount on each navigation the way the old per-render
  // version did, without recounting on every unrelated re-render.
  const { stats, due } = useMemo(() => {
    void pathname
    if (vocab.length === 0) return { stats: null, due: 0 }
    const all = vocab
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
  }, [vocab, cards, pathname])

  return (
    <aside
      className={[
        "material fixed lg:static inset-y-0 left-0 z-40 w-64 max-w-[85vw] h-dvh overflow-y-auto border-r flex flex-col",
        // will-change keeps the drawer on its own compositor layer, so its
        // slide-out keeps running smoothly while the page being navigated to
        // is still mounting on the main thread. The iOS sheet curve gives
        // the drawer a quick start and a long, soft settle.
        "transition-transform duration-500 ease-[var(--ease-sheet)] lg:translate-x-0 will-change-transform lg:will-change-auto",
        open ? "translate-x-0 shadow-[var(--shadow-sheet)] lg:shadow-none" : "-translate-x-full",
      ].join(" ")}
      style={{
        borderColor: 'var(--tori-sb-border)',
        // Landscape on a notched iPhone can put the notch/rounded corner
        // over the drawer's left edge - no-op in portrait (inset is 0).
        paddingLeft: 'env(safe-area-inset-left)',
      }}
    >
      {/* Logo - extra top padding on mobile covers the drawer sitting flush
          against the top edge, under the iPhone notch/Dynamic Island. */}
      <div
        className="px-5 pt-5 pb-4"
        style={{ paddingTop: "max(1.25rem, env(safe-area-inset-top))" }}
      >
        <div className="flex items-center justify-between gap-2">
          <Link
            to="/"
            onClick={onClose}
            title="About Tori"
            className="flex items-center gap-3 group hover:opacity-80 transition-opacity min-w-0"
          >
            <span className="jp size-10 rounded-[11px] bg-accent text-accent-fg flex items-center justify-center text-xl font-bold leading-none shrink-0 shadow-[0_2px_8px_color-mix(in_srgb,var(--tori-accent)_35%,transparent)]">
              鳥
            </span>
            <div className="flex flex-col min-w-0">
              <span className="text-[17px] font-semibold tracking-[-0.02em] text-ink group-hover:text-accent transition-colors whitespace-nowrap">
                Tori
              </span>
              <span className="font-mono text-[11px] text-muted whitespace-nowrap">
                JLPT N5 / N4
              </span>
            </div>
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="lg:hidden size-8 rounded-full bg-surface text-muted flex items-center justify-center shrink-0 cursor-pointer text-lg leading-none hover:text-ink active:scale-90 transition-transform"
          >
            ×
          </button>
        </div>
        <div className="flex items-center justify-between gap-2 mt-4">
          <LevelSwitcher />
          <LanguageSwitcher />
        </div>
      </div>

      {/* Compact theme picker (segmented control) */}
      <div className="px-5 pb-3">
        <InkCabinet compact />
      </div>

      {/* Due alert */}
      {due > 0 && (
        <Link
          to="/review"
          onClick={onClose}
          className="mx-3 mb-1 px-3 py-2.5 rounded-[var(--radius-sm)] bg-accent text-accent-fg flex items-center gap-2.5 active:scale-[0.98] transition-transform shadow-[0_4px_14px_color-mix(in_srgb,var(--tori-accent)_30%,transparent)]"
        >
          <span className="min-w-6 h-6 px-1.5 rounded-full bg-white/25 font-mono text-[13px] font-semibold flex items-center justify-center">{due}</span>
          <span className="text-[13px] font-medium">{t('sidebar.cardsDueNow')}</span>
        </Link>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 pb-3 pt-1 flex flex-col gap-px">
        {[{ id: "", items: [HOME] }, ...navGroups].map(group => (
          <div key={group.id || "home"} className={group.id ? "mt-3" : ""}>
            {group.id && (
              <div className="px-3 pb-1 font-mono text-[10.5px] font-medium uppercase tracking-[0.08em] text-muted">
                {t(`nav.groups.${group.id}`)}
              </div>
            )}
            {group.items.map(({ to, label, kana, key }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                onClick={onClose}
                onPointerDown={() => prefetchRoute(to)}
                onPointerEnter={() => prefetchRoute(to)}
                className={({ isActive }) =>
                  [
                    "nav-item flex items-baseline gap-2.5 px-3 py-[7px] rounded-[9px] active:scale-[0.98]",
                    isActive
                      ? "bg-accent text-accent-fg"
                      : "hover:bg-[var(--tori-hairline)]",
                  ].join(" ")
                }
              >
                <span className="font-semibold text-sm leading-tight shrink-0">
                  <Furigana kanji={label} kana={kana} />
                </span>
                <span className="text-[13px] opacity-65 truncate">{t(`nav.${key}`)}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Mini stats */}
      <div className="p-3 grid grid-cols-2 gap-2">
        {[
          { label: t('common.stats.total'), val: stats?.total ?? '–' },
          { label: t('common.stats.mastered'), val: stats?.mastered ?? '–' },
          { label: t('common.stats.review'), val: stats?.review ?? '–' },
          { label: t('common.stats.new'), val: stats?.new ?? '–' },
        ].map(({ label, val }) => (
          <div key={label} className="bg-card/70 rounded-[var(--radius-sm)] px-3 py-2 shadow-[var(--shadow-brutal)]">
            <div className="font-mono text-[17px] font-semibold leading-tight tracking-[-0.02em]">{val}</div>
            <div className="text-[11px] text-muted">{label}</div>
          </div>
        ))}
      </div>
    </aside>
  )
}
