import { ButtonHTMLAttributes } from "react"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost"
  size?: "sm" | "md" | "lg"
}

export function Button({ 
  variant = "primary", 
  size = "md",
  className = "",
  children,
  ...props 
}: ButtonProps) {
  const baseStyles = "font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
  
  const variants = {
    primary: "bg-primary-500 text-white hover:bg-primary-600 active:scale-[0.98] shadow-sm hover:shadow-md",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100"
  }

  const sizes = {
    sm: "py-1.5 px-3 text-xs",
    md: "py-2 px-4 text-sm",
    lg: "py-3 px-5 text-base"
  }

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
