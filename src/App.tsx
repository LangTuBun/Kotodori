import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Layout } from "@/components/layout/Layout"
import { Dashboard } from "@/pages/Dashboard"
import { VocabBrowser } from "@/pages/VocabBrowser"
import { Review } from "@/pages/Review"
import { Grammar } from "@/pages/Grammar"
import { VerbForms } from "@/pages/VerbForms"
import { Homophones } from "@/pages/Homophones"
import { Kanji } from "@/pages/Kanji"
import { Counters } from "@/pages/Counters"
import { Settings } from "@/pages/Settings"
import { Landing } from "@/pages/Landing"

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
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="vocab" element={<VocabBrowser />} />
          <Route path="review" element={<Review />} />
          <Route path="grammar" element={<Grammar />} />
          <Route path="verb-forms" element={<VerbForms />} />
          <Route path="kanji" element={<Kanji />} />
          <Route path="counters" element={<Counters />} />
          <Route path="homophones" element={<Homophones />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
