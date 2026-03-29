// Platform Adapter Interface
// Defines the contract for all platform adapters (LinkedIn, Gmail, etc.)

export interface PlatformAdapter {
  // Platform identifier
  readonly platform: string
  
  // Check if current page is a valid messaging page for this platform
  isMessagingPage(): boolean
  
  // Find the message input container element
  findMessageInput(): HTMLElement | null
  
  // Find the container where we should inject our button
  findButtonContainer(): HTMLElement | null
  
  // Extract conversation context from the page
  extractConversation(): ConversationMessage[]
  
  // Get selectors used for this platform (for debugging)
  getSelectors(): PlatformSelectors
}

export interface PlatformSelectors {
  // CSS selectors for finding elements
  messageInput: string[]
  buttonContainer: string[]
  conversationArea: string[]
  messageItem: string[]
  messageText: string[]
  senderIndicator: string[]
}

// Extracted message structure
export interface ConversationMessage {
  sender: "me" | "them"
  text: string
  timestamp?: string
}

// Extraction result
export interface ExtractionResult {
  success: boolean
  messages: ConversationMessage[]
  error?: string
}

// Button injection result
export interface InjectionResult {
  success: boolean
  buttonElement?: HTMLElement
  error?: string
}
