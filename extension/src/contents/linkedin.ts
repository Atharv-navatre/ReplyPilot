import type { PlasmoCSConfig } from "plasmo"
import { linkedInAdapter } from "../adapters"
import { injectGenerateButton, removeGenerateButton } from "../lib/buttonInjector"
import { extractConversation, debugLogContext } from "../lib/contextExtractor"
import { openReplyPanel, closeReplyPanel, isPanelOpen, getState } from "../lib/replyPanel"
import { insertReply, hasDraftText } from "../lib/replyInserter"
import { trackReplyInserted, trackExtensionLoaded } from "../lib/tracker"

// Plasmo content script configuration
export const config: PlasmoCSConfig = {
  matches: ["https://www.linkedin.com/*"],
  run_at: "document_idle"
}

// Unique ID for our injected button
const BUTTON_ID = "replypilot-generate-btn"

// Debounce timer for observer callbacks
let debounceTimer: ReturnType<typeof setTimeout> | null = null

// Track if we've already injected
let isInjected = false

// Main initialization
function init() {
  console.log("[ReplyPilot] Content script loaded on LinkedIn")
  
  // Track extension load
  trackExtensionLoaded()
  
  // Initial check and injection
  checkAndInject()
  
  // Set up observer for dynamic page changes
  observePageChanges()
}

// Check if we should inject and do it
function checkAndInject() {
  // Only proceed if on a messaging page
  if (!linkedInAdapter.isMessagingPage()) {
    // Clean up if we navigated away from messaging
    if (isInjected) {
      removeGenerateButton(BUTTON_ID)
      isInjected = false
    }
    return
  }

  // Check if button already exists
  if (document.getElementById(BUTTON_ID)) {
    isInjected = true
    return
  }

  // Find the message input area
  const messageInput = linkedInAdapter.findMessageInput()
  if (!messageInput) {
    // Input not found yet, will retry on next observer trigger
    return
  }

  // Find container for button injection
  const container = linkedInAdapter.findButtonContainer()
  if (!container) {
    return
  }

  // Inject the button
  const result = injectGenerateButton({
    buttonId: BUTTON_ID,
    container,
    onButtonClick: handleGenerateClick
  })

  if (result.success) {
    isInjected = true
    console.log("[ReplyPilot] Generate button injected successfully")
  }
}

// Handle button click - opens reply panel
function handleGenerateClick() {
  console.log("[ReplyPilot] Generate button clicked!")
  
  // If panel is already open, close it
  if (isPanelOpen()) {
    closeReplyPanel()
    return
  }

  // Extract conversation context
  const extraction = extractConversation(linkedInAdapter)
  
  // Debug log
  if (extraction.success) {
    debugLogContext(extraction.messages)
  }
  
  // Open the reply panel with extracted messages
  openReplyPanel(extraction.messages, handleInsertReply)
}

// Handle reply insertion
function handleInsertReply(reply: string) {
  console.log("[ReplyPilot] Inserting reply...")
  
  // Get current tone from panel state
  const panelState = getState()
  const tone = panelState.selectedTone
  
  // Check for existing draft
  if (hasDraftText(linkedInAdapter)) {
    console.log("[ReplyPilot] Note: Replacing existing draft text")
  }
  
  // Insert the reply
  const result = insertReply(linkedInAdapter, reply)
  
  if (result.success) {
    console.log("[ReplyPilot] ✅ Reply inserted successfully!")
    // Track successful insertion
    trackReplyInserted(tone, "linkedin")
    showInsertionFeedback(true)
  } else {
    console.error("[ReplyPilot] ❌ Insertion failed:", result.error)
    showInsertionFeedback(false, result.error)
  }
}

// Show visual feedback after insertion
function showInsertionFeedback(success: boolean, error?: string) {
  // Create toast notification
  const toast = document.createElement("div")
  toast.id = "replypilot-toast"
  toast.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    padding: 12px 20px;
    background: ${success ? "#10b981" : "#ef4444"};
    color: white;
    border-radius: 10px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 14px;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 10000;
    display: flex;
    align-items: center;
    gap: 8px;
    animation: replypilot-toast-in 0.3s ease-out;
  `
  
  // Add animation if not already present
  if (!document.getElementById("replypilot-toast-styles")) {
    const styles = document.createElement("style")
    styles.id = "replypilot-toast-styles"
    styles.textContent = `
      @keyframes replypilot-toast-in {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes replypilot-toast-out {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(10px); }
      }
    `
    document.head.appendChild(styles)
  }
  
  toast.innerHTML = success 
    ? "✅ Reply inserted!" 
    : `❌ ${error || "Insertion failed"}`
  
  // Remove existing toast if any
  document.getElementById("replypilot-toast")?.remove()
  
  // Add toast
  document.body.appendChild(toast)
  
  // Auto-remove after delay
  setTimeout(() => {
    toast.style.animation = "replypilot-toast-out 0.3s ease-out forwards"
    setTimeout(() => toast.remove(), 300)
  }, 2500)
}

// Observe DOM changes for dynamic page navigation
function observePageChanges() {
  const observer = new MutationObserver((mutations) => {
    // Debounce to avoid excessive calls
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }
    
    debounceTimer = setTimeout(() => {
      checkAndInject()
    }, 300)
  })

  // Observe the body for changes (LinkedIn is a SPA)
  observer.observe(document.body, {
    childList: true,
    subtree: true
  })
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init)
} else {
  init()
}

// Also listen for URL changes (LinkedIn SPA navigation)
let lastUrl = location.href
new MutationObserver(() => {
  const url = location.href
  if (url !== lastUrl) {
    lastUrl = url
    console.log("[ReplyPilot] URL changed, rechecking...")
    // Close panel on navigation
    if (isPanelOpen()) {
      closeReplyPanel()
    }
    checkAndInject()
  }
}).observe(document, { subtree: true, childList: true })
