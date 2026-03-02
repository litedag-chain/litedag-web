"use client"

import { Button } from "@litedag/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@litedag/ui/components/dialog"
import { CopyText } from "@litedag/ui/components/copy-text"

export function ReceiveDialog({ address, open, onOpenChange }: {
  address: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Receive LDG</DialogTitle>
          <DialogDescription>Share your wallet address to receive LDG.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <CopyText
            text={address}
            truncate="none"
            size="base"
            className="w-full justify-center break-all text-center font-mono text-base"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
