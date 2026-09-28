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
- **Voice pronunciation** — speaker buttons throughout the app, using [VOICEVOX](https://voicevox.hiroshiba.jp) (free, self-hosted, optional) when available, the browser's own built-in voice otherwise
- **Self-hosted, no cloud accounts** — all study data lives in `localStorage`, per device; the only network calls this app ever makes are to your own VOICEVOX container, if you run one

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

# 3. Build and start (also brings up the optional VOICEVOX voice --
#    see "Voice pronunciation" below)
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

## Voice pronunciation

The speaker icons throughout the app (Vocabulary, Grammar, Kanji, ...) read words and sentences aloud. Two backends, tried in this order:

1. **VOICEVOX** — a free, real (non-robotic) Japanese voice. Runs as a second container (`voicevox` in `docker-compose.yml`), started automatically by `docker compose up -d --build` alongside the app itself. Nothing to configure — the app detects it and switches to it on its own; Settings shows which backend is currently active.
2. **Browser voice** — the device's own built-in text-to-speech. Used automatically whenever VOICEVOX isn't reachable (not deployed, still starting up — its first boot can take up to ~60s while it loads its voice models — or down for any reason), and nothing ever hangs waiting on it. A VOICEVOX request that fails switches that session back to the browser voice for every later tap; the one tap that triggered the failure can, rarely, come up silent, since by then it's no longer inside the original tap's gesture — the standard limitation web audio hits on iOS Safari whenever a fallback has to kick in after a network round trip.

Notes:

- **Resource cost.** The VOICEVOX image bundles voice models for every included character, so it's a real download (check the size with `docker images` after pulling) and uses a modest amount of CPU per phrase spoken. If self-hosting on constrained hardware, this is the service to drop first — remove the `voicevox` block from `docker-compose.yml` and the app falls back to the browser voice with no other changes needed.
- **Not exposed externally.** The `voicevox` container's port is never published to the host or network — the app's own nginx proxies to it internally (see `docker/nginx.conf`), so it's reachable only from the `tori` container.
- **Option B/C (no Docker).** VOICEVOX is only wired up through the Docker Compose setup above. Serving the static build yourself, or running the Vite dev server, gives you the browser-voice fallback only, which needs no setup.
- **Credit.** The character voice used is 春日部つむぎ (Kasugabe Tsumugi), whose license permits free commercial and non-commercial use with a credit notice — shown on the app's own Settings page whenever VOICEVOX is active. See [VOICEVOX's terms](https://voicevox.hiroshiba.jp/term/) if you swap in a different character voice (`VOICEVOX_SPEAKER` in `src/lib/speech.ts`).

---

## Data & privacy

All vocab and grammar content lives as JSON files under `src/data/n5/` and `src/data/n4/`. Review progress, streaks, and settings are stored in the browser's `localStorage` — per-device, per-browser, never sent anywhere.

Since there is no server-side state, there is nothing to back up for user data beyond the browser itself.

---

## Stack

React · Vite · TypeScript · Tailwind CSS · React Router · Zustand · nginx (Docker runtime)
