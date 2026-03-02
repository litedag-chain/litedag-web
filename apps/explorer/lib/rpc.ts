import { COIN } from "@litedag/shared/constants"
import { formatCoin, formatNumber, formatHashrate, timeAgo } from "@litedag/shared/format"
import type {
  RpcResponse,
  GetBlockResponse,
  GetInfoResponse,
  GetTransactionResponse,
  GetAddressResponse,
  GetTxListResponse,
  GetDelegateResponse,
} from "@litedag/shared/rpc-types"

export type { GetBlockResponse, GetInfoResponse, GetTransactionResponse, GetAddressResponse, GetTxListResponse, GetDelegateResponse }
export type { BlockHeader, Block, TxOutput } from "@litedag/shared/rpc-types"
export { COIN, formatCoin, formatNumber, formatHashrate, timeAgo }

const NODE_RPC_URL = process.env.NODE_RPC_URL || "http://127.0.0.1:6311"

async function rpc<T>(method: string, params: Record<string, unknown> = {}): Promise<T> {
  const res = await fetch(NODE_RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    cache: "no-store",
  })

  const json: RpcResponse<T> = await res.json()
  if (json.error) throw new Error(json.error.message)
  return json.result!
}

export function getInfo() {
  return rpc<GetInfoResponse>("get_info")
}

export function getBlockByHeight(height: number) {
  return rpc<GetBlockResponse>("get_block_by_height", { height })
}

export function getBlockByHash(hash: string) {
  return rpc<GetBlockResponse>("get_block_by_hash", { hash })
}

export function getTransaction(txid: string) {
  return rpc<GetTransactionResponse>("get_transaction", { txid })
}

export function getAddress(address: string) {
  return rpc<GetAddressResponse>("get_address", { address })
}

export function getTxList(address: string, transferType: string, page: number) {
  return rpc<GetTxListResponse>("get_tx_list", {
    address,
    transfer_type: transferType,
    page,
  })
}

export function getDelegate(delegateAddress: string) {
  return rpc<GetDelegateResponse>("get_delegate", { delegate_address: delegateAddress })
}

export function getRichList() {
  return rpc<{ list: { address: string; balance: number }[] }>("get_rich_list")
}
