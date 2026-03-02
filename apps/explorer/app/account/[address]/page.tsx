export const dynamic = "force-dynamic"

import Link from "next/link"
import { notFound } from "next/navigation"
import { getAddress, getTxList, getTransaction, formatCoin } from "@/lib/rpc"
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

type Props = {
  params: Promise<{ address: string }>
  searchParams: Promise<{ page?: string; transfer_type?: string }>
}

export async function generateMetadata({ params }: Props) {
  const { address } = await params
  return { title: `Account ${address.slice(0, 16)}...` }
}

export default async function AccountPage({ params, searchParams }: Props) {
  const { address } = await params
  const sp = await searchParams
  const page = parseInt(sp.page || "0", 10)
  const transferType = sp.transfer_type === "outgoing" ? "outgoing" : "incoming"

  let addrInfo
  try {
    addrInfo = await getAddress(address)
  } catch {
    notFound()
  }

  let txList: { txid: string; height: number; amount: number; fee: number; coinbase: boolean }[] = []
  let maxPage = 0

  try {
    const txListRes = await getTxList(address, transferType, page)
    maxPage = txListRes.max_page

    const uniqueTxids = [...new Set(txListRes.transactions)]
    const txDetails = await Promise.allSettled(
      uniqueTxids.map((txid) => getTransaction(txid))
    )

    txList = uniqueTxids
      .map((txid, i) => {
        const r = txDetails[i]
        if (r?.status !== "fulfilled") return null
        const tx = r.value
        return {
          txid,
          height: tx.height,
          amount: tx.total_amount,
          fee: tx.fee,
          coinbase: tx.coinbase,
        }
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
      .sort((a, b) => b.height - a.height)
  } catch {
    // tx list fetch failed — show account info without txs
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-4 text-2xl font-bold">Account</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Balance</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm">
          <div className="flex flex-col gap-1 sm:flex-row sm:gap-4">
            <span className="w-32 shrink-0 font-medium text-muted-foreground">Address</span>
            <span className="min-w-0 break-all font-mono text-xs">{address}</span>
          </div>
          <div className="flex flex-col gap-1 sm:flex-row sm:gap-4">
            <span className="w-32 shrink-0 font-medium text-muted-foreground">Balance</span>
            <span className="font-bold">{formatCoin(addrInfo.balance)} LDG</span>
          </div>
          {addrInfo.mempool_balance > 0 && (
            <div className="flex flex-col gap-1 sm:flex-row sm:gap-4">
              <span className="w-32 shrink-0 font-medium text-muted-foreground">Pending</span>
              <span>{formatCoin(addrInfo.mempool_balance)} LDG</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-4">
            Transactions
            <div className="flex gap-2 text-sm font-normal">
              <Link
                href={`/account/${address}?transfer_type=incoming`}
                className={transferType === "incoming" ? "font-bold text-primary" : "text-muted-foreground hover:text-foreground"}
              >
                Incoming
              </Link>
              <Link
                href={`/account/${address}?transfer_type=outgoing`}
                className={transferType === "outgoing" ? "font-bold text-primary" : "text-muted-foreground hover:text-foreground"}
              >
                Outgoing
              </Link>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {txList.length === 0 ? (
            <p className="text-sm text-muted-foreground">No transactions found.</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>TX ID</TableHead>
                    <TableHead>Block</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {txList.map((tx) => (
                    <TableRow key={tx.txid}>
                      <TableCell>
                        <Link
                          href={`/tx/${tx.txid}`}
                          className="font-mono text-xs text-primary hover:underline"
                        >
                          {tx.txid.slice(0, 16)}...
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/block/${tx.height}`}
                          className="text-primary hover:underline"
                        >
                          {tx.height.toLocaleString()}
                        </Link>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCoin(tx.amount)} LDG
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {maxPage > 0 && (
                <div className="mt-4 flex justify-between text-sm">
                  {page > 0 && (
                    <Link
                      href={`/account/${address}?transfer_type=${transferType}&page=${page - 1}`}
                      className="text-primary hover:underline"
                    >
                      Previous
                    </Link>
                  )}
                  <span className="text-muted-foreground">
                    Page {page + 1} of {maxPage + 1}
                  </span>
                  {page < maxPage && (
                    <Link
                      href={`/account/${address}?transfer_type=${transferType}&page=${page + 1}`}
                      className="text-primary hover:underline"
                    >
                      Next
                    </Link>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
