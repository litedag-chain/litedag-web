---
title: Staking
weight: 2
---

### Brief Guide: Staking LDG with the CLI Wallet

This guide will walk you through the two steps required to stake your LDG and start earning rewards.

#### Prerequisites
- Your CLI wallet is installed, synchronized, and contains a balance of LDG.
- You have unlocked your wallet using the `unlock` command.

#### Step 1: Set a Delegate

Before you can stake, you must choose a delegate (similar to a validator or pool). A list of active and reliable delegates is available on the official block explorer:

**Delegate List:** [https://explorer.litedag.com/delegates](https://explorer.litedag.com/delegates)

Choose a delegate and note its address (e.g., `delegate1`). In your CLI wallet, use the `set_delegate` command.

**Command:**
```bash
set_delegate delegate1
```
*(Replace `delegate1` with your chosen delegate's actual address)*

**What this does:** This command assigns your wallet to your chosen delegate. You do not need to do this again unless you wish to change delegates.

#### Step 2: Stake Your LDG

Once your delegate is set, you can lock your funds to begin staking. The minimum stake is **100 LDG**.

**Command:**
```bash
stake 500
```
*(This example stakes 500 LDG)*

**Important Information:**
- Staking **locks your delegated funds for 2 months**.
- If you stake additional amounts later, **all your staked funds** will be re-locked for a new 2-month period.

#### Unstaking Your Funds

After the 2-month locking period has passed, you can withdraw your LDG using the `unstake` command.

**Command:**
```bash
unstake 500
```
*(This example unstakes 500 LDG)*

**Summary of Commands:**
1. `set_delegate <delegate_address>`
2. `stake <amount>`
3. `unstake <amount>` (after 2 months)

Always ensure your wallet is unlocked and you have a small amount of LDG left to pay for the transaction fees.
