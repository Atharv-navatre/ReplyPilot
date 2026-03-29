// Utility functions for the backend

// Format date for logging
export function formatDate(date: Date = new Date()): string {
  return date.toISOString()
}

// Safe JSON parse with fallback
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json)
  } catch {
    return fallback
  }
}
