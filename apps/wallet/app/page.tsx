"use client"

import { useState, useCallback, useEffect } from "react"
import {
  createWallet,
  restoreWallet,
  encryptWallet,
  decryptWallet,
  decryptKeysFile,
  type Wallet,
} from "@/lib/crypto"
import { loadSession, saveSession, getSavedWallets } from "@/lib/session"
import { Landing } from "@/components/landing"
import { CreateSeed } from "@/components/create-seed"
import { CreatePassword } from "@/components/create-password"
import { Unlock } from "@/components/unlock"
import { Dashboard } from "@/components/dashboard"

type View = "landing" | "create-seed" | "create-password" | "unlock" | "dashboard"

export default function WalletPage() {
  const [view, setView] = useState<View>("landing")
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [walletName, setWalletName] = useState("")
  const [mnemonic, setMnemonic] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [initialized, setInitialized] = useState(false)

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

  const handleImportFile = async (file: File, password: string) => {
    setError("")
    try {
      const fileData = await file.arrayBuffer()
      const w = await decryptKeysFile(fileData, password)
      let name = file.name.replace(/\.keys$/, "")
      let suffix = 2
      while (localStorage.getItem(`wallet:${name}`)) {
        name = `${file.name.replace(/\.keys$/, "")}-${suffix++}`
      }
      setWallet(w)
      setWalletName(name)
      setPassword(password)
      const encrypted = await encryptWallet(w, password)
      localStorage.setItem(`wallet:${name}`, encrypted)
      openDashboard(w, name)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to import wallet file")
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

  const handleLock = useCallback(() => {
    setWallet(null)
    setPassword("")
    setView("landing")
  }, [])

  if (!initialized) return null

  if (view === "dashboard" && wallet) {
    return <Dashboard wallet={wallet} walletName={walletName} onLock={handleLock} />
  }

  if (view === "create-seed") {
    return <CreateSeed mnemonic={mnemonic} onNext={() => setView("create-password")} />
  }

  if (view === "create-password") {
    return (
      <CreatePassword
        walletName={walletName}
        setWalletName={setWalletName}
        password={password}
        setPassword={setPassword}
        error={error}
        onSave={handleSave}
      />
    )
  }

  if (view === "unlock") {
    return (
      <Unlock
        walletName={walletName}
        setWalletName={setWalletName}
        password={password}
        setPassword={setPassword}
        error={error}
        onUnlock={handleUnlock}
        onBack={() => setView("landing")}
      />
    )
  }

  return (
    <Landing
      mnemonic={mnemonic}
      setMnemonic={setMnemonic}
      error={error}
      onCreate={handleCreate}
      onRestore={handleRestore}
      onImportFile={handleImportFile}
      savedWallets={getSavedWallets()}
      onSelectWallet={(name) => { setWalletName(name); setView("unlock") }}
    />
  )
}
