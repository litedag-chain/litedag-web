import { mnemonicToEntropy, entropyToMnemonic } from "bip39"
import { ed25519 } from "@noble/curves/ed25519.js"
import { blake3 } from "@noble/hashes/blake3"
import { hmac } from "@noble/hashes/hmac"
import { sha512 } from "@noble/hashes/sha512"
import { crc32 } from "@/lib/address"

const HD_COIN_TYPE = 6310
const WALLET_PREFIX = "v"
const SEED_ENTROPY = 24 // bytes — 192 bits = 18-word mnemonic

export type Wallet = {
  mnemonic: string
  entropy: Uint8Array
  privateKey: Uint8Array
  publicKey: Uint8Array
  address: string
}

// SLIP-10 derivation for ed25519
function slip10MasterKey(seed: Uint8Array) {
  const key = new TextEncoder().encode("ed25519 seed")
  const hash = hmac(sha512, key, seed)
  return { key: hash.slice(0, 32), chainCode: hash.slice(32) }
}

function slip10Derive(node: { key: Uint8Array; chainCode: Uint8Array }, index: number) {
  const data = new Uint8Array(1 + 32 + 4)
  data[0] = 0x00
  data.set(node.key, 1)
  const view = new DataView(data.buffer)
  view.setUint32(33, index, false)
  const hash = hmac(sha512, node.chainCode, data)
  return { key: hash.slice(0, 32), chainCode: hash.slice(32) }
}

function slip10DerivePath(seed: Uint8Array, path: string) {
  const segments = path.split("/").slice(1)
  let node = slip10MasterKey(seed)
  for (const segment of segments) {
    let index = parseInt(segment.replace("'", ""))
    if (segment.endsWith("'")) index += 0x80000000
    node = slip10Derive(node, index)
  }
  return node
}

function bytesToBigInt(bytes: Uint8Array): bigint {
  let result = 0n
  for (let i = 0; i < bytes.length; i++) {
    result = result * 256n + BigInt(bytes[i]!)
  }
  return result
}

// Address generation (matches Go implementation)
function addressFromPubKey(pubKey: Uint8Array): string {
  const hash = blake3(pubKey)
  const addrBytes = hash.slice(0, 22)
  const checksum = crc32(addrBytes)
  const checksumBytes = new Uint8Array(2)
  new DataView(checksumBytes.buffer).setUint16(0, checksum & 0xffff, true)
  const fullBytes = new Uint8Array(2 + addrBytes.length)
  fullBytes.set(checksumBytes, 0)
  fullBytes.set(addrBytes, 2)
  return WALLET_PREFIX + bytesToBigInt(fullBytes).toString(36)
}

export function formatPublicKey(pubKey: Uint8Array): string {
  return Array.from(pubKey)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

export function createWallet(): Wallet {
  const entropy = new Uint8Array(SEED_ENTROPY)
  crypto.getRandomValues(entropy)
  const mnemonic = entropyToMnemonic(Buffer.from(entropy))
  const path = `m/44'/${HD_COIN_TYPE}'/0'/0'/0'`
  const node = slip10DerivePath(entropy, path)
  const pubKey = ed25519.getPublicKey(node.key)
  return {
    mnemonic,
    entropy,
    privateKey: node.key,
    publicKey: pubKey,
    address: addressFromPubKey(pubKey),
  }
}

export function restoreWallet(mnemonic: string): Wallet {
  const entropyHex = mnemonicToEntropy(mnemonic)
  const rawEntropy = new Uint8Array(
    entropyHex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
  )
  const derivationEntropy = new Uint8Array(SEED_ENTROPY)
  derivationEntropy.set(rawEntropy.slice(0, SEED_ENTROPY))
  const path = `m/44'/${HD_COIN_TYPE}'/0'/0'/0'`
  const node = slip10DerivePath(derivationEntropy, path)
  const pubKey = ed25519.getPublicKey(node.key)
  return {
    mnemonic,
    entropy: derivationEntropy,
    privateKey: node.key,
    publicKey: pubKey,
    address: addressFromPubKey(pubKey),
  }
}

// Wallet encryption/decryption via WebCrypto (PBKDF2 + AES-GCM)
async function deriveKey(password: string, salt: Uint8Array, iterations = 100000) {
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, [
    "deriveKey",
  ])
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: salt as BufferSource, iterations, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  )
}

export async function encryptWallet(wallet: Wallet, password: string): Promise<string> {
  const data = JSON.stringify({
    mnemonic: wallet.mnemonic,
    address: wallet.address,
    publicKey: Array.from(wallet.publicKey),
    privateKey: Array.from(wallet.privateKey),
  })
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await deriveKey(password, salt)
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(data))
  const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength)
  combined.set(salt, 0)
  combined.set(iv, salt.length)
  combined.set(new Uint8Array(encrypted), salt.length + iv.length)
  return btoa(String.fromCharCode(...combined))
}

export async function decryptWallet(encrypted: string, password: string): Promise<Wallet> {
  const combined = new Uint8Array(
    atob(encrypted)
      .split("")
      .map((c) => c.charCodeAt(0))
  )
  const salt = combined.slice(0, 16)
  const iv = combined.slice(16, 28)
  const data = combined.slice(28)
  const key = await deriveKey(password, salt)
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data)
  const parsed = JSON.parse(new TextDecoder().decode(decrypted))
  return {
    mnemonic: parsed.mnemonic,
    entropy: new Uint8Array(0),
    privateKey: new Uint8Array(parsed.privateKey),
    publicKey: new Uint8Array(parsed.publicKey),
    address: parsed.address,
  }
}

// CLI wallet .keys format: salt[16] + time[4 LE] + mem[4 LE] + nonce[12] + AES-256-GCM(json)
// KDF: Argon2id (time iterations, mem KiB, parallelism=1, 32-byte key)
// Plaintext JSON: { NetworkID, Mnemonic, PrivateKey, Address, PubKey }
async function decryptCliKeysFile(bytes: Uint8Array, password: string): Promise<Wallet> {
  const { argon2id } = await import("hash-wasm")
  const salt = bytes.slice(0, 16)
  const view = new DataView(bytes.buffer, bytes.byteOffset)
  const time = view.getUint32(16, true)
  const mem = view.getUint32(20, true)
  const nonceAndCiphertext = bytes.slice(24)
  const nonce = nonceAndCiphertext.slice(0, 12)
  const ciphertext = nonceAndCiphertext.slice(12)

  const keyHex = await argon2id({
    password: new TextEncoder().encode(password),
    salt,
    iterations: time,
    memorySize: mem,
    parallelism: 1,
    hashLength: 32,
    outputType: "hex",
  })
  const keyBytes = new Uint8Array(keyHex.match(/.{2}/g)!.map((b) => parseInt(b, 16)))

  const cryptoKey = await crypto.subtle.importKey("raw", keyBytes, "AES-GCM", false, ["decrypt"])
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv: nonce }, cryptoKey, ciphertext)
  const parsed = JSON.parse(new TextDecoder().decode(decrypted))
  if (!parsed.Mnemonic || typeof parsed.Mnemonic !== "string") {
    throw new Error("Invalid CLI wallet file")
  }
  return restoreWallet(parsed.Mnemonic)
}

// Web wallet .keys format: salt[16] + iv[12] + AES-256-GCM(json)
// KDF: PBKDF2-SHA256 (600k or 100k iterations)
// Plaintext JSON: { mnemonic, address, publicKey, privateKey }
async function decryptWebKeysFile(bytes: Uint8Array, password: string): Promise<Wallet> {
  const salt = bytes.slice(0, 16)
  const iv = bytes.slice(16, 28)
  const encrypted = bytes.slice(28)

  const tryDecrypt = async (iterations: number): Promise<Wallet> => {
    const key = await deriveKey(password, salt, iterations)
    const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, encrypted)
    const parsed = JSON.parse(new TextDecoder().decode(decrypted))
    if (!parsed.mnemonic || typeof parsed.mnemonic !== "string") {
      throw new Error("Invalid web wallet file")
    }
    return restoreWallet(parsed.mnemonic)
  }

  try {
    return await tryDecrypt(600000)
  } catch {
    return await tryDecrypt(100000)
  }
}

// Auto-detect CLI vs web wallet format and decrypt.
// CLI format has Argon2 time/mem params at bytes 16-24 (both > 0, reasonable values).
// Web format has the GCM IV starting at byte 16 (random bytes, not valid Argon2 params).
// Entirely client-side — file never leaves the browser.
export async function decryptKeysFile(fileData: ArrayBuffer, password: string): Promise<Wallet> {
  const bytes = new Uint8Array(fileData)
  if (bytes.length < 29) throw new Error("File too small to be a wallet")

  const view = new DataView(bytes.buffer, bytes.byteOffset)
  const time = view.getUint32(16, true)
  const mem = view.getUint32(20, true)
  const isCli = time > 0 && time <= 65536 && mem > 0 && mem <= 16777216

  if (isCli) {
    try {
      return await decryptCliKeysFile(bytes, password)
    } catch {
      // Misdetected — fall through to web format
    }
  }

  try {
    return await decryptWebKeysFile(bytes, password)
  } catch {
    if (!isCli) {
      // Haven't tried CLI yet — random IV bytes happened to not look like Argon2 params
      try {
        return await decryptCliKeysFile(bytes, password)
      } catch {
        // Both failed
      }
    }
    throw new Error("Wrong password or corrupted wallet file")
  }
}
