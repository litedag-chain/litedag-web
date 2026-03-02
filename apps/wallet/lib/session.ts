import type { Wallet } from "@/lib/crypto"

export const AUTO_LOCK_MS = 15 * 60 * 1000
export const BALANCE_POLL_MS = 15_000

const SESSION_KEY = "wallet_session"

export function saveSession(name: string, wallet: Wallet) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({
    name,
    mnemonic: wallet.mnemonic,
    privateKey: Array.from(wallet.privateKey),
    publicKey: Array.from(wallet.publicKey),
    address: wallet.address,
    savedAt: Date.now(),
  }))
}

export function loadSession(): { name: string; wallet: Wallet } | null {
  const raw = localStorage.getItem(SESSION_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
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

export function clearSession() {
  localStorage.removeItem(SESSION_KEY)
}

export function touchSession() {
  const raw = localStorage.getItem(SESSION_KEY)
  if (!raw) return
  try {
    const parsed = JSON.parse(raw)
    parsed.savedAt = Date.now()
    localStorage.setItem(SESSION_KEY, JSON.stringify(parsed))
  } catch { /* */ }
}

export function getSavedWallets(): string[] {
  if (typeof window === "undefined") return []
  return Object.keys(localStorage)
    .filter((k) => k.startsWith("wallet:"))
    .map((k) => k.slice(7))
}
