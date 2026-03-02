import { mnemonicToEntropy, entropyToMnemonic } from "bip39"
import { ed25519 } from "@noble/curves/ed25519.js"
import { blake3 } from "@noble/hashes/blake3"
import { hmac } from "@noble/hashes/hmac"
import { sha512 } from "@noble/hashes/sha512"

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

// CRC32 checksum
function crc32(data: Uint8Array): number {
  let crc = 0xffffffff
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i]!
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1))
    }
  }
  return (crc ^ 0xffffffff) >>> 0
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
async function deriveKey(password: string, salt: Uint8Array) {
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, [
    "deriveKey",
  ])
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: salt as BufferSource, iterations: 100000, hash: "SHA-256" },
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
