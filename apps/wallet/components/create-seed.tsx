"use client"

import { Button } from "@litedag/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@litedag/ui/components/card"
import { CopyText } from "@litedag/ui/components/copy-text"

export function CreateSeed({ mnemonic, onNext }: {
  mnemonic: string
  onNext: () => void
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mx-auto max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Your Seed Phrase</CardTitle>
            <CardDescription>
              Write these words down and store them safely. This is the only way to recover your wallet.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <CopyText
              text={mnemonic}
              truncate="none"
              size="sm"
              className="rounded-lg border border-border/50 bg-secondary p-4 leading-relaxed text-foreground"
            />
            <Button onClick={onNext}>I saved my seed phrase</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
