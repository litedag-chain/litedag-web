"use client"

import * as React from "react"
import { Check, Copy } from "lucide-react"
import { cn } from "@litedag/ui/lib/utils"

export interface CopyTextProps extends React.HTMLAttributes<HTMLDivElement> {
  text: string
  truncate?: "middle" | "end" | "none"
  truncateLength?: number
  size?: "xs" | "sm" | "base"
}

export function CopyText({
  text,
  truncate = "middle",
  truncateLength,
  size = "sm",
  className,
  ...props
}: CopyTextProps) {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const displayed = React.useMemo(() => {
    if (truncate === "none") return text
    const len = truncateLength ?? (truncate === "middle" ? 28 : 20)
    if (text.length <= len) return text
    if (truncate === "middle") {
      const half = Math.floor(len / 2)
      return `${text.slice(0, half)}...${text.slice(-half)}`
    }
    return `${text.slice(0, len)}...`
  }, [text, truncate, truncateLength])

  const sizeClass = size === "xs" ? "text-xs" : size === "sm" ? "text-sm" : "text-base"
  const iconSize = size === "xs" ? 12 : size === "sm" ? 14 : 16

  return (
    <div
      onClick={handleCopy}
      title={text}
      className={cn(
        "group inline-flex min-w-0 cursor-pointer items-center gap-1.5 rounded px-1 py-0.5 font-mono transition-colors hover:bg-muted",
        sizeClass,
        className,
      )}
      {...props}
    >
      <span className="min-w-0 truncate">{displayed}</span>
      <span className="shrink-0 transition-opacity">
        {copied ? (
          <Check className="text-green-500" size={iconSize} />
        ) : (
          <Copy
            className="opacity-0 transition-opacity group-hover:opacity-50"
            size={iconSize}
          />
        )}
      </span>
    </div>
  )
}
