# ReplyPilot — Project Setup Guide

## What We're Building

Setting up the complete project foundation for ReplyPilot:
- **Extension**: Plasmo + React + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: Supabase (preparation)

## Why This Setup Matters

1. **Plasmo** simplifies Chrome extension development with React
2. **TypeScript** catches errors early and improves maintainability
3. **Tailwind** enables rapid, consistent UI development
4. **Monorepo structure** keeps extension and backend organized but separate
5. **Environment separation** keeps secrets secure

---

## STEP 1: Create Folder Structure

Open your terminal in `d:\Reply_Pilot` and run:

```bash
# Create root directories
mkdir extension
mkdir extension\src
mkdir extension\src\contents
mkdir extension\src\components
mkdir extension\src\components\ui
mkdir extension\src\background
mkdir extension\src\popup
mkdir extension\src\lib
mkdir extension\src\hooks
mkdir extension\src\adapters
mkdir extension\src\types
mkdir extension\assets

mkdir backend
mkdir backend\src
mkdir backend\src\routes
mkdir backend\src\controllers
mkdir backend\src\services
mkdir backend\src\middleware
mkdir backend\src\config
mkdir backend\src\types
mkdir backend\src\utils

mkdir docs
```

---

## STEP 2: Extension Setup

### 2.1 Create `extension\package.json`

```json
{
  "name": "replypilot-extension",
  "displayName": "ReplyPilot",
  "version": "1.0.0",
  "description": "AI-powered smart reply generator for LinkedIn",
  "author": "ReplyPilot",
  "scripts": {
    "dev": "plasmo dev",
    "build": "plasmo build",
    "package": "plasmo package"
  },
  "dependencies": {
    "plasmo": "^0.89.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/chrome": "^0.0.267",
    "@types/node": "^20.11.5",
    "@types/react": "^18.2.48",
    "@types/react-dom": "^18.2.18",
    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.33",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.3.3"
  },
  "manifest": {
    "permissions": [
      "storage",
      "activeTab"
    ],
    "host_permissions": [
      "https://www.linkedin.com/*"
    ]
  }
}
```

### 2.2 Create `extension\tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "~/*": ["./src/*"]
    }
  },
  "include": ["src/**/*", "*.ts"],
  "exclude": ["node_modules", "build"]
}
```

### 2.3 Create `extension\tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{tsx,ts,jsx,js}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e"
        }
      }
    }
  },
  plugins: []
}
```

### 2.4 Create `extension\postcss.config.js`

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
}
```

### 2.5 Create `extension\src\style.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 2.6 Create `extension\src\popup\index.tsx`

```tsx
import "../style.css"

function Popup() {
  return (
    <div className="w-80 p-4 bg-white">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
          <span className="text-white text-lg font-bold">R</span>
        </div>
        <div>
          <h1 className="text-lg font-semibold text-gray-900">ReplyPilot</h1>
          <p className="text-xs text-gray-500">AI-powered replies</p>
        </div>
      </div>
      
      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm text-green-700 font-medium">Active on LinkedIn</span>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-3">
        <p className="text-xs text-gray-500 mb-1">Replies generated</p>
        <p className="text-2xl font-bold text-gray-900">0</p>
      </div>

      <p className="text-xs text-gray-400 text-center mt-4">
        v1.0.0 • ReplyPilot MVP
      </p>
    </div>
  )
}

export default Popup
```

### 2.7 Create `extension\src\types\index.ts`

```typescript
// Tone options for reply generation
export type Tone = "professional" | "friendly" | "short"

// Message from conversation
export interface Message {
  sender: "user" | "other"
  content: string
  timestamp?: string
}

// Request to generate a reply
export interface GenerateRequest {
  context: Message[]
  tone: Tone
  platform: "linkedin"
}

// Response from generate API
export interface GenerateResponse {
  reply: string
  success: boolean
  error?: string
}

// Message types for extension communication
export type MessageType = 
  | "GENERATE_REPLY"
  | "GENERATION_COMPLETE"
  | "TRACK_EVENT"

export interface ExtensionMessage {
  type: MessageType
  payload?: unknown
}
```

### 2.8 Create `extension\src\lib\api.ts`

```typescript
// API client for communicating with backend
const API_URL = process.env.PLASMO_PUBLIC_API_URL || "http://localhost:3001"

export async function generateReply(
  context: string[],
  tone: string,
  platform: string
): Promise<{ reply: string }> {
  const response = await fetch(`${API_URL}/api/v1/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ context, tone, platform })
  })

  if (!response.ok) {
    throw new Error("Failed to generate reply")
  }

  return response.json()
}

export async function trackEvent(eventType: string, metadata?: object): Promise<void> {
  try {
    await fetch(`${API_URL}/api/v1/track`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ eventType, metadata })
    })
  } catch (error) {
    console.error("Failed to track event:", error)
  }
}
```

### 2.9 Create `extension\src\lib\storage.ts`

```typescript
// Chrome storage helpers
interface StorageData {
  replyCount: number
  lastUsed?: string
}

const DEFAULT_DATA: StorageData = {
  replyCount: 0
}

export async function getStorageData(): Promise<StorageData> {
  const result = await chrome.storage.local.get(DEFAULT_DATA)
  return result as StorageData
}

export async function incrementReplyCount(): Promise<number> {
  const data = await getStorageData()
  const newCount = data.replyCount + 1
  
  await chrome.storage.local.set({
    replyCount: newCount,
    lastUsed: new Date().toISOString()
  })
  
  return newCount
}

export async function getReplyCount(): Promise<number> {
  const data = await getStorageData()
  return data.replyCount
}
```

### 2.10 Create `extension\src\background\index.ts`

```typescript
// Background service worker
// Handles API calls and extension communication

export {}

chrome.runtime.onInstalled.addListener(() => {
  console.log("ReplyPilot installed")
})

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "GENERATE_REPLY") {
    handleGenerateReply(message.payload)
      .then(sendResponse)
      .catch((error) => sendResponse({ error: error.message }))
    return true // Keep channel open for async response
  }
  
  if (message.type === "TRACK_EVENT") {
    handleTrackEvent(message.payload)
    return false
  }
})

async function handleGenerateReply(payload: {
  context: string[]
  tone: string
  platform: string
}): Promise<{ reply: string } | { error: string }> {
  const API_URL = process.env.PLASMO_PUBLIC_API_URL || "http://localhost:3001"
  
  try {
    const response = await fetch(`${API_URL}/api/v1/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
    
    if (!response.ok) {
      throw new Error("API request failed")
    }
    
    return await response.json()
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unknown error" }
  }
}

async function handleTrackEvent(payload: { eventType: string; metadata?: object }): Promise<void> {
  const API_URL = process.env.PLASMO_PUBLIC_API_URL || "http://localhost:3001"
  
  try {
    await fetch(`${API_URL}/api/v1/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
  } catch (error) {
    console.error("Failed to track event:", error)
  }
}
```

### 2.11 Create `extension\.env.example`

```env
# Backend API URL
PLASMO_PUBLIC_API_URL=http://localhost:3001
```

### 2.12 Create `extension\.env`

```env
PLASMO_PUBLIC_API_URL=http://localhost:3001
```

---

## STEP 3: Backend Setup

### 3.1 Create `backend\package.json`

```json
{
  "name": "replypilot-backend",
  "version": "1.0.0",
  "description": "ReplyPilot API server",
  "main": "dist/app.js",
  "scripts": {
    "dev": "nodemon --exec ts-node src/app.ts",
    "build": "tsc",
    "start": "node dist/app.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.4.1",
    "express": "^4.18.2",
    "openai": "^4.28.0"
  },
  "devDependencies": {
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/node": "^20.11.5",
    "nodemon": "^3.0.3",
    "ts-node": "^10.9.2",
    "typescript": "^5.3.3"
  }
}
```

### 3.2 Create `backend\tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 3.3 Create `backend\src\app.ts`

```typescript
import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import routes from "./routes"
import { errorHandler } from "./middleware/errorHandler"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() })
})

// API routes
app.use("/api/v1", routes)

// Error handling
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`🚀 ReplyPilot API running on http://localhost:${PORT}`)
})

export default app
```

### 3.4 Create `backend\src\routes\index.ts`

```typescript
import { Router } from "express"
import generateRouter from "./generate"
import trackRouter from "./track"

const router = Router()

router.use("/generate", generateRouter)
router.use("/track", trackRouter)

export default router
```

### 3.5 Create `backend\src\routes\generate.ts`

```typescript
import { Router } from "express"
import { generateReply } from "../controllers/generateController"

const router = Router()

router.post("/", generateReply)

export default router
```

### 3.6 Create `backend\src\routes\track.ts`

```typescript
import { Router } from "express"
import { trackEvent } from "../controllers/trackController"

const router = Router()

router.post("/", trackEvent)

export default router
```

### 3.7 Create `backend\src\controllers\generateController.ts`

```typescript
import { Request, Response, NextFunction } from "express"
import { generateReplyService } from "../services/aiService"

export async function generateReply(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { context, tone, platform } = req.body

    if (!context || !tone || !platform) {
      res.status(400).json({ 
        success: false, 
        error: "Missing required fields: context, tone, platform" 
      })
      return
    }

    const reply = await generateReplyService(context, tone, platform)

    res.json({ success: true, reply })
  } catch (error) {
    next(error)
  }
}
```

### 3.8 Create `backend\src\controllers\trackController.ts`

```typescript
import { Request, Response, NextFunction } from "express"
import { trackEventService } from "../services/trackingService"

export async function trackEvent(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { eventType, metadata } = req.body

    if (!eventType) {
      res.status(400).json({ success: false, error: "Missing eventType" })
      return
    }

    await trackEventService(eventType, metadata)

    res.json({ success: true })
  } catch (error) {
    next(error)
  }
}
```

### 3.9 Create `backend\src\services\aiService.ts`

```typescript
import { buildPrompt } from "./promptBuilder"
import { callOpenAI } from "../providers/openai"

export async function generateReplyService(
  context: string[],
  tone: string,
  platform: string
): Promise<string> {
  const prompt = buildPrompt(context, tone, platform)
  const reply = await callOpenAI(prompt)
  return reply
}
```

### 3.10 Create `backend\src\services\promptBuilder.ts`

```typescript
const TONE_DESCRIPTIONS: Record<string, string> = {
  professional: "professional, clear, and business-appropriate",
  friendly: "warm, approachable, and conversational",
  short: "brief, direct, and to the point"
}

const SYSTEM_PROMPT = `You are a professional communication assistant helping users write replies.

IMPORTANT RULES:
- Write naturally, like a real person
- Match the tone and energy of the conversation
- Never sound robotic or overly formal
- Don't use phrases like "I hope this message finds you well" or "I am writing to..."
- Keep responses concise and relevant
- Use contractions (I'm, don't, can't)
- Vary sentence length for natural rhythm`

export function buildPrompt(
  context: string[],
  tone: string,
  platform: string
): { system: string; user: string } {
  const toneDesc = TONE_DESCRIPTIONS[tone] || TONE_DESCRIPTIONS.professional
  
  const conversationContext = context
    .map((msg, i) => `Message ${i + 1}: ${msg}`)
    .join("\n")

  const system = `${SYSTEM_PROMPT}

Tone: Be ${toneDesc}.
Platform: ${platform}`

  const user = `Here's the recent conversation:

${conversationContext}

Write a reply that continues this conversation naturally.`

  return { system, user }
}
```

### 3.11 Create `backend\src\services\trackingService.ts`

```typescript
// Tracking service - will integrate with Supabase in V2
export async function trackEventService(
  eventType: string,
  metadata?: object
): Promise<void> {
  // For V1, just log the event
  // Will integrate with Supabase later
  console.log(`[Track] ${eventType}`, metadata || {})
}
```

### 3.12 Create `backend\src\providers\openai.ts`

```typescript
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function callOpenAI(prompt: { system: string; user: string }): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: prompt.system },
      { role: "user", content: prompt.user }
    ],
    max_tokens: 300,
    temperature: 0.7
  })

  const reply = response.choices[0]?.message?.content

  if (!reply) {
    throw new Error("No response from OpenAI")
  }

  return reply.trim()
}
```

### 3.13 Create `backend\src\middleware\errorHandler.ts`

```typescript
import { Request, Response, NextFunction } from "express"

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error("[Error]", error.message)

  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === "production" 
      ? "Internal server error" 
      : error.message
  })
}
```

### 3.14 Create `backend\src\config\index.ts`

```typescript
export const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || "development",
  openaiApiKey: process.env.OPENAI_API_KEY,
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_ANON_KEY
}
```

### 3.15 Create `backend\.env.example`

```env
PORT=3001
NODE_ENV=development

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key-here

# Supabase (for V2)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

### 3.16 Create `backend\.env`

```env
PORT=3001
NODE_ENV=development

# OpenAI - Replace with your actual key
OPENAI_API_KEY=sk-your-openai-api-key-here

# Supabase (for V2)
SUPABASE_URL=
SUPABASE_ANON_KEY=
```

---

## STEP 4: Install Dependencies

### Terminal 1 - Extension

```bash
cd d:\Reply_Pilot\extension
npm install -g pnpm
pnpm install
```

### Terminal 2 - Backend

```bash
cd d:\Reply_Pilot\backend
npm install
```

---

## STEP 5: Run Development Servers

### Terminal 1 - Backend

```bash
cd d:\Reply_Pilot\backend
npm run dev
```

Should see: `🚀 ReplyPilot API running on http://localhost:3001`

### Terminal 2 - Extension

```bash
cd d:\Reply_Pilot\extension
pnpm dev
```

Should see: `Your extension is ready at chrome-extension://...`

---

## STEP 6: Load Extension in Chrome

1. Open Chrome browser
2. Navigate to `chrome://extensions`
3. Enable **Developer mode** (toggle in top right)
4. Click **Load unpacked**
5. Select folder: `d:\Reply_Pilot\extension\build\chrome-mv3-dev`
6. ReplyPilot extension should appear!
7. Click the extension icon to see the popup

---

## STEP 7: Verification Checklist

### Backend Verification

Open browser or use curl:
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{"status":"ok","timestamp":"2026-03-28T..."}
```

### Extension Verification

1. Extension icon appears in Chrome toolbar
2. Clicking icon shows popup with "ReplyPilot" branding
3. Popup shows "Active on LinkedIn" status
4. No errors in Chrome DevTools console

---

## What's Next

After setup is verified, we'll build:

1. **LinkedIn content script** - Detect messaging page
2. **Generate button injection** - Add button near input
3. **Context extraction** - Pull conversation messages
4. **Reply modal** - Show AI reply with tone selection
5. **Insert functionality** - Put reply into input field

---

## Troubleshooting

### "pnpm not found"
```bash
npm install -g pnpm
```

### Extension not loading
- Check `build\chrome-mv3-dev` folder exists
- Try running `pnpm dev` again
- Check for TypeScript errors in terminal

### Backend not starting
- Check if port 3001 is already in use
- Verify all dependencies installed
- Check for TypeScript errors

### API errors
- Ensure backend is running before testing extension
- Check CORS is properly configured
- Verify `.env` file exists with correct values
