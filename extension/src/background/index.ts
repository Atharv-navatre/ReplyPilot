// Background service worker
// Handles API calls and extension communication

export {}

chrome.runtime.onInstalled.addListener(() => {
  console.log("ReplyPilot installed")
})

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "GENERATE_REPLY") {
    handleGenerateReply(message.payload)
      .then(sendResponse)
      .catch((error) => sendResponse({ error: error.message }))
    return true // Keep channel open for async response
  }
  
  if (message.type === "TRACK_EVENT") {
    handleTrackEvent(message.payload)
    return false
  }
})

async function handleGenerateReply(payload: {
  context: string[]
  tone: string
  platform: string
}): Promise<{ reply: string } | { error: string }> {
  const API_URL = process.env.PLASMO_PUBLIC_API_URL || "http://localhost:3001"
  
  try {
    const response = await fetch(`${API_URL}/api/v1/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
    
    if (!response.ok) {
      throw new Error("API request failed")
    }
    
    return await response.json()
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unknown error" }
  }
}

async function handleTrackEvent(payload: { eventType: string; metadata?: object }): Promise<void> {
  const API_URL = process.env.PLASMO_PUBLIC_API_URL || "http://localhost:3001"
  
  try {
    await fetch(`${API_URL}/api/v1/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
  } catch (error) {
    console.error("Failed to track event:", error)
  }
}
