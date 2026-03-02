import Link from "next/link"
import { Button } from "@litedag/ui/components/button"
import { Timeline, type TimelineItem } from "@litedag/ui/components/timeline"
import { FeatureCards } from "@/components/feature-cards"

const features = [
  {
    title: "15s blocks",
    description: "Fast finality with MiniDAG consensus.",
  },
  {
    title: "Merge-mined",
    description: "Shared hashrate, lower cost security.",
  },
  {
    title: "ASIC-resistant",
    description: "RandomLiteDAG keeps CPUs competitive.",
  },
  {
    title: "No premine",
    description: "10% dev fee on block rewards only.",
  },
  {
    title: "Scalable",
    description: "MiniDAG prunes chain bloat.",
  },
  {
    title: "Original",
    description: "Written from scratch in Go.",
  },
]

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
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-start gap-12 px-4 py-24 lg:grid-cols-[1fr_auto] lg:gap-16 lg:py-32">
          <div className="flex flex-col gap-5">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              LiteDAG
            </h1>
            <p className="max-w-sm text-[15px] leading-relaxed text-muted-foreground">
              The first MiniDAG — a DAG simulated on a linear chain.
              Multi-chain PoW via merge-mining.
            </p>
            <div className="flex gap-3">
              <Button asChild size="sm">
                <Link href="/docs/info/links#wallets">Get started</Link>
              </Button>
              <Button variant="outline" asChild size="sm">
                <Link href="/docs">Read the docs</Link>
              </Button>
            </div>
          </div>

          <FeatureCards features={features} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="mb-8 text-lg font-semibold">Roadmap</h2>
        <Timeline items={roadmap} />
      </section>
    </main>
  )
}
