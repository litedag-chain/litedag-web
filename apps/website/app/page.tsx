import { FeatureCards } from "@/components/feature-cards"
import { HeroDotMatrix } from "@/components/hero-dot-matrix"
import { HeroGlobe } from "@/components/hero-globe"
import { HeroSubtitle } from "@/components/hero-subtitle"

const ROADMAP = {
  done: [
    { title: "Begin of the project", date: "Nov 2023" },
    { title: "ASIC/FPGA/GPU-resistant PoW", date: "Jul 2024" },
    { title: "Merge Mining Network", date: "Jul 2024" },
    { title: "MiniDAG implementation", date: "Jan 2025" },
    { title: "Website, Blog, and Docs" },
    { title: "Block Explorer" },
    { title: "Public testnet" },
    { title: "Public stagenet" },
    { title: "Mainnet launch", date: "Aug 2025" },
    { title: "Hybrid Proof of Stake", date: "Sep 2025" },
    { title: "GUI wallet (Linux/Windows)" },
  ],
  current: [
    { title: "List to exchanges" },
    { title: "GUI wallet for Android" },
  ],
  future: [
    { title: "Bounties website" },
    { title: "Smart Contracts Research" },
    { title: "Quantum Resistance" },
  ],
} as const

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
      <section className="relative flex h-[calc(100svh-3.5rem)] items-center overflow-hidden">
        <HeroDotMatrix />
        <div className="relative z-10 mx-auto flex w-full max-w-7xl items-center px-4">
          <div className="flex max-w-lg flex-col gap-4">
            <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl" style={{ fontFamily: "var(--font-display), sans-serif" }}>
              The lightest DAG.
            </h1>
            <p className="max-w-md text-base leading-[1.65] text-muted-foreground/90">
              DAG benefits on a linear chain. Hybrid PoW/PoS with merge-mining.
            </p>
            <HeroSubtitle />
          </div>
        </div>
        <HeroGlobe />
      </section>

      <FeatureCards />

      <section className="border-y border-border/50 bg-muted/50 py-16">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="mb-6 text-sm font-medium uppercase tracking-widest text-muted-foreground/50" style={{ fontFamily: "var(--font-display), sans-serif" }}>Roadmap</h2>
          <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <RoadmapPhase label="Completed" fig="PHASE 01" items={ROADMAP.done} variant="done" />
            <RoadmapPhase label="In Progress" fig="PHASE 02" items={ROADMAP.current} variant="current" />
            <RoadmapPhase label="Planned" fig="PHASE 03" items={ROADMAP.future} variant="future" />
          </div>
        </div>
      </section>
    </main>
  )
}
