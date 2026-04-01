---
title: Mining
weight: 1
---

### Mining LDG

LiteDAG uses **RandomLiteDAG**, a CPU-optimized proof-of-work algorithm derived from RandomX. Anyone with a computer can mine.

#### Option 1: Built-in CPU Miner

The node binary includes a basic single-threaded CPU miner. Good for getting started quickly.

```bash
# Download and build the node
git clone https://github.com/litedag-chain/litedag-blockchain.git
cd litedag-blockchain
go build -o litedag-node ./cmd/litedag-node

# Start mining
./litedag-node --mine <your-wallet-address> --data-dir ./data
```

The node will sync the chain, then start mining to your address.

#### Option 2: XMRig (Recommended)

For better performance, use [XMRig](https://github.com/xmrig/xmrig) pointed at the LiteDAG stratum port. XMRig uses all CPU threads and is significantly faster.

```bash
./xmrig -o node.litedag.com:6312 -u <your-wallet-address> -a rx/litedag
```

Or in your `config.json`:
```json
{
  "pools": [
    {
      "url": "node.litedag.com:6312",
      "user": "<your-wallet-address>",
      "algo": "rx/litedag"
    }
  ]
}
```

#### Option 3: Run Your Own Node + Mine

For the best decentralization, run your own node and mine against it locally:

```bash
# Start node with public RPC and stratum
./litedag-node --data-dir ./data --public-rpc --stratum-bind-ip 0.0.0.0

# In another terminal, point XMRig at your local node
./xmrig -o 127.0.0.1:6312 -u <your-wallet-address> -a rx/litedag
```

#### Block Reward

Each block rewards **20 LDG**, split as:

| Recipient | Share | Amount |
|-----------|-------|--------|
| Miner | 50% | 10 LDG |
| Staker | 40% | 8 LDG |
| Treasury | 10% | 2 LDG |

Block time is **15 seconds**. The reward decreases by 10% every season (91 days), with a permanent tail emission of **1 LDG/block**.

#### Getting a Wallet Address

Create a wallet using the CLI or the [web wallet](https://wallet.litedag.com):

```bash
go build -o litedag-wallet-cli ./cmd/litedag-wallet-cli
./litedag-wallet-cli
> create
> <wallet-name>
> <password>
> <password>
```

Your address starts with `v` and looks like: `vhcunjkejkshqf4jjx9gfnu52162mvoa9eoqhi`

#### Ports

| Port | Protocol | Purpose |
|------|----------|---------|
| 6310 | P2P | Node-to-node communication |
| 6311 | RPC | JSON-RPC API |
| 6312 | Stratum | Mining connections |

#### Next Steps

- [Staking Guide](/docs/guides/staking) — Earn 40% of block rewards by staking your LDG
- [Running as a Service](/docs/guides/systemd) — Run the node and staker with systemd
