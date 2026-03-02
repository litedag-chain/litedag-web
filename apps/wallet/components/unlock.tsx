"use client"

import { Button } from "@litedag/ui/components/button"
import { Input } from "@litedag/ui/components/input"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@litedag/ui/components/card"

export function Unlock({ walletName, setWalletName, password, setPassword, error, onUnlock, onBack }: {
  walletName: string
  setWalletName: (v: string) => void
  password: string
  setPassword: (v: string) => void
  error: string
  onUnlock: () => void
  onBack: () => void
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mx-auto max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Unlock Wallet</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Input placeholder="Wallet name" value={walletName} onChange={(e) => setWalletName(e.target.value)} />
            <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && onUnlock()} />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button onClick={onUnlock} disabled={!walletName || !password}>Unlock</Button>
            <Button variant="ghost" onClick={onBack}>Back</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
