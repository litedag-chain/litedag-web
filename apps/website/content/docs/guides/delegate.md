---
title: Running a Delegate
weight: 10
---

Delegates are essential for securing the LiteDAG network. They process transactions and create new blocks, earning rewards for themselves and their stakers. Running a delegate requires a dedicated wallet and a server running 24/7.

### Prerequisites

Before you begin, ensure you have the following:

1. **A Dedicated Delegate Wallet:** A fresh, synchronized LiteDAG CLI wallet that you will use *only* for your delegate.
2. **Sufficient LDG Balance:** This wallet must contain at least **1010 LDG**.
   - **1000 LDG** for the delegate registration fee.
   - **~10 LDG** to cover transaction fees.
3. **A Stable Server:** A reliable server that will host the delegate node and maintain 24/7 uptime.

### Step-by-Step Guide

#### Step 1: Register Your Delegate

In your dedicated delegate wallet, use the `register_delegate` command. This will permanently register your delegate on the network for a fee of 1000 LDG. The delegate id must be unique and not already taken.

**Command:**
```bash
register_delegate <delegate id> <delegate name>
```

**Example:**
```bash
register_delegate 1 AwesomeDelegate
```

#### Step 2: Configure Your Delegate for Fee Collection

Delegates earn a 1% fee from the staking rewards generated for their voters. To enable this, you must configure your delegate wallet to claim these fees.

**Command:**
```bash
set_delegate <delegate id / address>
```

**Example:**
```bash
set_delegate delegate1
```

#### Step 3: Start the Staking Process

To actively participate in block forging, you must run the wallet in staking mode. This command must be kept running continuously in your terminal or process manager. **Ensure your LiteDAG node is fully synchronized before starting.**

**Command:**
```bash
litedag-wallet-cli --open-wallet <delegate_wallet_file> --start-staking <delegate_public_key_or_address>
```

**Example:**
```bash
litedag-wallet-cli --open-wallet my_delegate_wallet --start-staking delegate1
```

> **Important:** Do not close this process. Your delegate will only stake blocks while this command is actively running on a synchronized node.

#### Step 4: Stake LDG to Your Delegate

A delegate's chances of being selected to stake the next block are proportional to the total LDG staked to it. To start staking blocks quickly, you or others need to stake LDG to your delegate's address.

1. **From Your Own Wallets:** In any other LiteDAG wallet, use the `vote` command to stake LDG to your delegate's address.
2. **From the Community:** Share your delegate's name and address publicly to attract votes from other LDG holders.

The more LDG staked to your delegate, the more often it will be selected to stake blocks and earn rewards.

### Summary

Ensure your delegate's server remains online and synchronized to consistently participate in network consensus and avoid missing forging opportunities.
