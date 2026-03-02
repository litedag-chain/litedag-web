"use client"

import { useState } from "react"
import { Button } from "@litedag/ui/components/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@litedag/ui/components/card"

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
        active ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  )
}

export function Landing({ mnemonic, setMnemonic, error, onCreate, onRestore, savedWallets, onSelectWallet }: {
  mnemonic: string
  setMnemonic: (v: string) => void
  error: string
  onCreate: () => void
  onRestore: () => void
  savedWallets: string[]
  onSelectWallet: (name: string) => void
}) {
  const [tab, setTab] = useState<"create" | "restore">("create")

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mx-auto max-w-md space-y-6">
        <Card>
          <CardHeader>
            <div className="flex gap-1 rounded-lg bg-muted p-0.5">
              <TabButton active={tab === "create"} onClick={() => setTab("create")}>Create</TabButton>
              <TabButton active={tab === "restore"} onClick={() => setTab("restore")}>Restore</TabButton>
            </div>
          </CardHeader>
          <CardContent>
            {tab === "create" ? (
              <div className="flex flex-col gap-4">
                <p className="text-sm text-muted-foreground">Generate a new wallet with a fresh seed phrase.</p>
                <Button onClick={onCreate} className="w-full">Create Wallet</Button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <p className="text-sm text-muted-foreground">Enter your seed phrase to restore an existing wallet.</p>
                <textarea
                  className="min-h-24 w-full rounded-lg border border-border/50 bg-secondary px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  placeholder="Enter your seed phrase..."
                  value={mnemonic}
                  onChange={(e) => setMnemonic(e.target.value)}
                />
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button onClick={onRestore} disabled={!mnemonic.trim()}>Restore Wallet</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {savedWallets.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Saved Wallets</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {savedWallets.map((name) => (
                <Button key={name} variant="outline" className="justify-start" onClick={() => onSelectWallet(name)}>
                  {name}
                </Button>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
