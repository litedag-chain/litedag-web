"use client"

import { useState, useRef } from "react"
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

function RestoreMethodButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-lg border px-3 py-2 text-sm transition-colors ${
        active
          ? "border-primary bg-primary/5 text-foreground"
          : "border-border/50 text-muted-foreground hover:border-border hover:text-foreground"
      }`}
    >
      {children}
    </button>
  )
}

export function Landing({ mnemonic, setMnemonic, error, onCreate, onRestore, onImportFile, savedWallets, onSelectWallet }: {
  mnemonic: string
  setMnemonic: (v: string) => void
  error: string
  onCreate: () => void
  onRestore: () => void
  onImportFile: (file: File, password: string) => void
  savedWallets: string[]
  onSelectWallet: (name: string) => void
}) {
  const [tab, setTab] = useState<"create" | "restore">("create")
  const [restoreMethod, setRestoreMethod] = useState<"seed" | "file">("seed")
  const [importPassword, setImportPassword] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 2xl:max-w-[85%]">
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
                <div className="flex gap-2">
                  <RestoreMethodButton active={restoreMethod === "seed"} onClick={() => setRestoreMethod("seed")}>
                    Seed Phrase
                  </RestoreMethodButton>
                  <RestoreMethodButton active={restoreMethod === "file"} onClick={() => setRestoreMethod("file")}>
                    Wallet File
                  </RestoreMethodButton>
                </div>

                {restoreMethod === "seed" ? (
                  <>
                    <p className="text-sm text-muted-foreground">Enter your seed phrase to restore your wallet.</p>
                    <textarea
                      className="min-h-24 w-full rounded-lg border border-border/50 bg-secondary px-3 py-2 text-sm focus:border-primary focus:outline-none"
                      placeholder="Enter your seed phrase..."
                      value={mnemonic}
                      onChange={(e) => setMnemonic(e.target.value)}
                    />
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    <Button onClick={onRestore} disabled={!mnemonic.trim()}>Restore Wallet</Button>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Import a <code className="rounded bg-muted px-1 py-0.5 text-xs">.keys</code> file from the desktop or old web wallet.
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".keys"
                      className="hidden"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                    />
                    <Button
                      variant="outline"
                      className="w-full justify-start font-normal"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {selectedFile ? selectedFile.name : "Select .keys file..."}
                    </Button>
                    <input
                      type="password"
                      className="w-full rounded-lg border border-border/50 bg-secondary px-3 py-2 text-sm focus:border-primary focus:outline-none"
                      placeholder="Wallet password"
                      value={importPassword}
                      onChange={(e) => setImportPassword(e.target.value)}
                    />
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    <Button
                      onClick={() => { if (selectedFile) onImportFile(selectedFile, importPassword) }}
                      disabled={!selectedFile || !importPassword}
                    >
                      Import &amp; Login
                    </Button>
                  </>
                )}
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
