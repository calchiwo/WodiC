"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mic, MicOff } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSpeechRecognition } from "@/hooks/use-speech-recognition"
import { useTextToSpeech } from "@/hooks/use-text-to-speech"

interface UnitConversionVoiceProps {
  onVoiceInput: (input: string) => void
  isProcessing: boolean
}

export function UnitConversionVoice({ onVoiceInput, isProcessing }: UnitConversionVoiceProps) {
  const [transcript, setTranscript] = useState("")

  const {
    isListening,
    isSupported,
    start: startListening,
    stop: stopListening,
    reset: resetSpeech,
  } = useSpeechRecognition({
    continuous: false,
    interimResults: true,
    onResult: (text, isFinal) => {
      setTranscript(text)
      if (isFinal && text.trim()) {
        onVoiceInput(text.trim())
        setTranscript("")
      }
    },
    onError: (error) => {
      console.error("[v0] Voice recognition error:", error)
    },
  })

  const { isSpeaking } = useTextToSpeech({
    rate: 0.8,
    pitch: 1,
    volume: 0.8,
    lang: "en-US",
  })

  const handleToggle = () => {
    if (isListening) {
      stopListening()
    } else {
      resetSpeech()
      setTranscript("")
      startListening()
    }
  }

  return (
    <Card className="bg-card/50 border-dashed">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant={isListening ? "destructive" : "default"}
            onClick={handleToggle}
            disabled={!isSupported || isProcessing || isSpeaking}
            className={cn("rounded-full h-10 w-10 p-0", isListening && "animate-pulse")}
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>

          <div className="flex-1">
            <div className="text-sm text-muted-foreground">
              {isListening ? (
                <span className="text-accent italic">Listening for conversion...</span>
              ) : transcript ? (
                <span className="italic">"{transcript}"</span>
              ) : (
                <span>Say: "Convert 5 kilograms to pounds"</span>
              )}
            </div>
          </div>

          <Badge variant={isSupported ? "default" : "destructive"} className="text-xs">
            {isSupported ? "Voice Ready" : "No Voice"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
