import { Suspense, lazy } from "react"
import { routeLoaders, loadRouteData, type RoutePath } from "@/lib/routes"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Layout } from "@/components/layout/Layout"
import { ToriLoader } from "@/components/ui/ToriLoader"

// Every page pulls in one or more of the large per-domain JSON data files
// (n5/n4 vocab, grammar, kanji, kanjivg...) -- statically importing all of
// them from App.tsx would put the entire dataset in the single main bundle
// even for a visitor who only ever opens Settings. Lazy-loading per route
// lets Vite split each page (and its data) into its own chunk.
// Each page is lazy through routeLoaders (src/lib/routes.ts); the level data a
// page needs is requested in the same tick, in parallel with its code, rather
// than after the page mounts.
function page<K extends RoutePath, N extends string>(path: K, name: N) {
  return lazy(() => {
    loadRouteData(path)
    return (routeLoaders[path]() as Promise<Record<string, unknown>>)
      .then(m => ({ default: m[name] as React.ComponentType }))
  })
}
const Landing = page("/", "Landing")
const VocabBrowser = page("/vocab", "VocabBrowser")
const Review = page("/review", "Review")
const Grammar = page("/grammar", "Grammar")
const Kaiwa = page("/kaiwa", "Kaiwa")
const VerbForms = page("/verb-forms", "VerbForms")
const Transitivity = page("/transitivity", "Transitivity")
const Usage = page("/usage", "Usage")
const Kanji = page("/kanji", "Kanji")
const Counters = page("/counters", "Counters")
const Homophones = page("/homophones", "Homophones")
const Settings = page("/settings", "Settings")

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
          <Route path="kaiwa" element={<Suspense fallback={<RouteFallback />}><Kaiwa /></Suspense>} />
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
