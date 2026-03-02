"use client"

import { useRef } from "react"
import { EncryptedText } from "@litedag/ui/components/encrypted-text"
import { ZapIcon, type ZapHandle } from "@litedag/ui/components/zap"
import { GitMergeIcon, type GitMergeIconHandle } from "@litedag/ui/components/git-merge"
import { CpuIcon, type CpuIconHandle } from "@litedag/ui/components/cpu"
import { HandCoinsIcon, type HandCoinsIconHandle } from "@litedag/ui/components/hand-coins"
import { LayersIcon, type LayersIconHandle } from "@litedag/ui/components/layers"
import { FingerprintIcon, type FingerprintIconHandle } from "@litedag/ui/components/fingerprint"

type IconHandle = ZapHandle | GitMergeIconHandle | CpuIconHandle | HandCoinsIconHandle | LayersIconHandle | FingerprintIconHandle

const FEATURES = [
  {
    fig: "FIG 0.1",
    title: "15s blocks",
    description: "Fast finality with MiniDAG consensus. Uncle blocks are acknowledged and rewarded, not discarded.",
    Icon: ZapIcon,
  },
  {
    fig: "FIG 0.2",
    title: "Merge-mined",
    description: "Shared hashrate with partner chains. Lower cost security without splitting mining power.",
    Icon: GitMergeIcon,
  },
  {
    fig: "FIG 0.3",
    title: "ASIC-resistant",
    description: "RandomLiteDAG memory-hard PoW keeps consumer CPUs competitive against specialized hardware.",
    Icon: CpuIcon,
  },
  {
    fig: "FIG 0.4",
    title: "No premine",
    description: "10% governance fee on block rewards only. No ICO, no VC allocation, no insider tokens.",
    Icon: HandCoinsIcon,
  },
  {
    fig: "FIG 0.5",
    title: "Scalable",
    description: "MiniDAG acknowledges parallel work without the complexity of a full DAG data structure.",
    Icon: LayersIcon,
  },
  {
    fig: "FIG 0.6",
    title: "Original",
    description: "Written from scratch in Go. ~17k lines of audited code, no forked runtime dependencies.",
    Icon: FingerprintIcon,
  },
] as const

function FeatureCard({ fig, title, description, Icon }: {
  fig: string
  title: string
  description: string
  Icon: React.ForwardRefExoticComponent<React.RefAttributes<IconHandle> & { size?: number; className?: string }>
}) {
  const ref = useRef<IconHandle>(null)

  return (
    <div
      onMouseEnter={() => ref.current?.startAnimation()}
      onMouseLeave={() => ref.current?.stopAnimation()}
      className="group flex flex-col border border-border/50 bg-card transition-colors hover:bg-muted/50"
    >
      <div className="relative flex h-48 items-center justify-center bg-muted/20 transition-colors group-hover:bg-muted/40">
        <span className="absolute left-4 top-4 font-mono text-[11px] tracking-wider text-muted-foreground/40">
          {fig}
        </span>
        <Icon
          ref={ref}
          size={80}
          className="text-muted-foreground transition-colors group-hover:text-foreground"
        />
      </div>
      <div className="flex flex-col gap-1.5 p-5">
        <h3 className="text-sm font-semibold" style={{ fontFamily: "var(--font-display), sans-serif" }}>
          <EncryptedText text={title} revealDelayMs={40} flipDelayMs={30} encryptedClassName="opacity-30" />
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

export function FeatureCards() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <FeatureCard key={f.title} {...f} />
        ))}
      </div>
    </section>
  )
}
