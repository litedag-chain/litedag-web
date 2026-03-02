"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { Button } from "@litedag/ui/components/button"
import { Input } from "@litedag/ui/components/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@litedag/ui/components/card"
import { CopyText } from "@litedag/ui/components/copy-text"
import {
  createWallet,
  restoreWallet,
  encryptWallet,
  decryptWallet,
  formatPublicKey,
  type Wallet,
} from "@/lib/crypto"
import { rpc, formatCoin } from "@/lib/rpc-client"
import {
  createAndSignTransfer,
  createAndSignSetDelegate,
  createAndSignStake,
  createAndSignUnstake,
  submitTransaction,
} from "@/lib/transaction"
import type {
  GetAddressResponse,
  GetDelegateResponse,
  GetTxListResponse,
  GetTransactionResponse,
  GetInfoResponse,
} from "@litedag/shared/rpc-types"
import { COIN, TARGET_BLOCK_TIME } from "@litedag/shared/constants"

type View = "landing" | "create-seed" | "create-password" | "unlock" | "dashboard"

const AUTO_LOCK_MS = 15 * 60 * 1000
const BALANCE_POLL_MS = 15_000

// Session persistence via localStorage (survives refresh + new tabs)
// Cleared on explicit Lock or auto-lock timeout
const SESSION_KEY = "wallet_session"

function saveSession(name: string, wallet: Wallet) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({
    name,
    mnemonic: wallet.mnemonic,
    privateKey: Array.from(wallet.privateKey),
    publicKey: Array.from(wallet.publicKey),
    address: wallet.address,
    savedAt: Date.now(),
  }))
}

function loadSession(): { name: string; wallet: Wallet } | null {
  const raw = localStorage.getItem(SESSION_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    // Expire after AUTO_LOCK_MS of inactivity (savedAt is refreshed on every user action)
    if (parsed.savedAt && Date.now() - parsed.savedAt > AUTO_LOCK_MS) {
      localStorage.removeItem(SESSION_KEY)
      return null
    }
    return {
      name: parsed.name,
      wallet: {
        mnemonic: parsed.mnemonic,
        entropy: new Uint8Array(0),
        privateKey: new Uint8Array(parsed.privateKey),
        publicKey: new Uint8Array(parsed.publicKey),
        address: parsed.address,
      },
    }
  } catch { return null }
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY)
}

function touchSession() {
  const raw = localStorage.getItem(SESSION_KEY)
  if (!raw) return
  try {
    const parsed = JSON.parse(raw)
    parsed.savedAt = Date.now()
    localStorage.setItem(SESSION_KEY, JSON.stringify(parsed))
  } catch { /* */ }
}

export default function WalletPage() {
  const [view, setView] = useState<View>("landing")
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [walletName, setWalletName] = useState("")
  const [mnemonic, setMnemonic] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [balance, setBalance] = useState<number | null>(null)
  const [initialized, setInitialized] = useState(false)
  const autoLockRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Restore session on mount
  useEffect(() => {
    const session = loadSession()
    if (session) {
      setWallet(session.wallet)
      setWalletName(session.name)
      setView("dashboard")
    }
    setInitialized(true)
  }, [])

  const lock = useCallback(() => {
    clearSession()
    setWallet(null)
    setBalance(null)
    setPassword("")
    setView("landing")
  }, [])

  // Auto-lock on inactivity + keep session timestamp fresh
  useEffect(() => {
    if (view !== "dashboard") return
    const resetTimer = () => {
      if (autoLockRef.current) clearTimeout(autoLockRef.current)
      autoLockRef.current = setTimeout(lock, AUTO_LOCK_MS)
      touchSession()
    }
    const events = ["mousedown", "keypress", "scroll", "touchstart"] as const
    for (const e of events) window.addEventListener(e, resetTimer, { passive: true })
    resetTimer()
    return () => {
      if (autoLockRef.current) clearTimeout(autoLockRef.current)
      for (const e of events) window.removeEventListener(e, resetTimer)
    }
  }, [view, lock])

  const refreshBalance = useCallback(async (address: string) => {
    try {
      const res = await rpc<GetAddressResponse>("get_address", { address })
      setBalance(res.balance)
    } catch { /* node not reachable */ }
  }, [])

  // Auto-poll balance every 15s while on dashboard
  useEffect(() => {
    if (view !== "dashboard" || !wallet) return
    refreshBalance(wallet.address)
    pollRef.current = setInterval(() => refreshBalance(wallet.address), BALANCE_POLL_MS)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [view, wallet, refreshBalance])

  const openDashboard = useCallback((w: Wallet, name: string) => {
    setWallet(w)
    setWalletName(name)
    saveSession(name, w)
    setView("dashboard")
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
      openDashboard(wallet, walletName)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save wallet")
    }
  }

  const handleUnlock = async () => {
    setError("")
    try {
      const encrypted = localStorage.getItem(`wallet:${walletName}`)
      if (!encrypted) { setError("Wallet not found"); return }
      const w = await decryptWallet(encrypted, password)
      openDashboard(w, walletName)
    } catch {
      setError("Wrong password or corrupted wallet")
    }
  }

  const savedWallets = typeof window !== "undefined"
    ? Object.keys(localStorage).filter((k) => k.startsWith("wallet:")).map((k) => k.slice(7))
    : []

  // Don't render until session restore attempt completes
  if (!initialized) return null

  if (view === "dashboard" && wallet) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="min-w-0">
            <p className="font-display text-2xl font-semibold tracking-tight">{walletName}</p>
            <CopyText text={wallet.address} size="xs" truncate="none" className="mt-1 text-muted-foreground" />
          </div>
          <Button variant="outline" size="sm" onClick={lock}>Lock</Button>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-display text-2xl font-bold tracking-tight">
                {balance !== null ? `${formatCoin(balance)} LDG` : "..."}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Public Key</CardTitle>
            </CardHeader>
            <CardContent>
              <CopyText text={formatPublicKey(wallet.publicKey)} size="xs" className="text-muted-foreground" />
            </CardContent>
          </Card>

          <StakingInfoCard wallet={wallet} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <SendForm wallet={wallet} onSent={() => refreshBalance(wallet.address)} />
            <StakingActions wallet={wallet} onAction={() => refreshBalance(wallet.address)} />
          </div>
          <TransactionHistory wallet={wallet} />
        </div>
      </div>
    )
  }

  if (view === "create-seed") {
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
              <Button onClick={() => setView("create-password")}>I saved my seed phrase</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (view === "create-password") {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
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
              <Button onClick={handleSave} disabled={!walletName || !password}>Save & Open</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (view === "unlock") {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mx-auto max-w-md">
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Unlock Wallet</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Input placeholder="Wallet name" value={walletName} onChange={(e) => setWalletName(e.target.value)} />
              <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleUnlock()} />
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button onClick={handleUnlock} disabled={!walletName || !password}>Unlock</Button>
              <Button variant="ghost" onClick={() => setView("landing")}>Back</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Landing
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mx-auto max-w-md space-y-6">
        <LandingCard
          mnemonic={mnemonic}
          setMnemonic={setMnemonic}
          error={error}
          onCreate={handleCreate}
          onRestore={handleRestore}
        />

        {savedWallets.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Saved Wallets</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {savedWallets.map((name) => (
                <Button key={name} variant="outline" className="justify-start" onClick={() => { setWalletName(name); setView("unlock") }}>
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

function LandingCard({ mnemonic, setMnemonic, error, onCreate, onRestore }: {
  mnemonic: string; setMnemonic: (v: string) => void; error: string; onCreate: () => void; onRestore: () => void
}) {
  const [tab, setTab] = useState<"create" | "restore">("create")
  return (
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
  )
}

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

// --- Staking Info (top card) ---

function StakingInfoCard({ wallet }: { wallet: Wallet }) {
  const [info, setInfo] = useState<{ delegateId: number; stakedBalance: number; unlockHeight: number; currentHeight: number } | null>(null)

  useEffect(() => {
    (async () => {
      try {
        const addrInfo = await rpc<GetAddressResponse>("get_address", { address: wallet.address })
        const delegateId = addrInfo.delegate_id || 0
        const currentHeight = addrInfo.height || 0
        let stakedBalance = 0, unlockHeight = 0
        if (delegateId > 0) {
          try {
            const d = await rpc<GetDelegateResponse>("get_delegate", { delegate_id: delegateId })
            const f = d.funds?.find((f) => f.owner === wallet.address)
            if (f) { stakedBalance = f.amount || 0; unlockHeight = f.unlock || 0 }
          } catch { /* */ }
        }
        setInfo({ delegateId, stakedBalance, unlockHeight, currentHeight })
      } catch {
        setInfo({ delegateId: 0, stakedBalance: 0, unlockHeight: 0, currentHeight: 0 })
      }
    })()
  }, [wallet.address])

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">Staking</CardTitle>
      </CardHeader>
      <CardContent>
        {info ? (
          <div className="space-y-1">
            <p className="font-display text-2xl font-bold tracking-tight">{formatCoin(info.stakedBalance)} LDG</p>
            <p className="text-xs text-muted-foreground">
              Delegate: {info.delegateId > 0 ? info.delegateId : "Not set"}
            </p>
            {info.unlockHeight > info.currentHeight && (
              <p className="text-xs text-muted-foreground">
                Locked for {info.unlockHeight - info.currentHeight} blocks
              </p>
            )}
          </div>
        ) : (
          <p className="text-2xl font-bold">...</p>
        )}
      </CardContent>
    </Card>
  )
}

// --- Send Form ---

function SendForm({ wallet, onSent }: { wallet: Wallet; onSent: () => void }) {
  const [recipient, setRecipient] = useState("")
  const [amount, setAmount] = useState("")
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState("")
  const [error, setError] = useState("")

  const handleSend = async () => {
    setError(""); setResult(""); setSending(true)
    try {
      const v = await rpc<{ valid: boolean; error_message?: string }>("validate_address", { address: recipient })
      if (!v.valid) { setError(v.error_message || "Invalid address"); return }
      const atomicAmount = BigInt(Math.round(parseFloat(amount) * 1e9))
      const { hex, hash } = await createAndSignTransfer(wallet, [{ recipient, amount: atomicAmount }])
      await submitTransaction(hex)
      setResult(hash)
      setRecipient(""); setAmount("")
      onSent()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send")
    } finally { setSending(false) }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display">Send</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Input placeholder="Recipient address" value={recipient} onChange={(e) => setRecipient(e.target.value)} />
        <Input type="number" placeholder="Amount (LDG)" value={amount} onChange={(e) => setAmount(e.target.value)} />
        {error && <p className="text-sm text-destructive">{error}</p>}
        {result && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Sent!</span>
            <CopyText text={result} size="xs" className="text-muted-foreground" />
          </div>
        )}
        <Button onClick={handleSend} disabled={sending || !recipient || !amount}>
          {sending ? "Sending..." : "Send"}
        </Button>
      </CardContent>
    </Card>
  )
}

// --- Staking Actions ---

type DelegateEntry = { id: number; name: string; total_amount: number }

function StakingActions({ wallet, onAction }: { wallet: Wallet; onAction: () => void }) {
  const [delegateInput, setDelegateInput] = useState("")
  const [stakeAmount, setStakeAmount] = useState("")
  const [unstakeAmount, setUnstakeAmount] = useState("")
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState("")
  const [error, setError] = useState("")
  const [info, setInfo] = useState<{ delegateId: number; unlockHeight: number; currentHeight: number } | null>(null)
  const [delegates, setDelegates] = useState<DelegateEntry[]>([])

  const fetchInfo = useCallback(async () => {
    try {
      const a = await rpc<GetAddressResponse>("get_address", { address: wallet.address })
      const delegateId = a.delegate_id || 0
      let unlockHeight = 0
      if (delegateId > 0) {
        try {
          const d = await rpc<GetDelegateResponse>("get_delegate", { delegate_id: delegateId })
          const f = d.funds?.find((f) => f.owner === wallet.address)
          if (f) unlockHeight = f.unlock || 0
        } catch { /* */ }
      }
      setInfo({ delegateId, unlockHeight, currentHeight: a.height || 0 })
    } catch { /* */ }
  }, [wallet.address])

  useEffect(() => { fetchInfo() }, [fetchInfo])

  // Discover delegates (same approach as explorer: probe IDs 1..50)
  useEffect(() => {
    (async () => {
      const found: DelegateEntry[] = []
      for (let i = 1; i <= 50; i++) {
        try {
          const d = await rpc<GetDelegateResponse>("get_delegate", { delegate_address: `delegate${i}` })
          found.push({ id: d.id, name: d.name, total_amount: d.total_amount })
        } catch { break }
      }
      setDelegates(found)
    })()
  }, [])

  const wrap = async (fn: () => Promise<void>) => {
    setError(""); setResult(""); setBusy(true)
    try {
      await fn()
      // Re-fetch after a short delay to let the tx get mined
      setTimeout(fetchInfo, 2000)
      onAction()
    }
    catch (e) { setError(e instanceof Error ? e.message : "Transaction failed") }
    finally { setBusy(false) }
  }

  const handleSetDelegate = () => wrap(async () => {
    const id = parseInt(delegateInput)
    assert(!isNaN(id) && id > 0, "Delegate ID must be a positive integer")
    const { hex, hash } = await createAndSignSetDelegate(wallet, id, info?.delegateId ?? 0)
    await submitTransaction(hex)
    setResult(hash); setDelegateInput("")
  })

  const handleStake = () => wrap(async () => {
    const atomic = BigInt(Math.round(parseFloat(stakeAmount) * 1e9))
    assert(atomic > 0n, "Stake amount must be positive")
    assert((info?.delegateId ?? 0) > 0, "Set a delegate first (takes ~15s to confirm)")
    const { hex, hash } = await createAndSignStake(wallet, atomic, info!.delegateId, info?.unlockHeight ?? 0)
    await submitTransaction(hex)
    setResult(hash); setStakeAmount("")
  })

  const handleUnstake = () => wrap(async () => {
    const atomic = BigInt(Math.round(parseFloat(unstakeAmount) * 1e9))
    assert(atomic > 0n, "Unstake amount must be positive")
    assert((info?.delegateId ?? 0) > 0, "No delegate set")
    if (info && info.unlockHeight > info.currentHeight) {
      const blocks = info.unlockHeight - info.currentHeight
      throw new Error(`Funds locked for ${blocks} more blocks (~${Math.ceil((blocks * TARGET_BLOCK_TIME) / 60)} min)`)
    }
    const { hex, hash } = await createAndSignUnstake(wallet, atomic, info!.delegateId)
    await submitTransaction(hex)
    setResult(hash); setUnstakeAmount("")
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display">Staking</CardTitle>
        {info && (
          <p className="text-xs text-muted-foreground">
            Your delegate: {info.delegateId > 0 ? info.delegateId : "Not set"}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {delegates.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">Available delegates</p>
            <div className="rounded-lg border border-border/50 bg-secondary">
              {delegates.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDelegateInput(String(d.id))}
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors hover:bg-muted first:rounded-t-lg last:rounded-b-lg"
                >
                  <span>
                    <span className="font-medium">{d.name}</span>
                    <span className="ml-2 text-xs text-muted-foreground">#{d.id}</span>
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {formatCoin(d.total_amount)} LDG
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Input placeholder="Delegate ID" type="number" value={delegateInput} onChange={(e) => setDelegateInput(e.target.value)} className="flex-1" />
          <Button onClick={handleSetDelegate} disabled={busy || !delegateInput} size="sm">Set</Button>
        </div>
        <div className="flex gap-2">
          <Input placeholder="Stake amount (LDG)" type="number" value={stakeAmount} onChange={(e) => setStakeAmount(e.target.value)} className="flex-1" />
          <Button onClick={handleStake} disabled={busy || !stakeAmount} size="sm">Stake</Button>
        </div>
        <div className="flex gap-2">
          <Input placeholder="Unstake amount (LDG)" type="number" value={unstakeAmount} onChange={(e) => setUnstakeAmount(e.target.value)} className="flex-1" />
          <Button onClick={handleUnstake} disabled={busy || !unstakeAmount} size="sm" variant="outline">Unstake</Button>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        {result && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>TX:</span>
            <CopyText text={result} size="xs" className="text-muted-foreground" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// --- Transaction History ---

type TxEntry = { txid: string; amount: number; fee: number; height: number; time: number }

function TransactionHistory({ wallet }: { wallet: Wallet }) {
  const [txs, setTxs] = useState<TxEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [incoming, outgoing, chainInfo] = await Promise.all([
          rpc<GetTxListResponse>("get_tx_list", { address: wallet.address, transfer_type: "incoming", page: 0 }),
          rpc<GetTxListResponse>("get_tx_list", { address: wallet.address, transfer_type: "outgoing", page: 0 }),
          rpc<GetInfoResponse>("get_info", {}),
        ])
        const currentHeight = chainInfo.height || 0
        const txMap = new Map<string, "incoming" | "outgoing" | "both">()
        for (const tx of incoming.transactions ?? []) {
          if (typeof tx === "string" && tx.length === 64) txMap.set(tx.toLowerCase(), "incoming")
        }
        for (const tx of outgoing.transactions ?? []) {
          if (typeof tx === "string" && tx.length === 64) {
            const hex = tx.toLowerCase()
            txMap.set(hex, txMap.has(hex) ? "both" : "outgoing")
          }
        }
        const txids = Array.from(txMap.keys())
        const entries: TxEntry[] = []
        for (let i = 0; i < txids.length; i += 10) {
          const batch = txids.slice(i, i + 10)
          const details = await Promise.all(batch.map((txid) => rpc<GetTransactionResponse>("get_transaction", { txid }).catch(() => null)))
          for (let j = 0; j < batch.length; j++) {
            const tx = details[j]; const txid = batch[j]!; const txType = txMap.get(txid)!
            if (!tx) continue
            const isOutgoing = tx.sender === wallet.address
            let amountAtomic = 0
            if (txType === "incoming" || (txType === "both" && !isOutgoing)) {
              amountAtomic = (tx.outputs ?? []).reduce((sum, out) => out.recipient === wallet.address ? sum + (out.amount || 0) : sum, 0)
            } else {
              amountAtomic = -((tx.total_amount || 0) + (tx.fee || 0))
            }
            let timeMs = Date.now()
            if (tx.height && tx.height < currentHeight) timeMs -= (currentHeight - tx.height) * TARGET_BLOCK_TIME * 1000
            entries.push({ txid, amount: amountAtomic / COIN, fee: (tx.fee || 0) / COIN, height: tx.height || 0, time: timeMs })
          }
        }
        entries.sort((a, b) => b.height - a.height)
        if (!cancelled) setTxs(entries)
      } catch { /* */ }
      finally { if (!cancelled) setLoading(false) }
    }
    load()
    return () => { cancelled = true }
  }, [wallet.address])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display">Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : txs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No transactions yet</p>
        ) : (
          <div className="space-y-2">
            {txs.map((tx) => (
              <div key={tx.txid} className="flex items-center justify-between gap-4 border-b border-border/30 pb-2 last:border-0">
                <div className="min-w-0 flex-1">
                  <CopyText text={tx.txid} size="xs" className="text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    Block {tx.height} &middot; {new Date(tx.time).toLocaleString()}
                  </p>
                </div>
                <p className={`shrink-0 font-mono text-sm font-medium ${tx.amount >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {tx.amount >= 0 ? "+" : ""}{tx.amount.toFixed(4)} LDG
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function assert(condition: boolean, msg: string): asserts condition {
  if (!condition) throw new Error(msg)
}
