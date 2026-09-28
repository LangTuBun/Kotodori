// Word/sentence pronunciation via the browser's built-in Web Speech API
// (speechSynthesis) -- no audio files, no API key, no network request, and
// no bundle weight beyond this module. The trade-off for "free" is quality
// (a synthetic voice, not a recording) and reach (only plays where the
// device has a Japanese voice installed).
//
// The app's primary target is an iPhone PWA, which shapes two choices below:
//  1. speak() does no async work before calling synth.speak() -- iOS Safari
//     only allows speech synthesis to start synchronously within the tap
//     event that triggered it. Waiting on a voices-loaded promise or even a
//     setTimeout(0) first can land outside that window and play nothing,
//     with no error to catch. (Some older desktop Chrome builds have the
//     opposite issue -- speak() called in the same tick as a preceding
//     cancel() can be dropped -- but that's the lesser risk on the platform
//     this app actually ships to.)
//  2. Voices load asynchronously and getVoices() can legitimately keep
//     returning [] on iOS even once a Japanese voice is available -- so
//     "no cached voice yet" must never disable the button. Passing
//     lang="ja-JP" with no explicit `voice` still speaks correctly through
//     the system's default voice for that language.

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
  // Warm the cache as early as possible so the *first* tap already has a
  // voice to pick from -- speak() itself never waits on this.
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

// Simple external store (read via useSyncExternalStore) tracking which
// utterance -- identified by the caller-supplied `id` passed to speak() --
// is currently playing, so every SpeakButton instance on screen can
// independently tell whether it's the active one.
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

// The one utterance currently in flight. Guards onend/onerror against
// firing for an utterance that's no longer the current one -- e.g. a second
// tap that calls cancel() can still leave the first utterance's onerror
// queued, and without this check it would clear the *new* utterance's
// active/pulsing state instead of its own.
let current: SpeechSynthesisUtterance | null = null

export function cancelSpeech() {
  if (!isSpeechSupported()) return
  current = null
  setActiveId(null)
  window.speechSynthesis.cancel()
}

interface SpeakOptions {
  /** Identifies this utterance to the active-speech store; pass the same id
   *  a SpeakButton was given so it can highlight itself while playing. */
  id: string
  /** 0.5-2, browser-clamped. Learners benefit from slightly-slower-than-
   *  native speech; 1 is the browser's normal rate. */
  rate?: number
}

export function speak(text: string, { id, rate = 0.85 }: SpeakOptions): boolean {
  const trimmed = text.trim()
  if (!trimmed || !isSpeechSupported()) return false

  const synth = window.speechSynthesis
  synth.cancel()

  const voice = pickJapaneseVoice()
  const utterance = new SpeechSynthesisUtterance(trimmed)
  utterance.lang = voice?.lang ?? "ja-JP"
  if (voice) utterance.voice = voice
  utterance.rate = rate

  current = utterance
  utterance.onstart = () => {
    if (current === utterance) setActiveId(id)
  }
  const finish = () => {
    if (current !== utterance) return
    current = null
    setActiveId(null)
  }
  utterance.onend = finish
  utterance.onerror = finish

  synth.speak(utterance)
  return true
}
