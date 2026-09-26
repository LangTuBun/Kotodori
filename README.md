# Kotodori 🐦

A personal Japanese study app built around JLPT N5/N4. One place for vocab, grammar, kanji, and spaced-repetition review — no accounts, no subscriptions, opens in a browser tab.

## Features

- **Vocabulary browser** — N5/N4 words with search (Japanese, romaji, or meaning), chapter/category filters, and POS filters
- **Grammar reference** — N5/N4 patterns with examples and a dedicated verb-conjugation table
- **Kanji browser** — stroke-order animations, readings, grouped by textbook chapter
- **Counters (助数詞)** — reference for Japanese counting words
- **Spaced-repetition review** — SM-2 algorithm for vocab and kanji
- **Homophone practice** — drills for pairs that sound identical
- **Dashboard** — streaks, progress stats, and upcoming review counts
- **English / Vietnamese UI** — toggle between languages, several color themes including dark mode
- **100% local** — all data in `localStorage`; no backend, no sync, nothing leaves the device

---

## Self-hosting

### Option A — Docker (recommended)

Requirements: [Docker](https://docs.docker.com/get-docker/) with the Compose plugin (included in Docker Desktop).

```bash
# 1. Clone the repo
git clone https://github.com/your-username/kotodori.git
cd kotodori

# 2. (Optional) change the host port if 8080 is already taken
cp .env.example .env
#   edit .env and set TORI_PORT=<your preferred port>

# 3. Build and start
docker compose up -d --build
```

Open **http://localhost:8080** (or whichever port you chose) in your browser.

#### Updating

```bash
git pull
docker compose up -d --build
```

#### Custom domain / TLS

Point any reverse proxy at the container's HTTP port — it's a plain static site with no special requirements:

| Proxy | Notes |
|---|---|
| **Caddy** | `reverse_proxy localhost:8080` in your Caddyfile; TLS is automatic |
| **Nginx Proxy Manager** | Add a Proxy Host → `http://localhost:8080`; enable SSL with Let's Encrypt |
| **Traefik** | Label the container as usual; no websockets or sticky sessions needed |

---

### Option B — Serve the static build yourself

Requirements: Node.js 18+.

```bash
# 1. Install dependencies
npm install

# 2. Build the production bundle
npm run build
# Output lands in dist/

# 3. Serve with any static file server, e.g.:
npx serve dist
# or copy dist/ to your existing nginx/Apache/Caddy root
```

---

### Option C — Dev server (local development)

```bash
npm install
npm run dev
# Vite hot-reloads at http://localhost:5173
```

Other useful commands:

```bash
npm run build   # production bundle → dist/
npm run lint    # oxlint check
```

---

## Data & privacy

All vocab and grammar content lives as JSON files under `src/data/n5/` and `src/data/n4/`. Review progress, streaks, and settings are stored in the browser's `localStorage` — per-device, per-browser, never sent anywhere.

Since there is no server-side state, there is nothing to back up for user data beyond the browser itself.

---

## Stack

React · Vite · TypeScript · Tailwind CSS · React Router · Zustand · nginx (Docker runtime)
