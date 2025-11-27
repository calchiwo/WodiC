// This module provides optional improved parsing for voice input
// It's completely modular and can be toggled independently

/**
 * Structured math tokens returned from parsing natural language
 */
export interface MathTokens {
  operator: "+" | "-" | "*" | "/" | "%" | "^" | null
  operands: number[]
  rawExpression: string
  confidence: "high" | "medium" | "low"
}

export function normalizeNaturalLanguage(input: string): string {
  let normalized = input.toLowerCase().trim()

  const fillerWords = [
    "the",
    "a",
    "an",
    "is",
    "are",
    "what",
    "please",
    "can you",
    "could you",
    "tell me",
    "show me",
    "calculate",
    "compute",
    "give me",
    "find",
    "solve",
  ]

  fillerWords.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, "gi")
    normalized = normalized.replace(regex, "")
  })

  normalized = normalized.replace(/\b(\w+)(\s+\1)+\b/g, "$1")

  normalized = normalized.replace(/\s+/g, " ").trim()

  return normalized
}

export function parseNaturalLanguageMath(input: string): MathTokens | null {
  const cleaned = normalizeNaturalLanguage(input)

  const operatorPatterns = [
    {
      regex: /plus|add|\+/gi,
      operator: "+" as const,
      confidence: "high" as const,
    },
    {
      regex: /minus|subtract|-/gi,
      operator: "-" as const,
      confidence: "high" as const,
    },
    {
      regex: /times|multiply|multiplied by|×|\*/gi,
      operator: "*" as const,
      confidence: "high" as const,
    },
    {
      regex: /divide|divided by|÷|\//gi,
      operator: "/" as const,
      confidence: "high" as const,
    },
    {
      regex: /percent|%/gi,
      operator: "%" as const,
      confidence: "high" as const,
    },
    {
      regex: /power|to the|squared|cubed|\^/gi,
      operator: "^" as const,
      confidence: "medium" as const,
    },
  ]

  let detectedOperator: (typeof operatorPatterns)[number] | null = null
  for (const pattern of operatorPatterns) {
    if (pattern.regex.test(cleaned)) {
      detectedOperator = pattern
      break
    }
  }

  const numberMatches = cleaned.match(/-?\d+\.?\d*|\d*\.?\d+/g)
  const operands = numberMatches ? numberMatches.map(Number) : []

  if (!detectedOperator || operands.length < 2) {
    return null
  }

  return {
    operator: detectedOperator.operator,
    operands,
    rawExpression: cleaned,
    confidence: detectedOperator.confidence,
  }
}

export function tokensToExpression(tokens: MathTokens): string {
  const operatorMap: Record<string, string> = {
    "+": " + ",
    "-": " - ",
    "*": " * ",
    "/": " / ",
    "%": " % ",
    "^": " ^ ",
  }

  if (!tokens.operator || tokens.operands.length < 2) {
    return tokens.rawExpression
  }

  const operator = operatorMap[tokens.operator] || tokens.operator
  return tokens.operands.join(operator)
}

export function validateMathTokens(tokens: MathTokens): boolean {
  // Check if operands are finite numbers
  if (!tokens.operands.every((num) => isFinite(num))) {
    return false
  }

  // Check for unreasonably large numbers (overflow protection)
  if (tokens.operands.some((num) => Math.abs(num) > 1e15)) {
    return false
  }

  // Division by zero check
  if (tokens.operator === "/" && tokens.operands.slice(1).some((num) => num === 0)) {
    return false
  }

  return true
}

export function generateExplanation(tokens: MathTokens): string {
  const operatorWords: Record<string, string> = {
    "+": "plus",
    "-": "minus",
    "*": "times",
    "/": "divided by",
    "%": "percent",
    "^": "to the power of",
  }

  if (!tokens.operator) {
    return tokens.rawExpression
  }

  const operatorWord = operatorWords[tokens.operator] || tokens.operator
  return tokens.operands.join(` ${operatorWord} `)
}
