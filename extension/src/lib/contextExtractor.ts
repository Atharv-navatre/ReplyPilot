// Context Extractor Utility
// Handles extracting and formatting conversation context for AI

import type { ConversationMessage, ExtractionResult, PlatformAdapter } from "../adapters/types"

// Format for API submission
export interface FormattedContext {
  platform: string
  messages: ConversationMessage[]
  messageCount: number
}

// Extract conversation using the appropriate adapter
export function extractConversation(adapter: PlatformAdapter): ExtractionResult {
  try {
    const messages = adapter.extractConversation()
    
    return {
      success: messages.length > 0,
      messages,
      error: messages.length === 0 ? "No messages found" : undefined
    }
  } catch (error) {
    return {
      success: false,
      messages: [],
      error: error instanceof Error ? error.message : "Extraction failed"
    }
  }
}

// Format context for API submission
export function formatContextForAPI(
  adapter: PlatformAdapter,
  messages: ConversationMessage[]
): FormattedContext {
  return {
    platform: adapter.platform,
    messages,
    messageCount: messages.length
  }
}

// Convert messages to simple string array (for simpler API calls)
export function messagesToStringArray(messages: ConversationMessage[]): string[] {
  return messages.map(msg => {
    const prefix = msg.sender === "me" ? "[You]" : "[Them]"
    return `${prefix}: ${msg.text}`
  })
}

// Get a preview of the context (for debugging)
export function getContextPreview(messages: ConversationMessage[]): string {
  if (messages.length === 0) {
    return "No messages extracted"
  }

  return messages
    .map((msg, i) => {
      const sender = msg.sender === "me" ? "You" : "Them"
      const preview = msg.text.length > 50 
        ? msg.text.substring(0, 50) + "..." 
        : msg.text
      return `${i + 1}. [${sender}]: ${preview}`
    })
    .join("\n")
}

// Debug helper: log extracted context to console
export function debugLogContext(messages: ConversationMessage[]): void {
  console.group("[ReplyPilot] Extracted Context")
  console.log(`Total messages: ${messages.length}`)
  
  messages.forEach((msg, i) => {
    const sender = msg.sender === "me" ? "📤 You" : "📥 Them"
    console.log(`${i + 1}. ${sender}: ${msg.text}`)
  })
  
  console.groupEnd()
}

// Validate extracted messages
export function validateMessages(messages: ConversationMessage[]): {
  valid: boolean
  issues: string[]
} {
  const issues: string[] = []

  if (messages.length === 0) {
    issues.push("No messages extracted")
  }

  // Check for empty messages
  const emptyCount = messages.filter(m => !m.text || m.text.trim().length === 0).length
  if (emptyCount > 0) {
    issues.push(`${emptyCount} empty message(s) found`)
  }

  // Check for very short messages
  const veryShort = messages.filter(m => m.text.length < 3).length
  if (veryShort > 0) {
    issues.push(`${veryShort} very short message(s) found`)
  }

  // Check for balance (at least one message from "them" ideally)
  const fromThem = messages.filter(m => m.sender === "them").length
  if (fromThem === 0 && messages.length > 0) {
    issues.push("No messages from the other person found")
  }

  return {
    valid: issues.length === 0,
    issues
  }
}
