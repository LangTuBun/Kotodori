# Kotodori

Kotodori is a small Japanese learning app focused on JLPT N5 study. It brings vocabulary, grammar, review cards, and homophone practice into one calm daily workspace.

The goal is simple: make it easy to open the app, review for a few minutes, and leave with a little more Japanese in long-term memory.

## What It Has

- N5 vocabulary browser with search, chapter filters, and part-of-speech filters
- Grammar browser for N5 patterns
- Review mode with spaced-repetition style ratings
- Homophone practice for words that sound alike
- Dashboard with streak, progress, and review stats
- Local-first progress storage in the browser

## Tech Stack

- React
- Vite
- TypeScript
- Tailwind CSS
- React Router
- Zustand

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Run lint checks:

```bash
npm run lint
```

## Data

For now, Kotodori uses local JSON files under `src/data/n5`. User review progress is stored locally in the browser, so there is no backend requirement yet.

## Roadmap

The next big steps are better example sentences, richer grammar explanations, review history, audio support, and deeper homophone exercises.
