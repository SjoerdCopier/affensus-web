import * as React from "react"
import { cn } from "@/lib/utils"

interface TooltipProviderProps {
  children: React.ReactNode
}

const TooltipProvider = ({ children }: TooltipProviderProps) => {
  return <div>{children}</div>
}

interface TooltipProps {
  children: React.ReactNode
}

const Tooltip = ({ children }: TooltipProps) => {
  return (
    <div className="relative inline-block group">
      {children}
    </div>
  )
}

interface TooltipTriggerProps {
  children: React.ReactNode
  className?: string
}

const TooltipTrigger = ({ children, className }: TooltipTriggerProps) => {
  return (
    <div className={cn("cursor-help", className)}>
      {children}
    </div>
  )
}

interface TooltipContentProps {
  children: React.ReactNode
  className?: string
}

const TooltipContent = ({ children, className }: TooltipContentProps) => {
  return (
    <div className={cn(
      "absolute z-50 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200",
      "-top-2 left-6 transform -translate-y-full w-80 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg",
      "before:content-[''] before:absolute before:top-full before:left-4 before:border-4 before:border-transparent before:border-t-gray-900",
      className
    )}>
      {children}
    </div>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
