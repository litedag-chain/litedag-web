export const dynamic = "force-dynamic"

import Link from "next/link"
import {
  getInfo,
  getBlockByHeight,
  formatCoin,
  formatHashrate,
  formatNumber,
  timeAgo,
  COIN,
  type GetBlockResponse,
} from "@/lib/rpc"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@litedag/ui/components/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@litedag/ui/components/table"

async function getRecentBlocks(height: number, count: number) {
  const blocks: GetBlockResponse[] = []
  const start = Math.max(0, height - count + 1)
  const promises = []
  for (let h = height; h >= start; h--) {
    promises.push(getBlockByHeight(h))
  }
  const results = await Promise.allSettled(promises)
  for (const r of results) {
    if (r.status === "fulfilled") blocks.push(r.value)
  }
  return blocks
}

export default async function Page() {
  const info = await getInfo()
  const blocks = await getRecentBlocks(info.height, 20)

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Chain info */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Height</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{info.height.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Hashrate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatHashrate(info.difficulty, info.target_block_time)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Circulating</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatNumber(info.circulating_supply / COIN)} LDG
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Block Reward</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {(info.block_reward / COIN).toFixed(2)} LDG
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <form action="/search" className="mb-8">
        <input
          name="q"
          type="text"
          placeholder="Search by block height, hash, tx id, or address..."
          className="w-full rounded-lg border bg-background px-4 py-2 text-sm"
        />
      </form>

      {/* Recent blocks */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Blocks</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Height</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Miner</TableHead>
                <TableHead>Txs</TableHead>
                <TableHead className="text-right">Reward</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {blocks.map((b) => (
                <TableRow key={b.hash}>
                  <TableCell>
                    <Link
                      href={`/block/${b.block.header.height}`}
                      className="font-mono text-primary hover:underline"
                    >
                      {b.block.header.height.toLocaleString()}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {timeAgo(b.block.header.timestamp)}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/account/${b.miner}`}
                      className="font-mono text-xs text-primary hover:underline"
                    >
                      {b.miner.slice(0, 16)}...
                    </Link>
                  </TableCell>
                  <TableCell>{b.block.transactions.length}</TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCoin(b.total_reward)} LDG
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
