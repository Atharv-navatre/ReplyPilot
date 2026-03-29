interface StatusBadgeProps {
  status: "active" | "inactive" | "loading"
  platform?: string
}

export function StatusBadge({ status, platform = "LinkedIn" }: StatusBadgeProps) {
  const statusConfig = {
    active: {
      bg: "bg-green-50",
      border: "border-green-200",
      dot: "bg-green-500",
      text: "text-green-700",
      label: `Active on ${platform}`
    },
    inactive: {
      bg: "bg-gray-50",
      border: "border-gray-200",
      dot: "bg-gray-400",
      text: "text-gray-600",
      label: "Not on supported page"
    },
    loading: {
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      dot: "bg-yellow-500 animate-pulse",
      text: "text-yellow-700",
      label: "Checking..."
    }
  }

  const config = statusConfig[status]

  return (
    <div className={`${config.bg} border ${config.border} rounded-lg p-3`}>
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 ${config.dot} rounded-full`}></div>
        <span className={`text-sm font-medium ${config.text}`}>
          {config.label}
        </span>
      </div>
    </div>
  )
}
