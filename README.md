# Kotodori

A personal Japanese study app built around JLPT N5/N4. The idea was simple: one place for vocab, grammar, kanji, and review — no accounts, no subscriptions, opens in a browser tab.

## What's inside

- Vocabulary browser (N5/N4) with search, chapter filters, and POS filters
- Grammar reference for N5/N4 patterns, with a dedicated verb-forms conjugation table
- Kanji browser with stroke-order lookup, grouped by textbook chapter
- Counters (助数詞) reference
- Spaced-repetition review mode (SM-2) for both vocab and kanji
- Homophone practice for pairs that sound identical
- Dashboard with streaks, progress stats, and upcoming reviews
- English/Vietnamese UI, a few paper-themed color schemes (including dark), and a mobile-friendly layout
- Everything stored locally in the browser — no backend, no sync

## Running it

```bash
npm install
npm run dev
```

```bash
npm run build   # production bundle
npm run lint    # lint check
```

## Data

All vocab and grammar data lives as JSON under `src/data/n5` and `src/data/n4`. Review progress, streak, and settings are kept in `localStorage` — per-browser, per-device, nothing leaves the machine.

## Self-hosting with Docker

It's a static SPA, so the Docker setup just builds it and serves the result with nginx.

```bash
git clone <this repo> kotodori && cd kotodori
docker compose up -d --build
```

Open `http://<host>:8080`. To change the port, copy `.env.example` to `.env` and set `TORI_PORT`.

To update after pulling changes:

```bash
git pull
docker compose up -d --build
```

For TLS and a domain, point any reverse proxy (Nginx Proxy Manager, Caddy, Traefik) at the container's HTTP port — it's a plain static site so no special rules are needed. No websockets, no API routes, no sticky sessions.

Since progress lives in `localStorage`, there's nothing server-side to back up for user data. Your own edits to the data files and any customizations are covered by git history.

## Stack

React · Vite · TypeScript · Tailwind CSS · React Router · Zustand
