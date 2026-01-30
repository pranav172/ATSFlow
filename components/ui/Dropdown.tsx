"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface DropdownProps {
  trigger: React.ReactNode
  children: React.ReactNode
  align?: "left" | "right"
  className?: string
}

export function Dropdown({ trigger, children, align = "left", className }: DropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
      
      {isOpen && (
        <div 
          className={cn(
            "absolute z-50 mt-2 w-56 rounded-md bg-white dark:bg-dark-surface border border-border dark:border-dark-border shadow-lg focus:outline-none animate-in fade-in zoom-in-95 duration-100",
            align === "right" ? "right-0" : "left-0",
            className
          )}
        >
          <div className="py-1" role="menu" aria-orientation="vertical">
            {children}
          </div>
        </div>
      )}
    </div>
  )
}

interface DropdownItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  onClick?: () => void
}

export function DropdownItem({ children, className, onClick, ...props }: DropdownItemProps) {
  return (
    <div
      className={cn(
        "block px-4 py-2 text-sm text-text-primary dark:text-dark-text-primary hover:bg-surface dark:hover:bg-dark-surfaceHover cursor-pointer transition-colors",
        className
      )}
      role="menuitem"
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  )
}
