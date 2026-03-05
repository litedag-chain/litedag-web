export const dynamic = "force-dynamic"

import Link from "next/link"
import { notFound } from "next/navigation"
import {
  getBlockByHeight,
  getBlockByHash,
  getInfo,
  formatCoin,
  type GetBlockResponse,
} from "@/lib/rpc"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@litedag/ui/components/card"
import { Badge } from "@litedag/ui/components/badge"

type Props = { params: Promise<{ id: string }> }

async function fetchBlock(id: string): Promise<GetBlockResponse | null> {
  try {
    if (id.length === 64) return await getBlockByHash(id)
    const height = parseInt(id, 10)
    if (isNaN(height)) return null
    return await getBlockByHeight(height)
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  return { title: `Block ${id}` }
}

export default async function BlockPage({ params }: Props) {
  const { id } = await params
  const block = await fetchBlock(id)
  if (!block) notFound()

  const info = await getInfo()
  const confirmations = info.height - block.block.header.height + 1
  const timestamp = new Date(block.block.header.timestamp).toUTCString()

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 2xl:max-w-[85%]">
      <div className="mb-4 flex items-center gap-3">
        <h1 className="text-2xl font-bold">Block {block.block.header.height.toLocaleString()}</h1>
        <Badge variant="secondary">{confirmations.toLocaleString()} confirmations</Badge>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm">
          <Row label="Hash" value={block.hash} mono />
          <Row label="Height" value={block.block.header.height.toLocaleString()} />
          <Row label="Timestamp" value={timestamp} />
          <Row
            label="Miner"
            value={
              <Link href={`/account/${block.miner}`} className="text-primary hover:underline">
                {block.miner}
              </Link>
            }
          />
          <Row label="Transactions" value={block.block.transactions.length.toString()} />
          <Row label="Total Reward" value={`${formatCoin(block.total_reward)} LDG`} />
          <Row label="Miner Reward" value={`${formatCoin(block.miner_reward)} LDG`} />
          <Row label="Staker Reward" value={`${formatCoin(block.staker_reward)} LDG`} />
          <Row label="Governance Reward" value={`${formatCoin(block.governance_reward)} LDG`} />
          {block.block.header.DelegateId > 0 && (
            <Row
              label="Delegate"
              value={
                <Link
                  href={`/delegate/${block.block.header.DelegateId}`}
                  className="text-primary hover:underline"
                >
                  delegate{block.block.header.DelegateId}
                </Link>
              }
            />
          )}
          {block.block.header.prev_hash && (
            <Row
              label="Previous Block"
              value={
                <Link
                  href={`/block/${block.block.header.height > 0 ? block.block.header.height - 1 : 0}`}
                  className="text-primary hover:underline"
                >
                  {block.block.header.height > 0 ? block.block.header.height - 1 : 0}
                </Link>
              }
            />
          )}
        </CardContent>
      </Card>

      {block.block.transactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2">
              {block.block.transactions.map((txid) => (
                <li key={txid}>
                  <Link
                    href={`/tx/${txid}`}
                    className="font-mono text-sm text-primary hover:underline"
                  >
                    {txid}
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <div className="mt-4 flex justify-between text-sm">
        {block.block.header.height > 0 && (
          <Link href={`/block/${block.block.header.height - 1}`} className="text-primary hover:underline">
            Block {block.block.header.height - 1}
          </Link>
        )}
        <Link
          href={`/block/${block.block.header.height + 1}`}
          className="text-primary hover:underline"
        >
          Block {block.block.header.height + 1}
        </Link>
      </div>
    </div>
  )
}

function Row({
  label,
  value,
  mono,
}: {
  label: string
  value: React.ReactNode
  mono?: boolean
}) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:gap-4">
      <span className="w-40 shrink-0 font-medium text-muted-foreground">{label}</span>
      <span className={`min-w-0 break-all ${mono ? "font-mono text-xs" : ""}`}>{value}</span>
    </div>
  )
}
