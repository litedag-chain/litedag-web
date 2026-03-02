"use client"

import { useState, useCallback, useEffect, useRef, useMemo } from "react"
import { Button } from "@litedag/ui/components/button"
import { CopyText } from "@litedag/ui/components/copy-text"
import { rpc } from "@/lib/rpc-client"
import { AUTO_LOCK_MS, BALANCE_POLL_MS, touchSession, clearSession } from "@/lib/session"
import { BalanceHero } from "@/components/balance-hero"
import { StakingPanel, type StakingInfo } from "@/components/staking-panel"
import { TransactionHistory, type TxEntry } from "@/components/transaction-history"
import type { BalancePoint } from "@/components/balance-chart"
import { COIN } from "@litedag/shared/constants"
import { Lock } from "lucide-react"
import type { Wallet } from "@/lib/crypto"
import type { GetAddressResponse, GetDelegateResponse, GetTxListResponse, GetTransactionResponse, GetInfoResponse } from "@litedag/shared/rpc-types"
import { TARGET_BLOCK_TIME } from "@litedag/shared/constants"

export function Dashboard({ wallet, walletName, onLock }: {
  wallet: Wallet
  walletName: string
  onLock: () => void
}) {
  const [balance, setBalance] = useState<number | null>(null)
  const [stakingInfo, setStakingInfo] = useState<StakingInfo | null>(null)
  const [chartData, setChartData] = useState<BalancePoint[]>([])
  const autoLockRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const lock = useCallback(() => {
    clearSession()
    onLock()
  }, [onLock])

  // Auto-lock on inactivity
  useEffect(() => {
    const resetTimer = () => {
      if (autoLockRef.current) clearTimeout(autoLockRef.current)
      autoLockRef.current = setTimeout(lock, AUTO_LOCK_MS)
      touchSession()
    }
    const events = ["mousedown", "keypress", "scroll", "touchstart"] as const
    for (const e of events) window.addEventListener(e, resetTimer, { passive: true })
    resetTimer()
    return () => {
      if (autoLockRef.current) clearTimeout(autoLockRef.current)
      for (const e of events) window.removeEventListener(e, resetTimer)
    }
  }, [lock])

  const refreshAll = useCallback(async () => {
    try {
      const addrInfo = await rpc<GetAddressResponse>("get_address", { address: wallet.address })
      setBalance(addrInfo.balance)

      const delegateId = addrInfo.delegate_id || 0
      const currentHeight = addrInfo.height || 0
      let stakedBalance = 0, unlockHeight = 0
      if (delegateId > 0) {
        try {
          const d = await rpc<GetDelegateResponse>("get_delegate", { delegate_id: delegateId })
          const f = d.funds?.find((f) => f.owner === wallet.address)
          if (f) { stakedBalance = f.amount || 0; unlockHeight = f.unlock || 0 }
        } catch { /* */ }
      }
      setStakingInfo({ delegateId, stakedBalance, unlockHeight, currentHeight })
    } catch { /* node not reachable */ }
  }, [wallet.address])

  // Poll balance + staking info
  useEffect(() => {
    refreshAll()
    pollRef.current = setInterval(refreshAll, BALANCE_POLL_MS)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [refreshAll])

  // Derive chart data from transactions
  useEffect(() => {
    let cancelled = false
    async function loadChartData() {
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
        type TxDetail = { txid: string; dir: "incoming" | "outgoing" | "both"; height: number; delta: number }
        const txDetails: TxDetail[] = []

        for (let i = 0; i < txids.length; i += 10) {
          const batch = txids.slice(i, i + 10)
          const details = await Promise.all(batch.map((txid) => rpc<GetTransactionResponse>("get_transaction", { txid }).catch(() => null)))
          for (let j = 0; j < batch.length; j++) {
            const tx = details[j]; const txid = batch[j]!; const dir = txMap.get(txid)!
            if (!tx) continue
            let delta: number
            if (tx.coinbase) {
              delta = (tx.outputs ?? []).reduce((sum, out) => out.recipient === wallet.address ? sum + (out.amount || 0) : sum, 0)
            } else if (tx.sender === wallet.address) {
              delta = -((tx.total_amount || 0) + (tx.fee || 0))
            } else {
              delta = (tx.outputs ?? []).reduce((sum, out) => out.recipient === wallet.address ? sum + (out.amount || 0) : sum, 0)
            }
            txDetails.push({ txid, dir, height: tx.height || 0, delta })
          }
        }

        // Sort by height ascending
        txDetails.sort((a, b) => a.height - b.height)

        // Walk forward from inferred starting balance
        const currentTotal = (balance ?? 0) + (stakingInfo?.stakedBalance ?? 0)
        const totalDelta = txDetails.reduce((sum, t) => sum + t.delta, 0)
        let runningBalance = currentTotal - totalDelta

        const points: BalancePoint[] = []
        if (txDetails.length > 0) {
          points.push({ height: txDetails[0]!.height, balance: runningBalance })
        }
        for (const t of txDetails) {
          runningBalance += t.delta
          points.push({ height: t.height, balance: runningBalance })
        }

        if (!cancelled) setChartData(points)
      } catch { /* */ }
    }
    loadChartData()
    return () => { cancelled = true }
  }, [wallet.address, balance, stakingInfo?.stakedBalance])

  const handleAction = useCallback(() => {
    setTimeout(refreshAll, 2000)
  }, [refreshAll])

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="min-w-0">
          <p className="font-display text-2xl font-semibold tracking-tight">{walletName}</p>
          <CopyText text={wallet.address} size="xs" truncate="none" className="mt-1 text-muted-foreground" />
        </div>
        <Button variant="outline" size="sm" onClick={lock}>
          <Lock size={14} />
          Lock
        </Button>
      </div>

      <div className="space-y-6">
        <BalanceHero
          balance={balance}
          stakedBalance={stakingInfo?.stakedBalance ?? 0}
          pendingBalance={0}
          chartData={chartData}
          wallet={wallet}
          onBalanceChange={handleAction}
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <StakingPanel
            wallet={wallet}
            onAction={handleAction}
            stakingInfo={stakingInfo}
          />
          <TransactionHistory wallet={wallet} />
        </div>
      </div>
    </div>
  )
}
