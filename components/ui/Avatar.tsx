import * as React from "react"
import { cn } from "@/lib/utils"

interface AvatarProps {
  src?: string | null
  alt?: string
  fallback?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function Avatar({ src, alt, fallback, size = 'md', className }: AvatarProps) {
  const [error, setError] = React.useState(false)

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl'
  }

  return (
    <div className={cn("relative inline-block rounded-full overflow-hidden bg-border dark:bg-dark-border", sizeClasses[size], className)}>
      {src && !error ? (
        <img
          src={src}
          alt={alt || "Avatar"}
          className="w-full h-full object-cover"
          onError={() => setError(true)}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center font-medium text-text-secondary dark:text-dark-text-secondary">
          {fallback || "?"}
        </div>
      )}
    </div>
  )
}
