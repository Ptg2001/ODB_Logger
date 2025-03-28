import React from "react"

interface PageTitleProps {
  title: string
  subtitle?: string
}

export function PageTitle({ title, subtitle }: PageTitleProps) {
  return (
    <div className="w-full px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-b border-border/30 bg-background/95 backdrop-blur-sm shadow-sm">
      <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight">{title}</h1>
      {subtitle && (
        <p className="text-xs sm:text-sm md:text-base text-muted-foreground mt-1">{subtitle}</p>
      )}
    </div>
  )
} 