import type { RpcResponse } from "@litedag/shared/rpc-types"
export { COIN } from "@litedag/shared/constants"
export { formatCoin } from "@litedag/shared/format"

export async function rpc<T>(method: string, params: Record<string, unknown> = {}): Promise<T> {
  const res = await fetch("/api/rpc", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  })

  const json: RpcResponse<T> = await res.json()
  if (json.error) throw new Error(json.error.message)
  return json.result!
}
