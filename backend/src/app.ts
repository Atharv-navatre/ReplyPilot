import dotenv from "dotenv"
dotenv.config()

import express from "express"
import cors from "cors"
import { config } from "./config"
import routes from "./routes"
import { requestLogger } from "./middleware/requestLogger"
import { errorHandler } from "./middleware/errorHandler"

const app = express()

// Middleware
app.use(
  cors({
    origin: true, // Allow extension requests from any origin
    credentials: true
  })
)

app.use(express.json())
app.use(requestLogger)

// Health check
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "1.0.0"
  })
})

// API routes
app.use("/api/v1", routes)

// Error handling (must be last)
app.use(errorHandler)

// Start server
const PORT = config.port
app.listen(PORT, () => {
  console.log(`🚀 ReplyPilot API running on http://localhost:${PORT}`)
  console.log(`   Environment: ${config.nodeEnv}`)
})

export default app