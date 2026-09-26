import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'

// Exposes `virtual:grammar-index`: just the fields the cross-link chips on
// Verb Forms / Transitivity / Usage render (id, pattern, meaning...), derived
// from the real grammar JSON at build time. Those tabs used to import the full
// enriched grammar set (~1.2MB) only to draw a handful of link chips, so every
// first visit downloaded and parsed all of it. Generated from source on each
// build, so it can't drift from grammar.json.
function grammarIndex(): Plugin {
  const virtualId = 'virtual:grammar-index'
  const resolvedId = '\0' + virtualId
  const levels = ['n5', 'n4'] as const
  const fields = ['id', 'pattern', 'patternRuby', 'meaning', 'category', 'requiredVerbForm']
  return {
    name: 'grammar-index',
    resolveId(source) {
      if (source === virtualId) return resolvedId
    },
    load(id) {
      if (id !== resolvedId) return
      return levels.map(level => {
        const file = path.resolve(__dirname, `src/data/${level}/grammar.json`)
        this.addWatchFile(file)
        const points = JSON.parse(fs.readFileSync(file, 'utf8')) as Record<string, unknown>[]
        const slim = points.map(p => Object.fromEntries(fields.filter(f => f in p).map(f => [f, p[f]])))
        return `export const ${level} = JSON.parse(${JSON.stringify(JSON.stringify(slim))})`
      }).join('\n')
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), grammarIndex()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
})
