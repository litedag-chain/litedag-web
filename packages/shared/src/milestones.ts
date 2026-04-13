export type Milestone = {
  title: string
  description?: string
  status: "done" | "current" | "future"
  date?: string   // when it shipped (YYYY-MM or YYYY-MM-DD)
  target?: string // when we aim to ship
  major?: boolean // true = shows on roadmap, omitted = changelog only
  apps?: ("wallet" | "explorer" | "website")[] // which apps this is relevant to
  credit?: { name: string; url?: string }  // community contributor
  pr?: string // PR URL
}

export const milestones: Milestone[] = [
  // --- Done ---
  {
    title: "Original codebase written",
    date: "2023-11",
    status: "done",
    major: true,
    description: "~17k lines of Go, written from scratch. RandomX PoW, MiniDAG consensus, hybrid PoS.",
  },
  {
    title: "ASIC/FPGA/GPU-resistant PoW",
    date: "2024-07",
    status: "done",
    major: true,
    description: "RandomX memory-hard proof-of-work keeps consumer CPUs competitive.",
  },
  {
    title: "Merge mining network",
    date: "2024-07",
    status: "done",
    major: true,
    description: "Shared hashrate with partner chains via masterchain merge mining.",
  },
  {
    title: "MiniDAG implementation",
    date: "2025-01",
    status: "done",
    major: true,
    description: "Uncle block acknowledgment — side blocks earn 50% reward instead of being discarded.",
  },
  {
    title: "Hybrid Proof of Stake",
    date: "2025-09",
    status: "done",
    major: true,
    description: "50% miner / 40% staker / 10% treasury reward split. Delegated staking with on-chain registration.",
  },
  {
    title: "Security audit",
    date: "2026-02",
    status: "done",
    major: true,
    description: "Full static review of 103 Go files. No backdoors, no key exfiltration, no malicious code. RandomX binaries rebuilt from source and verified.",
  },
  {
    title: "LiteDAG fork",
    date: "2026-02",
    status: "done",
    major: true,
    description: "Forked from Virel. New network ID, cleared checkpoints, blocked old treasury, full rebrand across 7 repos.",
  },
  {
    title: "New brand identity",
    date: "2026-03",
    status: "done",
    major: true,
    apps: ["website"],
    description: "New logo, color palette, and visual identity across all apps.",
  },
  {
    title: "Website, explorer & web wallet",
    date: "2026-03",
    status: "done",
    major: true,
    apps: ["website", "explorer", "wallet"],
    description: "Rebuilt from scratch with redesigned UI/UX. Website, explorer, and wallet deploying independently.",
  },
  {
    title: "Production guides",
    date: "2026-03",
    status: "done",
    major: true,
    apps: ["website"],
    description: "Mining, staking, and systemd deployment guides for running nodes in production.",
  },
  {
    title: "Balance migration",
    date: "2026-03",
    status: "done",
    major: true,
    description: "1:1 snapshot at Virel height 1,188,160. 1,459 addresses, ~196.4M LDG prefunded at genesis. Same seed, same address, same balance.",
  },
  {
    title: "Mainnet launch",
    date: "2026-04",
    status: "done",
    major: true,
    description: "20 LDG/block, 1 LDG tail emission, 311.7M max supply. PoS active with delegate staking.",
  },
  {
    title: "Integrated address support",
    date: "2026-04",
    status: "done",
    apps: ["wallet"],
    description: "Fixed payment_id handling — CEX deposits are now properly identifiable. Verified against Go implementation with 40 cross-language test vectors.",
  },
  {
    title: "Manual Payment ID in send dialog",
    date: "2026-04",
    status: "done",
    apps: ["wallet"],
    description: "Optional Payment ID field in the send form. Manual value overrides the address-embedded payment_id.",
    credit: { name: "cexius", url: "https://github.com/cexius" },
    pr: "https://github.com/litedag-chain/litedag-web/pull/1",
  },

  {
    title: "Payment ID precision fix",
    date: "2026-04",
    status: "done",
    apps: ["wallet"],
    description: "Switched payment ID handling to bigint end-to-end, preventing silent precision loss for large payment IDs (above 2^53).",
    credit: { name: "cexius", url: "https://github.com/cexius" },
  },
  {
    title: "Mempool fee-priority sorting",
    date: "2026-04",
    status: "done",
    major: true,
    description: "Block assembly now selects highest fee-per-byte transactions first. Preserves nonce order per sender. Node v3.3.1.",
    credit: { name: "nuliro" },
  },
  {
    title: "Public testnet",
    status: "current",
    major: true,
  },

  // --- Current ---
  {
    title: "Exchange listings",
    status: "current",
    major: true,
  },
  {
    title: "GUI wallet for Android",
    status: "current",
    major: true,
  },
  {
    title: "Fee reduction",
    status: "current",
    major: true,
    description: "Remove protocol-level minimum fee, enforce at node mempool policy level. Requires hard fork.",
  },
  {
    title: "Bounties website",
    status: "future",
    major: true,
  },
  {
    title: "Smart contracts research",
    status: "future",
    major: true,
  },
  {
    title: "Quantum resistance",
    status: "future",
    major: true,
  },
]
