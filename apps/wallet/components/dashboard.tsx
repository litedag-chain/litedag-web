"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { Button } from "@litedag/ui/components/button"
import { CopyText } from "@litedag/ui/components/copy-text"
import { rpc } from "@/lib/rpc-client"
import { AUTO_LOCK_MS, BALANCE_POLL_MS, touchSession, clearSession } from "@/lib/session"
import { BalanceHero } from "@/components/balance-hero"
import { StakingPanel, type StakingInfo } from "@/components/staking-panel"
import { TransactionHistory, type TxEntry } from "@/components/transaction-history"
import type { BalancePoint } from "@/components/balance-chart"
import { Lock } from "lucide-react"
import type { Wallet } from "@/lib/crypto"
import {
  TX_VERSION_REGISTER_DELEGATE,
  TX_VERSION_SET_DELEGATE,
  TX_VERSION_STAKE,
  TX_VERSION_UNSTAKE,
} from "@litedag/shared/rpc-types"
import type { GetAddressResponse, GetDelegateResponse, GetTxListResponse, GetTransactionResponse, GetInfoResponse } from "@litedag/shared/rpc-types"
import { TARGET_BLOCK_TIME } from "@litedag/shared/constants"

function txsToChartData(txs: TxEntry[], currentHeight: number, currentTotal: number): BalancePoint[] {
  if (txs.length === 0) return []

  const sorted = [...txs].sort((a, b) => a.height - b.height)

  // Walk forward summing deltas. Staking ops only count the fee (principal
  // stays in wallet as staked). Start from 0 — any gap vs currentTotal at
  // the end is from mining/staking rewards not in the tx list.
  let running = 0
  const points: BalancePoint[] = []
  for (const tx of sorted) {
    running += tx.amount
    points.push({ height: tx.height, balance: running })
  }
  points.push({ height: currentHeight, balance: currentTotal })

  return points
}

export function Dashboard({ wallet, walletName, onLock }: {
  wallet: Wallet
  walletName: string
  onLock: () => void
}) {
  const [balance, setBalance] = useState<number | null>(null)
  const [stakingInfo, setStakingInfo] = useState<StakingInfo | null>(null)
  const [txs, setTxs] = useState<TxEntry[]>([])
  const [txsLoading, setTxsLoading] = useState(true)
  const [currentHeight, setCurrentHeight] = useState(0)
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

  const refreshBalance = useCallback(async () => {
    try {
      const addrInfo = await rpc<GetAddressResponse>("get_address", { address: wallet.address })
      setBalance(addrInfo.balance)
      setCurrentHeight(addrInfo.height || 0)

      const delegateId = addrInfo.delegate_id || 0
      let stakedBalance = 0, unlockHeight = 0
      if (delegateId > 0) {
        try {
          const d = await rpc<GetDelegateResponse>("get_delegate", { delegate_id: delegateId })
          const f = d.funds?.find((f) => f.owner === wallet.address)
          if (f) { stakedBalance = f.amount || 0; unlockHeight = f.unlock || 0 }
        } catch { /* */ }
      }
      setStakingInfo({ delegateId, stakedBalance, unlockHeight, currentHeight: addrInfo.height || 0 })
    } catch { /* node not reachable */ }
  }, [wallet.address])

  // Poll balance
  useEffect(() => {
    refreshBalance()
    pollRef.current = setInterval(refreshBalance, BALANCE_POLL_MS)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [refreshBalance])

  // Fetch all transaction pages
  useEffect(() => {
    let cancelled = false
    async function loadTxs() {
      try {
        const chainInfo = await rpc<GetInfoResponse>("get_info", {})
        const height = chainInfo.height || 0

        // Fetch page 0 of both directions to get max_page
        const [inPage0, outPage0] = await Promise.all([
          rpc<GetTxListResponse>("get_tx_list", { address: wallet.address, transfer_type: "incoming", page: 0 }),
          rpc<GetTxListResponse>("get_tx_list", { address: wallet.address, transfer_type: "outgoing", page: 0 }),
        ])

        // Fetch remaining pages in parallel
        const inPages = [inPage0]
        const outPages = [outPage0]
        const inRemaining = Array.from({ length: inPage0.max_page }, (_, i) => i + 1)
        const outRemaining = Array.from({ length: outPage0.max_page }, (_, i) => i + 1)

        const [inExtra, outExtra] = await Promise.all([
          Promise.all(inRemaining.map((p) => rpc<GetTxListResponse>("get_tx_list", { address: wallet.address, transfer_type: "incoming", page: p }))),
          Promise.all(outRemaining.map((p) => rpc<GetTxListResponse>("get_tx_list", { address: wallet.address, transfer_type: "outgoing", page: p }))),
        ])
        inPages.push(...inExtra)
        outPages.push(...outExtra)

        // Collect all txids
        const txMap = new Map<string, "incoming" | "outgoing" | "both">()
        for (const page of inPages) {
          for (const tx of page.transactions ?? []) {
            if (typeof tx === "string" && tx.length === 64) txMap.set(tx.toLowerCase(), "incoming")
          }
        }
        for (const page of outPages) {
          for (const tx of page.transactions ?? []) {
            if (typeof tx === "string" && tx.length === 64) {
              const hex = tx.toLowerCase()
              txMap.set(hex, txMap.has(hex) ? "both" : "outgoing")
            }
          }
        }

        // Fetch transaction details
        const txids = Array.from(txMap.keys())
        const entries: TxEntry[] = []
        for (let i = 0; i < txids.length; i += 10) {
          const batch = txids.slice(i, i + 10)
          const details = await Promise.all(batch.map((txid) => rpc<GetTransactionResponse>("get_transaction", { txid }).catch(() => null)))
          for (let j = 0; j < batch.length; j++) {
            const tx = details[j]; const txid = batch[j]!
            if (!tx) continue

            const outputs = tx.outputs ?? []

            let type: TxEntry["type"]
            let label: string
            let amountAtomic: number
            let displayAmount: number

            if (tx.coinbase) {
              type = "reward"
              label = "Reward"
              displayAmount = outputs.reduce((sum, out) => out.recipient === wallet.address ? sum + (out.amount || 0) : sum, 0)
              amountAtomic = displayAmount
            } else if (tx.version === TX_VERSION_STAKE) {
              type = "staking"
              label = "Staked"
              displayAmount = tx.total_amount
              amountAtomic = -(tx.fee || 0)
            } else if (tx.version === TX_VERSION_UNSTAKE) {
              type = "staking"
              label = "Unstaked"
              displayAmount = tx.total_amount + (tx.fee || 0)
              amountAtomic = -(tx.fee || 0)
            } else if (tx.version === TX_VERSION_SET_DELEGATE) {
              type = "staking"
              label = "Set Delegate"
              displayAmount = 0
              amountAtomic = -(tx.fee || 0)
            } else if (tx.version === TX_VERSION_REGISTER_DELEGATE) {
              type = "staking"
              label = "Register Delegate"
              displayAmount = tx.total_amount
              amountAtomic = -(tx.total_amount + (tx.fee || 0))
            } else if (tx.sender === wallet.address && outputs.length > 0 && outputs.every((o) => o.recipient === wallet.address)) {
              type = "self"
              label = "Self Transfer"
              displayAmount = 0
              amountAtomic = -(tx.fee || 0)
            } else if (tx.sender === wallet.address) {
              type = "sent"
              label = "Sent"
              displayAmount = tx.total_amount + (tx.fee || 0)
              amountAtomic = -(displayAmount)
            } else {
              type = "received"
              label = "Received"
              displayAmount = outputs.reduce((sum, out) => out.recipient === wallet.address ? sum + (out.amount || 0) : sum, 0)
              amountAtomic = displayAmount
            }

            let timeMs = Date.now()
            if (tx.height && tx.height < height) timeMs -= (height - tx.height) * TARGET_BLOCK_TIME * 1000

            entries.push({ txid, type, label, amount: amountAtomic, displayAmount, fee: tx.fee || 0, height: tx.height || 0, time: timeMs })
          }
        }

        entries.sort((a, b) => b.height - a.height)
        if (!cancelled) { setTxs(entries); setTxsLoading(false) }
      } catch {
        if (!cancelled) setTxsLoading(false)
      }
    }
    loadTxs()
    return () => { cancelled = true }
  }, [wallet.address])

  const totalBalance = (balance ?? 0) + (stakingInfo?.stakedBalance ?? 0)
  const chartData = txsToChartData(txs, currentHeight, totalBalance)

  const handleAction = useCallback(() => {
    setTimeout(refreshBalance, 2000)
  }, [refreshBalance])

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
            balance={balance}
          />
          <TransactionHistory txs={txs} loading={txsLoading} />
        </div>
      </div>
    </div>
  )
}
