"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mic, MicOff, Volume2, VolumeX, Calculator, Trash2, AlertCircle, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSpeechRecognition } from "@/hooks/use-speech-recognition"
import { useTextToSpeech } from "@/hooks/use-text-to-speech"
import AdvancedCalculatorFeatures from "@/components/advanced-calculator-features"

interface CalculationHistory {
  id: string
  input: string
  result: string
  explanation?: string
  timestamp: Date
}

export default function VoiceCalculator() {
  const [display, setDisplay] = useState("0")
  const [isProcessing, setIsProcessing] = useState(false)
  const [history, setHistory] = useState<CalculationHistory[]>([])
  const [currentTranscript, setCurrentTranscript] = useState("")
  const [processingError, setProcessingError] = useState<string | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Speech recognition hook
  const {
    isListening,
    isSupported: speechSupported,
    error: speechError,
    start: startListening,
    stop: stopListening,
    reset: resetSpeech,
  } = useSpeechRecognition({
    continuous: false,
    interimResults: true,
    onResult: (transcript, isFinal) => {
      setCurrentTranscript(transcript)
      if (isFinal && transcript.trim()) {
        processVoiceInput(transcript.trim())
      }
    },
    onError: (error) => {
      console.error("Speech recognition error:", error)
    },
    onEnd: () => {
      // Clear transcript after a delay if no final result
      setTimeout(() => {
        if (!isProcessing) {
          setCurrentTranscript("")
        }
      }, 1000)
    },
  })

  // Text-to-speech hook with enhanced settings
  const {
    speak,
    stop: stopSpeaking,
    isSpeaking,
    isSupported: ttsSupported,
    voices,
    error: ttsError,
  } = useTextToSpeech({
    rate: 0.8,
    pitch: 1,
    volume: 0.8,
    lang: "en-US",
  })

  const processManualCalculation = useCallback(
    async (expression: string) => {
      setIsProcessing(true)
      setProcessingError(null)

      try {
        console.log("[v0] Processing manual calculation:", expression)

        // First try local calculation for offline support
        const localResult = processLocalCalculationFallback(expression)
        if (localResult) {
          console.log("[v0] Using local calculation result:", localResult)
          setDisplay(localResult.value)

          const newCalculation: CalculationHistory = {
            id: Date.now().toString(),
            input: expression,
            result: localResult.value,
            explanation: localResult.explanation,
            timestamp: new Date(),
          }
          setHistory((prev) => [newCalculation, ...prev.slice(0, 9)])

          const speechText = formatSpeechOutput(localResult.value, localResult.explanation)
          speak(speechText)
          return
        }

        // Fallback to API if local calculation fails
        const response = await fetch("/api/calculate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ input: `Calculate ${expression}` }),
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        console.log("[v0] API calculation result:", data)

        setDisplay(data.result)

        const newCalculation: CalculationHistory = {
          id: Date.now().toString(),
          input: expression,
          result: data.result,
          explanation: data.explanation,
          timestamp: new Date(),
        }
        setHistory((prev) => [newCalculation, ...prev.slice(0, 9)])

        const speechText = formatSpeechOutput(data.result, data.explanation)
        speak(speechText)
      } catch (error) {
        console.error("[v0] Error processing calculation:", error)

        // Enhanced offline fallback
        const offlineResult = processLocalCalculationFallback(expression)
        if (offlineResult) {
          console.log("[v0] Using offline fallback:", offlineResult)
          setDisplay(offlineResult.value)
          speak(offlineResult.explanation)
        } else {
          setDisplay("Error")
          speak("Sorry, I couldn't calculate that. Please try again.")
        }
      } finally {
        setIsProcessing(false)
      }
    },
    [speak],
  )

  const processVoiceInput = useCallback(
    async (input: string) => {
      setIsProcessing(true)
      setProcessingError(null)

      try {
        console.log("[v0] Processing voice input:", input)

        // Try local calculation first for offline support
        const localResult = processLocalCalculationFallback(input)
        if (localResult) {
          console.log("[v0] Using local voice calculation:", localResult)
          setDisplay(localResult.value)

          const newCalculation: CalculationHistory = {
            id: Date.now().toString(),
            input: input,
            result: localResult.value,
            explanation: localResult.explanation,
            timestamp: new Date(),
          }
          setHistory((prev) => [newCalculation, ...prev.slice(0, 9)])

          const speechText = formatSpeechOutput(localResult.value, localResult.explanation)
          speak(speechText)
          return
        }

        const response = await fetch("/api/calculate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ input }),
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        console.log("[v0] Voice API result:", data)

        setDisplay(data.result)

        const newCalculation: CalculationHistory = {
          id: Date.now().toString(),
          input: input,
          result: data.result,
          explanation: data.explanation,
          timestamp: new Date(),
        }
        setHistory((prev) => [newCalculation, ...prev.slice(0, 9)])

        const speechText = formatSpeechOutput(data.result, data.explanation)
        speak(speechText)
      } catch (error) {
        console.error("[v0] Error processing voice calculation:", error)

        // Enhanced offline fallback for voice
        const offlineResult = processLocalCalculationFallback(input)
        if (offlineResult) {
          console.log("[v0] Using voice offline fallback:", offlineResult)
          setDisplay(offlineResult.value)
          speak(offlineResult.explanation)
        } else {
          setDisplay("0")
          speak("I didn't catch that. Could you please repeat your calculation?")
        }
      } finally {
        setIsProcessing(false)
        setCurrentTranscript("")
      }
    },
    [speak],
  )

  const processLocalCalculationFallback = (input: string): { value: string; explanation: string } | null => {
    try {
      const normalizedInput = input.toLowerCase().trim()

      // Handle "what is" questions
      let expression = normalizedInput
      if (normalizedInput.startsWith("what is") || normalizedInput.startsWith("calculate")) {
        expression = normalizedInput.replace(/^(what is|calculate)\s+/, "")
      }

      expression = expression.replace(/×/g, "*")

      // Basic arithmetic with word parsing
      if (expression.includes("plus") || expression.includes("add")) {
        const numbers = extractNumbersFromText(expression)
        if (numbers.length >= 2) {
          const result = numbers.reduce((sum, num) => sum + num, 0)
          return { value: result.toString(), explanation: `${numbers.join(" + ")} = ${result}` }
        }
      }

      if (expression.includes("minus") || expression.includes("subtract")) {
        const numbers = extractNumbersFromText(expression)
        if (numbers.length >= 2) {
          const result = numbers.reduce((diff, num, index) => (index === 0 ? num : diff - num))
          return { value: result.toString(), explanation: `${numbers.join(" - ")} = ${result}` }
        }
      }

      if (expression.includes("times") || expression.includes("multiply")) {
        const numbers = extractNumbersFromText(expression)
        if (numbers.length >= 2) {
          const result = numbers.reduce((product, num) => product * num, 1)
          return { value: result.toString(), explanation: `${numbers.join(" × ")} = ${result}` }
        }
      }

      if (expression.includes("divide")) {
        const numbers = extractNumbersFromText(expression)
        if (numbers.length >= 2 && numbers[1] !== 0) {
          const result = numbers[0] / numbers[1]
          return { value: result.toString(), explanation: `${numbers[0]} ÷ ${numbers[1]} = ${result}` }
        }
      }

      // Try direct mathematical expression evaluation
      const cleaned = expression.replace(/[^0-9+\-*/.() ]/g, "").replace(/\s+/g, "")
      if (cleaned && /\d/.test(cleaned)) {
        try {
          const result = Function(`"use strict"; return (${cleaned})`)()
          if (typeof result === "number" && !isNaN(result) && isFinite(result)) {
            return { value: result.toString(), explanation: `${cleaned} = ${result}` }
          }
        } catch {
          // Fall through to return null
        }
      }

      return null
    } catch {
      return null
    }
  }

  const extractNumbersFromText = (text: string): number[] => {
    const matches = text.match(/-?\d+\.?\d*|\d*\.?\d+/g)
    return matches ? matches.map(Number).filter((num) => !isNaN(num)) : []
  }

  const formatSpeechOutput = (result: string, explanation?: string): string => {
    const formattedResult = result
      .replace(/\*/g, " times ")
      .replace(/\+/g, " plus ")
      .replace(/-/g, " minus ")
      .replace(/\//g, " divided by ")
      .replace(/\^/g, " to the power of ")
      .replace(/√/g, " square root of ")
      .replace(/π/g, " pi ")
      .replace(/e/g, " e ")

    if (explanation) {
      const formattedExplanation = explanation
        .replace(/\*/g, " times ")
        .replace(/\+/g, " plus ")
        .replace(/-/g, " minus ")
        .replace(/\//g, " divided by ")
        .replace(/°/g, " degrees ")
        .replace(/=/g, " equals ")

      return `${formattedExplanation}. The answer is ${formattedResult}.`
    }

    return `The answer is ${formattedResult}.`
  }

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening()
    } else {
      resetSpeech()
      setProcessingError(null)
      startListening()
    }
  }

  const handleSpeakToggle = () => {
    if (isSpeaking) {
      stopSpeaking()
    } else {
      const speechText = formatSpeechOutput(display)
      speak(speechText)
    }
  }

  const handleButtonClick = (value: string) => {
    setProcessingError(null) // Clear errors when user interacts

    if (value === "C") {
      setDisplay("0")
      speak("Calculator cleared")
    } else if (value === "=") {
      if (display !== "0") {
        processManualCalculation(display)
      }
    } else if (value === "⌫") {
      setDisplay((prev) => (prev.length > 1 ? prev.slice(0, -1) : "0"))
    } else {
      setDisplay((prev) => (prev === "0" ? value : prev + value))
    }
  }

  const clearHistory = () => {
    setHistory([])
    speak("History cleared.")
  }

  const scientificButtons = [
    ["sin", "cos", "tan", "log"],
    ["√", "x²", "xʸ", "π"],
    ["(", ")", "e", "!"],
  ]

  const basicButtons = [
    ["C", "⌫", "/", "×"],
    ["7", "8", "9", "-"],
    ["4", "5", "6", "+"],
    ["1", "2", "3", "="],
    ["0", ".", "", ""],
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Calculator */}
      <div className="lg:col-span-2 space-y-4">
        {speechError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{speechError}</AlertDescription>
          </Alert>
        )}

        {/* Display */}
        <Card>
          <CardContent className="p-6">
            <div className="text-right">
              <div className="text-sm text-muted-foreground mb-2 min-h-[20px]">
                {currentTranscript && <span className="italic">"{currentTranscript}"</span>}
                {isProcessing && <span className="text-accent animate-pulse">Processing...</span>}
              </div>
              <div className="text-4xl font-mono font-bold text-foreground break-all">{display}</div>
            </div>
          </CardContent>
        </Card>

        {/* Voice Controls */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-center gap-4">
              <Button
                size="lg"
                variant={isListening ? "destructive" : "default"}
                onClick={handleVoiceToggle}
                disabled={!speechSupported || isProcessing}
                className={cn(
                  "h-16 w-16 rounded-full transition-all duration-200",
                  isListening && "animate-pulse scale-110 shadow-lg",
                )}
              >
                {isListening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={handleSpeakToggle}
                disabled={!ttsSupported}
                className={cn(
                  "h-16 w-16 rounded-full transition-all duration-200",
                  isSpeaking && "animate-pulse scale-105 shadow-md",
                )}
              >
                {isSpeaking ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="h-16 w-16 rounded-full"
              >
                <Settings className="h-6 w-6" />
              </Button>

              <div className="flex flex-col items-center gap-1">
                <Badge variant={speechSupported ? "default" : "destructive"}>
                  {speechSupported ? "Voice Ready" : "Voice Not Supported"}
                </Badge>
                <Badge variant={ttsSupported ? "default" : "destructive"}>
                  {ttsSupported ? `Speech Ready (${voices.length} voices)` : "Speech Not Supported"}
                </Badge>
                {isProcessing && (
                  <Badge variant="secondary" className="animate-pulse">
                    Processing...
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Features */}
        {showAdvanced && <AdvancedCalculatorFeatures onCalculate={processVoiceInput} isProcessing={isProcessing} />}

        {/* Basic Calculator */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Calculator
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-4 gap-2">
              {basicButtons.flat().map((btn, index) =>
                btn ? (
                  <Button
                    key={index}
                    variant={
                      btn === "="
                        ? "default"
                        : btn === "C" || btn === "⌫"
                          ? "destructive"
                          : btn === "/" || btn === "×" || btn === "-" || btn === "+"
                            ? "default"
                            : "outline"
                    }
                    onClick={() => handleButtonClick(btn)}
                    disabled={isProcessing}
                    className={cn(
                      "h-12 transition-all duration-150 hover:scale-105",
                      btn === "0" && "col-span-2",
                      btn === "=" && "bg-primary hover:bg-primary/90 shadow-md",
                      (btn === "/" || btn === "×" || btn === "-" || btn === "+") &&
                        "bg-blue-600 hover:bg-blue-700 text-white shadow-md",
                    )}
                  >
                    {btn}
                  </Button>
                ) : (
                  <div key={index} />
                ),
              )}
            </div>
          </CardContent>
        </Card>

        {/* Scientific Functions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Scientific Functions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-4 gap-2 mb-4">
              {scientificButtons.flat().map((btn, index) => (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => handleButtonClick(btn)}
                  className="h-12 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                  disabled={isProcessing}
                >
                  {btn}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* History Sidebar */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>History</CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={clearHistory}
                disabled={history.length === 0}
                className="hover:bg-blue-500 hover:text-white transition-colors bg-transparent"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {history.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">
                No calculations yet. Try saying "What is 2 plus 2?"
              </p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {history.map((calc) => (
                  <div
                    key={calc.id}
                    className="p-3 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-all duration-200 hover:shadow-sm"
                    onClick={() => {
                      setDisplay(calc.result)
                      speak(`Selected result: ${formatSpeechOutput(calc.result)}`)
                    }}
                  >
                    <div className="text-sm text-muted-foreground mb-1 line-clamp-2">"{calc.input}"</div>
                    <div className="font-mono font-semibold text-foreground">= {calc.result}</div>
                    {calc.explanation && (
                      <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{calc.explanation}</div>
                    )}
                    <div className="text-xs text-muted-foreground mt-1">{calc.timestamp.toLocaleTimeString()}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Voice Commands Examples */}
        <Card>
          <CardHeader>
            <CardTitle>Voice Commands Examples</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Basic Math:</p>
              <p>• "What is 25 times 4?"</p>
              <p>• "Calculate 15 plus 30"</p>
              <p>• "Divide 100 by 5"</p>

              <p className="font-medium text-foreground mt-3">Scientific:</p>
              <p>• "Sine of 30 degrees"</p>
              <p>• "Square root of 144"</p>
              <p>• "Log of 100"</p>

              <p className="font-medium text-foreground mt-3">Conversions:</p>
              <p>• "Convert 100 Fahrenheit to Celsius"</p>
              <p>• "Convert 5 feet to meters"</p>

              <p className="font-medium text-foreground mt-3">Advanced:</p>
              <p>• "Solve x squared plus 5x plus 6 equals 0"</p>
              <p>• "What is 15% of 200?"</p>
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Speech Recognition</span>
                <Badge variant={speechSupported ? "default" : "destructive"}>
                  {speechSupported ? "Ready" : "Not Available"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Text-to-Speech</span>
                <Badge variant={ttsSupported ? "default" : "destructive"}>
                  {ttsSupported ? "Ready" : "Not Available"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Available Voices</span>
                <Badge variant="outline">{voices.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Local Processing</span>
                <Badge variant={isProcessing ? "secondary" : "default"}>
                  {isProcessing ? "Processing..." : "Ready"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
