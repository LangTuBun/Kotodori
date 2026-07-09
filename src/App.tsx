import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Layout } from "@/components/layout/Layout"
import { Dashboard } from "@/pages/Dashboard"
import { VocabBrowser } from "@/pages/VocabBrowser"
import { Review } from "@/pages/Review"
import { Grammar } from "@/pages/Grammar"
import { VerbForms } from "@/pages/VerbForms"
import { Homophones } from "@/pages/Homophones"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="vocab" element={<VocabBrowser />} />
          <Route path="review" element={<Review />} />
          <Route path="grammar" element={<Grammar />} />
          <Route path="verb-forms" element={<VerbForms />} />
          <Route path="homophones" element={<Homophones />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
