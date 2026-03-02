"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@litedag/ui/components/card"
import { CopyText } from "@litedag/ui/components/copy-text"
import { formatCoin, explorerUrl } from "@/lib/rpc-client"
import { timeAgo } from "@litedag/shared/format"
import { ArrowUpRight, ArrowDownLeft, Pickaxe, Layers, ExternalLink } from "lucide-react"

type TxType = "reward" | "sent" | "received" | "staking"

export type TxEntry = {
  txid: string
  type: TxType
  amount: number // atomic units, signed (positive = in, negative = out)
  fee: number
  height: number
  time: number
}

const TX_TYPE_CONFIG: Record<TxType, { label: string; icon: typeof ArrowUpRight; colorClass: string; bgClass: string }> = {
  reward:   { label: "Reward",   icon: Pickaxe,      colorClass: "text-green-500", bgClass: "bg-green-500/10" },
  received: { label: "Received", icon: ArrowDownLeft, colorClass: "text-green-500", bgClass: "bg-green-500/10" },
  sent:     { label: "Sent",     icon: ArrowUpRight,  colorClass: "text-red-500",   bgClass: "bg-red-500/10" },
  staking:  { label: "Staking",  icon: Layers,        colorClass: "text-primary",   bgClass: "bg-primary/10" },
}

export function TransactionHistory({ txs, loading }: { txs: TxEntry[]; loading: boolean }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display">Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : txs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No transactions yet</p>
        ) : (
          <div className="space-y-3">
            {txs.map((tx) => {
              const cfg = TX_TYPE_CONFIG[tx.type]
              const Icon = cfg.icon
              const isPositive = tx.amount >= 0

              return (
                <div key={tx.txid} className="flex items-start gap-3 border-b border-border/30 pb-3 last:border-0 last:pb-0">
                  <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${cfg.bgClass}`}>
                    <Icon className={cfg.colorClass} size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{cfg.label}</span>
                      </div>
                      <span className={`shrink-0 font-mono text-sm font-medium ${isPositive ? "text-green-500" : "text-red-500"}`}>
                        {isPositive ? "+" : ""}{formatCoin(Math.abs(tx.amount))} LDG
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <CopyText text={tx.txid} size="xs" className="text-muted-foreground" />
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      {tx.type === "reward" ? (
                        <a
                          href={explorerUrl(`/block/${tx.height}`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-foreground hover:underline"
                        >
                          Block {tx.height}
                        </a>
                      ) : (
                        <span>Block {tx.height}</span>
                      )}
                      <span>&middot;</span>
                      <span>{timeAgo(tx.time)}</span>
                      {tx.fee > 0 && tx.type !== "reward" && (
                        <>
                          <span>&middot;</span>
                          <span>Fee {formatCoin(tx.fee)}</span>
                        </>
                      )}
                      <a
                        href={explorerUrl(`/tx/${tx.txid}`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto hover:text-foreground"
                      >
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
