---
title: Exchange Integration
weight: 10
---

> **Work in progress.** This guide covers the essentials for integrating LDG deposits and withdrawals. More detail will be added over time.

## Overview

LiteDAG uses **integrated addresses** for deposit identification — the same pattern as Monero. An integrated address encodes a base wallet address + a payment ID into a single string. When a user deposits to their integrated address, the payment ID rides along in the transaction, allowing your exchange to attribute the deposit.

## Integrated Addresses

An integrated address is a base address with an embedded payment ID:

```
Base address:       v24jjaqapm3i32y9kvc6trm6xq002aohpky35x
Integrated (id=42): v921892ptzjby5t6jczg81ud52vzdaz8no0m4tnu
```

Both point to the same wallet. The difference is the integrated version carries `payment_id=42` in the transaction when sent to.

### Encoding

```
"v" + base36( checksum(2) || address(22) || payment_id_compact_LE(0..8) )
```

- `address`: 22 bytes (from public key hash)
- `payment_id`: uint64, encoded as compact little-endian (trailing zero bytes stripped)
- `checksum`: CRC32-IEEE of `address || payment_id_bytes`, stored as LE uint16

When `payment_id` is 0, the compact encoding is empty — so a base address and an integrated address with `payment_id=0` are identical strings.

Reference implementation: [`address/address.go`](https://github.com/litedag-chain/litedag-blockchain/blob/master/address/address.go)

### Generating Integrated Addresses (Go)

```go
import "github.com/litedag-chain/litedag-blockchain/v3/address"

// Parse your hot wallet base address
base, _ := address.FromString("v24jjaqapm3i32y9kvc6trm6xq002aohpky35x")

// Create integrated address for user with payment_id=42
integrated := address.Integrated{Addr: base.Addr, PaymentId: 42}
depositAddress := integrated.String()
// -> "v921892ptzjby5t6jczg81ud52vzdaz8no0m4tnu"
```

Assign a unique `payment_id` (uint64) per user. Store the mapping in your database.

## Scanning Deposits

Poll the node RPC for incoming transactions to your hot wallet address.

### 1. Get transaction list

```bash
curl -X POST http://node:6311/json_rpc -d '{
  "jsonrpc": "2.0",
  "method": "get_tx_list",
  "params": {
    "address": "v24jjaqapm3i32y9kvc6trm6xq002aohpky35x",
    "transfer_type": "incoming",
    "page": 0
  }
}'
```

Returns a list of transaction hashes. Paginated via `max_page`.

### 2. Get transaction details

```bash
curl -X POST http://node:6311/json_rpc -d '{
  "jsonrpc": "2.0",
  "method": "get_transaction",
  "params": {
    "txid": "54f68ab80cf020513ffcf20e0f71a59796f49c87129717782af382cdd03cb6d8"
  }
}'
```

Response includes `outputs[]` — each output has:

```json
{
  "type": 0,
  "amount": 1000000000,
  "recipient": "v24jjaqapm3i32y9kvc6trm6xq002aohpky35x",
  "payment_id": 42,
  "extra_data": 0
}
```

Match `payment_id` to your user database. `amount` is in atomic units (1 LDG = 1,000,000,000).

### 3. Confirm depth

Check `height` in the transaction response. Compare against current chain height from `get_info`. Wait for sufficient confirmations before crediting.

## Submitting Withdrawals

Build and sign a transaction client-side, then submit the hex via RPC:

```bash
curl -X POST http://node:6311/json_rpc -d '{
  "jsonrpc": "2.0",
  "method": "submit_transaction",
  "params": {
    "hex": "<serialized transaction hex>"
  }
}'
```

Transaction construction requires: private key signing (Ed25519), varint encoding, fee calculation. See the [wallet CLI source](https://github.com/litedag-chain/litedag-blockchain/blob/master/cmd/litedag-wallet-cli/) or the [web wallet transaction library](https://github.com/litedag-chain/litedag-web/blob/master/apps/wallet/lib/transaction.ts) for reference implementations.

### Fee

Current protocol minimum: `2,000,000 atomic/byte` (~0.246 LDG for a typical 123-byte transaction). A fee reduction is planned — see the [changelog](/changelog).

## Validating Addresses

```bash
curl -X POST http://node:6311/json_rpc -d '{
  "jsonrpc": "2.0",
  "method": "validate_address",
  "params": {
    "address": "v921892ptzjby5t6jczg81ud52vzdaz8no0m4tnu"
  }
}'
```

Returns `{"valid": true}` for both base and integrated addresses.

## Key Reference

| What | Value |
|------|-------|
| Atomic units per coin | 1,000,000,000 (1e9) |
| Address prefix | `v` |
| Default RPC port | 6311 |
| Default P2P port | 6310 |
| Block time | ~15 seconds |
| Public RPC | `node.litedag.com:6311` |

## Questions?

Reach out on [Discord](https://discord.gg/litedag) or open an issue on [GitHub](https://github.com/litedag-chain/litedag-blockchain/issues).
