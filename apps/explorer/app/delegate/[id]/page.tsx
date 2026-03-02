export const dynamic = "force-dynamic"

import Link from "next/link"
import { notFound } from "next/navigation"
import { getDelegate, getInfo, formatCoin, COIN } from "@/lib/rpc"
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

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  return { title: `Delegate ${id}` }
}

function unlockTime(unlockHeight: number, currentHeight: number): string {
  if (unlockHeight <= currentHeight) return "Unlocked"
  const remaining = unlockHeight - currentHeight
  const seconds = remaining * 15
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  if (days > 0) return `${days}d ${hours}h`
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

export default async function DelegatePage({ params }: Props) {
  const { id } = await params
  const delegateAddr = id.startsWith("delegate") ? id : `delegate${id}`

  let delegate
  try {
    delegate = await getDelegate(delegateAddr)
  } catch {
    notFound()
  }

  const info = await getInfo()

  const funds = [...(delegate.funds || [])].sort((a, b) => b.amount - a.amount)

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-4 text-2xl font-bold">Delegate: {delegate.name || delegateAddr}</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm">
          <Row label="Address" value={delegate.address} mono />
          <Row
            label="Owner"
            value={
              <Link href={`/account/${delegate.owner}`} className="text-primary hover:underline">
                {delegate.owner}
              </Link>
            }
          />
          <Row label="Total Staked" value={`${formatCoin(delegate.total_amount)} LDG`} />
          <Row label="Stakers" value={(funds.length || 0).toString()} />
        </CardContent>
      </Card>

      {funds.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Stakers</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Owner</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Unlock</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {funds.map((f, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Link
                        href={`/account/${f.owner}`}
                        className="font-mono text-xs text-primary hover:underline"
                      >
                        {f.owner.slice(0, 20)}...
                      </Link>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCoin(f.amount)} LDG
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {unlockTime(f.unlock, info.height)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
