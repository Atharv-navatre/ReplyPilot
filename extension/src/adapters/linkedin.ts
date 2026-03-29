// LinkedIn Platform Adapter
// Handles LinkedIn-specific DOM detection and manipulation

import type { PlatformAdapter, PlatformSelectors, ConversationMessage } from "./types"

// LinkedIn DOM selectors
// Using multiple fallback selectors for resilience against LinkedIn DOM changes
const SELECTORS: PlatformSelectors = {
  // Message input selectors (LinkedIn's contenteditable div)
  messageInput: [
    'div.msg-form__contenteditable[contenteditable="true"]',
    'div[data-artdeco-is-focused]',
    'div.msg-form__msg-content-container div[contenteditable="true"]',
    'form.msg-form div[contenteditable="true"]'
  ],
  
  // Container where we inject our button (message form area)
  buttonContainer: [
    'div.msg-form__msg-content-container',
    'form.msg-form',
    'div.msg-form__left-actions',
    'div.msg-s-message-group__container'
  ],
  
  // Conversation area (for context extraction)
  conversationArea: [
    'div.msg-s-message-list-container',
    'ul.msg-s-message-list',
    'div.msg-conversation-listitem__body'
  ],
  
  // Individual message items
  messageItem: [
    'li.msg-s-message-list__event',
    'div.msg-s-event-listitem',
    'div.msg-s-message-group'
  ],
  
  // Message text content
  messageText: [
    'p.msg-s-event-listitem__body',
    'div.msg-s-event-listitem__body',
    'span.msg-s-event-listitem__body'
  ],
  
  // Sender indicator (to determine if message is from "me" or "them")
  senderIndicator: [
    'span.msg-s-message-group__profile-link',
    'a.msg-s-event-listitem__link',
    'img.msg-s-event-listitem__profile-picture'
  ]
}

// Maximum number of messages to extract
const MAX_MESSAGES = 5

export class LinkedInAdapter implements PlatformAdapter {
  readonly platform = "linkedin"

  isMessagingPage(): boolean {
    const url = window.location.href
    
    // LinkedIn messaging URLs
    return (
      url.includes("linkedin.com/messaging") ||
      url.includes("linkedin.com/in/") && this.hasOpenMessageWindow()
    )
  }

  // Check if there's an open message window (overlay on profile pages)
  private hasOpenMessageWindow(): boolean {
    return document.querySelector('div.msg-overlay-conversation-bubble') !== null
  }

  findMessageInput(): HTMLElement | null {
    const candidates = this.findMessageInputCandidates()
    if (candidates.length === 0) {
      return null
    }

    const activeElement = document.activeElement as HTMLElement | null
    if (activeElement) {
      const activeCandidate = candidates.find(
        (candidate) => candidate === activeElement || candidate.contains(activeElement)
      )
      if (activeCandidate) {
        return activeCandidate
      }
    }

    const selection = window.getSelection()
    const anchorNode = selection?.anchorNode
    if (anchorNode) {
      const selectionCandidate = candidates.find((candidate) => candidate.contains(anchorNode))
      if (selectionCandidate) {
        return selectionCandidate
      }
    }

    return candidates.sort((a, b) => this.scoreMessageInput(b) - this.scoreMessageInput(a))[0] || null
  }

  findButtonContainer(): HTMLElement | null {
    for (const selector of SELECTORS.buttonContainer) {
      const element = document.querySelector<HTMLElement>(selector)
      if (element) {
        return element
      }
    }
    return null
  }

  extractConversation(): ConversationMessage[] {
    const messages: ConversationMessage[] = []
    
    // Find the conversation container
    const conversationContainer = this.findConversationContainer()
    if (!conversationContainer) {
      console.log("[ReplyPilot] Could not find conversation container")
      return messages
    }

    // Find all message elements
    const messageElements = this.findMessageElements(conversationContainer)
    if (messageElements.length === 0) {
      console.log("[ReplyPilot] No message elements found")
      return messages
    }

    // Extract each message
    for (const element of messageElements) {
      const message = this.parseMessageElement(element)
      if (message) {
        messages.push(message)
      }
    }

    // Return only the last N messages (most recent)
    const recentMessages = messages.slice(-MAX_MESSAGES)
    
    console.log(`[ReplyPilot] Extracted ${recentMessages.length} messages`)
    return recentMessages
  }

  getSelectors(): PlatformSelectors {
    return SELECTORS
  }

  private findMessageInputCandidates(): HTMLElement[] {
    const candidates: HTMLElement[] = []

    for (const selector of SELECTORS.messageInput) {
      const elements = document.querySelectorAll<HTMLElement>(selector)
      for (const element of elements) {
        if (!candidates.includes(element) && this.isValidMessageInput(element)) {
          candidates.push(element)
        }
      }
    }

    return candidates
  }

  private isValidMessageInput(element: HTMLElement): boolean {
    if (element.contentEditable !== "true") {
      return false
    }

    const style = window.getComputedStyle(element)
    if (style.display === "none" || style.visibility === "hidden") {
      return false
    }

    const rect = element.getBoundingClientRect()
    return rect.width > 0 && rect.height > 0
  }

  private scoreMessageInput(element: HTMLElement): number {
    let score = 0

    if (element.matches("div.msg-form__contenteditable")) {
      score += 5
    }

    if (element.getAttribute("role") === "textbox") {
      score += 3
    }

    if (element.closest("form.msg-form")) {
      score += 2
    }

    if (element.closest("div.msg-overlay-conversation-bubble")) {
      score += 2
    }

    if (element.getAttribute("aria-label")) {
      score += 1
    }

    return score
  }

  // Find the main conversation container
  private findConversationContainer(): HTMLElement | null {
    // Try message overlay first (for profile page messaging)
    const overlay = document.querySelector<HTMLElement>('div.msg-overlay-conversation-bubble')
    if (overlay) {
      return overlay
    }

    // Try main messaging page
    for (const selector of SELECTORS.conversationArea) {
      const element = document.querySelector<HTMLElement>(selector)
      if (element) {
        return element
      }
    }
    return null
  }

  // Find all message elements in the container
  private findMessageElements(container: HTMLElement): HTMLElement[] {
    const elements: HTMLElement[] = []
    
    for (const selector of SELECTORS.messageItem) {
      const found = container.querySelectorAll<HTMLElement>(selector)
      if (found.length > 0) {
        elements.push(...Array.from(found))
        break // Use first working selector
      }
    }
    
    return elements
  }

  // Parse a single message element into structured data
  private parseMessageElement(element: HTMLElement): ConversationMessage | null {
    // Extract text content
    const text = this.extractMessageText(element)
    if (!text) {
      return null
    }

    // Determine sender
    const sender = this.determineSender(element)

    return {
      sender,
      text: text.trim()
    }
  }

  // Extract the text content from a message element
  private extractMessageText(element: HTMLElement): string | null {
    // Try specific selectors first
    for (const selector of SELECTORS.messageText) {
      const textElement = element.querySelector<HTMLElement>(selector)
      if (textElement && textElement.textContent) {
        return this.cleanText(textElement.textContent)
      }
    }

    // Fallback: try to find any paragraph or span with substantial text
    const paragraphs = element.querySelectorAll('p, span')
    for (const p of paragraphs) {
      const text = p.textContent?.trim()
      if (text && text.length > 5 && !this.isSystemMessage(text)) {
        return this.cleanText(text)
      }
    }

    return null
  }

  // Determine if message is from "me" or "them"
  private determineSender(element: HTMLElement): "me" | "them" {
    // LinkedIn typically shows "you" or marks outgoing messages differently
    
    // Check for outgoing message indicators
    const classList = element.className.toLowerCase()
    if (classList.includes('outgoing') || classList.includes('sent')) {
      return "me"
    }

    // Check for profile link (incoming messages usually have sender profile)
    const hasProfileLink = element.querySelector(
      'a[href*="/in/"], span.msg-s-message-group__profile-link'
    )
    
    // Check for sender name that's not "You"
    const senderName = element.querySelector('.msg-s-message-group__name')?.textContent?.trim()
    if (senderName && senderName.toLowerCase() === 'you') {
      return "me"
    }

    // Check message group structure
    // LinkedIn groups messages by sender, check parent for indicators
    const messageGroup = element.closest('.msg-s-message-group')
    if (messageGroup) {
      const groupName = messageGroup.querySelector('.msg-s-message-group__name')?.textContent?.trim()
      if (groupName && groupName.toLowerCase() === 'you') {
        return "me"
      }
      // If there's a profile link/image that's not the current user, it's "them"
      if (hasProfileLink) {
        return "them"
      }
    }

    // Default to "them" if we can't determine
    // This is safer because we usually want context from the other person
    return "them"
  }

  // Clean up extracted text
  private cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ')  // Normalize whitespace
      .replace(/\n+/g, ' ')  // Remove newlines
      .trim()
  }

  // Check if text is a system message (not actual conversation)
  private isSystemMessage(text: string): boolean {
    const systemPatterns = [
      /^you sent$/i,
      /^seen by/i,
      /^typing\.\.\.$/i,
      /^sent \d+ (hours?|minutes?|days?) ago$/i,
      /^\d+:\d+\s*(AM|PM)?$/i,
      /^today$/i,
      /^yesterday$/i
    ]
    
    return systemPatterns.some(pattern => pattern.test(text.trim()))
  }
}

// Export singleton instance
export const linkedInAdapter = new LinkedInAdapter()
