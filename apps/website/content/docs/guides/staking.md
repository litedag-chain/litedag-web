---
title: Staking
weight: 2
---

### Staking LDG

Stake your LDG to earn 40% of block rewards. Staking rewards auto-compound into your delegate's staked balance.

#### How Rewards Work

Each block distributes 20 LDG:

| Recipient | Share | Amount |
|-----------|-------|--------|
| Miner | 50% | 10 LDG |
| Staker | 40% | 8 LDG |
| Treasury | 10% | 2 LDG |

If no staker signs a block, the 40% staker share is **burned**. Running a staker keeps the network secure and earns you rewards.

#### Prerequisites

- CLI wallet installed and synced (a local node must be running)
- Wallet contains at least **11,000 LDG** (10,000 min stake + 1,000 delegate registration burn + fees)

#### Step 1: Register a Delegate

To stake, you first need a delegate (validator). You can either create your own or use an existing one.

**To create your own delegate:**
```bash
register_delegate <id> <name>
```
Example: `register_delegate 2 mypool` — this burns 1,000 LDG.

**To use an existing delegate**, browse the list at [explorer.litedag.com/delegates](https://explorer.litedag.com/delegates) and skip to Step 2.

#### Step 2: Set Your Delegate

Assign your wallet to a delegate:

```bash
set_delegate <delegate_id>
```
Example: `set_delegate 1` — assigns your wallet to delegate 1 (litedag).

#### Step 3: Stake

Lock your funds to begin earning rewards. Minimum stake is **10,000 LDG**.

```bash
stake 10000
```

**Important:**
- Staking locks your funds for **2 months**.
- Additional stakes reset the lock period.
- Rewards auto-compound — your staked balance grows automatically.

#### Step 4: Run the Staker (Delegate Owners Only)

If you registered your own delegate, you need to run the staker process to sign blocks:

```bash
./litedag-wallet-cli --open-wallet <name> --wallet-password <pass> --start-staking delegate<id> --non-interactive
```

This must run continuously. Use systemd or a tmux session to keep it alive.

#### Unstaking

After the 2-month lock period:

```bash
unstake 10000
```

#### Quick Reference

| Command | What it does |
|---------|-------------|
| `register_delegate <id> <name>` | Create a new delegate (burns 1,000 LDG) |
| `set_delegate <id>` | Assign your wallet to a delegate |
| `stake <amount>` | Lock LDG for staking (min 10,000) |
| `unstake <amount>` | Withdraw after lock expires |

Always keep a small amount of LDG unlocked in your wallet to pay for transaction fees.

#### See Also

- [Mining Guide](/docs/guides/mining) — Start mining LDG with CPU
- [Running as a Service](/docs/guides/systemd) — Run the staker with systemd
