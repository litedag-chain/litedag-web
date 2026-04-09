import { ed25519 } from "@noble/curves/ed25519.js"
import { blake3 } from "@noble/hashes/blake3"
import { NETWORK_ID, LEGACY_MAINNET_NETWORK_ID, FEE_PER_BYTE_V2 } from "@litedag/shared/constants"
import { rpc } from "@/lib/rpc-client"
import type { Wallet } from "@/lib/crypto"
import type { GetAddressResponse } from "@litedag/shared/rpc-types"
import { parseAddress, ADDRESS_SIZE } from "@/lib/address"

const TX_VERSION_TRANSFER = 1
const TX_VERSION_SET_DELEGATE = 3
const TX_VERSION_STAKE = 4
const TX_VERSION_UNSTAKE = 5

const SIGNATURE_SIZE = 64

type Tx = {
  version: number
  signer: number[]
  signature: Uint8Array | number[]
  data: Uint8Array
  nonce: number
  fee: bigint
}

// --- Encoding primitives ---

function encodeVarint(n: bigint | number): Uint8Array {
  let num = typeof n === "bigint" ? n : BigInt(n)
  const bytes: number[] = []
  while (num >= 0x80n) {
    bytes.push(Number(num & 0xffn) | 0x80)
    num = num >> 7n
  }
  bytes.push(Number(num & 0xffn))
  return new Uint8Array(bytes)
}

function assert(condition: boolean, msg: string): asserts condition {
  if (!condition) throw new Error(msg)
}

function concatBytes(...arrays: Uint8Array[]): Uint8Array {
  const total = arrays.reduce((sum, a) => sum + a.length, 0)
  const result = new Uint8Array(total)
  let offset = 0
  for (const a of arrays) {
    result.set(a, offset)
    offset += a.length
  }
  return result
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

// --- Serialization ---

function serializeOutput(recipient: string, paymentId: number, amount: bigint): Uint8Array {
  const parsed = parseAddress(recipient)
  // Integrated address carries its own payment_id — use it unless caller overrides
  const pid = parsed.paymentId !== 0 ? parsed.paymentId : paymentId
  return concatBytes(new Uint8Array(parsed.addr), encodeVarint(pid), encodeVarint(amount))
}

function serializeTransferData(outputs: { recipient: string; paymentId: number; amount: bigint }[]): Uint8Array {
  const parts = [encodeVarint(outputs.length)]
  for (const o of outputs) {
    parts.push(serializeOutput(o.recipient, o.paymentId, o.amount))
  }
  return concatBytes(...parts)
}

function serializeStakeData(amount: bigint, delegateId: number, prevUnlock: number): Uint8Array {
  return concatBytes(encodeVarint(amount), encodeVarint(delegateId), encodeVarint(prevUnlock))
}

function serializeUnstakeData(amount: bigint, delegateId: number): Uint8Array {
  return concatBytes(encodeVarint(amount), encodeVarint(delegateId))
}

function serializeSetDelegateData(delegateId: number, previousDelegateId: number): Uint8Array {
  return concatBytes(encodeVarint(delegateId), encodeVarint(previousDelegateId))
}

function serializeForSigning(tx: Tx): Uint8Array {
  const parts: Uint8Array[] = []

  if (tx.version !== 0) parts.push(new Uint8Array([tx.version]))

  parts.push(new Uint8Array(tx.signer))

  // Signature placeholder: write NETWORK_ID (LE uint64) if not legacy mainnet, else zeros
  const sigBytes = new Uint8Array(SIGNATURE_SIZE)
  if ((NETWORK_ID as bigint) !== (LEGACY_MAINNET_NETWORK_ID as bigint)) {
    const view = new DataView(sigBytes.buffer)
    view.setBigUint64(0, NETWORK_ID, true)
  }
  parts.push(sigBytes)

  parts.push(tx.data)
  parts.push(encodeVarint(tx.nonce))
  parts.push(encodeVarint(tx.fee))

  return concatBytes(...parts)
}

function serializeFinal(tx: Tx): Uint8Array {
  const parts: Uint8Array[] = []
  if (tx.version !== 0) parts.push(new Uint8Array([tx.version]))
  parts.push(new Uint8Array(tx.signer))
  parts.push(new Uint8Array(tx.signature))
  parts.push(tx.data)
  parts.push(encodeVarint(tx.nonce))
  parts.push(encodeVarint(tx.fee))
  return concatBytes(...parts)
}

// --- Fee calculation ---

// Iterative: fee varint size affects total size which affects fee
function calculateFee(tx: Tx): bigint {
  let fee = 0n
  for (let i = 0; i < 10; i++) {
    tx.fee = fee
    const parts: Uint8Array[] = []
    if (tx.version !== 0) parts.push(new Uint8Array([tx.version]))
    parts.push(new Uint8Array(32)) // signer
    parts.push(new Uint8Array(SIGNATURE_SIZE))
    parts.push(tx.data)
    parts.push(encodeVarint(tx.nonce))
    parts.push(encodeVarint(fee))
    const vSize = parts.reduce((sum, p) => sum + p.length, 0)
    const newFee = BigInt(vSize) * FEE_PER_BYTE_V2
    if (newFee === fee) return fee
    fee = newFee
  }
  return fee
}

// Fixed vSize fee for stake/unstake/setDelegate (matches Go's GetVirtualSize)
const BASE_OVERHEAD = 32 + 64 + 1 + 1 + 1 // 99

function fixedFee(dataVSize: number): bigint {
  return BigInt(BASE_OVERHEAD + dataVSize) * FEE_PER_BYTE_V2
}

// --- Nonce ---

async function getNonce(address: string): Promise<number> {
  const info = await rpc<GetAddressResponse>("get_address", { address })
  const lastNonce = info.mempool_last_nonce ?? info.last_nonce ?? 0
  return lastNonce + 1
}

// --- Sign and submit ---

async function signAndSerialize(wallet: Wallet, tx: Tx): Promise<{ hex: string; hash: string }> {
  const signData = serializeForSigning(tx)
  const signature = ed25519.sign(signData, wallet.privateKey)
  tx.signature = Array.from(signature)
  const serialized = serializeFinal(tx)
  return {
    hex: bytesToHex(serialized),
    hash: bytesToHex(blake3(serialized)),
  }
}

// --- Public API ---

export type TransferOutput = {
  recipient: string
  amount: bigint
  paymentId?: number
}

export async function createAndSignTransfer(
  wallet: Wallet,
  outputs: TransferOutput[]
): Promise<{ hex: string; hash: string }> {
  const nonce = await getNonce(wallet.address)
  const data = serializeTransferData(
    outputs.map((o) => ({ recipient: o.recipient, paymentId: o.paymentId ?? 0, amount: o.amount }))
  )
  const tx: Tx = {
    version: TX_VERSION_TRANSFER,
    signer: Array.from(wallet.publicKey),
    signature: new Uint8Array(SIGNATURE_SIZE),
    data,
    nonce,
    fee: 0n,
  }
  tx.fee = calculateFee(tx)
  return signAndSerialize(wallet, tx)
}

export async function createAndSignSetDelegate(
  wallet: Wallet,
  delegateId: number,
  previousDelegateId: number
): Promise<{ hex: string; hash: string }> {
  const nonce = await getNonce(wallet.address)
  const data = serializeSetDelegateData(delegateId, previousDelegateId)
  // Go: GetVirtualSize() = base_overhead + MAX_TX_PER_BLOCK (1000)
  const tx: Tx = {
    version: TX_VERSION_SET_DELEGATE,
    signer: Array.from(wallet.publicKey),
    signature: new Uint8Array(SIGNATURE_SIZE),
    data,
    nonce,
    fee: fixedFee(1000),
  }
  return signAndSerialize(wallet, tx)
}

export async function createAndSignStake(
  wallet: Wallet,
  amount: bigint,
  delegateId: number,
  prevUnlock: number
): Promise<{ hex: string; hash: string }> {
  const nonce = await getNonce(wallet.address)
  const data = serializeStakeData(amount, delegateId, prevUnlock)
  // Go: GetVirtualSize() = base_overhead + 256
  const tx: Tx = {
    version: TX_VERSION_STAKE,
    signer: Array.from(wallet.publicKey),
    signature: new Uint8Array(SIGNATURE_SIZE),
    data,
    nonce,
    fee: fixedFee(256),
  }
  return signAndSerialize(wallet, tx)
}

export async function createAndSignUnstake(
  wallet: Wallet,
  amount: bigint,
  delegateId: number
): Promise<{ hex: string; hash: string }> {
  const nonce = await getNonce(wallet.address)
  const data = serializeUnstakeData(amount, delegateId)
  // Go: GetVirtualSize() = base_overhead + 8
  const tx: Tx = {
    version: TX_VERSION_UNSTAKE,
    signer: Array.from(wallet.publicKey),
    signature: new Uint8Array(SIGNATURE_SIZE),
    data,
    nonce,
    fee: fixedFee(8),
  }
  return signAndSerialize(wallet, tx)
}

export async function submitTransaction(hex: string): Promise<{ result: boolean }> {
  return rpc<{ result: boolean }>("submit_transaction", { hex })
}

// --- Fee estimation (for confirmation dialogs) ---

export function estimateTransferFee(outputs: TransferOutput[]): bigint {
  const data = serializeTransferData(
    outputs.map((o) => ({ recipient: o.recipient, paymentId: o.paymentId ?? 0, amount: o.amount }))
  )
  const tx: Tx = {
    version: TX_VERSION_TRANSFER,
    signer: Array.from(new Uint8Array(32)),
    signature: new Uint8Array(SIGNATURE_SIZE),
    data,
    nonce: 1,
    fee: 0n,
  }
  return calculateFee(tx)
}

export const SET_DELEGATE_FEE = fixedFee(1000)
export const STAKE_FEE = fixedFee(256)
export const UNSTAKE_FEE = fixedFee(8)
