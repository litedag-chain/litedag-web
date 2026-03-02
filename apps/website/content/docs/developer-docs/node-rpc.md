---
title: Node RPC API documentation
---

This is a list of the litedag-node daemon RPC calls, their inputs and outputs, and examples of each.
All the RPC calls use the daemon's JSON RPC interface, as demonstrated below. The daemon implements the jsonrpc 2.0 standard.

Note: "atomic units" refer to the smallest fraction of 1 XST according to the implementation. 1 XST = 1e9 atomic units.

## Methods

### get_transaction

Inputs:
- txid (string): the transaction id

Outputs:
- sender (string): null if the transaction is a coinbase reward
- recipient (string): the recipient of this transaction
- amount (uint64): the amount (fee excluded, atomic units)
- fee (uint64): the fee (atomic units)
- nonce (uint64)
- signature (string): hex representation of the signature data
- height (uint64): height where this transaction is included, or zero
- coinbase (bool): if true, this is a coinbase transaction

Example:
```sh
curl http://127.0.0.1:6311/json_rpc -d '{"jsonrpc":"2.0","id":0,"method":"get_transaction","params":{"txid":"307bfc317fa990460312c31cfd9f6a6d2d7b8dc3134530b86bf5d77504d31988"}}' -H 'Content-Type: application/json'
```

### get_info

Inputs:

Outputs:
- height (uint64): the current blockchain height
- top_hash (string): the hash of the top block
- circulating_supply (uint64): the current circulating supply of the coin
- max_supply (uint64): the maximum supply of the coin
- coin (uint64): the coin identifier
- difficulty (string): the current mining difficulty
- cumulative_diff (string): the cumulative difficulty
- target_block_time: int: the target time for block generation (in seconds)
- block_reward (uint64): the reward for mining a block

Example:
```sh
curl http://127.0.0.1:6311/json_rpc -d '{"jsonrpc":"2.0","id":0,"method":"get_info"}' -H 'Content-Type: application/json'
```

### get_address

Inputs:
- address (string): the address to query

Outputs:
- balance (uint64): the confirmed balance of the address
- last_nonce (uint64): the last nonce used by the address
- last_incoming (uint64): the last incoming transaction amount
- mempool_balance (uint64): the unconfirmed balance from the mempool
- mempool_nonce (uint64): the unconfirmed nonce from the mempool
- mempool_incoming (uint64): the unconfirmed incoming transaction amount
- height (uint64): the current blockchain height

Example:
```sh
curl http://127.0.0.1:6311/json_rpc -d '{"jsonrpc":"2.0","id":0,"method":"get_address","params":{"address":"your_address_here"}}' -H 'Content-Type: application/json'
```

### get_tx_list

Inputs:
- address (string): the address to query
- transfer_type (string): "incoming" or "outgoing"
- page (uint64): the page number for pagination

Outputs:
- transactions ([]string) list of transaction hashes
- max_page (uint64): the maximum page number available

Example:
```sh
curl http://127.0.0.1:6311/json_rpc -d '{"jsonrpc":"2.0","id":0,"method":"get_tx_list","params":{"address":"your_address_here","transfer_type":"incoming","page":1}}' -H 'Content-Type: application/json'
```

### submit_transaction

Inputs:
- hex (string): the transaction data as a hex string

Outputs:
- txid (string): the transaction ID of the submitted transaction

Example:
```sh
curl http://127.0.0.1:6311/json_rpc -d '{"jsonrpc":"2.0","id":0,"method":"submit_transaction","params":{"hex":"your_transaction_hex_here"}}' -H 'Content-Type: application/json'
```

### get_block_by_hash

Inputs:
- hash (string): the block hash

Outputs:
- block (Block): the block data
- hash (string): the block hash
- total_reward (uint64): the total block reward (including fee)
- miner_reward (uint64): the block reward received by the miner
- miner (string): the miner's address

Example:
```sh
curl http://127.0.0.1:6311/json_rpc -d '{"jsonrpc":"2.0","id":0,"method":"get_block_by_hash","params":{"hash":"your_block_hash_here"}}' -H 'Content-Type: application/json'
```

### get_block_by_height

Inputs:
- height (uint64): the block height

Outputs:
- block (Block): the block data
- hash (string): the block hash
- total_reward (uint64): the total block reward (including fee)
- miner_reward (uint64): the block reward received by the miner
- miner (string): the miner's address

Example:
```sh
curl http://127.0.0.1:6311/json_rpc -d '{"jsonrpc":"2.0","id":0,"method":"get_block_by_height","params":{"height":15}}' -H 'Content-Type: application/json'
```

### calc_pow

Inputs:
- blob (string): the blob data as a hex string
- seed_hash (string): the seed hash

Outputs:
- hash (string): the calculated proof-of-work hash

Example:
```sh
curl http://127.0.0.1:6311/json_rpc -d '{"jsonrpc":"2.0","id":0,"method":"calc_pow","params":{"blob":"your_blob_here","seed_hash":"your_seed_hash_here"}}' -H 'Content-Type: application/json'
```

### validate_address

Inputs:
- address (string): the address to validate

Outputs:
- address (string): the address received
- valid (bool): true if the address or subaddress is valid
- error_message (string): if the address is invalid, why it is not valid
- main_address (string): the address without payment id
- payment_id (uint64): the payment id of the (sub)address

Example:
```sh
curl http://127.0.0.1:6311/json_rpc -d '{"jsonrpc":"2.0","id":0,"method":"calc_pow","params":{"blob":"your_blob_here","seed_hash":"your_seed_hash_here"}}' -H 'Content-Type: application/json'
```
