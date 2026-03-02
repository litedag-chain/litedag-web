---
title: Wallet RPC API documentation
---

This is a list of the litedag-wallet-cli RPC calls, their inputs and outputs, and examples of each.
All the RPC calls use the wallet's JSON RPC interface, as demonstrated below. The wallet implements the jsonrpc 2.0 standard.

Note: "atomic units" refer to the smallest fraction of 1 XST according to the implementation. 1 XST = 1e9 atomic units.

## Methods

### refresh
Inputs:
- No inputs

Outputs:
- `success` (bool): Whether the refresh was successful. Indicates a connection error with the node if false.

Example:
```sh
curl http://127.0.0.1:6318/json_rpc -u user:pass -d '{"jsonrpc":"2.0","id":0,"method":"refresh","params":{}}' -H 'Content-Type: application/json'
```

### get_balance

Inputs:
- No inputs

Outputs:
- `balance` uint64: the wallet balance (excluding mempool transactions)
- `mempool_balance` uint64: the unconfirmed balance

Example:
```sh
curl http://127.0.0.1:6318/json_rpc -u user:pass -d '{"jsonrpc":"2.0","id":0,"method":"get_balance","params":{}}' -H 'Content-Type: application/json'
```

### get_history

Inputs:
- `include_tx_data` (bool): Whether to include transaction data in the response.
- `filter_incoming_by_payment_id` (uint64): If set and not zero, only incoming transactions to this payment ID will be returned. Requires `include_tx_data` to be true.
- `transfer_type` (string): Either `incoming` or `outgoing`.
- `page` (uint64): The page of history to query.

Outputs:
- `transactions` ([]TxInfo): List of transactions.
- `max_page` (uint64): The last available page.

Example:
```sh
curl http://127.0.0.1:6318/json_rpc -u user:pass -d 
'{"jsonrpc":"2.0","id":0,"method":"get_history","params":{"filter_incoming_by_payment_id":3,"include_tx_data":true,"page":0}' -H 'Content-Type: application/json'
```

### create_transaction

Inputs:
- `outputs` ([]Output): List of transaction outputs:
>	- `destination` (address.Integrated): The integrated address of the transaction destination.
>	- `amount` (uint64): The amount to send in the transaction.

Outputs:
- `tx_blob` (enc.Hex): Hex-encoded transaction blob.
- `txid` (util.Hash): Hash of the created transaction.

Example:
```sh
curl http://127.0.0.1:6318/json_rpc -u user:pass -d 
'{"jsonrpc":"2.0","id":0,"method":"create_transaction","params":{"destination":"integrated_address","amount":1000000}}' -H 'Content-Type: 
application/json'
```

### submit_transaction

Inputs:
- `tx_blob` (enc.Hex): Hex-encoded transaction blob to submit.

Outputs:
- `txid` (util.Hash): Hash of the submitted transaction.

Example:
```sh
curl http://127.0.0.1:6318/json_rpc -u user:pass -d
'{"jsonrpc":"2.0","id":0,"method":"submit_transaction","params":{"tx_blob":"0x..."}}' -H 
'Content-Type: application/json'
```

### get_subaddress

Inputs:
- `payment_id` (uint64): Payment id of the subaddress. Not required if the `subaddress` field is set.
- `subaddress` (string): The subaddress in string format. Must belong to this wallet. Not required if the `payment_id` is set.
- `confirmations` (uint64): The minimum number of confirmations required for incoming transactions to be accounted.
- `max_page` (uint64): The maximum number of pages to check. Default 0 = unlimited.

Outputs:
- `payment_id` (uint64): Payment id of this subaddress.
- `subaddress` (string): The subaddress in string format.
- `total_received` (uint64): Total funds received by this subaddress.
- `mempool_total_received` (uint64): Total funds received by this subaddress, including unconfirmed transactions.
- `transactions` ([]TxInfo): List of incoming confirmed and unconfirmed transactions.

Example:
```sh
curl http://127.0.0.1:6318/json_rpc -u user:pass -d
'{"jsonrpc":"2.0","id":0,"method":"get_subaddress","params":{"subaddress":"yourSubaddressHere"}}' -H 
'Content-Type: application/json'
```
