// Word/sentence pronunciation, with two backends:
//
//  1. VOICEVOX (https://voicevox.hiroshiba.jp) -- free, high-quality Japanese
//     speech synthesis. Not a cloud API: it's a self-hosted engine (see the
//     `voicevox` service in docker-compose.yml), reached through this app's
//     own nginx at /voicevox/ (docker/nginx.conf) so the browser never talks
//     to it directly and no CORS setup is needed. Only used once a
//     same-session reachability probe confirms it's actually up.
//  2. The browser's built-in speechSynthesis -- the always-available
//     fallback from before this file grew a second backend. Used instantly
//     whenever VOICEVOX hasn't been confirmed reachable yet, or a VOICEVOX
//     request fails outright. That fallback runs after an await, though,
//     which iOS Safari can drop for the same reason browser-voice itself
//     needs to run synchronously below -- so the *one* tap that triggers a
//     VOICEVOX failure can, rarely, come up silent; every later tap is back
//     to the normal, reliable synchronous browser-voice path once the
//     backend has flipped.
//
// Every existing SpeakButton call site (Vocab, Grammar, Kanji, Verb Forms,
// Transitivity, Usage, Homophones, Counters) goes through speak() below
// unchanged -- upgrading to VOICEVOX needed no per-page changes.
//
// The app's primary target is an iPhone PWA, which shapes several choices
// here:
//  - The browser-voice path does no async work before calling
//    synth.speak() -- iOS Safari only allows speech synthesis to start
//    synchronously within the tap that triggered it.
//  - Voices load asynchronously and getVoices() can legitimately keep
//    returning [] on iOS even once a Japanese voice is available -- so "no
//    cached voice yet" must never disable the button; lang="ja-JP" with no
//    explicit `voice` still speaks correctly through the system default.
//  - VOICEVOX audio necessarily arrives after a network round trip, i.e.
//    after the tap's synchronous gesture window has closed -- WebKit is
//    more lenient about HTMLMediaElement.play() than speechSynthesis.speak()
//    in that situation, but only for an element that was already granted
//    permission during a real user gesture. unlockAudioElement() below
//    plays a silent clip synchronously the first time this session takes
//    the VOICEVOX path, arming the *same* element that later, async
//    play() calls reuse.
//  - VOICEVOX is only ever used once reachability is confirmed (a one-time
//    probe at startup, not raced per tap) -- racing it on every tap would
//    mean every single word waits out a timeout whenever the home server
//    happens to be slow or unreachable, which is exactly the kind of
//    per-keystroke/per-tap lag this app's performance work removed
//    elsewhere. A request that fails outright (HTTP error, network error,
//    playback rejected) flips back to the browser voice for the rest of the
//    session, rather than every later tap re-waiting out another timeout.

const VOICEVOX_BASE = "/voicevox"
// 春日部つむぎ (Kasugabe Tsumugi), style "ノーマル". Her license permits both
// commercial and non-commercial use for free, with a credit notice -- see
// the Settings page and README. To use a different VOICEVOX character, swap
// this id (GET /voicevox/speakers lists every installed character/style and
// its id) and update the credit text in Settings.tsx.
const VOICEVOX_SPEAKER = 8
const VOICEVOX_PROBE_TIMEOUT_MS = 3000
// Generous: a CPU-only engine can take several seconds for a longer
// sentence, and longer still for the very first synthesis after a fresh
// container start (the engine loads a character's voice model on first use,
// not at startup). A slow first tap falling back to the browser voice for
// that one tap is an acceptable cost for not hanging indefinitely.
const VOICEVOX_SYNTHESIS_TIMEOUT_MS = 12000
// Clips are uncompressed WAV (~48KB/sec at 24kHz/16-bit mono) -- capped
// fairly low since a phone's memory budget for this is not large.
const VOICEVOX_CACHE_LIMIT = 100

function fetchWithTimeout(input: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), timeoutMs)
  return fetch(input, { ...init, signal: controller.signal }).finally(() => window.clearTimeout(timer))
}

// ---------------------------------------------------------------------------
// Voice backend status -- exposed so Settings can show whether VOICEVOX is
// actually connected, rather than that being invisible.
// ---------------------------------------------------------------------------
export type VoiceBackend = "checking" | "voicevox" | "browser"

let backend: VoiceBackend = "checking"
const backendListeners = new Set<() => void>()

function setBackend(next: VoiceBackend) {
  if (backend === next) return
  backend = next
  for (const l of backendListeners) l()
}

export function getVoiceBackend(): VoiceBackend {
  return backend
}

export function subscribeVoiceBackend(listener: () => void): () => void {
  backendListeners.add(listener)
  return () => backendListeners.delete(listener)
}

let probed = false
function ensureVoicevoxProbed() {
  if (probed) return
  probed = true
  fetchWithTimeout(`${VOICEVOX_BASE}/speakers`, { method: "GET" }, VOICEVOX_PROBE_TIMEOUT_MS)
    .then(async res => {
      // Checking res.ok alone isn't enough: a deployment without the
      // voicevox service yet (an older container image, a non-Docker
      // static host, or `vite preview` during local testing) falls through
      // nginx's SPA catch-all and answers *every* unknown path with a 200
      // index.html -- indistinguishable from a real success by status code
      // alone. Require it to actually look like the engine's speaker list.
      if (!res.ok || !(res.headers.get("content-type") ?? "").includes("json")) {
        return setBackend("browser")
      }
      const body = await res.json()
      setBackend(Array.isArray(body) ? "voicevox" : "browser")
    })
    .catch(() => setBackend("browser"))
}
if (typeof window !== "undefined") ensureVoicevoxProbed()

// ---------------------------------------------------------------------------
// Browser voice (speechSynthesis) -- unchanged from before VOICEVOX existed.
// ---------------------------------------------------------------------------
let cachedVoices: SpeechSynthesisVoice[] = []

export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window
}

function refreshVoices() {
  if (!isSpeechSupported()) return
  const list = window.speechSynthesis.getVoices()
  if (list.length > 0) cachedVoices = list
}

if (isSpeechSupported()) {
  refreshVoices()
  window.speechSynthesis.addEventListener("voiceschanged", refreshVoices)
}

// Exact 'ja-JP' beats a looser 'ja-*' match, and a local (on-device) voice
// beats a network-backed one -- the network voice adds latency and just
// fails outright with no signal when the phone is offline. Reads whatever
// is cached right now; never waits for more voices to arrive.
function pickJapaneseVoice(): SpeechSynthesisVoice | null {
  const ja = cachedVoices.filter(v => v.lang.toLowerCase().startsWith("ja"))
  if (ja.length === 0) return null
  const score = (v: SpeechSynthesisVoice) =>
    (v.lang.toLowerCase() === "ja-jp" ? 2 : 0) + (v.localService ? 1 : 0)
  return ja.slice().sort((a, b) => score(b) - score(a))[0]
}

// The one browser utterance currently in flight. Guards onend/onerror
// against firing for an utterance that's no longer the current one -- e.g. a
// second tap that calls cancel() can still leave the first utterance's
// onerror queued, and without this check it would clear the *new*
// utterance's active/pulsing state instead of its own.
let currentUtterance: SpeechSynthesisUtterance | null = null

function speakViaBrowser(text: string, id: string, rate: number): boolean {
  if (!isSpeechSupported()) return false
  const synth = window.speechSynthesis
  synth.cancel()

  const voice = pickJapaneseVoice()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = voice?.lang ?? "ja-JP"
  if (voice) utterance.voice = voice
  utterance.rate = rate

  currentUtterance = utterance
  utterance.onstart = () => {
    if (currentUtterance === utterance) setActiveId(id)
  }
  const finish = () => {
    if (currentUtterance !== utterance) return
    currentUtterance = null
    setActiveId(null)
  }
  utterance.onend = finish
  utterance.onerror = finish

  synth.speak(utterance)
  return true
}

// ---------------------------------------------------------------------------
// VOICEVOX -- fetch a synthesized WAV clip (cached in memory by exact text,
// since the same handful of words get replayed a lot during study) and play
// it through one reused <audio> element.
// ---------------------------------------------------------------------------
let audioEl: HTMLAudioElement | null = null
function getAudioEl(): HTMLAudioElement {
  audioEl ??= new Audio()
  return audioEl
}

// A ~50ms silent clip, built once from a plain 44-byte WAV header (see
// https://docs.fileformat.com/audio/wav/) plus zeroed 16-bit PCM samples --
// not fetched, so this works even before VOICEVOX itself is reachable.
// Playing it synchronously inside the click handler, the very first time
// this session takes the VOICEVOX path, is what lets the *real* clip (which
// only exists after a network round trip, well outside that same gesture)
// still play via .play() on the same element afterwards.
function buildSilentWavBlob(): Blob {
  const sampleRate = 8000
  const dataSize = 800 // 400 samples * 2 bytes/sample, all zero
  const buf = new ArrayBuffer(44 + dataSize)
  const view = new DataView(buf)
  const writeStr = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i))
  }
  writeStr(0, "RIFF")
  view.setUint32(4, 36 + dataSize, true)
  writeStr(8, "WAVE")
  writeStr(12, "fmt ")
  view.setUint32(16, 16, true) // fmt chunk size
  view.setUint16(20, 1, true) // PCM
  view.setUint16(22, 1, true) // mono
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * 2, true) // byte rate (sampleRate * blockAlign)
  view.setUint16(32, 2, true) // block align (channels * bytesPerSample)
  view.setUint16(34, 16, true) // bits per sample
  writeStr(36, "data")
  view.setUint32(40, dataSize, true)
  // Bytes 44.. are already zero-initialized by ArrayBuffer -- that's silence.
  return new Blob([buf], { type: "audio/wav" })
}

let silentUrl: string | null = null
let audioUnlocked = false
function unlockAudioElement() {
  if (audioUnlocked) return
  audioUnlocked = true
  silentUrl = URL.createObjectURL(buildSilentWavBlob())
  const el = getAudioEl()
  el.src = silentUrl
  void el.play().catch(() => {})
}

const voicevoxCache = new Map<string, Blob>()
function cacheKey(text: string, rate: number): string {
  return `${VOICEVOX_SPEAKER}|${rate}|${text}`
}
function cacheSet(key: string, blob: Blob) {
  if (voicevoxCache.size >= VOICEVOX_CACHE_LIMIT) {
    const oldest = voicevoxCache.keys().next().value
    if (oldest !== undefined) voicevoxCache.delete(oldest)
  }
  voicevoxCache.set(key, blob)
}

// Bumped on every VOICEVOX call; a response is only used if it's still the
// most recent one requested, so a slow response to an earlier tap can't play
// over a later tap's word (or after cancelSpeech() gave up on it entirely).
let voicevoxSeq = 0

type SynthResult = { ok: true; blob: Blob } | { ok: false; reason: "stale" | "failed" }

async function synthesizeVoicevox(text: string, rate: number, seq: number): Promise<SynthResult> {
  try {
    const queryRes = await fetchWithTimeout(
      `${VOICEVOX_BASE}/audio_query?speaker=${VOICEVOX_SPEAKER}&text=${encodeURIComponent(text)}`,
      { method: "POST" },
      VOICEVOX_SYNTHESIS_TIMEOUT_MS
    )
    if (seq !== voicevoxSeq) return { ok: false, reason: "stale" }
    if (!queryRes.ok) return { ok: false, reason: "failed" }
    const query = await queryRes.json()
    query.speedScale = rate

    const synthRes = await fetchWithTimeout(
      `${VOICEVOX_BASE}/synthesis?speaker=${VOICEVOX_SPEAKER}`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(query) },
      VOICEVOX_SYNTHESIS_TIMEOUT_MS
    )
    if (seq !== voicevoxSeq) return { ok: false, reason: "stale" }
    if (!synthRes.ok) return { ok: false, reason: "failed" }
    return { ok: true, blob: await synthRes.blob() }
  } catch {
    // Network error, timeout, engine restarting mid-session, etc.
    return { ok: false, reason: "failed" }
  }
}

let currentObjectUrl: string | null = null

function playVoicevoxBlob(blob: Blob, id: string) {
  const el = getAudioEl()
  const url = URL.createObjectURL(blob)
  // Revoked right away rather than in `finish` below -- an interrupted clip
  // (the next tap calling pause()/reassigning .src, or cancelSpeech()) never
  // reaches onended/onerror, which would otherwise leak the previous URL
  // every time playback gets interrupted rather than finishing naturally.
  if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl)
  currentObjectUrl = url
  el.src = url
  const finish = () => {
    // Guards against a *this* clip's own stale callback -- e.g. tapping the
    // same word twice: the first play() gets interrupted (AbortError) by
    // the second tap's el.src reassignment, and without this check its
    // finish() would clear the active/pulsing state the second, still-
    // playing instance just set.
    if (currentObjectUrl !== url) return
    if (getActiveSpeechId() === id) setActiveId(null)
  }
  el.onended = finish
  el.onerror = finish
  setActiveId(id) // el.onplay would also cover this, but firing it right
  // away means the button pulses immediately rather than only once playback
  // audibly starts a moment later.
  el.play().catch((err: unknown) => {
    finish()
    // A pending play() rejects with AbortError when *interrupted* -- by the
    // very next tap's pause()/src reassignment (see speak() below), or by
    // cancelSpeech() on a route change -- which says nothing about whether
    // VOICEVOX itself works. Only a real rejection (autoplay/gesture policy
    // genuinely refusing this browser context) should give up on it for the
    // rest of the session; treating every interruption as a failure would
    // flip a normal quick double-tap to the browser voice permanently.
    if (err instanceof DOMException && err.name === "AbortError") return
    setBackend("browser")
  })
}

async function speakViaVoicevox(text: string, id: string, rate: number, seq: number) {
  const key = cacheKey(text, rate)
  const cached = voicevoxCache.get(key)
  if (cached) {
    // Already have this clip -- play it synchronously in the same call
    // stack as the tap (no fetch in between), which is unconditionally
    // reliable on iOS and instant, unlike the network-backed miss path.
    playVoicevoxBlob(cached, id)
    return
  }

  // Pulse immediately so the tap has visible feedback during the ~0.5-2s a
  // real synthesis call takes, rather than looking unresponsive until audio
  // actually starts.
  setActiveId(id)

  const result = await synthesizeVoicevox(text, rate, seq)
  if (seq !== voicevoxSeq) return // a later tap already took over

  if (!result.ok) {
    if (getActiveSpeechId() === id) setActiveId(null)
    if (result.reason === "failed") {
      // A stale result means a newer tap is already handling its own sound;
      // a real failure still needs *this* tap to produce something.
      setBackend("browser")
      speakViaBrowser(text, id, rate)
    }
    return
  }

  cacheSet(key, result.blob)
  playVoicevoxBlob(result.blob, id)
}

// ---------------------------------------------------------------------------
// Shared "who's speaking right now" store, read via useSyncExternalStore --
// covers both backends, so a SpeakButton doesn't need to know which one is
// actually playing.
// ---------------------------------------------------------------------------
type Listener = () => void
const listeners = new Set<Listener>()
let activeId: string | null = null

function setActiveId(id: string | null) {
  if (activeId === id) return
  activeId = id
  for (const l of listeners) l()
}

export function getActiveSpeechId(): string | null {
  return activeId
}

export function subscribeSpeech(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function cancelSpeech() {
  voicevoxSeq++ // invalidate any in-flight VOICEVOX fetch/decode
  currentUtterance = null
  setActiveId(null)
  if (isSpeechSupported()) window.speechSynthesis.cancel()
  if (audioEl) audioEl.pause()
}

interface SpeakOptions {
  /** Identifies this utterance to the active-speech store; pass the same id
   *  a SpeakButton was given so it can highlight itself while playing. */
  id: string
  /** 0.5-2. Learners benefit from slightly-slower-than-native speech; 1 is
   *  each backend's normal rate. Applied as speechSynthesis's `rate` or
   *  VOICEVOX's `speedScale`, whichever backend ends up used. */
  rate?: number
}

export function speak(text: string, { id, rate = 0.85 }: SpeakOptions): boolean {
  const trimmed = text.trim()
  if (!trimmed || !isSpeechSupported()) return false

  // Every tap invalidates whatever VOICEVOX request/decode was previously in
  // flight -- unconditionally, even a cache hit that never itself talks to
  // the network. Without this, tapping an in-flight word A and then an
  // already-cached word B lets A's response land *after* B started playing
  // and pass its own (unbumped) staleness check, swapping B's audio out for
  // A's mid-playback.
  const seq = ++voicevoxSeq

  // Stop whatever either backend was doing -- without this, a tap that
  // switches backends mid-session (a VOICEVOX failure flips to the browser
  // voice, say) could briefly overlap the old backend's tail with the new
  // one's start.
  window.speechSynthesis.cancel()
  if (audioEl) audioEl.pause()

  ensureVoicevoxProbed()
  if (backend === "voicevox") {
    unlockAudioElement() // must happen synchronously, inside this tap
    void speakViaVoicevox(trimmed, id, rate, seq)
    return true
  }
  return speakViaBrowser(trimmed, id, rate)
}
