// AI Service - orchestrates AI reply generation

import { Tone, Platform } from "../types"
import { buildPrompt, cleanReply } from "./promptBuilder"
import { callOpenAI } from "../providers/openai"
import { callGroq } from "../providers/groq"
import { config } from "../config"

export interface ConversationMessage {
  sender: "me" | "them"
  text: string
}

const MAX_SENTENCES_BY_TONE: Record<Tone, number> = {
  professional: 4,
  friendly: 3,
  short: 2
}

const SYSTEM_MESSAGE_PATTERNS = [
  /^message request accepted$/i,
  /^message request sent$/i,
  /^you are now connected/i,
  /^linkedin member$/i,
  /^typing\.\.\.$/i,
  /^seen by/i,
  /^today$/i,
  /^yesterday$/i
]

// Generate a reply using AI
export async function generateReplyService(
  messages: ConversationMessage[],
  tone: Tone,
  platform: Platform
): Promise<string> {
  const cleanedMessages = cleanConversationMessages(messages)

  // Build the prompt
  const prompt = buildPrompt(cleanedMessages, tone, platform)
  
  const provider = config.aiProvider
  console.log(`[AI Service] Generating reply with tone="${tone}" platform="${platform}" provider="${provider}"`)
  
  // Call the configured AI provider
  let rawReply: string
  if (provider === "groq") {
    rawReply = await callGroq(prompt)
  } else {
    rawReply = await callOpenAI(prompt)
  }
  
  // Clean the response to remove AI artifacts
  const reply = enforceReplyLength(cleanReply(rawReply), tone)
  
  console.log(`[AI Service] Raw: "${rawReply.substring(0, 50)}..."`)
  console.log(`[AI Service] Cleaned: "${reply.substring(0, 50)}..."`)
  
  return reply
}

function cleanConversationMessages(messages: ConversationMessage[]): ConversationMessage[] {
  const cleaned: ConversationMessage[] = []

  for (const message of messages) {
    const text = normalizeMessageText(message.text)
    if (!text || isSystemMessage(text)) {
      continue
    }

    const previous = cleaned.at(-1)
    if (previous && previous.sender === message.sender && previous.text === text) {
      continue
    }

    cleaned.push({
      sender: message.sender,
      text
    })
  }

  return cleaned
}

function normalizeMessageText(text: string): string {
  return text.replace(/\s+/g, " ").trim()
}

function isSystemMessage(text: string): boolean {
  return SYSTEM_MESSAGE_PATTERNS.some((pattern) => pattern.test(text))
}

function enforceReplyLength(reply: string, tone: Tone): string {
  const normalized = reply
    .replace(/\r\n/g, "\n")
    .replace(/\s+/g, " ")
    .trim()

  const sentenceMatches = normalized.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || []

  const limitedSentences = sentenceMatches
    .map((sentence) => sentence.trim())
    .filter(Boolean)
    .slice(0, MAX_SENTENCES_BY_TONE[tone])

  let result = limitedSentences.join(" ")

  const MAX_WORDS_BY_TONE: Record<Tone, number> = {
    professional: 60,
    friendly: 45,
    short: 25
  }

  const words = result.split(/\s+/)
  if (words.length > MAX_WORDS_BY_TONE[tone]) {
    result = words.slice(0, MAX_WORDS_BY_TONE[tone]).join(" ")
    result = result.replace(/[,:;-\s]*$/, "").trim()
    if (!/[.!?]$/.test(result)) {
      result += "."
    }
  }

  return result || normalized
}