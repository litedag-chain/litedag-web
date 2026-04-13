"use client"

import { useState } from "react"
import { Button } from "@litedag/ui/components/button"
import { Input } from "@litedag/ui/components/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@litedag/ui/components/dialog"
import { CopyText } from "@litedag/ui/components/copy-text"
import { rpc } from "@/lib/rpc-client"
import {
  createAndSignTransfer,
  submitTransaction,
  estimateTransferFee,
} from "@/lib/transaction"
import { ConfirmTxDialog, type PendingTx } from "@/components/confirm-tx-dialog"
import type { Wallet } from "@/lib/crypto"

function assert(condition: boolean, msg: string): asserts condition {
  if (!condition) throw new Error(msg)
}

export function SendDialog({ wallet, open, onOpenChange, onSent }: {
  wallet: Wallet
  open: boolean
  onOpenChange: (open: boolean) => void
  onSent: () => void
}) {
  const [recipient, setRecipient] = useState("")
  const [amount, setAmount] = useState("")
  const [paymentId, setPaymentId] = useState("")
  const [result, setResult] = useState("")
  const [error, setError] = useState("")
  const [pending, setPending] = useState<PendingTx | null>(null)
  const [validating, setValidating] = useState(false)

  const reset = () => {
    setRecipient(""); setAmount(""); setPaymentId(""); setResult(""); setError("")
  }

  const handlePrepare = async () => {
    setError(""); setResult(""); setValidating(true)
    try {
      const v = await rpc<{ valid: boolean; error_message?: string }>("validate_address", { address: recipient })
      if (!v.valid) { setError(v.error_message || "Invalid address"); return }
      const atomicAmount = BigInt(Math.round(parseFloat(amount) * 1e9))
      assert(atomicAmount > 0n, "Amount must be positive")
      let manualPid: bigint | undefined
      if (paymentId.trim() !== "") {
        assert(/^\d+$/.test(paymentId.trim()), "Payment ID must be a non-negative integer")
        manualPid = BigInt(paymentId.trim())
      }
      const fee = estimateTransferFee([{ recipient, amount: atomicAmount, paymentId: manualPid }])
      const rows = [
        { label: "To", value: recipient },
        { label: "Amount", value: `${parseFloat(amount).toLocaleString()} LDG` },
      ]
      if (manualPid !== undefined && manualPid !== 0n) {
        rows.push({ label: "Payment ID", value: String(manualPid) })
      }
      setPending({
        title: "Send LDG",
        rows,
        fee,
        execute: async () => {
          const { hex, hash } = await createAndSignTransfer(wallet, [{ recipient, amount: atomicAmount, paymentId: manualPid }])
          await submitTransaction(hex)
          return hash
        },
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to prepare transaction")
    } finally {
      setValidating(false)
    }
  }

  return (
    <>
      <Dialog open={open && !pending} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Send LDG</DialogTitle>
            <DialogDescription>Enter a recipient address and amount.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <Input placeholder="Recipient address" value={recipient} onChange={(e) => setRecipient(e.target.value)} />
            <Input type="number" min={0} placeholder="Amount (LDG)" value={amount} onChange={(e) => setAmount(e.target.value)} />
            <Input type="text" inputMode="numeric" pattern="[0-9]*" placeholder="Payment ID (optional)" value={paymentId} onChange={(e) => setPaymentId(e.target.value)} />
            {error && <p className="text-sm text-destructive">{error}</p>}
            {result && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Sent!</span>
                <CopyText text={result} size="xs" className="text-muted-foreground" />
              </div>
            )}
            <Button onClick={handlePrepare} disabled={validating || !recipient || !amount}>
              {validating ? "Validating..." : "Review Transaction"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <ConfirmTxDialog
        pending={pending}
        onClose={() => setPending(null)}
        onSuccess={(hash) => {
          setPending(null)
          setResult(hash)
          setRecipient(""); setAmount(""); setPaymentId("")
          onSent()
          onOpenChange(false)
        }}
      />
    </>
  )
}
