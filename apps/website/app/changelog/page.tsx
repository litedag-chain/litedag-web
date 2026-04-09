import type { Metadata } from "next"
import { milestones } from "@litedag/shared/milestones"

export const metadata: Metadata = {
  title: "Changelog",
  description: "What's shipped in LiteDAG.",
}

function formatDate(date?: string): string {
  if (!date) return ""
  const [y, m] = date.split("-")
  if (!m) return y!
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  return `${months[parseInt(m, 10) - 1]} ${y}`
}

export default function ChangelogPage() {
  const done = milestones
    .filter((m) => m.status === "done")
    .reverse()

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 2xl:max-w-[50%]">
      <h1
        className="mb-2 text-3xl font-bold tracking-tight"
        style={{ fontFamily: "var(--font-display), sans-serif" }}
      >
        Changelog
      </h1>
      <p className="mb-12 text-sm text-muted-foreground">What&apos;s shipped.</p>

      <div className="relative border-l border-border/50 pl-8">
        {done.map((m, i) => (
          <div key={i} className="relative mb-10 last:mb-0">
            <div className="absolute -left-[41px] top-1 size-3 rounded-full border-2 border-emerald-400 bg-background" />
            <div className="flex items-baseline gap-3">
              <h2 className="text-base font-semibold" style={{ fontFamily: "var(--font-display), sans-serif" }}>
                {m.title}
              </h2>
              {m.date && (
                <span className="shrink-0 font-mono text-xs text-muted-foreground/50">
                  {formatDate(m.date)}
                </span>
              )}
            </div>
            {m.description && (
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {m.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
