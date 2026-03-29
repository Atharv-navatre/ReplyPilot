// Tone options for reply generation
export type Tone = "professional" | "friendly" | "short"

// Message from conversation
export interface Message {
  sender: "user" | "other"
  content: string
  timestamp?: string
}

// Request to generate a reply
export interface GenerateRequest {
  context: Message[]
  tone: Tone
  platform: "linkedin"
}

// Response from generate API
export interface GenerateResponse {
  reply: string
  success: boolean
  error?: string
}

// Message types for extension communication
export type MessageType = 
  | "GENERATE_REPLY"
  | "GENERATION_COMPLETE"
  | "TRACK_EVENT"

export interface ExtensionMessage {
  type: MessageType
  payload?: unknown
}
