"use client"

import { Button } from "@litedag/ui/components/button"
import { Input } from "@litedag/ui/components/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@litedag/ui/components/card"

export function CreatePassword({ walletName, setWalletName, password, setPassword, error, onSave }: {
  walletName: string
  setWalletName: (v: string) => void
  password: string
  setPassword: (v: string) => void
  error: string
  onSave: () => void
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 2xl:max-w-[85%]">
      <div className="mx-auto max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Set Wallet Password</CardTitle>
            <CardDescription>This password encrypts your wallet in this browser.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Input placeholder="Wallet name" value={walletName} onChange={(e) => setWalletName(e.target.value)} />
            <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button onClick={onSave} disabled={!walletName || !password}>Save & Open</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
