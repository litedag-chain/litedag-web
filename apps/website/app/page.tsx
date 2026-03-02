import Link from "next/link"
import { Button } from "@litedag/ui/components/button"
import { HeroBackground } from "@/components/hero-background"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@litedag/ui/components/card"
import { Timeline, type TimelineItem } from "@litedag/ui/components/timeline"

const features = [
  {
    title: "Incredibly fast",
    description:
      "LiteDAG produces a block every 15 seconds.",
  },
  {
    title: "Extremely scalable",
    description:
      "MiniDAG prunes unnecessary block info, reducing chain size and increasing throughput.",
  },
  {
    title: "Multi-chain security",
    description:
      "Merge-mined protocols share hashrate. Higher security at lower cost.",
  },
  {
    title: "Secure",
    description:
      "RandomLiteDAG is an ASIC-resistant mining algorithm. CPUs are the most efficient hardware.",
  },
  {
    title: "Fair",
    description:
      "No premine. Development funded with a 10% fee on block rewards.",
  },
  {
    title: "Unique",
    description:
      "Written from the ground up in Go, one of the most original blockchain projects.",
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

const links = [
  { label: "Discord", href: "https://discord.gg/Kx5qtH6Jm2" },
  { label: "Twitter", href: "https://x.com/LiteDAGProtocol" },
  { label: "Matrix", href: "https://matrix.to/#/#litedag:converser.eu" },
  { label: "Telegram", href: "https://t.me/litedag_en" },
  { label: "GitHub", href: "https://github.com/litedag-chain" },
]

export default function Page() {
  return (
    <main className="min-h-svh">
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center gap-6 overflow-hidden px-4 py-32 text-center">
        <HeroBackground />
        <h1 className="relative z-10 text-4xl font-bold tracking-tight sm:text-6xl">
          Beyond the impossible.
          <br />
          <span className="bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
            Meet the LiteDAG Protocol.
          </span>
        </h1>
        <p className="relative z-10 max-w-2xl text-lg text-muted-foreground">
          The world&apos;s first MiniDAG — a novel system that simulates a
          Directed Acyclic Graph (DAG) on a linear blockchain. Secured by
          multi-chain Proof-of-Work via Merge-Mining.
        </p>
        <div className="relative z-10 flex gap-3">
          <Button asChild>
            <Link href="/docs/info/links#wallets">Get started</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/docs">Read the docs</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-4 py-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Card key={f.title}>
              <CardHeader>
                <CardTitle>{f.title}</CardTitle>
                <CardDescription>{f.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* Roadmap */}
      <section className="mx-auto max-w-3xl px-4 py-16">
        <h2 className="mb-8 text-2xl font-bold">Roadmap</h2>
        <Timeline items={roadmap} />
      </section>

      {/* Community */}
      <section className="mx-auto max-w-3xl px-4 py-16">
        <h2 className="mb-4 text-2xl font-bold">Get involved</h2>
        <p className="mb-6 text-muted-foreground">
          Join the community and stay up-to-date with the latest news.
        </p>
        <div className="flex flex-wrap gap-3">
          {links.map((l) => (
            <Button key={l.label} variant="outline" asChild>
              <a href={l.href} target="_blank" rel="noopener noreferrer">
                {l.label}
              </a>
            </Button>
          ))}
        </div>
      </section>
    </main>
  )
}
