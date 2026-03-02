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
  rows: { label: string; value: string }[]
  fee: bigint
  execute: () => Promise<string>
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
        <div className="space-y-2">
          {pending?.rows.map((row) => (
            <div key={row.label} className="flex items-start justify-between gap-4 text-sm">
              <span className="shrink-0 text-muted-foreground">{row.label}</span>
              <span className="min-w-0 break-all text-right font-mono">{row.value}</span>
            </div>
          ))}
          <div className="border-t border-border/50 pt-2">
            <div className="flex justify-between text-sm font-medium">
              <span className="text-muted-foreground">Network Fee</span>
              <span className="font-mono">{pending ? formatCoin(Number(pending.fee)) : "0"} LDG</span>
            </div>
          </div>
        </div>
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
