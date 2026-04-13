// Address encoding/decoding matching Go address.FromString / Integrated.String()
//
// Address wire format (base36 encoded):
//   "v" + base36( checksum(2) || addr(22) || paymentId_compact_LE(0..8) )
//
// When paymentId is 0, trailing bytes are absent — base address = integrated with id 0.
// Checksum is CRC32-IEEE of (addr || paymentId bytes), stored as LE uint16.

export const ADDRESS_SIZE = 22

export function crc32(data: Uint8Array): number {
  let crc = 0xffffffff
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i]!
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1))
    }
  }
  return (crc ^ 0xffffffff) >>> 0
}

function assert(condition: boolean, msg: string): asserts condition {
  if (!condition) throw new Error(msg)
}

export function parseAddress(addressStr: string): { addr: Uint8Array; paymentId: bigint } {
  const trimmed = addressStr.trim()
  assert(trimmed.length >= 5 && trimmed.length <= 100, `Invalid address length: ${trimmed.length}`)
  assert(trimmed.startsWith("v"), "Address must start with 'v'")

  const addrStr = trimmed.slice(1)
  assert(/^[0-9a-z]+$/.test(addrStr), "Address contains invalid characters")

  let bigInt = 0n
  for (let i = 0; i < addrStr.length; i++) {
    const c = addrStr.charCodeAt(i)
    const value = c >= 97 ? c - 87 : c - 48 // a=10..z=35, 0=0..9=9
    bigInt = bigInt * 36n + BigInt(value)
  }

  const bytes: number[] = []
  let n = bigInt
  while (n > 0n) {
    bytes.unshift(Number(n & 0xffn))
    n = n >> 8n
  }
  while (bytes.length < ADDRESS_SIZE + 2) bytes.unshift(0)

  const data = new Uint8Array(bytes)

  // Validate checksum: Go checksums everything after the 2-byte prefix
  const payload = data.slice(2)
  const sum = crc32(payload) & 0xffff
  const stored = data[0]! | (data[1]! << 8) // little-endian uint16
  assert(sum === stored, `Invalid address checksum: expected ${sum.toString(16)}, got ${stored.toString(16)}`)

  const addr = new Uint8Array(payload.slice(0, ADDRESS_SIZE))

  // Decode paymentId from trailing compact little-endian bytes
  let paymentId = 0n
  if (payload.length > ADDRESS_SIZE) {
    const pidBytes = payload.slice(ADDRESS_SIZE)
    assert(pidBytes.length <= 8, `Payment ID too long: ${pidBytes.length} bytes`)
    const padded = new Uint8Array(8)
    padded.set(pidBytes)
    const view = new DataView(padded.buffer)
    paymentId = view.getBigUint64(0, true)
  }

  return { addr, paymentId }
}
