export const dynamic = "force-dynamic"

import Link from "next/link"
import { notFound } from "next/navigation"
import { getTransaction, getInfo, formatCoin } from "@/lib/rpc"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@litedag/ui/components/card"
import { Badge } from "@litedag/ui/components/badge"

type Props = { params: Promise<{ txid: string }> }

export async function generateMetadata({ params }: Props) {
  const { txid } = await params
  return { title: `TX ${txid.slice(0, 16)}...` }
}

export default async function TxPage({ params }: Props) {
  const { txid } = await params

  let tx
  try {
    tx = await getTransaction(txid)
  } catch {
    notFound()
  }

  const info = await getInfo()
  const confirmations = tx.height > 0 ? info.height - tx.height + 1 : 0

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-4 text-2xl font-bold">Transaction</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            Details
            {tx.coinbase && <Badge>Coinbase</Badge>}
            {confirmations > 0 && (
              <Badge variant="secondary">{confirmations.toLocaleString()} confirmations</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm">
          <Row label="TX ID" value={txid} mono />
          {tx.sender && (
            <Row
              label="Sender"
              value={
                <Link href={`/account/${tx.sender}`} className="text-primary hover:underline">
                  {tx.sender}
                </Link>
              }
            />
          )}
          <Row label="Total Amount" value={`${formatCoin(tx.total_amount)} LDG`} />
          <Row label="Fee" value={`${formatCoin(tx.fee)} LDG`} />
          <Row
            label="Block"
            value={
              tx.height > 0 ? (
                <Link href={`/block/${tx.height}`} className="text-primary hover:underline">
                  {tx.height.toLocaleString()}
                </Link>
              ) : (
                "Pending"
              )
            }
          />
          <Row label="Nonce" value={tx.nonce.toString()} />
        </CardContent>
      </Card>

      {tx.outputs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Outputs</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            {tx.outputs.map((out, i) => (
              <div key={i} className="flex flex-col gap-1 rounded border p-3 sm:flex-row sm:items-center sm:justify-between">
                <Link href={`/account/${out.recipient}`} className="font-mono text-xs text-primary hover:underline">
                  {out.recipient}
                </Link>
                <span className="font-mono">{formatCoin(out.amount)} LDG</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
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
      <span className="w-32 shrink-0 font-medium text-muted-foreground">{label}</span>
      <span className={`min-w-0 break-all ${mono ? "font-mono text-xs" : ""}`}>{value}</span>
    </div>
  )
}
