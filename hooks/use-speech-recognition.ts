"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import type SpeechRecognition from "speech-recognition"

interface UseSpeechRecognitionOptions {
  continuous?: boolean
  interimResults?: boolean
  lang?: string
  onResult?: (transcript: string, isFinal: boolean) => void
  onError?: (error: string) => void
  onStart?: () => void
  onEnd?: () => void
}

export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}) {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [error, setError] = useState<string | null>(null)

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const { continuous = false, interimResults = true, lang = "en-US", onResult, onError, onStart, onEnd } = options

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

      if (SpeechRecognition) {
        setIsSupported(true)
        recognitionRef.current = new SpeechRecognition()

        const recognition = recognitionRef.current
        recognition.continuous = continuous
        recognition.interimResults = interimResults
        recognition.lang = lang
        recognition.maxAlternatives = 1

        recognition.onstart = () => {
          setIsListening(true)
          setError(null)
          setTranscript("")
          onStart?.()

          // Set a timeout to automatically stop listening after 30 seconds
          timeoutRef.current = setTimeout(() => {
            stop()
          }, 30000)
        }

        recognition.onresult = (event) => {
          let finalTranscript = ""
          let interimTranscript = ""

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              finalTranscript += transcript
            } else {
              interimTranscript += transcript
            }
          }

          const fullTranscript = finalTranscript || interimTranscript
          setTranscript(fullTranscript)
          onResult?.(fullTranscript, !!finalTranscript)
        }

        recognition.onerror = (event) => {
          const errorMessage = getErrorMessage(event.error)
          setError(errorMessage)
          setIsListening(false)
          onError?.(errorMessage)

          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
          }
        }

        recognition.onend = () => {
          setIsListening(false)
          onEnd?.()

          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
          }
        }
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [continuous, interimResults, lang, onResult, onError, onStart, onEnd])

  const start = useCallback(() => {
    if (recognitionRef.current && isSupported && !isListening) {
      try {
        recognitionRef.current.start()
      } catch (error) {
        setError("Failed to start speech recognition")
        onError?.("Failed to start speech recognition")
      }
    }
  }, [isSupported, isListening, onError])

  const stop = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
    }
  }, [isListening])

  const reset = useCallback(() => {
    setTranscript("")
    setError(null)
  }, [])

  return {
    isListening,
    isSupported,
    transcript,
    error,
    start,
    stop,
    reset,
  }
}

function getErrorMessage(error: string): string {
  switch (error) {
    case "no-speech":
      return "No speech detected. Please try again."
    case "audio-capture":
      return "Microphone not accessible. Please check permissions."
    case "not-allowed":
      return "Microphone permission denied. Please enable microphone access."
    case "network":
      return "Network error. Please check your connection."
    case "service-not-allowed":
      return "Speech recognition service not available."
    default:
      return `Speech recognition error: ${error}`
  }
}
