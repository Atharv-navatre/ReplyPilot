import { Router } from "express"
import generateRouter from "./generate"
import trackRouter from "./track"

const router = Router()

// API v1 routes
router.use("/generate", generateRouter)
router.use("/track", trackRouter)

// Placeholder for future routes
// router.use("/auth", authRouter)     // V2
// router.use("/history", historyRouter) // V2

export default router
