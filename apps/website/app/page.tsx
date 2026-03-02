import { Timeline, type TimelineItem } from "@litedag/ui/components/timeline"
import { FeatureCards } from "@/components/feature-cards"
import { HeroDotMatrix } from "@/components/hero-dot-matrix"
import { HeroGlobe } from "@/components/hero-globe"
import { HeroSubtitle } from "@/components/hero-subtitle"

const roadmap: TimelineItem[] = [
  { title: "Begin of the project", status: "done", date: "Nov 2023" },
  { title: "ASIC/FPGA/GPU-resistant PoW", status: "done", date: "Jul 2024" },
  { title: "Merge Mining Network", status: "done", date: "Jul 2024" },
  { title: "MiniDAG implementation", status: "done", date: "Jan 2025" },
  { title: "Website, Blog, and Docs", status: "done" },
  { title: "Block Explorer", status: "done" },
  { title: "Public testnet", status: "done" },
  { title: "Public stagenet", status: "done" },
  { title: "Mainnet launch", status: "done", date: "Aug 2025" },
  { title: "Hybrid Proof of Stake", status: "done", date: "Sep 2025" },
  { title: "GUI wallet (Linux/Windows)", status: "done" },
  { title: "List to exchanges", status: "current" },
  { title: "GUI wallet for Android", status: "current" },
  { title: "Bounties website", status: "future" },
  { title: "Smart Contracts Research", status: "future" },
  { title: "Quantum Resistance", status: "future" },
]

export default function Page() {
  return (
    <main className="min-h-svh">
      <section className="relative flex h-[calc(100svh-3.5rem)] items-center overflow-hidden">
        <HeroDotMatrix />
        <div className="relative z-10 mx-auto flex w-full max-w-7xl items-center px-4">
          <div className="flex max-w-lg flex-col gap-5">
            <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              The lightest DAG.
            </h1>
            <p className="max-w-md text-[15px] leading-relaxed text-muted-foreground">
              DAG benefits on a linear chain. Hybrid PoW/PoS with merge-mining.
            </p>
            <HeroSubtitle />
          </div>
        </div>
        <HeroGlobe />
      </section>

      <FeatureCards />

      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="mb-8 text-lg font-semibold">Roadmap</h2>
        <Timeline items={roadmap} />
      </section>
    </main>
  )
}
