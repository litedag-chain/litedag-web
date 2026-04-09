import Link from "next/link"
import { FeatureCards } from "@/components/feature-cards"
import { HeroSection } from "@/components/hero-section"
import { milestones } from "@litedag/shared/milestones"

function formatDate(date?: string): string | undefined {
  if (!date) return undefined
  const [y, m] = date.split("-")
  if (!m) return y
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  return `${months[parseInt(m, 10) - 1]} ${y}`
}

const ROADMAP = {
  done: milestones.filter((m) => m.status === "done" && m.major).map((m) => ({ title: m.title, date: formatDate(m.date) })),
  current: milestones.filter((m) => m.status === "current" && m.major).map((m) => ({ title: m.title, date: formatDate(m.target) })),
  future: milestones.filter((m) => m.status === "future" && m.major).map((m) => ({ title: m.title, date: formatDate(m.target) })),
}

const RECENT_CHANGES = milestones
  .filter((m) => m.status === "done" && m.description)
  .slice(-5)
  .reverse()

function RoadmapPhase({ label, fig, items, variant }: {
  label: string
  fig: string
  items: ReadonlyArray<{ title: string; date?: string }>
  variant: "done" | "current" | "future"
}) {
  return (
    <div className="flex flex-col border border-border/50 bg-background">
      <div className="flex items-center justify-between border-b border-border/50 px-5 py-3">
        <h3 className="text-sm font-semibold" style={{ fontFamily: "var(--font-display), sans-serif" }}>
          {label}
        </h3>
        <span className="font-mono text-[11px] tracking-wider text-muted-foreground/40">{fig}</span>
      </div>
      <ul className="flex flex-col gap-0 p-0">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3 border-b border-border/20 px-5 py-2.5 last:border-b-0">
            {variant === "done" && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-emerald-400">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
            {variant === "current" && (
              <div className="mt-1 size-3 shrink-0 rounded-full border-2 border-foreground">
                <div className="size-full rounded-full" />
              </div>
            )}
            {variant === "future" && (
              <div className="mt-1 size-3 shrink-0 rounded-full border-2 border-muted-foreground/25" />
            )}
            <div className="flex flex-1 items-baseline justify-between gap-2">
              <span className={
                variant === "done" ? "text-sm text-muted-foreground" :
                variant === "current" ? "text-sm text-foreground" :
                "text-sm text-muted-foreground/60"
              }>
                {item.title}
              </span>
              {item.date && (
                <span className="shrink-0 font-mono text-[11px] text-muted-foreground/40">{item.date}</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Page() {
  return (
    <main className="min-h-svh">
      <HeroSection />

      <FeatureCards />

      <section className="border-y border-border/50 bg-muted/50 py-16">
        <div className="mx-auto max-w-7xl px-4 2xl:max-w-[85%]">
          <h2 className="mb-6 text-sm font-medium uppercase tracking-widest text-muted-foreground/50" style={{ fontFamily: "var(--font-display), sans-serif" }}>Roadmap</h2>
          <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <RoadmapPhase label="Completed" fig="PHASE 01" items={ROADMAP.done} variant="done" />
            <RoadmapPhase label="In Progress" fig="PHASE 02" items={ROADMAP.current} variant="current" />
            <RoadmapPhase label="Planned" fig="PHASE 03" items={ROADMAP.future} variant="future" />
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 2xl:max-w-[85%]">
          <div className="mb-6 flex items-baseline justify-between">
            <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground/50" style={{ fontFamily: "var(--font-display), sans-serif" }}>Recent Changes</h2>
            <Link href="/changelog" className="text-xs text-muted-foreground/50 transition-colors hover:text-foreground">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {RECENT_CHANGES.map((m, i) => (
              <div key={i} className="flex flex-col gap-1.5 border border-border/50 p-5">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="text-sm font-semibold" style={{ fontFamily: "var(--font-display), sans-serif" }}>
                    {m.title}
                  </h3>
                  {m.date && (
                    <span className="shrink-0 font-mono text-[11px] text-muted-foreground/40">
                      {formatDate(m.date)}
                    </span>
                  )}
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">{m.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
