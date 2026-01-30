"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, disabled, ...props }, ref) => (
    <div className="flex items-center">
      <input
        type="checkbox"
        ref={ref}
        className={cn(
          "w-4 h-4 text-white bg-white dark:bg-dark-surface border-border dark:border-dark-border rounded focus:ring-primary dark:focus:ring-primary ring-offset-background focus:ring-2 checked:bg-primary checked:border-primary transition-all",
          className
        )}
        checked={checked}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
        disabled={disabled}
        {...props}
      />
    </div>
  )
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
