// Usage Tracker - sends analytics events to backend
// Fire-and-forget design: never blocks user actions

import { trackEvent } from "./api"

// Event types
export type TrackingEventType = 
  | "reply_generated"
  | "reply_inserted"
  | "panel_opened"
  | "extension_loaded"

// Track reply generation
export function trackReplyGenerated(
  tone: string,
  messageCount: number,
  platform: string = "linkedin"
): void {
  track("reply_generated", { tone, messageCount, platform })
}

// Track reply insertion
export function trackReplyInserted(
  tone: string,
  platform: string = "linkedin"
): void {
  track("reply_inserted", { tone, platform })
}

// Track panel opened
export function trackPanelOpened(platform: string = "linkedin"): void {
  track("panel_opened", { platform })
}

// Track extension loaded
export function trackExtensionLoaded(): void {
  track("extension_loaded", {})
}

// Core tracking function (fire-and-forget)
function track(
  event: TrackingEventType,
  metadata: Record<string, unknown>
): void {
  // Don't await - fire and forget
  trackEvent(event, metadata).catch(() => {
    // Silent fail - tracking should never break UX
  })
  
  // Also log locally for debugging
  console.log(`[Tracker] ${event}`, metadata)
}
