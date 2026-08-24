# Tori

Tori is a small Japanese learning app focused on JLPT N5/N4 study. It brings vocabulary, grammar, verb forms, counters, kanji, review cards, and homophone practice into one calm daily workspace.

The goal is simple: make it easy to open the app, review for a few minutes, and leave with a little more Japanese in long-term memory.

## What It Has

- N5/N4 vocabulary browser with search, chapter filters, and part-of-speech filters
- Grammar browser for N5/N4 patterns, plus a dedicated verb-forms conjugation reference
- Kanji browser with stroke-order lookup, grouped by textbook chapter
- Counters (助数詞) reference
- Review mode with SM-2 spaced repetition, for both vocab and kanji
- Homophone practice for words that sound alike
- Dashboard with streak, progress, and review stats
- English/Vietnamese UI, several paper themes (including dark), and a mobile-friendly layout
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

Tori uses local JSON files under `src/data/n5` and `src/data/n4`. User review progress (SM-2 spaced-repetition state, streak, settings) is stored locally in the browser via `localStorage` -- there is no backend or database. That also means progress is per-browser/per-device, not synced across them.

## Self-Hosting (Docker)

Tori is a static SPA -- the Docker image just builds it and serves the result with nginx, nothing else to run or configure.

```bash
git clone <this repo> tori && cd tori
docker compose up -d --build
```

Open `http://<host>:8080`. To use a different port, copy `.env.example` to `.env` and set `TORI_PORT`.

**Updating** after pulling new changes:

```bash
git pull
docker compose up -d --build
```

**Reverse proxy**: the container only serves plain HTTP on its internal port 80 (mapped to `TORI_PORT` on the host) -- point whatever you already run on Proxmox for TLS/domains at that (Nginx Proxy Manager, Caddy, Traefik, etc.) rather than exposing it directly. It's a single static site, so any reverse proxy config works with no special rules -- no websockets, no API routes, no sticky sessions.

**Data note**: since progress lives in each browser's `localStorage`, there's no volume to back up on the server side for user data. What *is* worth backing up is your own edits to this repo (the data JSON, any customization) -- ordinary git history covers that.

## Roadmap

The next big steps are better example sentences, richer grammar explanations, review history, audio support, and deeper homophone exercises.
