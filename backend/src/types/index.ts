// Common types for ReplyPilot API

// Tone options for reply generation
export type Tone = "professional" | "friendly" | "short"

// Supported platforms
export type Platform = "linkedin" // V2: | "gmail" | "whatsapp" | "instagram"

// Conversation message
export interface ConversationMessage {
  sender: "me" | "them"
  text: string
}

// Generate reply request body
export interface GenerateRequest {
  messages: ConversationMessage[]
  tone: Tone
  platform?: Platform
}

// Generate reply response
export interface GenerateResponse {
  success: boolean
  reply?: string
  error?: string
}

// Track event request body
export interface TrackRequest {
  eventType: string
  metadata?: Record<string, unknown>
}

// Standard API response wrapper
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}
