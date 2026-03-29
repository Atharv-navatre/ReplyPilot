// Prompt Builder - constructs high-quality prompts for AI reply generation

import { Tone, Platform } from "../types"
import { PromptInput } from "../providers/openai"

export interface PromptMessage {
  sender: "me" | "them"
  text: string
}

type ScenarioType =
  | "job_or_internship_request"
  | "guidance_or_advice_request"
  | "recruiter_outreach"
  | "networking_request"
  | "appreciation_message"
  | "collaboration_inquiry"
  | "follow_up_message"
  | "cold_outreach_message"
  | "general_professional_conversation"

const TONE_CONFIG: Record<Tone, {
  description: string
  guidelines: string[]
}> = {
  professional: {
    description: "polished, warm, concise",
    guidelines: [
      "Be polite, practical, and calm",
      "Sound like a working professional replying on LinkedIn",
      "Keep it natural, not overly polished",
      "Do not sound like HR, a recruiter, or a mentor speech",
      "Avoid unnecessary praise or hype"
    ]
  },
  friendly: {
    description: "warm, natural, conversational",
    guidelines: [
      "Sound approachable and human",
      "Use relaxed wording without becoming casual in a sloppy way",
      "Feel like a real peer or senior replying naturally",
      "Do not overdo enthusiasm",
      "Keep warmth low-key, not bubbly"
    ]
  },
  short: {
    description: "brief, direct, polite",
    guidelines: [
      "Keep it very short",
      "Still sound human and respectful",
      "Do not become robotic or cold",
      "Only include the most useful reply",
      "Do not add extra encouragement just to soften it"
    ]
  }
}

const BANNED_PHRASES = [
  "that's great to hear",
  "congrats on",
  "congratulations on",
  "that's awesome to see",
  "that's great to see",
  "that's wonderful",
  "that's amazing",
  "it sounds like you're eager to",
  "I'm glad you're excited about",
  "that's a solid foundation",
  "I'd like to take a closer look at your profile",
  "I'm impressed by your",
  "I'd be happy to review your profile",
  "hope this message finds you well",
  "hope this finds you well",
  "I trust you are doing well",
  "I trust this message finds you",
  "thank you for reaching out",
  "thanks for reaching out to me",
  "I am writing to",
  "I wanted to reach out",
  "I hope you're having a great",
  "I reviewed your profile",
  "I noticed you have",
  "based on your background",
  "I appreciate your interest",
  "I'd be happy to discuss this further",
  "looking forward to hearing from you",
  "please do not hesitate",
  "don't hesitate to",
  "at your earliest convenience",
  "circle back",
  "touch base",
  "synergy",
  "leverage",
  "moving forward",
  "as per my previous",
  "I would be more than happy",
  "absolutely",
  "definitely",
  "certainly",
  "I'd be happy to chat",
  "I'd be happy to explore",
  "I think it's great that",
  "I noticed that",
  "Based on your profile",
  "Based on your experience"
]

const SYSTEM_PROMPT = `You write short LinkedIn DM replies.

You are NOT:
- a recruiter
- a coach
- a career counselor
- an evaluator
- an assistant writing polished business copy

You ARE:
- a normal LinkedIn user replying to another person in chat

CRITICAL RULES:
1. Write ONLY the final reply text.
2. Write as "Me" replying to "Them".
3. Never switch perspective.
4. Never evaluate, assess, coach, review, or analyze Them.
5. Do not paraphrase Their ambition, motivation, or background back to them.
6. Do not sound like HR, mentorship content, or ChatGPT.
7. Keep the reply short enough that a real person would actually send it.
8. Prefer natural chat wording over polished business writing.
9. Do not write more than needed.
10. Do not over-praise or over-encourage Them.

NEVER USE THESE:
${BANNED_PHRASES.map(p => `- "${p}"`).join("\n")}

STYLE RULES:
- Use contractions naturally
- Sound human and believable
- Avoid filler
- Avoid motivational language
- Avoid sounding too polished
- Avoid praise-heavy openings
- Avoid repeating Their story back to them
- Prefer grounded phrasing over polished encouragement
- Ask at most one follow-up question
- Prefer 1 to 3 short sentences
- No long paragraph
- No intro like "Sure" or "Here's a reply"

PERSPECTIVE RULE:
- "Me" = the current user sending the reply
- "Them" = the sender of the LinkedIn message
- Always write as Me replying to Them`

const SCENARIO_GUIDANCE: Record<ScenarioType, string[]> = {
  job_or_internship_request: [
    "If Them is asking for a job, internship, referral, or opportunity, reply naturally and realistically.",
    "Do not promise anything you do not know you can offer.",
    "A practical next step can be to suggest they keep applying, share a resume, or stay in touch — but keep it brief."
  ],
  guidance_or_advice_request: [
    "If Them is asking for guidance, reply simply and practically.",
    "Do not sound like a mentor speech or career counselor.",
    "Keep it grounded and natural."
  ],
  recruiter_outreach: [
    "If Them is a recruiter, reply with interest, polite decline, or request for more details.",
    "Do not sound overly eager or generic."
  ],
  networking_request: [
    "If Them wants to connect or network, keep the reply light and warm.",
    "Do not overdo it."
  ],
  appreciation_message: [
    "If Them is appreciating or complimenting, reply modestly and naturally."
  ],
  collaboration_inquiry: [
    "If Them is asking to collaborate, sound open but practical.",
    "Ask only one useful follow-up if needed."
  ],
  follow_up_message: [
    "If Them is following up, respond clearly and directly."
  ],
  cold_outreach_message: [
    "If Them is sending a cold outreach, keep the reply polite and realistic.",
    "Do not overcommit."
  ],
  general_professional_conversation: [
    "Reply naturally to the actual point of the message."
  ]
}

const TONE_OUTPUT_RULES: Record<Tone, string[]> = {
  professional: [
    "Use 2 to 3 short sentences.",
    "Max 60 words.",
    "Sound thoughtful, calm, and professional."
  ],
  friendly: [
    "Use 1 to 3 short sentences.",
    "Max 45 words.",
    "Sound warm, relaxed, and natural."
  ],
  short: [
    "Use 1 to 2 short sentences only.",
    "Max 25 words.",
    "Sound brief but still polite."
  ]
}

export function buildPrompt(
  messages: PromptMessage[],
  tone: Tone,
  platform: Platform
): PromptInput {
  const toneConfig = TONE_CONFIG[tone] || TONE_CONFIG.professional

  const normalizedMessages = messages
    .map((message) => ({
      sender: message.sender,
      text: message.text.trim()
    }))
    .filter((message) => message.text.length > 0)

  const conversationText = normalizedMessages
    .map((message, index) => {
      const speaker = message.sender === "me" ? "Me" : "Them"
      return `${index + 1}. ${speaker}: ${message.text}`
    })
    .join("\n")

  const lastMessage = [...normalizedMessages].reverse().find((message) => message.sender === "them")
  const scenario = inferScenario(normalizedMessages)
  const scenarioInstructions = SCENARIO_GUIDANCE[scenario]
  const toneOutputRules = TONE_OUTPUT_RULES[tone]

  const toneInstructions = `
TONE: ${toneConfig.description.toUpperCase()}
${toneConfig.guidelines.map(g => `• ${g}`).join("\n")}`

  const system = `${SYSTEM_PROMPT}

${toneInstructions}

Platform: ${platform} (LinkedIn professional chat)`

  const user = `Conversation:

${conversationText}

Likely conversation type: ${formatScenarioLabel(scenario)}
${lastMessage ? `Most recent message from Them: "${lastMessage.text}"` : ""}

Write the next message that Me should send to Them.

IMPORTANT:
- Reply as a normal person, not a helper bot
- Do NOT analyze Them
- Do NOT repeat Their story back to them
- Do NOT sound like a mentor or recruiter
- Do NOT over-praise or congratulate unless the message clearly calls for it
- Do NOT open with exaggerated positivity
- Keep it socially natural
- Keep it brief enough to actually send
- Move the conversation forward only if useful
- Tone rules:
${toneOutputRules.map((instruction) => `- ${instruction}`).join("\n")}
- Scenario guidance:
${scenarioInstructions.map((instruction) => `- ${instruction}`).join("\n")}

Output only the final reply text.`

  return { system, user }
}

export function cleanReply(reply: string): string {
  let cleaned = reply.trim()

  const prefixPatterns = [
    /^(here'?s?\s+(a\s+)?((possible|suggested|draft)\s+)?reply:?\s*)/i,
    /^(sure[,!]?\s*(here'?s?\s+)?)/i,
    /^(of course[,!]?\s*)/i,
    /^(absolutely[,!]?\s*)/i,
    /^(certainly[,!]?\s*)/i,
    /^(reply:?\s*)/i,
    /^(message:?\s*)/i,
    /^["']/,
  ]

  for (const pattern of prefixPatterns) {
    cleaned = cleaned.replace(pattern, "")
  }

  cleaned = cleaned.replace(/["']$/, "")
  cleaned = cleaned.replace(/[\-\.]{3,}$/, "").trim()

  return cleaned
}

function inferScenario(messages: PromptMessage[]): ScenarioType {
  const lastIncomingText =
    [...messages].reverse().find((message) => message.sender === "them")?.text.toLowerCase() || ""

  if (/(internship|fresher|entry level|entry-level|job|opening|opportunity|referral|resume|cv|looking for)/i.test(lastIncomingText)) {
    return "job_or_internship_request"
  }

  if (/(guidance|advice|suggest|help me|help with|roadmap|how should i|how do i|get started|what should i learn)/i.test(lastIncomingText)) {
    return "guidance_or_advice_request"
  }

  if (/(recruiter|hiring|role|position|opening on our team|we are hiring|opportunity for you|interview)/i.test(lastIncomingText)) {
    return "recruiter_outreach"
  }

  if (/(connect|network|networking|stay in touch|expand my network|learn from your journey)/i.test(lastIncomingText)) {
    return "networking_request"
  }

  if (/(congrats|congratulations|great work|impressive|well done|appreciate|appreciated|thank you for sharing|loved your post)/i.test(lastIncomingText)) {
    return "appreciation_message"
  }

  if (/(collaborate|collaboration|freelance|consulting|project|partnership|work together)/i.test(lastIncomingText)) {
    return "collaboration_inquiry"
  }

  if (/(following up|follow up|just checking|checking in|gentle reminder|circling back|wanted to follow up)/i.test(lastIncomingText)) {
    return "follow_up_message"
  }

  if (/(came across your profile|wanted to connect|reaching out to connect|would love to connect|open to connecting|open to connect)/i.test(lastIncomingText)) {
    return "cold_outreach_message"
  }

  return "general_professional_conversation"
}

function formatScenarioLabel(scenario: ScenarioType): string {
  return scenario.replace(/_/g, " ")
}
