import { useState } from "react"

interface ToneSelectorProps {
  selectedTone: string
  onToneChange: (tone: string) => void
}

const tones = [
  { 
    id: "professional", 
    label: "Professional", 
    icon: "💼",
    description: "Clear and business-appropriate"
  },
  { 
    id: "friendly", 
    label: "Friendly", 
    icon: "😊",
    description: "Warm and conversational"
  },
  { 
    id: "short", 
    label: "Short", 
    icon: "⚡",
    description: "Brief and to the point"
  }
]

export function ToneSelector({ selectedTone, onToneChange }: ToneSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        Reply Tone
      </label>
      <div className="grid grid-cols-3 gap-2">
        {tones.map((tone) => (
          <button
            key={tone.id}
            onClick={() => onToneChange(tone.id)}
            className={`
              flex flex-col items-center p-3 rounded-lg border-2 transition-all
              ${selectedTone === tone.id 
                ? "border-primary-500 bg-primary-50 text-primary-700" 
                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
              }
            `}
          >
            <span className="text-lg mb-1">{tone.icon}</span>
            <span className="text-xs font-medium">{tone.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
