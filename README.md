# ReplyPilot

AI-powered Chrome extension that helps users write smart, context-aware replies on LinkedIn, Gmail, WhatsApp, and Instagram.

## Project Structure

```
ReplyPilot/
├── extension/          # Chrome extension (Plasmo + React + TypeScript + Tailwind)
├── backend/            # API server (Node.js + Express)
├── docs/               # Documentation
└── README.md           # This file
```

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or pnpm
- Chrome browser

### Setup Extension

```bash
cd extension
pnpm install
pnpm dev
```

### Setup Backend

```bash
cd backend
npm install
npm run dev
```

### Load Extension in Chrome

1. Open Chrome → `chrome://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `extension/build/chrome-mv3-dev`

## Tech Stack

| Layer | Technology |
|-------|------------|
| Extension | Plasmo, React, TypeScript, Tailwind CSS |
| Backend | Node.js, Express, TypeScript |
| Database | Supabase |
| AI | OpenAI API |

## Current Version

**V1 (MVP)** - LinkedIn support only

## License

MIT
