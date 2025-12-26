"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calculator, Thermometer, Ruler } from "lucide-react"
import { UnitConversionVoice } from "@/components/unit-conversion-voice"
import { parseUnitConversionVoiceInput, convertUnits } from "@/utils/unit-converter"

interface AdvancedCalculatorFeaturesProps {
  onCalculate: (input: string) => void
  isProcessing: boolean
}

const quickCalculations = [
  { label: "Area of Circle", template: "πr²" },
  { label: "Pythagorean Theorem", template: "a² + b² = c²" },
  { label: "Simple Interest", template: "PRT/100" },
]

export default function AdvancedCalculatorFeatures({ onCalculate, isProcessing }: AdvancedCalculatorFeaturesProps) {
  const [unitValue, setUnitValue] = useState("")
  const [fromUnit, setFromUnit] = useState("")
  const [toUnit, setToUnit] = useState("")
  const [conversionResult, setConversionResult] = useState<{
    result: string
    formula: string
    explanation: string
  } | null>(null)
  const [equationInput, setEquationInput] = useState("")

  const handleVoiceUnitConversion = (voiceInput: string) => {
    const parsed = parseUnitConversionVoiceInput(voiceInput)
    if (parsed) {
      const result = convertUnits(parsed)
      if (result) {
        setUnitValue(parsed.value.toString())
        setFromUnit(parsed.sourceUnit)
        setToUnit(parsed.targetUnit)
        setConversionResult(result)
        // Call parent to process and speak the result
        onCalculate(`Convert ${parsed.value} ${parsed.sourceUnit} to ${parsed.targetUnit}`)
      }
    }
  }

  const handleUnitConversion = () => {
    if (unitValue && fromUnit && toUnit) {
      const result = convertUnits({
        value: Number.parseFloat(unitValue),
        sourceUnit: fromUnit,
        targetUnit: toUnit,
      })

      if (result) {
        setConversionResult(result)
        onCalculate(`Convert ${unitValue} ${fromUnit} to ${toUnit}. Result: ${result.result}`)
      } else {
        onCalculate(`Convert ${unitValue} ${fromUnit} to ${toUnit}`)
      }
    }
  }

  const handleEquationSolve = () => {
    if (equationInput) {
      onCalculate(`Solve ${equationInput}`)
    }
  }

  const temperatureUnits = [
    { value: "celsius", label: "Celsius (°C)" },
    { value: "fahrenheit", label: "Fahrenheit (°F)" },
    { value: "kelvin", label: "Kelvin (K)" },
  ]

  const lengthUnits = [
    { value: "meters", label: "Meters (m)" },
    { value: "feet", label: "Feet (ft)" },
    { value: "inches", label: "Inches (in)" },
    { value: "centimeters", label: "Centimeters (cm)" },
    { value: "kilometers", label: "Kilometers (km)" },
    { value: "miles", label: "Miles (mi)" },
  ]

  const weightUnits = [
    { value: "kilograms", label: "Kilograms (kg)" },
    { value: "pounds", label: "Pounds (lb)" },
    { value: "grams", label: "Grams (g)" },
    { value: "ounces", label: "Ounces (oz)" },
    { value: "tons", label: "Tons" },
  ]

  const volumeUnits = [
    { value: "liters", label: "Liters (L)" },
    { value: "milliliters", label: "Milliliters (mL)" },
    { value: "gallons_us", label: "Gallons (US)" },
    { value: "cups", label: "Cups" },
    { value: "fluid_ounces", label: "Fluid Ounces (fl oz)" },
  ]

  const speedUnits = [
    { value: "kmh", label: "Kilometers/Hour (km/h)" },
    { value: "mph", label: "Miles/Hour (mph)" },
    { value: "ms", label: "Meters/Second (m/s)" },
    { value: "knots", label: "Knots" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Advanced Features
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="conversions" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="conversions">Unit Conversion</TabsTrigger>
            <TabsTrigger value="equations">Equations</TabsTrigger>
            <TabsTrigger value="quick">Quick Calc</TabsTrigger>
          </TabsList>

          <TabsContent value="conversions" className="space-y-4">
            <UnitConversionVoice onVoiceInput={handleVoiceUnitConversion} isProcessing={isProcessing} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Temperature Conversion */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Thermometer className="h-4 w-4" />
                  <Label>Temperature</Label>
                </div>
                <div className="space-y-2">
                  <Input
                    placeholder="Enter temperature"
                    value={unitValue}
                    onChange={(e) => setUnitValue(e.target.value)}
                    type="number"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Select value={fromUnit} onValueChange={setFromUnit}>
                      <SelectTrigger>
                        <SelectValue placeholder="From" />
                      </SelectTrigger>
                      <SelectContent>
                        {temperatureUnits.map((unit) => (
                          <SelectItem key={unit.value} value={unit.value}>
                            {unit.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={toUnit} onValueChange={setToUnit}>
                      <SelectTrigger>
                        <SelectValue placeholder="To" />
                      </SelectTrigger>
                      <SelectContent>
                        {temperatureUnits.map((unit) => (
                          <SelectItem key={unit.value} value={unit.value}>
                            {unit.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Length Conversion */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Ruler className="h-4 w-4" />
                  <Label>Length</Label>
                </div>
                <div className="space-y-2">
                  <Input
                    placeholder="Enter length"
                    value={unitValue}
                    onChange={(e) => setUnitValue(e.target.value)}
                    type="number"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Select value={fromUnit} onValueChange={setFromUnit}>
                      <SelectTrigger>
                        <SelectValue placeholder="From" />
                      </SelectTrigger>
                      <SelectContent>
                        {lengthUnits.map((unit) => (
                          <SelectItem key={unit.value} value={unit.value}>
                            {unit.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={toUnit} onValueChange={setToUnit}>
                      <SelectTrigger>
                        <SelectValue placeholder="To" />
                      </SelectTrigger>
                      <SelectContent>
                        {lengthUnits.map((unit) => (
                          <SelectItem key={unit.value} value={unit.value}>
                            {unit.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Ruler className="h-4 w-4" />
                  <Label>Weight</Label>
                </div>
                <div className="space-y-2">
                  <Input
                    placeholder="Enter weight"
                    value={unitValue}
                    onChange={(e) => setUnitValue(e.target.value)}
                    type="number"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Select value={fromUnit} onValueChange={setFromUnit}>
                      <SelectTrigger>
                        <SelectValue placeholder="From" />
                      </SelectTrigger>
                      <SelectContent>
                        {weightUnits.map((unit) => (
                          <SelectItem key={unit.value} value={unit.value}>
                            {unit.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={toUnit} onValueChange={setToUnit}>
                      <SelectTrigger>
                        <SelectValue placeholder="To" />
                      </SelectTrigger>
                      <SelectContent>
                        {weightUnits.map((unit) => (
                          <SelectItem key={unit.value} value={unit.value}>
                            {unit.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Ruler className="h-4 w-4" />
                  <Label>Volume</Label>
                </div>
                <div className="space-y-2">
                  <Input
                    placeholder="Enter volume"
                    value={unitValue}
                    onChange={(e) => setUnitValue(e.target.value)}
                    type="number"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Select value={fromUnit} onValueChange={setFromUnit}>
                      <SelectTrigger>
                        <SelectValue placeholder="From" />
                      </SelectTrigger>
                      <SelectContent>
                        {volumeUnits.map((unit) => (
                          <SelectItem key={unit.value} value={unit.value}>
                            {unit.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={toUnit} onValueChange={setToUnit}>
                      <SelectTrigger>
                        <SelectValue placeholder="To" />
                      </SelectTrigger>
                      <SelectContent>
                        {volumeUnits.map((unit) => (
                          <SelectItem key={unit.value} value={unit.value}>
                            {unit.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Ruler className="h-4 w-4" />
                  <Label>Speed</Label>
                </div>
                <div className="space-y-2">
                  <Input
                    placeholder="Enter speed"
                    value={unitValue}
                    onChange={(e) => setUnitValue(e.target.value)}
                    type="number"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Select value={fromUnit} onValueChange={setFromUnit}>
                      <SelectTrigger>
                        <SelectValue placeholder="From" />
                      </SelectTrigger>
                      <SelectContent>
                        {speedUnits.map((unit) => (
                          <SelectItem key={unit.value} value={unit.value}>
                            {unit.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={toUnit} onValueChange={setToUnit}>
                      <SelectTrigger>
                        <SelectValue placeholder="To" />
                      </SelectTrigger>
                      <SelectContent>
                        {speedUnits.map((unit) => (
                          <SelectItem key={unit.value} value={unit.value}>
                            {unit.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            <Button
              onClick={handleUnitConversion}
              disabled={!unitValue || !fromUnit || !toUnit || isProcessing}
              className="w-full"
            >
              Convert Units
            </Button>

            {conversionResult && (
              <Card className="bg-accent/10 border-accent/20">
                <CardContent className="p-4 space-y-2">
                  <div className="font-semibold text-foreground">{conversionResult.result}</div>
                  <div className="text-sm text-muted-foreground">
                    <div>Formula: {conversionResult.formula}</div>
                    <div className="mt-1 italic">{conversionResult.explanation}</div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="equations" className="space-y-4">
            <div className="space-y-3">
              <Label>Equation to Solve</Label>
              <Input
                placeholder="e.g., x^2 + 5x + 6 = 0 or 2x + 3 = 11"
                value={equationInput}
                onChange={(e) => setEquationInput(e.target.value)}
              />
              <Button onClick={handleEquationSolve} disabled={!equationInput || isProcessing} className="w-full">
                Solve Equation
              </Button>
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Examples:</Label>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>• Linear: 2x + 3 = 11</p>
                <p>• Quadratic: x² + 5x + 6 = 0</p>
                <p>• System: x + y = 5, x - y = 1</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="quick" className="space-y-4">
            <div className="grid grid-cols-1 gap-2">
              {quickCalculations.map((calc, index) => (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => onCalculate(calc.template)}
                  disabled={isProcessing}
                  className="justify-start text-left h-auto p-3"
                >
                  <div>
                    <div className="font-medium">{calc.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">{calc.template}</div>
                  </div>
                </Button>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
