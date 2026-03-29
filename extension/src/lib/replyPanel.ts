// Reply Panel - Inline UI for ReplyPilot
// Displays context, tone selection, and generated reply

import type { ConversationMessage } from "../adapters/types"
import { generateReply, ApiError } from "./api"
import { trackReplyGenerated, trackPanelOpened } from "./tracker"

// Panel state
export interface ReplyPanelState {
  isOpen: boolean
  isLoading: boolean
  selectedTone: "professional" | "friendly" | "short"
  messages: ConversationMessage[]
  generatedReply: string | null
  error: string | null
}

// Panel configuration
const PANEL_ID = "replypilot-panel"
const OVERLAY_ID = "replypilot-overlay"

// Tone options
const TONES = [
  { id: "professional", label: "Professional", icon: "💼", desc: "Clear and business-appropriate" },
  { id: "friendly", label: "Friendly", icon: "😊", desc: "Warm and conversational" },
  { id: "short", label: "Short", icon: "⚡", desc: "Brief and direct" }
] as const

// Fallback replies when API fails (matches improved quality standards)
const FALLBACK_REPLIES: Record<string, string> = {
  professional: "That sounds interesting—I'd be happy to connect and learn more. What time works best for a quick chat?",
  friendly: "Oh nice, this sounds great! Would love to hear more about it. When are you free to chat?",
  short: "Sounds good—happy to connect. When works for you?"
}

// Panel state
let state: ReplyPanelState = {
  isOpen: false,
  isLoading: false,
  selectedTone: "professional",
  messages: [],
  generatedReply: null,
  error: null
}

// Callbacks
let onInsertReply: ((reply: string) => void) | null = null

// Open the reply panel
export function openReplyPanel(
  messages: ConversationMessage[],
  insertCallback?: (reply: string) => void
): void {
  // Store callback
  onInsertReply = insertCallback || null
  
  // Update state
  state = {
    isOpen: true,
    isLoading: false,
    selectedTone: "professional",
    messages,
    generatedReply: null,
    error: messages.length === 0 ? "No messages found in conversation" : null
  }
  
  // Track panel opened
  trackPanelOpened("linkedin")
  
  // Render panel
  renderPanel()
}

// Close the reply panel
export function closeReplyPanel(): void {
  state.isOpen = false
  removePanel()
}

// Check if panel is open
export function isPanelOpen(): boolean {
  return state.isOpen
}

// Render the panel into the DOM
function renderPanel(): void {
  // Remove existing panel if any
  removePanel()
  
  // Create overlay
  const overlay = document.createElement("div")
  overlay.id = OVERLAY_ID
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.3);
    z-index: 9998;
    backdrop-filter: blur(2px);
  `
  overlay.addEventListener("click", closeReplyPanel)
  
  // Create panel
  const panel = document.createElement("div")
  panel.id = PANEL_ID
  panel.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 420px;
    max-width: 90vw;
    max-height: 80vh;
    background: white;
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
    z-index: 9999;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    overflow: hidden;
    animation: replypilot-fade-in 0.2s ease-out;
  `
  
  // Add animation keyframes
  if (!document.getElementById("replypilot-styles")) {
    const styles = document.createElement("style")
    styles.id = "replypilot-styles"
    styles.textContent = `
      @keyframes replypilot-fade-in {
        from { opacity: 0; transform: translate(-50%, -48%); }
        to { opacity: 1; transform: translate(-50%, -50%); }
      }
      @keyframes replypilot-spin {
        to { transform: rotate(360deg); }
      }
    `
    document.head.appendChild(styles)
  }
  
  // Build panel content
  panel.innerHTML = buildPanelHTML()
  
  // Add to DOM
  document.body.appendChild(overlay)
  document.body.appendChild(panel)
  
  // Attach event listeners
  attachEventListeners()
}

// Remove panel from DOM
function removePanel(): void {
  document.getElementById(PANEL_ID)?.remove()
  document.getElementById(OVERLAY_ID)?.remove()
}

// Build panel HTML
function buildPanelHTML(): string {
  return `
    <!-- Header -->
    <div style="
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      border-bottom: 1px solid #e5e7eb;
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    ">
      <div style="display: flex; align-items: center; gap: 10px;">
        <div style="
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <span style="color: white; font-weight: bold; font-size: 14px;">R</span>
        </div>
        <div>
          <div style="font-weight: 600; font-size: 15px; color: #111827;">ReplyPilot</div>
          <div style="font-size: 11px; color: #6b7280;">AI-powered replies</div>
        </div>
      </div>
      <button id="replypilot-close" style="
        background: none;
        border: none;
        cursor: pointer;
        padding: 6px;
        border-radius: 6px;
        color: #6b7280;
        font-size: 18px;
        line-height: 1;
        transition: all 0.15s;
      " onmouseover="this.style.background='#f3f4f6'" onmouseout="this.style.background='none'">✕</button>
    </div>
    
    <!-- Content -->
    <div style="padding: 20px; overflow-y: auto; max-height: calc(80vh - 200px);">
      ${state.error ? buildErrorHTML() : buildContentHTML()}
    </div>
  `
}

// Build error state HTML
function buildErrorHTML(): string {
  return `
    <div style="
      text-align: center;
      padding: 30px 20px;
      color: #6b7280;
    ">
      <div style="font-size: 40px; margin-bottom: 12px;">😕</div>
      <div style="font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">
        ${state.error}
      </div>
      <div style="font-size: 12px;">
        Make sure you have an active conversation open
      </div>
    </div>
  `
}

// Build main content HTML
function buildContentHTML(): string {
  return `
    <!-- Context Preview -->
    <div style="margin-bottom: 16px;">
      <div style="
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: #6b7280;
        margin-bottom: 8px;
      ">Conversation Context</div>
      <div style="
        background: #f9fafb;
        border: 1px solid #e5e7eb;
        border-radius: 10px;
        padding: 12px;
        max-height: 120px;
        overflow-y: auto;
      ">
        ${buildContextPreviewHTML()}
      </div>
    </div>
    
    <!-- Tone Selector -->
    <div style="margin-bottom: 16px;">
      <div style="
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: #6b7280;
        margin-bottom: 8px;
      ">Reply Tone</div>
      <div style="display: flex; gap: 8px;">
        ${TONES.map(tone => buildToneButtonHTML(tone)).join("")}
      </div>
    </div>
    
    <!-- Generate Button -->
    <button id="replypilot-generate" style="
      width: 100%;
      padding: 12px 16px;
      background: ${state.isLoading ? "#94a3b8" : "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)"};
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      cursor: ${state.isLoading ? "not-allowed" : "pointer"};
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.2s;
      box-shadow: 0 2px 8px rgba(14, 165, 233, 0.3);
    " ${state.isLoading ? "disabled" : ""}>
      ${state.isLoading ? buildLoadingSpinnerHTML() + " Generating..." : "✨ Generate Reply"}
    </button>
    
    <!-- Error Message -->
    ${state.error ? buildErrorHTML() : ""}
    
    <!-- Generated Reply Preview -->
    ${state.generatedReply ? buildReplyPreviewHTML() : ""}
  `
}

// Build context preview HTML
function buildContextPreviewHTML(): string {
  if (state.messages.length === 0) {
    return `<div style="color: #9ca3af; font-size: 13px; text-align: center;">No messages found</div>`
  }
  
  return state.messages.map(msg => `
    <div style="
      display: flex;
      gap: 8px;
      margin-bottom: 8px;
      font-size: 13px;
      line-height: 1.4;
    ">
      <span style="
        flex-shrink: 0;
        font-weight: 600;
        color: ${msg.sender === "me" ? "#0ea5e9" : "#8b5cf6"};
      ">${msg.sender === "me" ? "You:" : "Them:"}</span>
      <span style="color: #374151;">${truncateText(msg.text, 80)}</span>
    </div>
  `).join("")
}

// Build tone button HTML
function buildToneButtonHTML(tone: typeof TONES[number]): string {
  const isSelected = state.selectedTone === tone.id
  return `
    <button 
      class="replypilot-tone-btn" 
      data-tone="${tone.id}"
      style="
        flex: 1;
        padding: 10px 8px;
        background: ${isSelected ? "#eff6ff" : "white"};
        border: 2px solid ${isSelected ? "#0ea5e9" : "#e5e7eb"};
        border-radius: 10px;
        cursor: pointer;
        transition: all 0.15s;
        text-align: center;
      "
    >
      <div style="font-size: 18px; margin-bottom: 4px;">${tone.icon}</div>
      <div style="
        font-size: 12px;
        font-weight: 600;
        color: ${isSelected ? "#0369a1" : "#374151"};
      ">${tone.label}</div>
    </button>
  `
}

// Build loading spinner HTML
function buildLoadingSpinnerHTML(): string {
  return `
    <svg style="
      width: 16px;
      height: 16px;
      animation: replypilot-spin 1s linear infinite;
    " viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-opacity="0.3"/>
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
    </svg>
  `
}

// Build error message HTML
function buildErrorHTML(): string {
  const isWarning = state.error?.includes("Offline mode")
  return `
    <div style="
      margin-top: 12px;
      padding: 10px 14px;
      background: ${isWarning ? "#fef3c7" : "#fef2f2"};
      border: 1px solid ${isWarning ? "#fcd34d" : "#fecaca"};
      border-radius: 8px;
      font-size: 13px;
      color: ${isWarning ? "#92400e" : "#dc2626"};
      display: flex;
      align-items: center;
      gap: 8px;
    ">
      <span>${isWarning ? "⚠️" : "❌"}</span>
      <span>${state.error}</span>
    </div>
  `
}

// Build reply preview HTML
function buildReplyPreviewHTML(): string {
  return `
    <div style="margin-top: 16px;">
      <div style="
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: #6b7280;
        margin-bottom: 8px;
      ">Generated Reply</div>
      <div style="
        background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
        border: 1px solid #bae6fd;
        border-radius: 10px;
        padding: 14px;
      ">
        <div style="
          font-size: 14px;
          line-height: 1.5;
          color: #0c4a6e;
          margin-bottom: 12px;
        ">${state.generatedReply}</div>
        <div style="display: flex; gap: 8px;">
          <button id="replypilot-insert" style="
            flex: 1;
            padding: 10px 16px;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            transition: all 0.2s;
          ">📝 Insert Reply</button>
          <button id="replypilot-regenerate" style="
            padding: 10px 16px;
            background: white;
            color: #374151;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
          ">🔄</button>
        </div>
      </div>
    </div>
  `
}

// Attach event listeners
function attachEventListeners(): void {
  // Close button
  document.getElementById("replypilot-close")?.addEventListener("click", closeReplyPanel)
  
  // Tone buttons
  document.querySelectorAll(".replypilot-tone-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const tone = (e.currentTarget as HTMLElement).dataset.tone as ReplyPanelState["selectedTone"]
      state.selectedTone = tone
      renderPanel()
    })
  })
  
  // Generate button
  document.getElementById("replypilot-generate")?.addEventListener("click", handleGenerate)
  
  // Insert button
  document.getElementById("replypilot-insert")?.addEventListener("click", handleInsert)
  
  // Regenerate button
  document.getElementById("replypilot-regenerate")?.addEventListener("click", handleGenerate)
}

// Handle generate click - calls the real API
async function handleGenerate(): Promise<void> {
  // Clear previous state
  state.isLoading = true
  state.generatedReply = null
  state.error = null
  renderPanel()

  try {
    // Convert messages to API format
    const apiMessages = state.messages.map(msg => ({
      sender: msg.sender,
      text: msg.text
    }))

    console.log("[ReplyPilot] Calling API with tone:", state.selectedTone)

    // Call the backend API
    const reply = await generateReply(apiMessages, state.selectedTone, "linkedin")

    state.generatedReply = reply
    state.isLoading = false
    state.error = null
    renderPanel()

    // Track successful generation
    trackReplyGenerated(state.selectedTone, state.messages.length, "linkedin")

    console.log("[ReplyPilot] Reply generated successfully")

  } catch (error) {
    console.error("[ReplyPilot] API error:", error)

    state.isLoading = false

    if (error instanceof ApiError) {
      if (error.isNetworkError) {
        // Network error - use fallback with notice
        state.error = "Offline mode: Using template reply"
        state.generatedReply = FALLBACK_REPLIES[state.selectedTone]
        // Still track as generated (with fallback)
        trackReplyGenerated(state.selectedTone, state.messages.length, "linkedin")
      } else {
        // Server error
        state.error = error.message
        state.generatedReply = null
      }
    } else {
      // Unknown error
      state.error = "Something went wrong. Please try again."
      state.generatedReply = null
    }

    renderPanel()
  }
}

// Handle insert click
function handleInsert(): void {
  if (state.generatedReply && onInsertReply) {
    onInsertReply(state.generatedReply)
    closeReplyPanel()
  } else if (state.generatedReply) {
    console.warn("[ReplyPilot] Insert callback not set")
  } else {
    console.warn("[ReplyPilot] No reply to insert")
  }
}

// Helper: Truncate text
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + "..."
}

// Export for debugging
export function getState(): ReplyPanelState {
  return { ...state }
}
