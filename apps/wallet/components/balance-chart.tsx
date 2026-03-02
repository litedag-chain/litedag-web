"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { formatCoin } from "@/lib/rpc-client"
import { COIN } from "@litedag/shared/constants"

export type BalancePoint = {
  height: number
  balance: number // atomic units
}

const chartConfig = {
  balance: {
    label: "Balance",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export function BalanceChart({ data }: { data: BalancePoint[] }) {
  if (data.length < 2) return null

  const displayData = data.map((d) => ({
    height: d.height,
    balance: d.balance / COIN,
  }))

  return (
    <ChartContainer config={chartConfig} className="h-[140px] w-full">
      <AreaChart
        accessibilityLayer
        data={displayData}
        margin={{ left: 0, right: 0, top: 4, bottom: 0 }}
      >
        <defs>
          <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-balance)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="var(--color-balance)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="height"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={40}
          tickFormatter={(v) => `#${v}`}
        />
        <YAxis hide domain={["dataMin", "dataMax"]} />
        <ChartTooltip
          content={
            <ChartTooltipContent
              className="w-[160px]"
              labelFormatter={(value) => `Block #${value}`}
              formatter={(value) => [formatCoin(Number(value) * COIN) + " LDG", "Balance"]}
            />
          }
        />
        <Area
          dataKey="balance"
          type="monotone"
          stroke="var(--color-balance)"
          strokeWidth={2}
          fill="url(#balanceGradient)"
          dot={false}
        />
      </AreaChart>
    </ChartContainer>
  )
}
