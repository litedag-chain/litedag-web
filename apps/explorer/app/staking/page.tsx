export const dynamic = "force-dynamic"

import { getInfo, COIN } from "@/lib/rpc"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@litedag/ui/components/card"

export const metadata = { title: "Staking Calculator" }

const BLOCKS_PER_DAY = 5760 // 86400 / 15
const STAKER_PERCENT = 0.4

// Simplified reward calculation matching Go explorer's GetStakeReward
// Block reward reduces 10% every season (91 days = 524160 blocks)
function getBlockReward(height: number): number {
  const SEASON_BLOCKS = 91 * BLOCKS_PER_DAY
  const INITIAL_REWARD = 175 * COIN

  // First 2 seasons (6 months) = no reduction
  if (height < 2 * SEASON_BLOCKS) return INITIAL_REWARD

  const seasonsElapsed = Math.floor(height / SEASON_BLOCKS) - 1
  return Math.floor(INITIAL_REWARD * Math.pow(0.9, seasonsElapsed))
}

function getStakeReward(startHeight: number, blockCount: number, totalStake: number): number {
  if (totalStake === 0) return 0
  let total = 0
  for (let i = 0; i < blockCount; i++) {
    total += getBlockReward(startHeight + i) * STAKER_PERCENT
  }
  return total / COIN
}

export default async function StakingPage() {
  const info = await getInfo()
  const stake = info.stake / COIN

  const reward24h = stake > 0 ? getStakeReward(info.height, BLOCKS_PER_DAY, info.stake) / stake : 0
  const reward30d = stake > 0 ? getStakeReward(info.height, 30 * BLOCKS_PER_DAY, info.stake) / stake : 0
  const reward1y = stake > 0 ? getStakeReward(info.height, 365 * BLOCKS_PER_DAY, info.stake) / stake : 0

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Staking Calculator</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Network Staking Info</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm">
          <Row label="Total Staked" value={`${stake.toLocaleString()} LDG`} />
          <Row
            label="% of Supply"
            value={
              info.circulating_supply > 0
                ? `${((info.stake / info.circulating_supply) * 100).toFixed(2)}%`
                : "0%"
            }
          />
          <Row label="Block Reward" value={`${(info.block_reward / COIN).toFixed(2)} LDG`} />
          <Row label="Staker Share" value="40% of block reward" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Estimated Returns (per 1 LDG staked)</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <RewardCard period="24 Hours" percent={reward24h * 100} />
          <RewardCard period="30 Days" percent={reward30d * 100} />
          <RewardCard period="1 Year" percent={reward1y * 100} />
        </CardContent>
      </Card>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:gap-4">
      <span className="w-32 shrink-0 font-medium text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  )
}

function RewardCard({ period, percent }: { period: string; percent: number }) {
  return (
    <div className="rounded-lg border p-4 text-center">
      <p className="text-sm text-muted-foreground">{period}</p>
      <p className="mt-1 text-2xl font-bold">{percent.toFixed(2)}%</p>
    </div>
  )
}
