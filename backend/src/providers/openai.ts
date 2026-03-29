  // OpenAI Provider - handles communication with OpenAI API

  import { config } from "../config"

  export interface PromptInput {
    system: string
    user: string
  }

  export interface OpenAIMessage {
    role: "system" | "user" | "assistant"
    content: string
  }

  export interface OpenAIResponse {
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

  // Call OpenAI Chat Completions API
  export async function callOpenAI(prompt: PromptInput): Promise<string> {
    if (!config.openaiApiKey) {
      throw new Error("OpenAI API key not configured")
    }

    const messages: OpenAIMessage[] = [
      { role: "system", content: prompt.system },
      { role: "user", content: prompt.user }
    ]

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${config.openaiApiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        max_tokens: 200,        // Shorter replies are better for messaging
        temperature: 0.8,       // Slightly higher for more natural variation
        presence_penalty: 0.3,  // Discourage repetitive phrases
        frequency_penalty: 0.2  // Encourage vocabulary variety
      })
    })

    if (!response.ok) {
      const errorBody = await response.text()
      console.error("[OpenAI] API error:", response.status, errorBody)
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = (await response.json()) as OpenAIResponse

    const reply = data.choices?.[0]?.message?.content?.trim()
    if (!reply) {
      throw new Error("No reply generated from OpenAI")
    }

    console.log(`[OpenAI] Generated reply (${data.usage.total_tokens} tokens)`)
    return reply
  }
