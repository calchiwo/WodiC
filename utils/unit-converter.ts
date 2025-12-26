// Unit configuration database - modular and extensible
const UNIT_CONVERSION_DATABASE = {
  // Temperature conversions
  temperature: {
    celsius_to_fahrenheit: (value: number) => (value * 9) / 5 + 32,
    fahrenheit_to_celsius: (value: number) => ((value - 32) * 5) / 9,
    celsius_to_kelvin: (value: number) => value + 273.15,
    kelvin_to_celsius: (value: number) => value - 273.15,
    fahrenheit_to_kelvin: (value: number) => ((value - 32) * 5) / 9 + 273.15,
    kelvin_to_fahrenheit: (value: number) => ((value - 273.15) * 9) / 5 + 32,
  },

  // Length conversions
  length: {
    meters_to_feet: (value: number) => value * 3.28084,
    feet_to_meters: (value: number) => value * 0.3048,
    meters_to_inches: (value: number) => value * 39.3701,
    inches_to_meters: (value: number) => value * 0.0254,
    meters_to_centimeters: (value: number) => value * 100,
    centimeters_to_meters: (value: number) => value / 100,
    kilometers_to_miles: (value: number) => value * 0.621371,
    miles_to_kilometers: (value: number) => value * 1.60934,
    centimeters_to_inches: (value: number) => value / 2.54,
    inches_to_centimeters: (value: number) => value * 2.54,
    feet_to_centimeters: (value: number) => value * 30.48,
    centimeters_to_feet: (value: number) => value / 30.48,
  },

  // Weight conversions
  weight: {
    kilograms_to_pounds: (value: number) => value * 2.20462,
    pounds_to_kilograms: (value: number) => value / 2.20462,
    kilograms_to_grams: (value: number) => value * 1000,
    grams_to_kilograms: (value: number) => value / 1000,
    grams_to_ounces: (value: number) => value * 0.035274,
    ounces_to_grams: (value: number) => value * 28.3495,
    pounds_to_ounces: (value: number) => value * 16,
    ounces_to_pounds: (value: number) => value / 16,
    tons_to_kilograms: (value: number) => value * 1000,
    kilograms_to_tons: (value: number) => value / 1000,
  },

  // Volume conversions
  volume: {
    liters_to_gallons_us: (value: number) => value * 0.264172,
    gallons_us_to_liters: (value: number) => value * 3.78541,
    liters_to_milliliters: (value: number) => value * 1000,
    milliliters_to_liters: (value: number) => value / 1000,
    liters_to_cups: (value: number) => value * 4.22675,
    cups_to_liters: (value: number) => value / 4.22675,
    milliliters_to_fluid_ounces: (value: number) => value * 0.033814,
    fluid_ounces_to_milliliters: (value: number) => value * 29.5735,
    gallons_us_to_milliliters: (value: number) => value * 3785.41,
    milliliters_to_gallons_us: (value: number) => value / 3785.41,
  },

  // Speed conversions
  speed: {
    kmh_to_mph: (value: number) => value * 0.621371,
    mph_to_kmh: (value: number) => value * 1.60934,
    ms_to_kmh: (value: number) => value * 3.6,
    kmh_to_ms: (value: number) => value / 3.6,
    knots_to_kmh: (value: number) => value * 1.852,
    kmh_to_knots: (value: number) => value / 1.852,
  },
}

// Unit name aliases for flexible input parsing
const UNIT_ALIASES: Record<string, string> = {
  // Temperature
  celsius: "celsius",
  c: "celsius",
  "c°": "celsius",
  fahrenheit: "fahrenheit",
  f: "fahrenheit",
  "f°": "fahrenheit",
  kelvin: "kelvin",
  k: "kelvin",

  // Length
  meter: "meters",
  meters: "meters",
  m: "meters",
  feet: "feet",
  foot: "feet",
  ft: "feet",
  inch: "inches",
  inches: "inches",
  in: "inches",
  cm: "centimeters",
  centimeter: "centimeters",
  centimeters: "centimeters",
  km: "kilometers",
  kilometer: "kilometers",
  kilometers: "kilometers",
  mile: "miles",
  miles: "miles",
  mi: "miles",

  // Weight
  kg: "kilograms",
  kilogram: "kilograms",
  kilograms: "kilograms",
  pound: "pounds",
  pounds: "pounds",
  lb: "pounds",
  lbs: "pounds",
  g: "grams",
  gram: "grams",
  grams: "grams",
  mg: "milligrams",
  milligram: "milligrams",
  milligrams: "milligrams",
  oz: "ounces",
  ounce: "ounces",
  ounces: "ounces",
  ton: "tons",
  tons: "tons",

  // Volume
  liter: "liters",
  liters: "liters",
  l: "liters",
  gallon: "gallons_us",
  gallons: "gallons_us",
  gal: "gallons_us",
  ml: "milliliters",
  milliliter: "milliliters",
  milliliters: "milliliters",
  cup: "cups",
  cups: "cups",
  "fl oz": "fluid_ounces",
  "fluid oz": "fluid_ounces",
  "fluid ounce": "fluid_ounces",
  "fluid ounces": "fluid_ounces",

  // Speed
  kmh: "kmh",
  "km/h": "kmh",
  mph: "mph",
  "mi/h": "mph",
  ms: "ms",
  "m/s": "ms",
  knots: "knots",
  knot: "knots",
}

export interface UnitConversionInput {
  value: number
  sourceUnit: string
  targetUnit: string
}

export interface UnitConversionResult {
  value: number
  result: string
  formula: string
  explanation: string
}

// Parse voice input like "Convert 5 kilograms to pounds"
export function parseUnitConversionVoiceInput(input: string): UnitConversionInput | null {
  const normalizedInput = input.toLowerCase().trim()

  // Pattern: "convert X [unit] to [unit]"
  const pattern = /convert\s+([\d.]+)\s*([a-z°/\s]+?)\s+to\s+([a-z°/\s]+)/i
  const match = normalizedInput.match(pattern)

  if (!match) {
    return null
  }

  const value = Number.parseFloat(match[1])
  const sourceUnitRaw = match[2].trim()
  const targetUnitRaw = match[3].trim()

  const sourceUnit = UNIT_ALIASES[sourceUnitRaw] || sourceUnitRaw
  const targetUnit = UNIT_ALIASES[targetUnitRaw] || targetUnitRaw

  if (!isNaN(value) && sourceUnit && targetUnit) {
    return {
      value,
      sourceUnit,
      targetUnit,
    }
  }

  return null
}

// Find conversion function based on source and target units
function findConversionKey(sourceUnit: string, targetUnit: string): string | null {
  // Normalize unit names
  const normalized = (unit: string) => unit.toLowerCase().replace(/\s+/g, "_")
  const source = normalized(sourceUnit)
  const target = normalized(targetUnit)

  // Search through conversion database
  for (const [category, conversions] of Object.entries(UNIT_CONVERSION_DATABASE)) {
    const key = `${source}_to_${target}`
    if (key in conversions) {
      return key
    }
  }

  return null
}

// Get the category of a unit for better formatting
function getUnitCategory(unit: string): string | null {
  const normalized = unit.toLowerCase().replace(/\s+/g, "_")

  for (const [category, conversions] of Object.entries(UNIT_CONVERSION_DATABASE)) {
    for (const key of Object.keys(conversions)) {
      if (key.includes(normalized)) {
        return category
      }
    }
  }

  return null
}

// Perform the actual unit conversion
export function convertUnits(input: UnitConversionInput): UnitConversionResult | null {
  const conversionKey = findConversionKey(input.sourceUnit, input.targetUnit)

  if (!conversionKey) {
    return null
  }

  const category = getUnitCategory(input.sourceUnit)
  if (!category) {
    return null
  }

  const conversions = UNIT_CONVERSION_DATABASE[category as keyof typeof UNIT_CONVERSION_DATABASE]
  const conversionFunc = conversions[conversionKey as keyof typeof conversions]

  if (!conversionFunc || typeof conversionFunc !== "function") {
    return null
  }

  try {
    const result = conversionFunc(input.value)
    const roundedResult = Math.round(result * 10000) / 10000

    // Format source and target unit names nicely
    const formatUnitName = (unit: string) => {
      return unit
        .replace(/_/g, " ")
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    }

    const sourceUnitFormatted = formatUnitName(input.sourceUnit)
    const targetUnitFormatted = formatUnitName(input.targetUnit)

    return {
      value: roundedResult,
      result: `${input.value} ${sourceUnitFormatted} = ${roundedResult} ${targetUnitFormatted}`,
      formula: `${input.value} × ${getConversionFactor(input.sourceUnit, input.targetUnit)} = ${roundedResult}`,
      explanation: `${input.value} ${sourceUnitFormatted} is approximately ${roundedResult} ${targetUnitFormatted}`,
    }
  } catch (error) {
    console.error("[v0] Unit conversion error:", error)
    return null
  }
}

// Get the conversion factor for display
function getConversionFactor(sourceUnit: string, targetUnit: string): string {
  const conversionKey = findConversionKey(sourceUnit, targetUnit)
  if (!conversionKey) return "?"

  // Common factors for display
  const factors: Record<string, string> = {
    kilograms_to_pounds: "2.20462",
    pounds_to_kilograms: "0.453592",
    celsius_to_fahrenheit: "× 9/5 + 32",
    fahrenheit_to_celsius: "× 5/9 - 32",
    meters_to_feet: "3.28084",
    feet_to_meters: "0.3048",
    kilometers_to_miles: "0.621371",
    miles_to_kilometers: "1.60934",
    liters_to_gallons_us: "0.264172",
    gallons_us_to_liters: "3.78541",
  }

  return factors[conversionKey] || "custom"
}

// List available units in a category
export function getAvailableUnits(category: string): string[] {
  const categoryData = UNIT_CONVERSION_DATABASE[category as keyof typeof UNIT_CONVERSION_DATABASE]
  if (!categoryData) return []

  const units = new Set<string>()
  for (const key of Object.keys(categoryData)) {
    const parts = key.split("_to_")
    if (parts[0]) units.add(parts[0])
    if (parts[1]) units.add(parts[1])
  }

  return Array.from(units)
}

// Get all available conversion categories
export function getAvailableCategories(): string[] {
  return Object.keys(UNIT_CONVERSION_DATABASE)
}
