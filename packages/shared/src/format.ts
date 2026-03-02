import { COIN } from "@litedag/shared/constants"

export function formatCoin(atomic: number): string {
  const whole = Math.floor(atomic / COIN)
  const frac = atomic % COIN
  if (frac === 0) return whole.toLocaleString()
  const fracStr = frac.toString().padStart(9, "0").replace(/0+$/, "")
  return `${whole.toLocaleString()}.${fracStr}`
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(2)}K`
  return n.toFixed(2)
}

export function formatHashrate(difficulty: string, target: number): string {
  const diff = parseFloat(difficulty)
  const hs = diff / target
  if (hs >= 1e12) return `${(hs / 1e12).toFixed(2)} TH/s`
  if (hs >= 1e9) return `${(hs / 1e9).toFixed(2)} GH/s`
  if (hs >= 1e6) return `${(hs / 1e6).toFixed(2)} MH/s`
  if (hs >= 1e3) return `${(hs / 1e3).toFixed(2)} KH/s`
  return `${hs.toFixed(2)} H/s`
}

export function timeAgo(timestampMs: number): string {
  const diff = Date.now() - timestampMs
  const seconds = Math.floor(diff / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}
