// Reply Inserter Utility
// Handles inserting generated replies into platform message inputs

import type { PlatformAdapter } from "../adapters/types"

// Insertion result
export interface InsertionResult {
  success: boolean
  error?: string
}

// Insert reply into the message input for a given platform
export function insertReply(
  adapter: PlatformAdapter,
  reply: string
): InsertionResult {
  // Validate input
  if (!reply || reply.trim().length === 0) {
    return { success: false, error: "Empty reply" }
  }

  // Find the message input
  const input = adapter.findMessageInput()
  if (!input) {
    return { success: false, error: "Message input not found" }
  }

  // Platform-specific insertion
  switch (adapter.platform) {
    case "linkedin":
      return insertIntoLinkedIn(input, reply)
    default:
      return insertIntoContentEditable(input, reply)
  }
}

// Insert into LinkedIn's contenteditable message input
function insertIntoLinkedIn(input: HTMLElement, reply: string): InsertionResult {
  try {
    console.log("[ReplyPilot] Inserting reply into LinkedIn input...")
    focusLinkedInComposer(input)
    clearLinkedInComposer(input)

    const inserted = insertTextThroughEditor(input, reply)
    if (!inserted) {
      setLinkedInFallbackContent(input, reply)
    }

    dispatchInputEvents(input, reply)
    moveCursorToEnd(input)

    console.log("[ReplyPilot] Reply inserted successfully")
    return { success: true }
  } catch (error) {
    console.error("[ReplyPilot] Insertion failed:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Insertion failed" 
    }
  }
}

// Generic contenteditable insertion (fallback for other platforms)
function insertIntoContentEditable(input: HTMLElement, reply: string): InsertionResult {
  try {
    // Check if it's contenteditable
    if (input.contentEditable !== "true") {
      // Try as regular input/textarea
      if (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement) {
        input.value = reply
        input.focus()
        dispatchInputEvents(input, reply)
        return { success: true }
      }
      return { success: false, error: "Input is not editable" }
    }

    // Clear and set content
    input.innerHTML = ""
    input.textContent = reply

    // Focus and move cursor
    input.focus()
    moveCursorToEnd(input)

    // Dispatch events
    dispatchInputEvents(input, reply)

    return { success: true }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Insertion failed" 
    }
  }
}

// Move cursor to end of contenteditable element
function moveCursorToEnd(element: HTMLElement): void {
  const range = document.createRange()
  const selection = window.getSelection()

  if (!selection) return

  // Select all content and collapse to end
  range.selectNodeContents(element)
  range.collapse(false) // false = collapse to end

  selection.removeAllRanges()
  selection.addRange(range)
}

// Dispatch input events to notify the page of changes
function dispatchInputEvents(element: HTMLElement, text: string = ""): void {
  element.dispatchEvent(new InputEvent("input", {
    bubbles: true,
    cancelable: true,
    data: text,
    inputType: "insertText"
  }))

  // Change event
  element.dispatchEvent(new Event("change", {
    bubbles: true,
    cancelable: true
  }))

  // Keyup event (some apps listen for this)
  element.dispatchEvent(new KeyboardEvent("keyup", {
    bubbles: true,
    cancelable: true,
    key: " "
  }))

  // For React-based apps like LinkedIn
  element.dispatchEvent(new Event("input", { bubbles: true }))
}

function focusLinkedInComposer(input: HTMLElement): void {
  input.focus()
  input.dispatchEvent(new FocusEvent("focus", { bubbles: true }))
  input.dispatchEvent(new FocusEvent("focusin", { bubbles: true }))
}

function clearLinkedInComposer(input: HTMLElement): void {
  focusLinkedInComposer(input)
  selectComposerContents(input)
  removeLinkedInPlaceholder(input)

  const deleted = document.execCommand("delete")
  if (!deleted) {
    input.innerHTML = ""
  }

  placeCaretAtStart(input)
}

function insertTextThroughEditor(input: HTMLElement, reply: string): boolean {
  focusLinkedInComposer(input)

  const normalizedReply = normalizeReplyText(reply)
  dispatchBeforeInputEvent(input, normalizedReply)

  if (document.queryCommandSupported?.("insertText")) {
    const inserted = document.execCommand("insertText", false, normalizedReply)
    if (inserted) {
      return true
    }
  }

  return false
}

function setLinkedInFallbackContent(input: HTMLElement, reply: string): void {
  removeLinkedInPlaceholder(input)
  input.innerHTML = ""

  const lines = normalizeReplyText(reply).split("\n")
  const selection = window.getSelection()
  const fragment = document.createDocumentFragment()

  for (const line of lines) {
    const paragraph = document.createElement("p")
    if (line) {
      paragraph.textContent = line
    } else {
      paragraph.appendChild(document.createElement("br"))
    }
    fragment.appendChild(paragraph)
  }

  if (lines.length === 0) {
    const paragraph = document.createElement("p")
    paragraph.appendChild(document.createElement("br"))
    fragment.appendChild(paragraph)
  }

  const range = document.createRange()
  range.selectNodeContents(input)
  range.collapse(true)

  selection?.removeAllRanges()
  selection?.addRange(range)
  range.insertNode(fragment)
}

function selectComposerContents(input: HTMLElement): void {
  const selection = window.getSelection()
  if (!selection) return

  const range = document.createRange()
  range.selectNodeContents(input)

  selection.removeAllRanges()
  selection.addRange(range)
}

function placeCaretAtStart(input: HTMLElement): void {
  const selection = window.getSelection()
  if (!selection) return

  const range = document.createRange()
  range.selectNodeContents(input)
  range.collapse(true)

  selection.removeAllRanges()
  selection.addRange(range)
}

function dispatchBeforeInputEvent(element: HTMLElement, text: string): void {
  element.dispatchEvent(new InputEvent("beforeinput", {
    bubbles: true,
    cancelable: true,
    data: text,
    inputType: "insertText"
  }))
}

function removeLinkedInPlaceholder(input: HTMLElement): void {
  input.querySelector(".msg-form__placeholder")?.remove()
  input.querySelectorAll("p.msg-form__placeholder").forEach((node) => node.remove())
  input.querySelectorAll("[data-placeholder]").forEach((node) => {
    if (node instanceof HTMLElement) {
      node.removeAttribute("data-placeholder")
    }
  })
  if (input.getAttribute("data-placeholder")) {
    input.removeAttribute("data-placeholder")
  }
}

function normalizeReplyText(reply: string): string {
  return reply.replace(/\r\n/g, "\n")
}

// Clear the message input
export function clearInput(adapter: PlatformAdapter): boolean {
  const input = adapter.findMessageInput()
  if (!input) return false

  try {
    if (input.contentEditable === "true") {
      input.innerHTML = ""
      // Restore LinkedIn's placeholder if needed
      const placeholder = document.createElement("p")
      placeholder.className = "msg-form__placeholder"
      placeholder.textContent = "Write a message..."
      input.appendChild(placeholder)
    } else if (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement) {
      input.value = ""
    }

    dispatchInputEvents(input)
    return true
  } catch {
    return false
  }
}

// Get current content of the message input
export function getInputContent(adapter: PlatformAdapter): string | null {
  const input = adapter.findMessageInput()
  if (!input) return null

  if (input.contentEditable === "true") {
    // For contenteditable, get text content excluding placeholders
    const placeholder = input.querySelector(".msg-form__placeholder")
    if (placeholder) {
      return "" // Empty if only placeholder
    }
    return input.textContent?.trim() || ""
  }

  if (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement) {
    return input.value
  }

  return input.textContent?.trim() || null
}

// Check if input has existing draft text
export function hasDraftText(adapter: PlatformAdapter): boolean {
  const content = getInputContent(adapter)
  return content !== null && content.length > 0
}

// Append to existing text (instead of replacing)
export function appendToInput(
  adapter: PlatformAdapter,
  text: string,
  separator: string = "\n\n"
): InsertionResult {
  const existingContent = getInputContent(adapter)
  
  if (existingContent && existingContent.length > 0) {
    return insertReply(adapter, existingContent + separator + text)
  }
  
  return insertReply(adapter, text)
}
