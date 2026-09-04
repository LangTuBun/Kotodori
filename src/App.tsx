import { Suspense, lazy } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Layout } from "@/components/layout/Layout"
import { ToriLoader } from "@/components/ui/ToriLoader"

// Every page pulls in one or more of the large per-domain JSON data files
// (n5/n4 vocab, grammar, kanji, kanjivg...) -- statically importing all of
// them from App.tsx put the entire dataset in the single main bundle
// (~3.2MB / ~880KB gzip) even for a visitor who only ever opens Settings.
// Lazy-loading per route lets Vite split each page (and the data it pulls
// in) into its own chunk, fetched on first navigation instead of up front.
// Landing (the site's home, at "/") carries the same data weight as the
// old Dashboard did (due/new/grammar counts) since they were merged, so it
// gets the same lazy treatment as everything else rather than being bundled
// eagerly the way a lightweight splash screen would be.
const Landing = lazy(() => import("@/pages/Landing").then(m => ({ default: m.Landing })))
const VocabBrowser = lazy(() => import("@/pages/VocabBrowser").then(m => ({ default: m.VocabBrowser })))
const Review = lazy(() => import("@/pages/Review").then(m => ({ default: m.Review })))
const Grammar = lazy(() => import("@/pages/Grammar").then(m => ({ default: m.Grammar })))
const VerbForms = lazy(() => import("@/pages/VerbForms").then(m => ({ default: m.VerbForms })))
const Transitivity = lazy(() => import("@/pages/Transitivity").then(m => ({ default: m.Transitivity })))
const Usage = lazy(() => import("@/pages/Usage").then(m => ({ default: m.Usage })))
const Kanji = lazy(() => import("@/pages/Kanji").then(m => ({ default: m.Kanji })))
const Counters = lazy(() => import("@/pages/Counters").then(m => ({ default: m.Counters })))
const Homophones = lazy(() => import("@/pages/Homophones").then(m => ({ default: m.Homophones })))
const Settings = lazy(() => import("@/pages/Settings").then(m => ({ default: m.Settings })))

// Route chunks aren't all tiny (the Grammar chunk alone is ~280KB gzip,
// carrying all 203 enriched N5+N4 grammar points) -- on a slow/mobile
// connection this can take a beat, so a bare `null` here would leave the
// content pane blank with zero indication anything is happening.
// ToriLoader draws the site's own bird mark stroke-by-stroke (the same
// technique as Landing's hero, self-contained so it doesn't need the lazy
// chunk it's standing in for) -- keeps every page's fallback in sync
// without a full per-page skeleton, and reads as "loading" on its own.
const RouteFallback = ToriLoader

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Home used to be a separate pre-shell splash page at "/" with a
            click-through to /dashboard inside the Layout/Sidebar shell.
            They were merged (Dashboard's queue cards folded into Landing) so
            there's one home page, living inside the same shell as every
            other page. Both old paths redirect here for bookmarks and the
            PWA manifest's start_url. */}
        <Route path="dashboard" element={<Navigate to="/" replace />} />
        <Route path="welcome" element={<Navigate to="/" replace />} />
        <Route element={<Layout />}>
          <Route index element={<Suspense fallback={<RouteFallback />}><Landing /></Suspense>} />
          <Route path="vocab" element={<Suspense fallback={<RouteFallback />}><VocabBrowser /></Suspense>} />
          <Route path="review" element={<Suspense fallback={<RouteFallback />}><Review /></Suspense>} />
          <Route path="grammar" element={<Suspense fallback={<RouteFallback />}><Grammar /></Suspense>} />
          <Route path="verb-forms" element={<Suspense fallback={<RouteFallback />}><VerbForms /></Suspense>} />
          <Route path="transitivity" element={<Suspense fallback={<RouteFallback />}><Transitivity /></Suspense>} />
          <Route path="usage" element={<Suspense fallback={<RouteFallback />}><Usage /></Suspense>} />
          <Route path="kanji" element={<Suspense fallback={<RouteFallback />}><Kanji /></Suspense>} />
          <Route path="counters" element={<Suspense fallback={<RouteFallback />}><Counters /></Suspense>} />
          <Route path="homophones" element={<Suspense fallback={<RouteFallback />}><Homophones /></Suspense>} />
          <Route path="settings" element={<Suspense fallback={<RouteFallback />}><Settings /></Suspense>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
