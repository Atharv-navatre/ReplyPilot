interface ActionButtonProps {
  onClick: () => void
  loading?: boolean
  disabled?: boolean
  children: React.ReactNode
}

export function ActionButton({ 
  onClick, 
  loading = false, 
  disabled = false,
  children 
}: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        w-full py-3 px-4 rounded-lg font-medium text-sm
        transition-all duration-200 flex items-center justify-center gap-2
        ${disabled || loading
          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
          : "bg-primary-500 text-white hover:bg-primary-600 active:scale-[0.98] shadow-sm hover:shadow-md"
        }
      `}
    >
      {loading ? (
        <>
          <LoadingSpinner />
          <span>Generating...</span>
        </>
      ) : (
        children
      )}
    </button>
  )
}

function LoadingSpinner() {
  return (
    <svg 
      className="animate-spin h-4 w-4" 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4"
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}
