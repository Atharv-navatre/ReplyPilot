export function Header() {
  return (
    <div className="flex items-center gap-3">
      <div className="w-11 h-11 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-sm">
        <span className="text-white text-xl font-bold">R</span>
      </div>
      <div>
        <h1 className="text-lg font-semibold text-gray-900">ReplyPilot</h1>
        <p className="text-xs text-gray-500">Smart AI-powered replies</p>
      </div>
    </div>
  )
}
