'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export type TranscriptTtsLine = {
  speaker: string
  text: string
}

type VoicePair = {
  host: SpeechSynthesisVoice | null
  guest: SpeechSynthesisVoice | null
}

function englishVoices(list: SpeechSynthesisVoice[]) {
  const en = list.filter((voice) => /^en([-_]|$)/i.test(voice.lang))
  return en.length > 0 ? en : list
}

/** Low scores = robotic / buzzy engines (common on Linux defaults). */
function voiceScore(voice: SpeechSynthesisVoice) {
  const name = `${voice.name} ${voice.voiceURI}`
  let score = 0

  // Explicit high-clarity Chrome / Edge voices (prefer these first).
  if (/google uk english female|google us english female|microsoft aria|microsoft jenny|microsoftsonia|samantha/i.test(name)) {
    score += 120
  }
  if (/google uk english male|google us english|microsoft guy|microsoft david|microsoft mark|daniel/i.test(name)) {
    score += 110
  }
  if (/neural|natural|premium|enhanced|online|wavenet|studio/i.test(name)) score += 80
  if (/google|microsoft|apple/i.test(name)) score += 45
  if (/samantha|karen|moira|victoria|zira|aria|jenny|sonia|susan|hazel|fiona|tessa/i.test(name)) score += 35
  if (/daniel|david|mark|alex|fred|guy|james|george|thomas/i.test(name)) score += 35

  // Remote/cloud voices are usually much clearer than local eSpeak clones.
  if (!voice.localService) score += 35
  if (/^en-GB/i.test(voice.lang)) score += 14
  else if (/^en-US/i.test(voice.lang)) score += 12
  else if (/^en-AU|^en-IN/i.test(voice.lang)) score += 8

  // Harsh / noisy engines — never pick these for Guest if anything else exists.
  if (/espeak|festival|mbrola|pico|compact|novelty|whisper|zarvox|trinoids|pipe|bad news|good news|cellos|speech dispatcher|dummy/i.test(name)) {
    score -= 200
  }
  if (voice.default) score += 2

  return score
}

function isLikelyFemale(voice: SpeechSynthesisVoice) {
  const name = voice.name
  // Prefer explicit "Female" labels (Chrome Google voices) over fuzzy name matches.
  if (/\bfemale\b/i.test(name)) return true
  if (/\bmale\b/i.test(name)) return false
  return /woman|zira|samantha|victoria|karen|moira|susan|aria|jenny|sonia|linda|hazel|fiona|tessa|veena|raveena/i.test(
    name,
  )
}

function isLikelyMale(voice: SpeechSynthesisVoice) {
  const name = voice.name
  if (/\bmale\b/i.test(name)) return true
  if (/\bfemale\b/i.test(name)) return false
  return /man|david|mark|daniel|alex|fred|george|thomas|guy|james|ravi|aaron|lee|tom|oliver/i.test(name)
}

function isClearVoice(voice: SpeechSynthesisVoice) {
  // Guest must clear this bar — noisy local female voices fail it.
  return voiceScore(voice) >= 50
}

/** Prefer two clear voices; never assign a low-quality female just to “sound female”. */
function pickVoicePair(list: SpeechSynthesisVoice[]): VoicePair {
  const ranked = [...englishVoices(list)].sort((a, b) => voiceScore(b) - voiceScore(a))
  if (ranked.length === 0) return { host: null, guest: null }

  const clear = ranked.filter(isClearVoice)
  const pool = clear.length > 0 ? clear : ranked.slice(0, Math.min(4, ranked.length))

  const host =
    pool.find((voice) => isLikelyMale(voice)) ||
    pool.find((voice) => !isLikelyFemale(voice)) ||
    pool[0] ||
    null

  // Guest: only a *clear* female. If none, use next-best clear voice (same engine family)
  // rather than a noisy espeak/local “female” that buzzes.
  const clearFemale = pool.find((voice) => voice !== host && isLikelyFemale(voice) && isClearVoice(voice))
  const sameFamily = (voice: SpeechSynthesisVoice) => {
    if (!host) return true
    const hostVendor = /google|microsoft|apple/i.exec(host.name)?.[0]
    if (!hostVendor) return !voice.localService
    return new RegExp(hostVendor, 'i').test(voice.name) && voice !== host
  }

  const guest =
    clearFemale ||
    pool.find((voice) => voice !== host && sameFamily(voice)) ||
    pool.find((voice) => voice !== host && !voice.localService) ||
    pool.find((voice) => voice !== host) ||
    host

  return { host, guest }
}

function speakerRole(speaker: string, index: number, uniqueOrder: string[]): 'host' | 'guest' {
  const label = speaker.trim().toLowerCase()
  if (/\bhost\b/.test(label)) return 'host'
  if (/\bguest\b/.test(label)) return 'guest'
  const order = uniqueOrder.indexOf(speaker.trim())
  if (order >= 0) return order % 2 === 0 ? 'host' : 'guest'
  return index % 2 === 0 ? 'host' : 'guest'
}

/** Strip markup / noise that makes TTS garble or buzz. */
function cleanSpeechText(raw: string) {
  return raw
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_~#>]+/g, ' ')
    .replace(/https?:\/\/\S+/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function waitForVoices(): Promise<SpeechSynthesisVoice[]> {
  if (typeof window === 'undefined' || !window.speechSynthesis) return Promise.resolve([])
  const existing = window.speechSynthesis.getVoices()
  if (existing.length > 0) return Promise.resolve(existing)

  return new Promise((resolve) => {
    const done = () => {
      window.speechSynthesis.removeEventListener('voiceschanged', done)
      resolve(window.speechSynthesis.getVoices())
    }
    window.speechSynthesis.addEventListener('voiceschanged', done)
    window.setTimeout(() => {
      window.speechSynthesis.removeEventListener('voiceschanged', done)
      resolve(window.speechSynthesis.getVoices())
    }, 1000)
  })
}

function pause(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

function speakUtterance(utterance: SpeechSynthesisUtterance) {
  return new Promise<void>((resolve) => {
    let settled = false
    const finish = () => {
      if (settled) return
      settled = true
      resolve()
    }
    utterance.onend = finish
    utterance.onerror = finish
    window.speechSynthesis.speak(utterance)
  })
}

/**
 * Browser SpeechSynthesis demo player for Host/Guest transcript lines.
 * Additive path until ElevenLabs audio replaces it.
 */
export function useTranscriptTts(lines: TranscriptTtsLine[]) {
  const [playing, setPlaying] = useState(false)
  const [supported, setSupported] = useState(false)
  const [lineIndex, setLineIndex] = useState(0)
  const cancelRef = useRef(false)
  const playingRef = useRef(false)
  const linesRef = useRef(lines)
  linesRef.current = lines

  useEffect(() => {
    setSupported(typeof window !== 'undefined' && 'speechSynthesis' in window)
    // Warm the voice list early so the first Play is clearer.
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      void waitForVoices()
    }
    return () => {
      cancelRef.current = true
      playingRef.current = false
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  const stop = useCallback(() => {
    cancelRef.current = true
    playingRef.current = false
    setPlaying(false)
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
  }, [])

  const speakFrom = useCallback(async (startIndex: number) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return

    const script = linesRef.current
      .map((line) => ({ ...line, text: cleanSpeechText(line.text) }))
      .filter((line) => line.text.length > 0)
    if (script.length === 0) return

    cancelRef.current = false
    playingRef.current = true
    setPlaying(true)

    // Clear any prior utterance, then wait — immediate speak-after-cancel causes glitches.
    window.speechSynthesis.cancel()
    await pause(120)

    const keepAlive = window.setInterval(() => {
      if (!playingRef.current || cancelRef.current) return
      // Only resume when Chrome has paused itself; avoid resume spam (adds buzz).
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume()
      }
    }, 12_000)

    try {
      const voices = pickVoicePair(await waitForVoices())
      const uniqueOrder = [...new Set(script.map((line) => line.speaker.trim()).filter(Boolean))]

      for (let index = Math.max(0, startIndex); index < script.length; index++) {
        if (cancelRef.current) break

        const line = script[index]
        setLineIndex(index)

        const role = speakerRole(line.speaker, index, uniqueOrder)
        const voice = role === 'host' ? voices.host : voices.guest
        const utterance = new SpeechSynthesisUtterance(line.text)

        if (voice) {
          utterance.voice = voice
          utterance.lang = voice.lang || 'en-US'
        } else {
          utterance.lang = 'en-US'
        }

        // Pitch must stay 1 — female voices get especially noisy when pitch-shifted.
        // Guest speaks a touch slower for clarity on weaker engines.
        utterance.rate = role === 'guest' ? 0.9 : 0.94
        utterance.pitch = 1
        utterance.volume = 1

        await speakUtterance(utterance)
        if (cancelRef.current) break
        // Short breath between speakers so turns don't smear together.
        await pause(role === 'host' ? 220 : 320)
      }

      if (!cancelRef.current) {
        setLineIndex(0)
      }
    } finally {
      window.clearInterval(keepAlive)
      playingRef.current = false
      setPlaying(false)
    }
  }, [])

  const toggle = useCallback(() => {
    if (!supported) return
    if (playingRef.current) {
      stop()
      return
    }
    void speakFrom(0)
  }, [speakFrom, stop, supported])

  return {
    supported,
    playing,
    lineIndex,
    lineCount: lines.filter((line) => cleanSpeechText(line.text).length > 0).length,
    toggle,
    stop,
  }
}
