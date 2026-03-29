import { Request, Response, NextFunction } from "express"
import { 
  trackEventService, 
  getStats, 
  getRecentEvents,
  TrackingMetadata 
} from "../services/trackingService"

// Track an event
export async function trackEvent(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { event, eventType, ...metadata } = req.body

    // Support both "event" and "eventType" for flexibility
    const type = event || eventType
    if (!type) {
      res.status(400).json({ success: false, error: "Missing event type" })
      return
    }

    await trackEventService(type, metadata as TrackingMetadata)

    res.json({ success: true })
  } catch (error) {
    // Don't fail the request for tracking errors
    console.error("[Track] Error:", error)
    res.json({ success: false, error: "Tracking failed" })
  }
}

// Get aggregated stats
export function getTrackingStats(
  req: Request,
  res: Response
): void {
  const stats = getStats()
  res.json({ success: true, stats })
}

// Get recent events (for debugging)
export function getTrackingEvents(
  req: Request,
  res: Response
): void {
  const limit = parseInt(req.query.limit as string) || 50
  const events = getRecentEvents(limit)
  res.json({ success: true, events, count: events.length })
}
