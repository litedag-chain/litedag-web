export const dynamic = "force-dynamic"

import { getInfo, formatNumber, COIN } from "@/lib/rpc"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@litedag/ui/components/card"

export const metadata = { title: "Stats" }

export default async function StatsPage() {
  const info = await getInfo()

  const circulating = info.circulating_supply / COIN
  const totalSupply = info.total_supply / COIN
  const maxSupply = info.max_supply / COIN
  const burned = info.burned / COIN
  const staked = info.stake / COIN

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Circulating Supply"
          value={`${formatNumber(circulating)} LDG`}
          sub={`${((circulating / maxSupply) * 100).toFixed(2)}% of max`}
        />
        <StatCard
          label="Total Supply"
          value={`${formatNumber(totalSupply)} LDG`}
          sub={`${((totalSupply / maxSupply) * 100).toFixed(2)}% of max`}
        />
        <StatCard
          label="Max Supply"
          value={`${formatNumber(maxSupply)} LDG`}
        />
        <StatCard
          label="Burned"
          value={`${formatNumber(burned)} LDG`}
          sub={`${((burned / maxSupply) * 100).toFixed(2)}% of max`}
        />
        <StatCard
          label="Total Staked"
          value={`${formatNumber(staked)} LDG`}
          sub={circulating > 0 ? `${((staked / circulating) * 100).toFixed(2)}% of circulating` : undefined}
        />
        <StatCard
          label="Peers"
          value={info.peers.toString()}
        />
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string
  value: string
  sub?: string
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xl font-bold">{value}</p>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </CardContent>
    </Card>
  )
}
