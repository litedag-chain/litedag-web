import * as React from "react"
import { cn } from "@litedag/ui/lib/utils"

type TimelineItemStatus = "done" | "current" | "future"

type TimelineItem = {
  title: string
  description?: string
  date?: string
  status: TimelineItemStatus
}

function Timeline({
  items,
  className,
}: {
  items: TimelineItem[]
  className?: string
}) {
  return (
    <div className={cn("flex flex-col", className)}>
      {items.map((item, i) => {
        const isFirst = i === 0
        const isLast = i === items.length - 1
        const prevDone = i > 0 && items[i - 1]!.status === "done"
        const connectorAboveColor = prevDone ? "bg-emerald-400/40" : "bg-border"
        const connectorBelowColor = item.status === "done" ? "bg-emerald-400/40" : "bg-border"

        return (
          <div key={i} className="flex">
            {/* Date column */}
            <div className="flex w-24 shrink-0 items-start justify-end pr-6 pt-3">
              {item.date && (
                <span className="font-mono text-xs text-muted-foreground">
                  {item.date}
                </span>
              )}
            </div>

            {/* Dot + connectors column */}
            <div className="relative flex w-10 shrink-0 flex-col items-center">
              {/* Connector above dot */}
              {!isFirst && (
                <div className={cn("w-0.5 flex-1", connectorAboveColor)} />
              )}
              {isFirst && <div className="flex-1" />}

              {/* Dot */}
              <div className="relative z-10 my-1 shrink-0">
                {item.status === "done" ? (
                  <div className="flex size-7 items-center justify-center rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/25">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-white dark:text-black"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                ) : item.status === "current" ? (
                  <div className="flex size-7 items-center justify-center rounded-full border-2 border-foreground bg-background">
                    <div className="size-2.5 rounded-full bg-foreground" />
                  </div>
                ) : (
                  <div className="size-7 rounded-full border-2 border-muted-foreground/25 bg-background" />
                )}
              </div>

              {/* Connector below dot */}
              {!isLast && (
                <div className={cn("w-0.5 flex-1", connectorBelowColor)} />
              )}
              {isLast && <div className="flex-1" />}
            </div>

            {/* Content column */}
            <div className="flex flex-1 flex-col justify-center py-3 pl-5">
              <span
                className={cn(
                  "font-medium",
                  item.status === "done" && "text-emerald-400",
                  item.status === "current" && "text-foreground",
                  item.status === "future" && "text-muted-foreground",
                )}
              >
                {item.title}
              </span>
              {item.description && (
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {item.description}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export { Timeline, type TimelineItem, type TimelineItemStatus }
