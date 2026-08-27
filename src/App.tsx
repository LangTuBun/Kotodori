import { Suspense, lazy } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Layout } from "@/components/layout/Layout"
import { Landing } from "@/pages/Landing"

// Every other page pulls in one or more of the large per-domain JSON data
// files (n5/n4 vocab, grammar, kanji, kanjivg...) -- statically importing
// all of them from App.tsx put the entire dataset in the single main bundle
// (~3.2MB / ~880KB gzip) even for a visitor who only ever opens Settings.
// Lazy-loading per route lets Vite split each page (and the data it pulls
// in) into its own chunk, fetched on first navigation instead of up front.
const Dashboard = lazy(() => import("@/pages/Dashboard").then(m => ({ default: m.Dashboard })))
const VocabBrowser = lazy(() => import("@/pages/VocabBrowser").then(m => ({ default: m.VocabBrowser })))
const Review = lazy(() => import("@/pages/Review").then(m => ({ default: m.Review })))
const Grammar = lazy(() => import("@/pages/Grammar").then(m => ({ default: m.Grammar })))
const VerbForms = lazy(() => import("@/pages/VerbForms").then(m => ({ default: m.VerbForms })))
const Kanji = lazy(() => import("@/pages/Kanji").then(m => ({ default: m.Kanji })))
const Counters = lazy(() => import("@/pages/Counters").then(m => ({ default: m.Counters })))
const Homophones = lazy(() => import("@/pages/Homophones").then(m => ({ default: m.Homophones })))
const Settings = lazy(() => import("@/pages/Settings").then(m => ({ default: m.Settings })))

// Route chunks aren't all tiny (the Grammar chunk alone is ~280KB gzip,
// carrying all 203 enriched N5+N4 grammar points) -- on a slow/mobile
// connection this can take a beat, so a bare `null` here would leave the
// content pane blank with zero indication anything is happening. Minimal
// brutalist pulse rather than a full skeleton: cheap to keep in sync with
// every page's differing layout, and still tells the user something's
// loading.
function RouteFallback() {
  return (
    <div className="h-full flex items-center justify-center p-8">
      <div className="w-40 h-10 border-3 border-structural bg-surface animate-pulse" />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing is the site's entry point -- accessing the site always
            hits this first. "welcome" kept as a redirect for old bookmarks
            (the Sidebar logo used to link there). */}
        <Route path="/" element={<Landing />} />
        <Route path="welcome" element={<Navigate to="/" replace />} />
        <Route element={<Layout />}>
          <Route path="dashboard" element={<Suspense fallback={<RouteFallback />}><Dashboard /></Suspense>} />
          <Route path="vocab" element={<Suspense fallback={<RouteFallback />}><VocabBrowser /></Suspense>} />
          <Route path="review" element={<Suspense fallback={<RouteFallback />}><Review /></Suspense>} />
          <Route path="grammar" element={<Suspense fallback={<RouteFallback />}><Grammar /></Suspense>} />
          <Route path="verb-forms" element={<Suspense fallback={<RouteFallback />}><VerbForms /></Suspense>} />
          <Route path="kanji" element={<Suspense fallback={<RouteFallback />}><Kanji /></Suspense>} />
          <Route path="counters" element={<Suspense fallback={<RouteFallback />}><Counters /></Suspense>} />
          <Route path="homophones" element={<Suspense fallback={<RouteFallback />}><Homophones /></Suspense>} />
          <Route path="settings" element={<Suspense fallback={<RouteFallback />}><Settings /></Suspense>} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
