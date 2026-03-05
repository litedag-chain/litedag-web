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
import { ArrowUpRight, ArrowDownLeft, Pickaxe, Layers, RefreshCw, ExternalLink } from "lucide-react"

type TxType = "reward" | "sent" | "received" | "staking" | "self"

export type TxEntry = {
  txid: string
  type: TxType
  label: string // display label ("Reward", "Sent", "Received", "Staked", "Unstaked", "Set Delegate")
  amount: number // balance delta in atomic units (for chart), signed
  displayAmount: number // amount to show in UI, always positive
  fee: number
  height: number
  time: number
  counterparty?: string // recipient (sent) or sender (received)
}

const TX_TYPE_CONFIG: Record<TxType, { icon: typeof ArrowUpRight; colorClass: string; bgClass: string; amountClass: string }> = {
  reward:   { icon: Pickaxe,      colorClass: "text-green-500", bgClass: "bg-green-500/10", amountClass: "text-green-500" },
  received: { icon: ArrowDownLeft, colorClass: "text-green-500", bgClass: "bg-green-500/10", amountClass: "text-green-500" },
  sent:     { icon: ArrowUpRight,  colorClass: "text-amber-500",  bgClass: "bg-amber-500/10",  amountClass: "text-amber-500" },
  staking:  { icon: Layers,        colorClass: "text-primary",   bgClass: "bg-primary/10",   amountClass: "text-primary" },
  self:     { icon: RefreshCw,     colorClass: "text-muted-foreground", bgClass: "bg-muted",  amountClass: "text-muted-foreground" },
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
              const prefix = tx.type === "staking" || tx.type === "self" ? "" : tx.amount >= 0 ? "+" : "-"

              return (
                <div key={tx.txid} className="flex items-start gap-3 border-b border-border/30 pb-3 last:border-0 last:pb-0">
                  <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${cfg.bgClass}`}>
                    <Icon className={cfg.colorClass} size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{tx.label}</span>
                      </div>
                      {tx.displayAmount > 0 && (
                        <span className={`shrink-0 font-mono text-sm font-medium ${cfg.amountClass}`}>
                          {prefix}{formatCoin(tx.displayAmount)} LDG
                        </span>
                      )}
                    </div>
                    {tx.counterparty && (
                      <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <span>{tx.type === "sent" ? "To" : "From"}</span>
                        <CopyText text={tx.counterparty} size="xs" truncate="middle" truncateLength={20} className="text-muted-foreground" />
                      </div>
                    )}
                    <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <span>Tx</span>
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
