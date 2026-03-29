// Groq Provider - handles communication with Groq API
// Groq uses OpenAI-compatible API format

import { config } from "../config"
import type { PromptInput } from "./openai"

interface GroqMessage {
  role: "system" | "user" | "assistant"
  content: string
}

interface GroqResponse {
  id: string
  choices: Array<{
    message: {
      content: string
    }
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

// Call Groq Chat Completions API
export async function callGroq(prompt: PromptInput): Promise<string> {
  if (!config.groqApiKey) {
    throw new Error("Groq API key not configured")
  }

  const messages: GroqMessage[] = [
    { role: "system", content: prompt.system },
    { role: "user", content: prompt.user }
  ]

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${config.groqApiKey}`
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",  // Fast and capable model
      messages,
      max_tokens: 200,
      temperature: 0.8
    })
  })

  if (!response.ok) {
    const errorBody = await response.text()
    console.error("[Groq] API error:", response.status, errorBody)
    throw new Error(`Groq API error: ${response.status}`)
  }

  const data = (await response.json()) as GroqResponse

  const reply = data.choices?.[0]?.message?.content?.trim()
  if (!reply) {
    throw new Error("No reply generated from Groq")
  }

  console.log(`[Groq] Generated reply (${data.usage.total_tokens} tokens)`)
  return reply
}
