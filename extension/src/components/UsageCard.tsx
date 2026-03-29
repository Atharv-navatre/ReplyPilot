interface UsageCardProps {
  count: number
  label?: string
}

export function UsageCard({ count, label = "Replies generated" }: UsageCardProps) {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{count}</p>
        </div>
        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
          <span className="text-2xl">✨</span>
        </div>
      </div>
    </div>
  )
}
