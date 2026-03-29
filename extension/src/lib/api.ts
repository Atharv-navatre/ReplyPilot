// API client for communicating with ReplyPilot backend

// Get API URL from environment or default to localhost
const API_URL = process.env.PLASMO_PUBLIC_API_URL || "http://localhost:3001"

// Types for API communication
export interface ConversationMessage {
  sender: "me" | "them"
  text: string
}

export type Tone = "professional" | "friendly" | "short"

export interface GenerateRequest {
  messages: ConversationMessage[]
  tone: Tone
  platform?: string
}

export interface GenerateResponse {
  success: boolean
  reply?: string
  error?: string
}

// Custom error for API failures
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public isNetworkError: boolean = false
  ) {
    super(message)
    this.name = "ApiError"
  }
}

// Generate a reply using the backend API
export async function generateReply(
  messages: ConversationMessage[],
  tone: Tone,
  platform: string = "linkedin"
): Promise<string> {
  console.log(`[API] Generating reply: ${messages.length} messages, tone=${tone}`)

  try {
    const response = await fetch(`${API_URL}/api/v1/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages,
        tone,
        platform
      } as GenerateRequest)
    })

    const data = (await response.json()) as GenerateResponse

    if (!response.ok || !data.success) {
      throw new ApiError(
        data.error || `Server error: ${response.status}`,
        response.status
      )
    }

    if (!data.reply) {
      throw new ApiError("No reply received from server")
    }

    console.log("[API] Reply generated successfully")
    return data.reply

  } catch (error) {
    // Handle network errors
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new ApiError(
        "Cannot connect to server. Please check if the backend is running.",
        undefined,
        true
      )
    }

    // Re-throw ApiError as-is
    if (error instanceof ApiError) {
      throw error
    }

    // Wrap unknown errors
    throw new ApiError(
      error instanceof Error ? error.message : "Unknown error occurred"
    )
  }
}

// Track an event (fire-and-forget)
export async function trackEvent(
  eventType: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    await fetch(`${API_URL}/api/v1/track`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ eventType, metadata })
    })
  } catch (error) {
    // Silent fail for tracking - don't interrupt user flow
    console.error("[API] Failed to track event:", error)
  }
}

// Health check - useful for debugging connection issues
export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/health`)
    return response.ok
  } catch {
    return false
  }
}
