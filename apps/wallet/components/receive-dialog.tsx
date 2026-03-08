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

export function ReceiveDialog({ address, publicKey, open, onOpenChange }: {
  address: string
  publicKey: string
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
        <div className="flex flex-col gap-4 py-4">
          <div>
            <p className="mb-1 text-xs font-medium text-muted-foreground">Address</p>
            <CopyText
              text={address}
              truncate="none"
              size="base"
              className="w-full break-all font-mono text-base"
            />
          </div>
          <div>
            <p className="mb-1 text-xs font-medium text-muted-foreground">Public Key</p>
            <CopyText
              text={publicKey}
              truncate="none"
              size="sm"
              className="w-full break-all font-mono text-sm"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
