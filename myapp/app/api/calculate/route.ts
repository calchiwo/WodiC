export async function POST(req: Request) {
  try {
    const { input } = await req.json()

    // Parse and evaluate the mathematical expression locally
    const result = processLocalCalculation(input)

    return Response.json({
      result: result.value,
      explanation: result.explanation,
    })
  } catch (error) {
    console.error("Calculation error:", error)
    return Response.json({
      result: "0",
      explanation: "Please try rephrasing your calculation",
    })
  }
}

function processLocalCalculation(input: string): { value: string; explanation: string } {
  const normalizedInput = input.toLowerCase().trim()

  try {
    // Handle "what is" questions
    if (normalizedInput.startsWith("what is") || normalizedInput.startsWith("calculate")) {
      const expression = normalizedInput.replace(/^(what is|calculate)\s+/, "")
      return processExpression(expression)
    }

    // Direct processing
    return processExpression(normalizedInput)
  } catch (error) {
    return handleFallbackCalculation(normalizedInput)
  }
}

function processExpression(input: string): { value: string; explanation: string } {
  // Handle basic arithmetic patterns with better flexibility
  if (input.includes("plus") || input.includes("add") || input.includes("+")) {
    return handleAddition(input)
  }
  if (input.includes("minus") || input.includes("subtract") || input.includes("-")) {
    return handleSubtraction(input)
  }
  if (input.includes("times") || input.includes("multiply") || input.includes("×") || input.includes("*")) {
    return handleMultiplication(input)
  }
  if (input.includes("divide") || input.includes("÷") || input.includes("/")) {
    return handleDivision(input)
  }

  // Handle power operations (squared, cubed, power)
  if (input.includes("squared") || input.includes("square") || input.includes("²")) {
    return handlePower(input)
  }
  if (input.includes("cubed") || input.includes("cube") || input.includes("³")) {
    return handlePower(input)
  }
  if (input.includes("power") || input.includes("to the power") || input.includes("^")) {
    return handlePower(input)
  }

  // Handle square root
  if (input.includes("square root") || input.includes("sqrt") || input.includes("√")) {
    return handleSquareRoot(input)
  }

  // Handle trigonometric functions
  if (input.includes("sine") || input.includes("sin")) {
    return handleSine(input)
  }
  if (input.includes("cosine") || input.includes("cos")) {
    return handleCosine(input)
  }
  if (input.includes("tangent") || input.includes("tan")) {
    return handleTangent(input)
  }

  // Handle logarithmic functions
  if (input.includes("log")) {
    return handleLogarithm(input)
  }
  if (input.includes("natural log") || input.includes("ln")) {
    return handleNaturalLogarithm(input)
  }

  if (input.includes("factorial") || input.includes("!")) {
    return handleFactorial(input)
  }

  if (input.includes("pi") || input.includes("π")) {
    return handlePi(input)
  }
  if (input.includes("euler") || input.includes(" e ") || input.includes("e =")) {
    return handleEuler(input)
  }

  // Handle percentage calculations
  if (input.includes("percent") || input.includes("%")) {
    return handlePercentage(input)
  }

  // Handle unit conversions
  return handleUnitConversion(input)
}

function handleUnitConversion(input: string): { value: string; explanation: string } {
  const { convertUnits, parseUnitConversionVoiceInput } = require("@/utils/unit-converter")

  // Try parsing as voice input first
  const voiceParsed = parseUnitConversionVoiceInput(input)
  if (voiceParsed) {
    const result = convertUnits(voiceParsed)
    if (result) {
      return {
        value: result.value.toString(),
        explanation: result.explanation,
      }
    }
  }

  // Fallback to original method for text input
  const numbers = extractNumbers(input)
  if (numbers.length >= 1) {
    const value = numbers[0]

    // Temperature conversions
    if (input.includes("fahrenheit") && input.includes("celsius")) {
      const result = ((value - 32) * 5) / 9
      return { value: result.toFixed(2), explanation: `${value}°F = ${result.toFixed(2)}°C` }
    }
    if (input.includes("celsius") && input.includes("fahrenheit")) {
      const result = (value * 9) / 5 + 32
      return { value: result.toFixed(2), explanation: `${value}°C = ${result.toFixed(2)}°F` }
    }

    // Length conversions
    if (input.includes("feet") && input.includes("meter")) {
      const result = value * 0.3048
      return { value: result.toFixed(3), explanation: `${value} feet = ${result.toFixed(3)} meters` }
    }
    if (input.includes("meter") && input.includes("feet")) {
      const result = value * 3.28084
      return { value: result.toFixed(3), explanation: `${value} meters = ${result.toFixed(3)} feet` }
    }

    if (input.includes("inch") && input.includes("cm")) {
      const result = value * 2.54
      return { value: result.toFixed(2), explanation: `${value} inches = ${result.toFixed(2)} cm` }
    }
    if (input.includes("cm") && input.includes("inch")) {
      const result = value / 2.54
      return { value: result.toFixed(2), explanation: `${value} cm = ${result.toFixed(2)} inches` }
    }
  }
  return { value: "0", explanation: "Please specify valid units for conversion" }
}

function handleFallbackCalculation(input: string): { value: string; explanation: string } {
  const numbers = extractNumbers(input)

  if (numbers.length === 0) {
    return { value: "0", explanation: "No numbers found in input" }
  }

  if (numbers.length === 1) {
    return { value: numbers[0].toString(), explanation: `Number: ${numbers[0]}` }
  }

  // Default to addition if multiple numbers found
  const result = numbers.reduce((sum, num) => sum + num, 0)
  return { value: result.toString(), explanation: `Sum of numbers: ${numbers.join(" + ")} = ${result}` }
}

function extractNumbers(input: string): number[] {
  const matches = input.match(/-?\d+\.?\d*|\d*\.?\d+/g)
  return matches ? matches.map(Number).filter((num) => !isNaN(num)) : []
}

function handleAddition(input: string): { value: string; explanation: string } {
  const numbers = extractNumbers(input)
  if (numbers.length >= 2) {
    const result = numbers.reduce((sum, num) => sum + num, 0)
    return { value: result.toString(), explanation: `${numbers.join(" + ")} = ${result}` }
  }
  if (numbers.length === 1) {
    return { value: numbers[0].toString(), explanation: `Number: ${numbers[0]}` }
  }
  return { value: "0", explanation: "Please provide numbers to add" }
}

function handleSubtraction(input: string): { value: string; explanation: string } {
  const numbers = extractNumbers(input)
  if (numbers.length >= 2) {
    const result = numbers.reduce((diff, num, index) => (index === 0 ? num : diff - num))
    return { value: result.toString(), explanation: `${numbers.join(" - ")} = ${result}` }
  }
  if (numbers.length === 1) {
    return { value: numbers[0].toString(), explanation: `Number: ${numbers[0]}` }
  }
  return { value: "0", explanation: "Please provide numbers to subtract" }
}

function handleMultiplication(input: string): { value: string; explanation: string } {
  const numbers = extractNumbers(input)
  if (numbers.length >= 2) {
    const result = numbers.reduce((product, num) => product * num, 1)
    return { value: result.toString(), explanation: `${numbers.join(" × ")} = ${result}` }
  }
  if (numbers.length === 1) {
    return { value: numbers[0].toString(), explanation: `Number: ${numbers[0]}` }
  }
  return { value: "0", explanation: "Please provide numbers to multiply" }
}

function handleDivision(input: string): { value: string; explanation: string } {
  const numbers = extractNumbers(input)
  if (numbers.length >= 2) {
    if (numbers.slice(1).some((num) => num === 0)) {
      return { value: "∞", explanation: "Cannot divide by zero" }
    }
    const result = numbers.reduce((quotient, num, index) => (index === 0 ? num : quotient / num))
    return { value: result.toString(), explanation: `${numbers.join(" ÷ ")} = ${result}` }
  }
  if (numbers.length === 1) {
    return { value: numbers[0].toString(), explanation: `Number: ${numbers[0]}` }
  }
  return { value: "0", explanation: "Please provide numbers to divide" }
}

function handleSquareRoot(input: string): { value: string; explanation: string } {
  const numbers = extractNumbers(input)
  if (numbers.length >= 1) {
    if (numbers[0] < 0) {
      return { value: "NaN", explanation: "Cannot take square root of negative number" }
    }
    const result = Math.sqrt(numbers[0])
    return { value: result.toString(), explanation: `√${numbers[0]} = ${result}` }
  }
  return { value: "0", explanation: "Please provide a number for square root" }
}

function handleSine(input: string): { value: string; explanation: string } {
  const numbers = extractNumbers(input)
  if (numbers.length >= 1) {
    const degrees = numbers[0]
    const radians = (degrees * Math.PI) / 180
    const result = Math.sin(radians)
    const cleanResult =
      Math.abs(result) < 1e-10
        ? 0
        : Math.abs(result - Math.round(result * 1e6) / 1e6) < 1e-10
          ? Math.round(result * 1e6) / 1e6
          : result.toFixed(6)
    return { value: cleanResult.toString(), explanation: `sin(${degrees}°) = ${cleanResult}` }
  }
  return { value: "0", explanation: "Please provide an angle for sine" }
}

function handleCosine(input: string): { value: string; explanation: string } {
  const numbers = extractNumbers(input)
  if (numbers.length >= 1) {
    const degrees = numbers[0]
    const radians = (degrees * Math.PI) / 180
    const result = Math.cos(radians)
    const cleanResult =
      Math.abs(result) < 1e-10
        ? 0
        : Math.abs(result - Math.round(result * 1e6) / 1e6) < 1e-10
          ? Math.round(result * 1e6) / 1e6
          : result.toFixed(6)
    return { value: cleanResult.toString(), explanation: `cos(${degrees}°) = ${cleanResult}` }
  }
  return { value: "0", explanation: "Please provide an angle for cosine" }
}

function handleTangent(input: string): { value: string; explanation: string } {
  const numbers = extractNumbers(input)
  if (numbers.length >= 1) {
    const degrees = numbers[0]
    const radians = (degrees * Math.PI) / 180
    const result = Math.tan(radians)
    const cleanResult =
      Math.abs(result) < 1e-10
        ? 0
        : Math.abs(result - Math.round(result * 1e6) / 1e6) < 1e-10
          ? Math.round(result * 1e6) / 1e6
          : result.toFixed(6)
    return { value: cleanResult.toString(), explanation: `tan(${degrees}°) = ${cleanResult}` }
  }
  return { value: "0", explanation: "Please provide an angle for tangent" }
}

function handleLogarithm(input: string): { value: string; explanation: string } {
  const numbers = extractNumbers(input)
  if (numbers.length >= 1) {
    if (numbers[0] <= 0) {
      return { value: "NaN", explanation: "Logarithm undefined for non-positive numbers" }
    }
    const result = Math.log10(numbers[0])
    return { value: result.toFixed(6), explanation: `log(${numbers[0]}) = ${result.toFixed(6)}` }
  }
  return { value: "0", explanation: "Please provide a number for logarithm" }
}

function handlePercentage(input: string): { value: string; explanation: string } {
  const numbers = extractNumbers(input)
  if (numbers.length >= 2) {
    const percentage = numbers[0]
    const total = numbers[1]
    const result = (percentage / 100) * total
    return { value: result.toString(), explanation: `${percentage}% of ${total} = ${result}` }
  }
  if (numbers.length === 1) {
    const result = numbers[0] / 100
    return { value: result.toString(), explanation: `${numbers[0]}% = ${result}` }
  }
  return { value: "0", explanation: "Please provide numbers for percentage calculation" }
}

function handlePower(input: string): { value: string; explanation: string } {
  const numbers = extractNumbers(input)
  if (input.includes("squared") || input.includes("square") || input.includes("²")) {
    if (numbers.length >= 1) {
      const result = Math.pow(numbers[0], 2)
      const cleanResult = result % 1 === 0 ? result.toString() : result.toFixed(6)
      return { value: cleanResult, explanation: `${numbers[0]}² = ${cleanResult}` }
    }
  }
  if (input.includes("cubed") || input.includes("cube") || input.includes("³")) {
    if (numbers.length >= 1) {
      const result = Math.pow(numbers[0], 3)
      const cleanResult = result % 1 === 0 ? result.toString() : result.toFixed(6)
      return { value: cleanResult, explanation: `${numbers[0]}³ = ${cleanResult}` }
    }
  }
  if (numbers.length >= 2) {
    const base = numbers[0]
    const exponent = numbers[1]
    const result = Math.pow(base, exponent)
    const cleanResult = result % 1 === 0 ? result.toString() : result.toFixed(6)
    return { value: cleanResult, explanation: `${base}^${exponent} = ${cleanResult}` }
  }
  return { value: "0", explanation: "Please provide base and exponent for power calculation" }
}

function handleNaturalLogarithm(input: string): { value: string; explanation: string } {
  const numbers = extractNumbers(input)
  if (numbers.length >= 1) {
    if (numbers[0] <= 0) {
      return { value: "NaN", explanation: "Natural logarithm undefined for non-positive numbers" }
    }
    const result = Math.log(numbers[0])
    return { value: result.toFixed(6), explanation: `ln(${numbers[0]}) = ${result.toFixed(6)}` }
  }
  return { value: "0", explanation: "Please provide a number for natural logarithm" }
}

function handleFactorial(input: string): { value: string; explanation: string } {
  const numbers = extractNumbers(input)
  if (numbers.length >= 1) {
    const n = Math.floor(numbers[0])
    if (n < 0) {
      return { value: "NaN", explanation: "Factorial undefined for negative numbers" }
    }
    if (n > 170) {
      return { value: "∞", explanation: "Factorial too large to calculate" }
    }
    let result = 1
    for (let i = 2; i <= n; i++) {
      result *= i
    }
    return { value: result.toString(), explanation: `${n}! = ${result}` }
  }
  return { value: "0", explanation: "Please provide a number for factorial" }
}

function handlePi(input: string): { value: string; explanation: string } {
  if (input.includes("*") || input.includes("multiply") || input.includes("times")) {
    const numbers = extractNumbers(input)
    if (numbers.length >= 1) {
      const result = Math.PI * numbers[0]
      return { value: result.toFixed(6), explanation: `π × ${numbers[0]} = ${result.toFixed(6)}` }
    }
  }
  return { value: Math.PI.toFixed(6), explanation: `π = ${Math.PI.toFixed(6)}` }
}

function handleEuler(input: string): { value: string; explanation: string } {
  if (input.includes("*") || input.includes("multiply") || input.includes("times")) {
    const numbers = extractNumbers(input)
    if (numbers.length >= 1) {
      const result = Math.E * numbers[0]
      return { value: result.toFixed(6), explanation: `e × ${numbers[0]} = ${result.toFixed(6)}` }
    }
  }
  return { value: Math.E.toFixed(6), explanation: `e = ${Math.E.toFixed(6)}` }
}
