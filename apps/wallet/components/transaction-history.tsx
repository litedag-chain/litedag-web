"use client"

import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@litedag/ui/components/card"
import { CopyText } from "@litedag/ui/components/copy-text"
import { Badge } from "@litedag/ui/components/badge"
import { rpc, formatCoin, explorerUrl } from "@/lib/rpc-client"
import { COIN, TARGET_BLOCK_TIME } from "@litedag/shared/constants"
import { timeAgo } from "@litedag/shared/format"
import { ArrowUpRight, ArrowDownLeft, Pickaxe, Layers, ExternalLink } from "lucide-react"
import type { Wallet } from "@/lib/crypto"
import type {
  GetTxListResponse,
  GetTransactionResponse,
  GetInfoResponse,
} from "@litedag/shared/rpc-types"

type TxType = "reward" | "sent" | "received" | "staking"

type TxEntry = {
  txid: string
  type: TxType
  amount: number
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

export type { TxEntry }

export function TransactionHistory({ wallet }: { wallet: Wallet }) {
  const [txs, setTxs] = useState<TxEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [incoming, outgoing, chainInfo] = await Promise.all([
          rpc<GetTxListResponse>("get_tx_list", { address: wallet.address, transfer_type: "incoming", page: 0 }),
          rpc<GetTxListResponse>("get_tx_list", { address: wallet.address, transfer_type: "outgoing", page: 0 }),
          rpc<GetInfoResponse>("get_info", {}),
        ])
        const currentHeight = chainInfo.height || 0
        const txMap = new Map<string, "incoming" | "outgoing" | "both">()
        for (const tx of incoming.transactions ?? []) {
          if (typeof tx === "string" && tx.length === 64) txMap.set(tx.toLowerCase(), "incoming")
        }
        for (const tx of outgoing.transactions ?? []) {
          if (typeof tx === "string" && tx.length === 64) {
            const hex = tx.toLowerCase()
            txMap.set(hex, txMap.has(hex) ? "both" : "outgoing")
          }
        }
        const txids = Array.from(txMap.keys())
        const entries: TxEntry[] = []
        for (let i = 0; i < txids.length; i += 10) {
          const batch = txids.slice(i, i + 10)
          const details = await Promise.all(batch.map((txid) => rpc<GetTransactionResponse>("get_transaction", { txid }).catch(() => null)))
          for (let j = 0; j < batch.length; j++) {
            const tx = details[j]; const txid = batch[j]!; const txDir = txMap.get(txid)!
            if (!tx) continue

            // Classify tx type
            let type: TxType
            let amountAtomic: number
            if (tx.coinbase) {
              type = "reward"
              amountAtomic = (tx.outputs ?? []).reduce((sum, out) => out.recipient === wallet.address ? sum + (out.amount || 0) : sum, 0)
            } else if (tx.sender === wallet.address && (tx.outputs ?? []).length === 0) {
              type = "staking"
              amountAtomic = -((tx.fee || 0))
            } else if (tx.sender === wallet.address) {
              type = "sent"
              amountAtomic = -((tx.total_amount || 0) + (tx.fee || 0))
            } else {
              type = "received"
              amountAtomic = (tx.outputs ?? []).reduce((sum, out) => out.recipient === wallet.address ? sum + (out.amount || 0) : sum, 0)
            }

            let timeMs = Date.now()
            if (tx.height && tx.height < currentHeight) timeMs -= (currentHeight - tx.height) * TARGET_BLOCK_TIME * 1000

            entries.push({ txid, type, amount: amountAtomic, fee: tx.fee || 0, height: tx.height || 0, time: timeMs })
          }
        }
        entries.sort((a, b) => b.height - a.height)
        if (!cancelled) setTxs(entries)
      } catch { /* */ }
      finally { if (!cancelled) setLoading(false) }
    }
    load()
    return () => { cancelled = true }
  }, [wallet.address])

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
