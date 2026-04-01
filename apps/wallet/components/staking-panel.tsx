"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@litedag/ui/components/button"
import { Input } from "@litedag/ui/components/input"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@litedag/ui/components/card"
import { CopyText } from "@litedag/ui/components/copy-text"
import { cn } from "@litedag/ui/lib/utils"
import { rpc, formatCoin } from "@/lib/rpc-client"
import {
  createAndSignSetDelegate,
  createAndSignStake,
  createAndSignUnstake,
  submitTransaction,
  SET_DELEGATE_FEE,
  STAKE_FEE,
  UNSTAKE_FEE,
} from "@/lib/transaction"
import { ConfirmTxDialog, type PendingTx } from "@/components/confirm-tx-dialog"
import { TARGET_BLOCK_TIME, COIN } from "@litedag/shared/constants"
import type { Wallet } from "@/lib/crypto"
import type { GetAddressResponse, GetDelegateResponse } from "@litedag/shared/rpc-types"

type DelegateEntry = { id: number; name: string; total_amount: number }

export type StakingInfo = {
  delegateId: number
  stakedBalance: number
  unlockHeight: number
  currentHeight: number
}

export function StakingPanel({ wallet, onAction, stakingInfo, balance }: {
  wallet: Wallet
  onAction: () => void
  stakingInfo: StakingInfo | null
  balance: number | null
}) {
  const [delegateInput, setDelegateInput] = useState("")
  const [stakeAmount, setStakeAmount] = useState("")
  const [unstakeAmount, setUnstakeAmount] = useState("")
  const [result, setResult] = useState("")
  const [error, setError] = useState("")
  const [delegates, setDelegates] = useState<DelegateEntry[]>([])
  const [pending, setPending] = useState<PendingTx | null>(null)

  useEffect(() => {
    (async () => {
      try {
        const all = await rpc<GetDelegateResponse[]>("get_delegates", {})
        setDelegates(all.map(d => ({ id: d.id, name: d.name, total_amount: d.total_amount })))
      } catch { /* node may not support get_delegates yet */ }
    })()
  }, [])

  const currentDelegateName = delegates.find(d => d.id === stakingInfo?.delegateId)?.name

  const onTxSuccess = (hash: string) => {
    setPending(null)
    setResult(hash)
    setDelegateInput(""); setStakeAmount(""); setUnstakeAmount("")
    onAction()
  }

  const handleSetDelegate = () => {
    setError(""); setResult("")
    const id = parseInt(delegateInput)
    if (isNaN(id) || id <= 0) { setError("Delegate ID must be a positive integer"); return }
    const name = delegates.find(d => d.id === id)?.name
    setPending({
      title: "Set Delegate",
      rows: [
        { label: "Delegate", value: name ? `${name} (#${id})` : `#${id}` },
        ...(stakingInfo && stakingInfo.delegateId > 0 ? [{ label: "Previous", value: currentDelegateName ? `${currentDelegateName} (#${stakingInfo.delegateId})` : `#${stakingInfo.delegateId}` }] : []),
      ],
      fee: SET_DELEGATE_FEE,
      execute: async () => {
        const { hex, hash } = await createAndSignSetDelegate(wallet, id, stakingInfo?.delegateId ?? 0)
        await submitTransaction(hex)
        return hash
      },
    })
  }

  const maxStakeAtomic = Math.max(0, (balance ?? 0) - Number(STAKE_FEE))
  const maxUnstakeAtomic = stakingInfo?.stakedBalance ?? 0

  const handleStake = () => {
    setError(""); setResult("")
    const atomic = BigInt(Math.round(parseFloat(stakeAmount) * 1e9))
    if (atomic <= 0n) { setError("Stake amount must be positive"); return }
    if ((stakingInfo?.delegateId ?? 0) === 0) { setError("Set a delegate first (takes ~15s to confirm)"); return }
    if (Number(atomic) > maxStakeAtomic) { setError(`Insufficient balance (max ${formatCoin(maxStakeAtomic)} LDG after fee)`); return }
    setPending({
      title: "Stake LDG",
      rows: [
        { label: "Amount", value: `${parseFloat(stakeAmount).toLocaleString()} LDG` },
        { label: "Delegate", value: currentDelegateName ? `${currentDelegateName} (#${stakingInfo!.delegateId})` : `#${stakingInfo!.delegateId}` },
      ],
      fee: STAKE_FEE,
      execute: async () => {
        const { hex, hash } = await createAndSignStake(wallet, atomic, stakingInfo!.delegateId, stakingInfo?.unlockHeight ?? 0)
        await submitTransaction(hex)
        return hash
      },
    })
  }

  const handleUnstake = () => {
    setError(""); setResult("")
    const atomic = BigInt(Math.round(parseFloat(unstakeAmount) * 1e9))
    if (atomic <= 0n) { setError("Unstake amount must be positive"); return }
    if ((stakingInfo?.delegateId ?? 0) === 0) { setError("No delegate set"); return }
    if (Number(atomic) > maxUnstakeAtomic) { setError(`Exceeds staked balance (max ${formatCoin(maxUnstakeAtomic)} LDG)`); return }
    if (stakingInfo && stakingInfo.unlockHeight > stakingInfo.currentHeight) {
      const blocks = stakingInfo.unlockHeight - stakingInfo.currentHeight
      setError(`Funds locked for ${blocks} more blocks (~${Math.ceil((blocks * TARGET_BLOCK_TIME) / 60)} min)`)
      return
    }
    setPending({
      title: "Unstake LDG",
      rows: [
        { label: "Amount", value: `${parseFloat(unstakeAmount).toLocaleString()} LDG` },
        { label: "Delegate", value: currentDelegateName ? `${currentDelegateName} (#${stakingInfo!.delegateId})` : `#${stakingInfo!.delegateId}` },
      ],
      fee: UNSTAKE_FEE,
      execute: async () => {
        const { hex, hash } = await createAndSignUnstake(wallet, atomic, stakingInfo!.delegateId)
        await submitTransaction(hex)
        return hash
      },
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display">Staking</CardTitle>
        {stakingInfo && stakingInfo.delegateId > 0 ? (
          <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2">
            <p className="text-xs text-muted-foreground">Current delegate</p>
            <p className="font-display text-sm font-medium">
              {currentDelegateName ?? "Delegate"}{" "}
              <span className="text-muted-foreground">#{stakingInfo.delegateId}</span>
            </p>
            {stakingInfo.stakedBalance > 0 && (
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                {formatCoin(stakingInfo.stakedBalance)} LDG staked
              </p>
            )}
            {stakingInfo.unlockHeight > stakingInfo.currentHeight && (
              <p className="text-xs text-muted-foreground">
                Locked for {stakingInfo.unlockHeight - stakingInfo.currentHeight} blocks
              </p>
            )}
          </div>
        ) : stakingInfo ? (
          <p className="text-xs text-muted-foreground">No delegate set — choose one below to start staking</p>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-3">
        {delegates.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">Available delegates</p>
            <div className="rounded-lg border border-border/50 bg-secondary">
              {delegates.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDelegateInput(String(d.id))}
                  className={cn(
                    "flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors first:rounded-t-lg last:rounded-b-lg",
                    d.id === stakingInfo?.delegateId ? "bg-primary/10" : "hover:bg-muted",
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span className="font-medium">{d.name}</span>
                    <span className="text-xs text-muted-foreground">#{d.id}</span>
                    {d.id === stakingInfo?.delegateId && (
                      <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[10px] font-medium text-primary">Active</span>
                    )}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {formatCoin(d.total_amount)} LDG
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Input placeholder="Delegate ID" type="number" min={1} value={delegateInput} onChange={(e) => setDelegateInput(e.target.value)} className="flex-1" />
          <Button onClick={handleSetDelegate} disabled={!delegateInput || parseInt(delegateInput) === stakingInfo?.delegateId} size="sm">Set</Button>
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input placeholder="Stake amount (LDG)" type="number" min={0} value={stakeAmount} onChange={(e) => setStakeAmount(e.target.value)} className="pr-12" />
            {maxStakeAtomic > 0 && (
              <button onClick={() => setStakeAmount((maxStakeAtomic / COIN).toString())} className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-primary hover:text-primary/80">Max</button>
            )}
          </div>
          <Button onClick={handleStake} disabled={!stakeAmount} size="sm">Stake</Button>
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input placeholder="Unstake amount (LDG)" type="number" min={0} value={unstakeAmount} onChange={(e) => setUnstakeAmount(e.target.value)} className="pr-12" />
            {maxUnstakeAtomic > 0 && (
              <button onClick={() => setUnstakeAmount((maxUnstakeAtomic / COIN).toString())} className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-primary hover:text-primary/80">Max</button>
            )}
          </div>
          <Button onClick={handleUnstake} disabled={!unstakeAmount} size="sm" variant="outline">Unstake</Button>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        {result && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>TX:</span>
            <CopyText text={result} size="xs" className="text-muted-foreground" />
          </div>
        )}
        <ConfirmTxDialog
          pending={pending}
          onClose={() => setPending(null)}
          onSuccess={onTxSuccess}
        />
      </CardContent>
    </Card>
  )
}
