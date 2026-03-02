"use client"

import { useState, useCallback } from "react"
import { Button } from "@litedag/ui/components/button"
import { Input } from "@litedag/ui/components/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@litedag/ui/components/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@litedag/ui/components/tabs"
import {
  createWallet,
  restoreWallet,
  encryptWallet,
  decryptWallet,
  formatPublicKey,
  type Wallet,
} from "@/lib/crypto"
import { rpc, formatCoin } from "@/lib/rpc-client"

type View = "landing" | "create-seed" | "create-password" | "unlock" | "dashboard"

export default function WalletPage() {
  const [view, setView] = useState<View>("landing")
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [walletName, setWalletName] = useState("")
  const [mnemonic, setMnemonic] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [balance, setBalance] = useState<number | null>(null)

  const refreshBalance = useCallback(async (address: string) => {
    try {
      const res = await rpc<{ balance: number }>("get_address", { address })
      setBalance(res.balance)
    } catch {
      // node not reachable
    }
  }, [])

  const handleCreate = () => {
    setError("")
    const w = createWallet()
    setWallet(w)
    setMnemonic(w.mnemonic)
    setView("create-seed")
  }

  const handleRestore = () => {
    setError("")
    try {
      const w = restoreWallet(mnemonic.trim())
      setWallet(w)
      setView("create-password")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid mnemonic")
    }
  }

  const handleSave = async () => {
    if (!wallet || !password || !walletName) return
    setError("")
    try {
      const encrypted = await encryptWallet(wallet, password)
      localStorage.setItem(`wallet:${walletName}`, encrypted)
      await refreshBalance(wallet.address)
      setView("dashboard")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save wallet")
    }
  }

  const handleUnlock = async () => {
    setError("")
    try {
      const encrypted = localStorage.getItem(`wallet:${walletName}`)
      if (!encrypted) {
        setError("Wallet not found")
        return
      }
      const w = await decryptWallet(encrypted, password)
      setWallet(w)
      await refreshBalance(w.address)
      setView("dashboard")
    } catch {
      setError("Wrong password or corrupted wallet")
    }
  }

  const handleLock = () => {
    setWallet(null)
    setBalance(null)
    setPassword("")
    setView("landing")
  }

  const savedWallets = typeof window !== "undefined"
    ? Object.keys(localStorage)
        .filter((k) => k.startsWith("wallet:"))
        .map((k) => k.slice(7))
    : []

  if (view === "dashboard" && wallet) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">LiteDAG Wallet</h1>
          <Button variant="outline" onClick={handleLock}>
            Lock
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{walletName}</CardTitle>
            <CardDescription className="break-all font-mono text-xs">
              {wallet.address}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {balance !== null ? `${formatCoin(balance)} LDG` : "Loading..."}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Public key: {formatPublicKey(wallet.publicKey)}
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2"
              onClick={() => refreshBalance(wallet.address)}
            >
              Refresh
            </Button>
          </CardContent>
        </Card>

        <SendForm wallet={wallet} onSent={() => refreshBalance(wallet.address)} />
      </div>
    )
  }

  if (view === "create-seed") {
    return (
      <div className="mx-auto flex min-h-svh max-w-lg flex-col items-center justify-center px-4">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Your Seed Phrase</CardTitle>
            <CardDescription>
              Write these words down and store them safely. This is the only way to recover your wallet.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="rounded-lg border bg-muted p-4 font-mono text-sm leading-relaxed">
              {mnemonic}
            </div>
            <Button onClick={() => setView("create-password")}>I saved my seed phrase</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (view === "create-password") {
    return (
      <div className="mx-auto flex min-h-svh max-w-lg flex-col items-center justify-center px-4">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Set Wallet Password</CardTitle>
            <CardDescription>
              This password encrypts your wallet in this browser.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Input
              placeholder="Wallet name"
              value={walletName}
              onChange={(e) => setWalletName(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button onClick={handleSave} disabled={!walletName || !password}>
              Save & Open
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (view === "unlock") {
    return (
      <div className="mx-auto flex min-h-svh max-w-lg flex-col items-center justify-center px-4">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Unlock Wallet</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Input
              placeholder="Wallet name"
              value={walletName}
              onChange={(e) => setWalletName(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button onClick={handleUnlock} disabled={!walletName || !password}>
              Unlock
            </Button>
            <Button variant="ghost" onClick={() => setView("landing")}>
              Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Landing
  return (
    <div className="mx-auto flex min-h-svh max-w-lg flex-col items-center justify-center px-4">
      <h1 className="mb-8 text-3xl font-bold">LiteDAG Wallet</h1>

      <Tabs defaultValue="create" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create">Create</TabsTrigger>
          <TabsTrigger value="restore">Restore</TabsTrigger>
        </TabsList>
        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Create New Wallet</CardTitle>
              <CardDescription>Generate a new wallet with a fresh seed phrase.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleCreate} className="w-full">
                Create Wallet
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="restore">
          <Card>
            <CardHeader>
              <CardTitle>Restore from Seed</CardTitle>
              <CardDescription>Enter your seed phrase to restore an existing wallet.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <textarea
                className="min-h-24 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                placeholder="Enter your seed phrase..."
                value={mnemonic}
                onChange={(e) => setMnemonic(e.target.value)}
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button onClick={handleRestore} disabled={!mnemonic.trim()}>
                Restore Wallet
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {savedWallets.length > 0 && (
        <Card className="mt-6 w-full">
          <CardHeader>
            <CardTitle>Saved Wallets</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {savedWallets.map((name) => (
              <Button
                key={name}
                variant="outline"
                className="justify-start"
                onClick={() => {
                  setWalletName(name)
                  setView("unlock")
                }}
              >
                {name}
              </Button>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function SendForm({
  wallet,
  onSent,
}: {
  wallet: Wallet
  onSent: () => void
}) {
  const [recipient, setRecipient] = useState("")
  const [amount, setAmount] = useState("")
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState("")
  const [error, setError] = useState("")

  const handleSend = async () => {
    setError("")
    setResult("")
    setSending(true)
    try {
      // Validate address via RPC
      const validation = await rpc<{ valid: boolean; error_message?: string }>("validate_address", {
        address: recipient,
      })
      if (!validation.valid) {
        setError(validation.error_message || "Invalid address")
        setSending(false)
        return
      }

      // For now, show that we'd need the wallet CLI/RPC to create+sign transactions
      // The web wallet in production proxies to a wallet RPC, not the node RPC
      setResult(
        `Transaction creation requires wallet RPC (port 6320). ` +
          `Send ${amount} LDG to ${recipient} from ${wallet.address}`
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send")
    } finally {
      setSending(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Send LDG</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Input
          placeholder="Recipient address"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
        />
        <Input
          type="number"
          placeholder="Amount (LDG)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        {result && <p className="text-sm text-muted-foreground">{result}</p>}
        <Button onClick={handleSend} disabled={sending || !recipient || !amount}>
          {sending ? "Sending..." : "Send"}
        </Button>
      </CardContent>
    </Card>
  )
}
