"use client"

import { useState, useEffect } from "react"
import { Button } from "@litedag/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@litedag/ui/components/dialog"
import { formatCoin } from "@/lib/rpc-client"

export type PendingTx = {
  title: string
  fee: bigint
  execute: () => Promise<string>
} & (
  | { rows: { label: string; value: string }[] }
  | { recipient: string; amount: number; paymentId?: bigint }
)

function isTransfer(p: PendingTx): p is PendingTx & { recipient: string; amount: number; paymentId?: bigint } {
  return "recipient" in p
}

export function ConfirmTxDialog({ pending, onClose, onSuccess }: {
  pending: PendingTx | null
  onClose: () => void
  onSuccess: (hash: string) => void
}) {
  const [submitting, setSubmitting] = useState(false)
  const [txError, setTxError] = useState("")

  useEffect(() => { setTxError("") }, [pending])

  const handleConfirm = async () => {
    if (!pending) return
    setSubmitting(true)
    setTxError("")
    try {
      const hash = await pending.execute()
      onSuccess(hash)
    } catch (e) {
      setTxError(e instanceof Error ? e.message : "Transaction failed")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={!!pending} onOpenChange={(open) => { if (!open && !submitting) onClose() }}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="font-display">{pending?.title}</DialogTitle>
          <DialogDescription>Review the details before confirming.</DialogDescription>
        </DialogHeader>

        {pending && isTransfer(pending) && <TransferDetails tx={pending} />}
        {pending && !isTransfer(pending) && <GenericDetails tx={pending} />}

        {txError && <p className="text-sm text-destructive">{txError}</p>}
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button onClick={handleConfirm} disabled={submitting}>
            {submitting ? "Confirming..." : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function TransferDetails({ tx }: { tx: PendingTx & { recipient: string; amount: number; paymentId?: bigint } }) {
  const hasPid = tx.paymentId !== undefined && tx.paymentId !== 0n
  const totalAtomic = BigInt(Math.round(tx.amount * 1e9)) + tx.fee

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs text-muted-foreground">Recipient</p>
        <p className="mt-0.5 break-all font-mono text-sm">{tx.recipient}</p>
      </div>

      {hasPid && (
        <div className="rounded border border-border/50 bg-muted/30 p-3">
          <p className="text-xs font-medium text-muted-foreground">Integrated address</p>
          <p className="mt-1 text-xs text-muted-foreground/70">
            This address contains an embedded Payment ID used by exchanges to identify your deposit.
          </p>
          <div className="mt-2 flex items-baseline justify-between text-xs">
            <span className="text-muted-foreground">Payment ID</span>
            <span className="font-mono">{String(tx.paymentId)}</span>
          </div>
        </div>
      )}

      <div className="space-y-2 border-t border-border/50 pt-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Amount</span>
          <span className="font-mono">{tx.amount.toLocaleString()} LDG</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Network fee</span>
          <span className="font-mono">{formatCoin(Number(tx.fee))} LDG</span>
        </div>
        <div className="flex justify-between border-t border-border/50 pt-2 text-sm font-medium">
          <span>Total</span>
          <span className="font-mono">{formatCoin(Number(totalAtomic))} LDG</span>
        </div>
      </div>
    </div>
  )
}

function GenericDetails({ tx }: { tx: PendingTx & { rows: { label: string; value: string }[] } }) {
  return (
    <div className="space-y-2">
      {tx.rows.map((row) => (
        <div key={row.label} className="flex items-start justify-between gap-4 text-sm">
          <span className="shrink-0 text-muted-foreground">{row.label}</span>
          <span className="min-w-0 break-all text-right font-mono">{row.value}</span>
        </div>
      ))}
      <div className="border-t border-border/50 pt-2">
        <div className="flex justify-between text-sm font-medium">
          <span className="text-muted-foreground">Network Fee</span>
          <span className="font-mono">{formatCoin(Number(tx.fee))} LDG</span>
        </div>
      </div>
    </div>
  )
}
