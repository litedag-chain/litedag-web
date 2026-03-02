export const dynamic = "force-dynamic"

import Link from "next/link"
import { getInfo, getDelegate, COIN } from "@/lib/rpc"
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

export const metadata = { title: "Delegates" }

export default async function DelegatesPage() {
  const info = await getInfo()
  const totalStake = info.stake

  const delegates = []
  for (let i = 1; i <= 50; i++) {
    try {
      const d = await getDelegate(`delegate${i}`)
      delegates.push(d)
    } catch {
      break
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>
            {delegates.length} delegate{delegates.length !== 1 ? "s" : ""} — Total staked:{" "}
            {(totalStake / COIN).toLocaleString()} LDG
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead className="text-right">Staked</TableHead>
                <TableHead className="text-right">% of Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {delegates.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>
                    <Link
                      href={`/delegate/${d.address}`}
                      className="text-primary hover:underline"
                    >
                      {d.id}
                    </Link>
                  </TableCell>
                  <TableCell>{d.name}</TableCell>
                  <TableCell>
                    <Link
                      href={`/account/${d.owner}`}
                      className="font-mono text-xs text-primary hover:underline"
                    >
                      {d.owner.slice(0, 16)}...
                    </Link>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {(d.total_amount / COIN).toLocaleString()} LDG
                  </TableCell>
                  <TableCell className="text-right">
                    {totalStake > 0
                      ? ((d.total_amount / totalStake) * 100).toFixed(1)
                      : "0"}
                    %
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
