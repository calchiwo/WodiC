"use client"

import { useState, useRef, useCallback, useEffect } from "react"

interface UseTextToSpeechOptions {
  rate?: number
  pitch?: number
  volume?: number
  lang?: string
  voice?: string
}

export function useTextToSpeech(options: UseTextToSpeechOptions = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [error, setError] = useState<string | null>(null)

  const synthRef = useRef<SpeechSynthesis | null>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  const { rate = 0.8, pitch = 1, volume = 0.8, lang = "en-US", voice } = options

  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      setIsSupported(true)
      synthRef.current = window.speechSynthesis

      const loadVoices = () => {
        const availableVoices = synthRef.current?.getVoices() || []
        setVoices(availableVoices)
      }

      loadVoices()

      // Some browsers load voices asynchronously
      if (synthRef.current.onvoiceschanged !== undefined) {
        synthRef.current.onvoiceschanged = loadVoices
      }
    }
  }, [])

  const speak = useCallback(
    (text: string) => {
      if (!synthRef.current || !isSupported || !text.trim()) {
        console.log("[v0] Speech synthesis not available or empty text")
        return
      }

      try {
        synthRef.current.cancel()

        setTimeout(() => {
          if (!synthRef.current) return

          const utterance = new SpeechSynthesisUtterance(text)
          utteranceRef.current = utterance

          utterance.rate = rate
          utterance.pitch = pitch
          utterance.volume = volume
          utterance.lang = lang

          if (voices.length > 0) {
            let selectedVoice = null

            if (voice) {
              selectedVoice = voices.find((v) => v.name === voice || v.lang === voice)
            }

            if (!selectedVoice) {
              // Try to find a voice that matches the language
              selectedVoice = voices.find((v) => v.lang.startsWith(lang.split("-")[0]))
            }

            if (!selectedVoice) {
              // Fallback to first available voice
              selectedVoice = voices[0]
            }

            if (selectedVoice) {
              utterance.voice = selectedVoice
            }
          }

          utterance.onstart = () => {
            setIsSpeaking(true)
            setError(null)
          }

          utterance.onend = () => {
            setIsSpeaking(false)
          }

          utterance.onerror = (event) => {
            console.log("[v0] Speech synthesis error:", event.error)
            setIsSpeaking(false)
            setError(null) // Don't show error to user
          }

          synthRef.current.speak(utterance)
        }, 100)
      } catch (error) {
        console.log("[v0] Failed to start speech synthesis:", error)
        setIsSpeaking(false)
        setError(null) // Don't show error to user
      }
    },
    [isSupported, rate, pitch, volume, lang, voice, voices],
  )

  const stop = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel()
      setIsSpeaking(false)
    }
  }, [])

  const pause = useCallback(() => {
    if (synthRef.current && isSpeaking) {
      synthRef.current.pause()
    }
  }, [isSpeaking])

  const resume = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.resume()
    }
  }, [])

  return {
    speak,
    stop,
    pause,
    resume,
    isSpeaking,
    isSupported,
    voices,
    error,
  }
}
