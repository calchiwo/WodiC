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

  // Handle scientific functions
  if (input.includes("square root") || input.includes("sqrt") || input.includes("√")) {
    return handleSquareRoot(input)
  }
  if (input.includes("sine") || input.includes("sin")) {
    return handleSine(input)
  }
  if (input.includes("cosine") || input.includes("cos")) {
    return handleCosine(input)
  }
  if (input.includes("tangent") || input.includes("tan")) {
    return handleTangent(input)
  }
  if (input.includes("log")) {
    return handleLogarithm(input)
  }

  // Handle percentage calculations
  if (input.includes("percent") || input.includes("%")) {
    return handlePercentage(input)
  }

  // Handle unit conversions
  if (input.includes("convert")) {
    return handleUnitConversion(input)
  }

  // Handle power operations
  if (input.includes("power") || input.includes("squared") || input.includes("cubed") || input.includes("^")) {
    return handlePower(input)
  }

  // Try to evaluate as direct mathematical expression
  const directResult = evaluateDirectExpression(input)
  if (directResult !== null) {
    return { value: directResult.toString(), explanation: `Result: ${directResult}` }
  }

  return handleFallbackCalculation(input)
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
    return { value: result.toFixed(6), explanation: `sin(${degrees}°) = ${result.toFixed(6)}` }
  }
  return { value: "0", explanation: "Please provide an angle for sine" }
}

function handleCosine(input: string): { value: string; explanation: string } {
  const numbers = extractNumbers(input)
  if (numbers.length >= 1) {
    const degrees = numbers[0]
    const radians = (degrees * Math.PI) / 180
    const result = Math.cos(radians)
    return { value: result.toFixed(6), explanation: `cos(${degrees}°) = ${result.toFixed(6)}` }
  }
  return { value: "0", explanation: "Please provide an angle for cosine" }
}

function handleTangent(input: string): { value: string; explanation: string } {
  const numbers = extractNumbers(input)
  if (numbers.length >= 1) {
    const degrees = numbers[0]
    const radians = (degrees * Math.PI) / 180
    const result = Math.tan(radians)
    return { value: result.toFixed(6), explanation: `tan(${degrees}°) = ${result.toFixed(6)}` }
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
  if (input.includes("squared")) {
    if (numbers.length >= 1) {
      const result = Math.pow(numbers[0], 2)
      return { value: result.toString(), explanation: `${numbers[0]}² = ${result}` }
    }
  }
  if (input.includes("cubed")) {
    if (numbers.length >= 1) {
      const result = Math.pow(numbers[0], 3)
      return { value: result.toString(), explanation: `${numbers[0]}³ = ${result}` }
    }
  }
  if (numbers.length >= 2) {
    const result = Math.pow(numbers[0], numbers[1])
    return { value: result.toString(), explanation: `${numbers[0]}^${numbers[1]} = ${result}` }
  }
  if (numbers.length === 1) {
    return { value: numbers[0].toString(), explanation: `Number: ${numbers[0]}` }
  }
  return { value: "0", explanation: "Please provide numbers for power calculation" }
}

function handleUnitConversion(input: string): { value: string; explanation: string } {
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

function evaluateDirectExpression(input: string): number | null {
  try {
    let cleaned = input.replace(/×/g, "*")

    // Clean the input to only allow safe mathematical operations
    cleaned = cleaned.replace(/[^0-9+\-*/.() ]/g, "").replace(/\s+/g, "")

    if (!cleaned || cleaned.length === 0) {
      return null
    }

    // Basic validation - must contain at least one number
    if (!/\d/.test(cleaned)) {
      return null
    }

    // Use Function constructor for safe evaluation (limited scope)
    const result = Function(`"use strict"; return (${cleaned})`)()
    return typeof result === "number" && !isNaN(result) && isFinite(result) ? result : null
  } catch {
    return null
  }
}
