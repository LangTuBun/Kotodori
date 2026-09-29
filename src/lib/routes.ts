import { useSettingsStore } from "@/store/settings-store"
import { loadVocab } from "@/data/vocab"
import { loadGrammar } from "@/data/grammar"

// One place that knows how to fetch each route's page chunk and the level
// data it renders. App.tsx lazy-loads through these, and the sidebar / idle
// prefetcher call them early, so a tab tap finds its code (and data) already
// on the way instead of starting a page -> data request waterfall.
export const routeLoaders = {
  "/": () => import("@/pages/Landing"),
  "/vocab": () => import("@/pages/VocabBrowser"),
  "/review": () => import("@/pages/Review"),
  "/grammar": () => import("@/pages/Grammar"),
  "/kaiwa": () => import("@/pages/Kaiwa"),
  "/verb-forms": () => import("@/pages/VerbForms"),
  "/transitivity": () => import("@/pages/Transitivity"),
  "/usage": () => import("@/pages/Usage"),
  "/kanji": () => import("@/pages/Kanji"),
  "/counters": () => import("@/pages/Counters"),
  "/homophones": () => import("@/pages/Homophones"),
  "/settings": () => import("@/pages/Settings"),
} as const

export type RoutePath = keyof typeof routeLoaders

/** Kicks off the level data a route needs, in parallel with its page chunk. */
export function loadRouteData(path: string): void {
  const level = useSettingsStore.getState().level
  if (path === "/vocab" || path === "/review" || path === "/homophones") loadVocab(level).catch(() => {})
  else if (path === "/grammar") loadGrammar(level).catch(() => {})
}

/** Warms a route (page chunk + its data). Safe to call repeatedly. */
export function prefetchRoute(path: string): void {
  const load = routeLoaders[path as RoutePath]
  if (!load) return
  load().catch(() => {})
  loadRouteData(path)
}

/** After first paint, quietly fetch every page chunk (code only, no data). */
export function prefetchAllRoutes(): void {
  const paths = Object.keys(routeLoaders) as RoutePath[]
  paths.forEach((p, i) => {
    window.setTimeout(() => { routeLoaders[p]().catch(() => {}) }, 2500 + i * 300)
  })
}
