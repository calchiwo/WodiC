interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null
  onend: ((this: SpeechRecognition, ev: Event) => any) | null
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
}

interface SpeechRecognitionResultList {
  length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
  isFinal: boolean
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface Window {
  SpeechRecognition: any
  webkitSpeechRecognition: any
}
