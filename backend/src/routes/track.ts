import { Router } from "express"
import { 
  trackEvent, 
  getTrackingStats, 
  getTrackingEvents 
} from "../controllers/trackController"

const router = Router()

// POST /api/v1/track - Log an event
router.post("/", trackEvent)

// GET /api/v1/track/stats - Get aggregated stats
router.get("/stats", getTrackingStats)

// GET /api/v1/track/events - Get recent events (debugging)
router.get("/events", getTrackingEvents)

export default router
