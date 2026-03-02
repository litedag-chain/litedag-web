---
title: Hybrid DPoS
weight: 3
---

This document outlines the **Hybrid Delayed-Proof-of-Stake (Hybrid DPoS)** consensus mechanism. This innovative protocol is designed to secure the blockchain by synergizing the initial trustless distribution of Proof-of-Work (PoW) with the finality and attack resistance of Proof-of-Stake (PoS). Its primary goal is to mitigate the risk of deep chain reorganizations, particularly those attempted by actors with a majority of hashrate (51% attacks), by making them economically prohibitive and computationally uncertain beyond a short window.

**If you need a guide for staking LiteDAG, check out the [staking guide](/docs/guides/staking)**

## Core Philosophy

The protocol operates on a simple principle: **PoW miners propose blocks, but PoS stakeholders ultimately validate and secure the chain's history.** Miners are free to mine any block they wish, but to receive their full reward and for their block to contribute its full weight to the chain, they must include the cryptographic signature of a randomly selected staking delegate from three blocks in the past. This creates a delayed validation loop that anchors the current chain progression to the established, staked chain.

## Key Terminology

- **PoW Miner:** A traditional miner who uses computational power to find a valid block hash below the network's target difficulty.
- **Staking Pool (Delegate):** An entity that has locked a stake of the native cryptocurrency in a special contract, making them eligible to be chosen to validate historical blocks.
- **Fast Hash:** A quick, non-secure hash function (e.g., `xxHash`, `Blake2`) used solely for fair and efficient delegate selection. It does not secure the block itself.
- **Staking Signature:** A cryptographic signature (e.g., using EdDSA or Schnorr) created by the chosen staking pool's private key, proving they validated a specific block.
- **Validation Window:** A fixed number of blocks (in this case, **3**) between when a delegate is chosen and when their signature is required.

## How It Works: Step-by-Step

### 1. Block Proposal (PoW Phase)
A PoW miner successfully finds a valid nonce for a new block `N`.
The miner constructs the block header, which includes the hash of the previous blocks' headers.

### 2. Delegate Selection (PoS Phase)
The hash from the new block `N` is used as a random seed to select a **staking pool** from the active set of stakers.
This selected delegate is assigned to validate block `N` itself. Their role is to sign this block, but their signature is not required immediately.

### 3. The Delay and Signature Inclusion
The requirement for the staking signature is delayed. The signature from the delegate chosen in block `N` must be included by the PoW miner **three blocks later, in block `N+3`**.
*   **Block `N`:** Delegate is chosen for block `N`.
*   **Block `N+1`:** Delegate is chosen for block `N+1`.
*   **Block `N+2`:** Delegate is chosen for block `N+2`.
*   **Block `N+3`:** The miner of block `N+3` must include the staking signature **for block `N`** within their block's coinbase transaction or a dedicated field.

### 4. Validation and Penalties
When a node receives block `N+3`, it checks for the presence of the valid staking signature for block `N`.
*   **✅ Signature Present and Valid:**
    *   The PoW miner of block `N+3` receives 100% of the PoW block reward.
    *   The staking pool receives 100% of the PoS staking reward.
    *   Block `N+3` contributes its **full difficulty** to the chain's cumulative difficulty (total work).

*   **❌ Signature Missing or Invalid:**
    *   **Economic Penalty:** The PoW miner of block `N+3` forfeits **10% of their PoW block reward**. This amount is burned (permanently removed from circulation). The entire PoS reward for the delegate is also burned.
    *   **Security Penalty:** Block `N+3` contributes **only 50% of its actual difficulty** to the chain's cumulative difficulty. This makes it easier for a competing chain (that *did* include all required signatures) to overtake this chain, even if it is longer in terms of block count.

## Security Properties & Attack Resistance

### Resistance to 51% PoW Attacks
This is the primary security feature. An attacker with majority hashrate cannot freely reorganize the chain beyond the validation window (3 blocks).

1.  To reorganize blocks older than 3 blocks, the attacker must not only mine a competing chain faster than the honest chain but also **obtain the valid staking signatures** for all blocks in their new chain.
2.  Since delegates are chosen randomly from stakeholders who are presumably honest/non-colluding, the attacker cannot predict or control who will sign the blocks they are trying to replace.
3.  To succeed, the attacker would need to either:
    *   **Corrupt the delegates:** Compromise the private keys of the specific delegates needed for their fraudulent chain, which is highly improbable.
    *   **Mine without signatures:** Mine a chain without the required signatures, but this chain would have a drastically reduced cumulative difficulty due to the 50% penalty on every invalid block, causing it to be orphaned by the honest network's chain.

This makes attempts to reverse transactions that are more than ~6 blocks old practically impossible.

### Resistance to Nothing-at-Stake
The "Nothing-at-Stake" problem, where stakers have no cost to validate multiple chains, is mitigated. Stakers are only rewarded if their signature is included on the **canonical chain**. Signing a non-canonical or attacker chain would be a wasted effort and could potentially lead to their stake being slashed in future protocol iterations.

### Chain Quality and Finality
The protocol encourages miners to build on the chain with the highest cumulative difficulty that also includes all valid staking signatures. Blocks without signatures are considered "low quality" and are easily orphaned, leading to rapid finality after the ~3-block window.

## Incentive Structure

| Actor | Action | Reward | Penalty |
| :--- | :--- | :--- | :--- |
| **PoW Miner** | Mines a block & includes past signatures | 50% of Block Reward | 10% Reward Burn |
| **Staking Pool** | Keeps node online, signs assigned blocks | 50% of Block Reward | 100% Reward Burn (if not included) |

## Conclusion

The Hybrid DPoS consensus mechanism provides a robust layer of security on top of traditional PoW. It successfully limits the power of PoW miners by tethering the chain's validity and progression to the economic stake of PoS participants. This creates a system where both hashrate and stake are necessary for the healthy and secure operation of the network, effectively eliminating the feasibility of long-range attacks and providing strong economic finality.
