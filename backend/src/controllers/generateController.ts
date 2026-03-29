import { Request, Response, NextFunction } from "express"
import { GenerateRequest, Tone, Platform } from "../types"
import { generateReplyService } from "../services/aiService"

// Generate reply controller
export async function generateReply(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // TEMP DEBUG LOG
    console.log("BODY RECEIVED:", JSON.stringify(req.body, null, 2))

    const { messages, tone, platform = "linkedin" } = req.body as GenerateRequest

    // Validate required fields
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({
        success: false,
        error: "Missing or invalid messages array"
      })
      return
    }

    if (!tone || !["professional", "friendly", "short"].includes(tone)) {
      res.status(400).json({
        success: false,
        error: "Invalid tone. Must be: professional, friendly, or short"
      })
      return
    }

    // Validate message structure
    const validMessages = messages.every(
      (msg) =>
        msg &&
        typeof msg.text === "string" &&
        ["me", "them"].includes(msg.sender)
    )

    if (!validMessages) {
      res.status(400).json({
        success: false,
        error: "Invalid message format. Each message must have sender (me/them) and text"
      })
      return
    }

    console.log(`[Generate] Processing request: ${messages.length} messages, tone=${tone}`)

    // Generate the reply
    const reply = await generateReplyService(messages, tone as Tone, platform as Platform)

    res.json({
      success: true,
      reply
    })
  } catch (error) {
    console.error("[Generate] Error:", error)

    // Return user-friendly error
    const message = error instanceof Error ? error.message : "Failed to generate reply"
    res.status(500).json({
      success: false,
      error: message
    })
  }
}