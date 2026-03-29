// Tracking service - handles usage analytics
// V1: In-memory tracking with console logging
// V2: Will integrate with Supabase for persistence

import { formatDate } from "../utils"

// Event types we track
export type TrackingEvent = 
  | "reply_generated"
  | "reply_inserted"
  | "panel_opened"
  | "extension_loaded"

// Event metadata structure
export interface TrackingMetadata {
  tone?: string
  platform?: string
  messageCount?: number
  success?: boolean
  error?: string
}

// In-memory event storage (for MVP - will move to DB in V2)
interface EventRecord {
  timestamp: string
  event: TrackingEvent
  metadata: TrackingMetadata
}

// In-memory storage
const events: EventRecord[] = []
const MAX_EVENTS = 1000 // Keep last 1000 events in memory

// Aggregated stats
interface Stats {
  totalGenerations: number
  totalInsertions: number
  generationsByTone: Record<string, number>
  insertionsByTone: Record<string, number>
  avgMessagesInContext: number
  lastUpdated: string
}

let stats: Stats = {
  totalGenerations: 0,
  totalInsertions: 0,
  generationsByTone: {},
  insertionsByTone: {},
  avgMessagesInContext: 0,
  lastUpdated: formatDate()
}

// Track running totals for average calculation
let totalMessageCount = 0
let messageCountSamples = 0

// Track an event
export async function trackEventService(
  eventType: string,
  metadata: TrackingMetadata = {}
): Promise<void> {
  const event = eventType as TrackingEvent
  const timestamp = formatDate()

  // Create event record
  const record: EventRecord = {
    timestamp,
    event,
    metadata
  }

  // Store in memory (with limit)
  events.push(record)
  if (events.length > MAX_EVENTS) {
    events.shift() // Remove oldest
  }

  // Update aggregated stats
  updateStats(event, metadata)

  // Log for debugging
  console.log(`[Track] ${event}`, JSON.stringify(metadata))
}

// Update aggregated statistics
function updateStats(event: TrackingEvent, metadata: TrackingMetadata): void {
  const tone = metadata.tone || "unknown"

  switch (event) {
    case "reply_generated":
      stats.totalGenerations++
      stats.generationsByTone[tone] = (stats.generationsByTone[tone] || 0) + 1
      
      // Track message count for averages
      if (metadata.messageCount !== undefined) {
        totalMessageCount += metadata.messageCount
        messageCountSamples++
        stats.avgMessagesInContext = Math.round(
          (totalMessageCount / messageCountSamples) * 10
        ) / 10
      }
      break

    case "reply_inserted":
      stats.totalInsertions++
      stats.insertionsByTone[tone] = (stats.insertionsByTone[tone] || 0) + 1
      break
  }

  stats.lastUpdated = formatDate()
}

// Get current stats (for debugging/monitoring)
export function getStats(): Stats {
  return { ...stats }
}

// Get recent events (for debugging)
export function getRecentEvents(limit: number = 50): EventRecord[] {
  return events.slice(-limit)
}

// Reset stats (useful for testing)
export function resetStats(): void {
  events.length = 0
  totalMessageCount = 0
  messageCountSamples = 0
  stats = {
    totalGenerations: 0,
    totalInsertions: 0,
    generationsByTone: {},
    insertionsByTone: {},
    avgMessagesInContext: 0,
    lastUpdated: formatDate()
  }
}
