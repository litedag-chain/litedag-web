"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { cn } from "@litedag/ui/lib/utils"

const VARIANTS = {
  warning: "border-yellow-500/30 bg-yellow-500/10 text-yellow-200",
  info: "border-blue-500/30 bg-blue-500/10 text-blue-200",
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
} as const

type BannerProps = {
  storageKey: string
  variant?: keyof typeof VARIANTS
  children: React.ReactNode
  className?: string
}

// Dismissable banner. Once dismissed, stays hidden via localStorage.
// Use storageKey to distinguish independent banners.
export function Banner({ storageKey, variant = "info", children, className }: BannerProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(!localStorage.getItem(storageKey))
  }, [storageKey])

  if (!visible) return null

  return (
    <div className={cn("flex items-center justify-center gap-3 border-b px-4 py-2 text-center text-sm", VARIANTS[variant], className)}>
      <span className="flex-1">{children}</span>
      <button
        onClick={() => { localStorage.setItem(storageKey, Date.now().toString()); setVisible(false) }}
        className="shrink-0 rounded p-0.5 opacity-50 transition-opacity hover:opacity-100"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  )
}

// Shows children only if there are unseen items since the last dismissal.
// Call markSeen() to update the timestamp (e.g. on "View all" click).
// storageKey stores the last-seen timestamp. unseenSince is the date of
// the newest item — if it's after the stored timestamp, banner shows.
type NewsBannerProps = {
  storageKey: string
  latestDate: string // YYYY-MM-DD or YYYY-MM
  variant?: keyof typeof VARIANTS
  children: React.ReactNode
  className?: string
}

export function NewsBanner({ storageKey, latestDate, variant = "info", children, className }: NewsBannerProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const lastSeen = localStorage.getItem(storageKey)
    if (!lastSeen) { setVisible(true); return }
    // Compare: latestDate (YYYY-MM-DD) vs stored ISO timestamp
    setVisible(latestDate > new Date(parseInt(lastSeen)).toISOString().slice(0, 10))
  }, [storageKey, latestDate])

  if (!visible) return null

  return (
    <div className={cn("flex items-center justify-center gap-3 border-b px-4 py-2 text-center text-sm", VARIANTS[variant], className)}>
      <span className="flex-1">{children}</span>
      <button
        onClick={() => { localStorage.setItem(storageKey, Date.now().toString()); setVisible(false) }}
        className="shrink-0 rounded p-0.5 opacity-50 transition-opacity hover:opacity-100"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  )
}
