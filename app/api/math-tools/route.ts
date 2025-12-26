export async function POST(req: Request) {
  try {
    const { input } = await req.json()

    // Process with local math tools
    const result = processWithLocalTools(input)

    return Response.json({
      result: result.value,
      explanation: result.explanation,
      toolUsed: result.tool,
    })
  } catch (error) {
    console.error("Math tools error:", error)
    return Response.json(
      {
        result: "Error",
        explanation: "Failed to process calculation with math tools",
      },
      { status: 500 },
    )
  }
}

function processWithLocalTools(input: string): { value: string; explanation: string; tool: string } {
  const normalizedInput = input.toLowerCase().trim()

  // Scientific calculator functions
  if (normalizedInput.includes("factorial")) {
    return handleFactorial(normalizedInput)
  }

  if (normalizedInput.includes("combination") || normalizedInput.includes("choose")) {
    return handleCombination(normalizedInput)
  }

  if (normalizedInput.includes("permutation")) {
    return handlePermutation(normalizedInput)
  }

  // Advanced mathematical functions
  if (normalizedInput.includes("derivative")) {
    return { value: "Error", explanation: "Derivative calculations require symbolic math", tool: "advanced" }
  }

  if (normalizedInput.includes("integral")) {
    return { value: "Error", explanation: "Integral calculations require symbolic math", tool: "advanced" }
  }

  // Default to basic calculation
  return { value: "Error", explanation: "Advanced calculation not supported in local mode", tool: "basic" }
}

function handleFactorial(input: string): { value: string; explanation: string; tool: string } {
  const numbers = extractNumbers(input)
  if (numbers.length >= 1) {
    const n = Math.floor(numbers[0])
    if (n < 0) {
      return { value: "Error", explanation: "Factorial of negative numbers is undefined", tool: "factorial" }
    }
    if (n > 20) {
      return { value: "Error", explanation: "Factorial too large (max 20)", tool: "factorial" }
    }

    let result = 1
    for (let i = 2; i <= n; i++) {
      result *= i
    }

    return { value: result.toString(), explanation: `${n}! = ${result}`, tool: "factorial" }
  }
  throw new Error("Invalid factorial")
}

function handleCombination(input: string): { value: string; explanation: string; tool: string } {
  const numbers = extractNumbers(input)
  if (numbers.length >= 2) {
    const n = numbers[0]
    const r = numbers[1]

    if (r > n || r < 0 || n < 0) {
      return { value: "Error", explanation: "Invalid combination parameters", tool: "combination" }
    }

    const result = factorial(n) / (factorial(r) * factorial(n - r))
    return { value: result.toString(), explanation: `C(${n},${r}) = ${result}`, tool: "combination" }
  }
  throw new Error("Invalid combination")
}

function handlePermutation(input: string): { value: string; explanation: string; tool: string } {
  const numbers = extractNumbers(input)
  if (numbers.length >= 2) {
    const n = numbers[0]
    const r = numbers[1]

    if (r > n || r < 0 || n < 0) {
      return { value: "Error", explanation: "Invalid permutation parameters", tool: "permutation" }
    }

    const result = factorial(n) / factorial(n - r)
    return { value: result.toString(), explanation: `P(${n},${r}) = ${result}`, tool: "permutation" }
  }
  throw new Error("Invalid permutation")
}

function factorial(n: number): number {
  if (n < 0) throw new Error("Factorial of negative number")
  if (n === 0 || n === 1) return 1
  let result = 1
  for (let i = 2; i <= n; i++) {
    result *= i
  }
  return result
}

function extractNumbers(input: string): number[] {
  const matches = input.match(/-?\d+\.?\d*/g)
  return matches ? matches.map(Number) : []
}
