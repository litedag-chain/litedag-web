export type RpcResponse<T> = {
  jsonrpc: "2.0"
  id: number
  result?: T
  error?: { code: number; message: string }
}

export type BlockHeader = {
  version: number
  height: number
  timestamp: number
  nonce: number
  nonce_extra: number[]
  other_chains: string[]
  recipient: string
  prev_hash: string[]
  side_blocks: string[]
  DelegateId: number
  NextDelegateId: number
  StakeSignature: number[]
}

export type Block = {
  header: BlockHeader
  transactions: string[]
  diff: number
  cumulative_diff: number
}

export type GetBlockResponse = {
  block: Block
  hash: string
  total_reward: number
  miner_reward: number
  staker_reward: number
  governance_reward: number
  miner: string
  delegate: string
  next_delegate: string
}

export type GetInfoResponse = {
  height: number
  top_hash: string
  total_supply: number
  circulating_supply: number
  max_supply: number
  supply_cap: number
  burned: number
  stake: number
  coin: number
  difficulty: string
  cumulative_diff: string
  target_block_time: number
  block_reward: number
  version: string
  peers: number
}

export type TxOutput = {
  type: number
  amount: number
  recipient: string
  payment_id: number
  extra_data: number
}

export type GetTransactionResponse = {
  sender: string | null
  inputs: unknown[]
  outputs: TxOutput[]
  total_amount: number
  fee: number
  nonce: number
  signature: string
  height: number
  coinbase: boolean
  virtual_size: number
}

export type GetAddressResponse = {
  balance: number
  last_nonce: number
  last_incoming: number
  mempool_balance: number
  mempool_last_nonce: number
  mempool_incoming: number
  delegate_id: number
  height: number
}

export type GetTxListResponse = {
  transactions: string[]
  max_page: number
}

export type GetDelegateResponse = {
  id: number
  address: string
  name: string
  owner: string
  total_amount: number
  funds: { owner: string; amount: number; unlock: number }[]
}
