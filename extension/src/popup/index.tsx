import { useState } from "react"
import "../style.css"
import { 
  Header, 
  ToneSelector, 
  UsageCard, 
  ActionButton, 
  StatusBadge,
  Footer 
} from "../components"

function Popup() {
  const [selectedTone, setSelectedTone] = useState("professional")
  const [isLoading, setIsLoading] = useState(false)
  const [testReply, setTestReply] = useState<string | null>(null)

  // Placeholder usage count - will be replaced with real data
  const usageCount = 0

  const handleGenerateTest = async () => {
    setIsLoading(true)
    setTestReply(null)

    // Simulate API delay for demo purposes
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Placeholder response based on selected tone
    const responses = {
      professional: "Thank you for reaching out. I'd be happy to discuss this further at your earliest convenience.",
      friendly: "Hey! Thanks for the message 😊 Would love to chat more about this!",
      short: "Sounds good. Let's connect."
    }

    setTestReply(responses[selectedTone as keyof typeof responses])
    setIsLoading(false)
  }

  return (
    <div className="w-80 bg-white">
      {/* Main content */}
      <div className="p-4 space-y-4">
        {/* Header */}
        <Header />

        {/* Status badge */}
        <StatusBadge status="active" platform="LinkedIn" />

        {/* Tone selector */}
        <ToneSelector 
          selectedTone={selectedTone} 
          onToneChange={setSelectedTone} 
        />

        {/* Generate button */}
        <ActionButton onClick={handleGenerateTest} loading={isLoading}>
          <span>✨</span>
          <span>Generate Test Reply</span>
        </ActionButton>

        {/* Test reply preview */}
        {testReply && (
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-3">
            <p className="text-xs font-medium text-primary-600 mb-1">Preview:</p>
            <p className="text-sm text-gray-700">{testReply}</p>
          </div>
        )}

        {/* Usage stats */}
        <UsageCard count={usageCount} />

        {/* Footer */}
        <Footer version="1.0.0" />
      </div>
    </div>
  )
}

export default Popup
