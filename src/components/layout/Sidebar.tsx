import { NavLink } from "react-router-dom"
import { useVocabStore } from "@/store/vocab-store"
import { Furigana } from "@/components/ui/Furigana"
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher"
import { useTranslation } from "@/lib/useTranslation"

const nav = [
  { to: "/",           label: "ホーム",     kana: "ホーム",         key: "home" },
  { to: "/vocab",      label: "単語",       kana: "たんご",         key: "vocabulary" },
  { to: "/review",     label: "復習",       kana: "ふくしゅう",      key: "review" },
  { to: "/grammar",    label: "文法",       kana: "ぶんぽう",        key: "grammar" },
  { to: "/verb-forms", label: "動詞の形",   kana: "どうしのかたち",   key: "verbForms" },
  { to: "/kanji",      label: "漢字",       kana: "かんじ",          key: "kanji" },
  { to: "/counters",   label: "数え方",     kana: "かぞえかた",      key: "counters" },
  { to: "/homophones", label: "同音語",     kana: "どうおんご",      key: "homophones" },
]

export function Sidebar() {
  const { streak, getStats } = useVocabStore()
  const stats = getStats()
  const getDueCards = useVocabStore(s => s.getDueCards)
  const due = getDueCards().length
  const { t } = useTranslation()

  return (
    <aside className="w-64 h-screen overflow-y-auto border-r-3 border-ink bg-surface flex flex-col">
      {/* Logo */}
      <div className="border-b-3 border-ink p-6">
        <div className="flex items-start justify-between gap-2">
          <div className="text-3xl font-black tracking-tighter">
            <Furigana kanji="言鳥" kana="ことどり" />
          </div>
          <LanguageSwitcher />
        </div>
        <div className="text-xs font-bold uppercase tracking-widest text-muted mt-1">KOTODORI</div>
      </div>

      {/* Streak */}
      <div className="border-b-3 border-ink p-4 flex items-center gap-3 bg-yellow">
        <div>
          <div className="text-xl font-black">{streak}</div>
          <div className="text-xs font-bold uppercase tracking-wider">{t('sidebar.dayStreak')}</div>
        </div>
      </div>

      {/* Due alert */}
      {due > 0 && (
        <div className="border-b-3 border-ink p-3 bg-red text-paper flex items-center gap-2">
          <span className="font-black text-lg">{due}</span>
          <span className="text-xs font-bold uppercase tracking-wider">{t('sidebar.cardsDueNow')}</span>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 p-4 flex flex-col gap-1">
        {nav.map(({ to, label, kana, key }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              [
                "flex items-center gap-3 px-4 py-2.5 border-3 transition-all duration-100",
                isActive
                  ? "border-ink bg-ink text-paper shadow-none translate-x-0.5 translate-y-0.5"
                  : "border-transparent hover:border-ink hover:shadow-[3px_3px_0px_#0a0a0a] hover:-translate-x-0.5 hover:-translate-y-0.5",
              ].join(" ")
            }
          >
            <div>
              <div className="font-black text-sm leading-tight">
                <Furigana kanji={label} kana={kana} />
              </div>
              <div className="text-xs font-bold uppercase tracking-wider opacity-60">{t(`nav.${key}`)}</div>
            </div>
          </NavLink>
        ))}
      </nav>

      {/* Mini stats */}
      <div className="border-t-3 border-ink p-4 grid grid-cols-2 gap-2">
        {[
          { label: t('common.stats.total'), val: stats.total },
          { label: t('common.stats.mastered'), val: stats.mastered },
          { label: t('common.stats.review'), val: stats.review },
          { label: t('common.stats.new'), val: stats.new },
        ].map(({ label, val }) => (
          <div key={label} className="bg-paper border-2 border-ink p-2 text-center">
            <div className="text-lg font-black">{val}</div>
            <div className="text-xs uppercase tracking-wider text-muted">{label}</div>
          </div>
        ))}
      </div>
    </aside>
  )
}
