---
title: Merge Mining
weight: 5
---

Merge mining is a process that allows miners to mine LiteDAG and its fork simultaneously without compromising the security or efficiency of the primary blockchain. The LiteDAG protocol leverages merge mining to enhance its network security, decentralization, and adoption by sharing the hashrate with future LiteDAG forks.

Some Key Benefits of Merge Mining for LiteDAG are:

- **Enhanced Security**: By leveraging the hash power of larger blockchains, LiteDAG benefits from increased network security and resistance to 51% attacks.

- **Decentralization**: Merge mining encourages participation from a broader range of miners, promoting decentralization.

- **Cost Efficiency**: Miners can earn rewards from both the primary and auxiliary blockchains without additional computational costs.

## How to merge mine LiteDAG

Suppose you have two nodes (must be compatible with LiteDAG Merge Mining): `litedag-node` and `examplecoin-node`.
Assuming `examplecoin`'s stratum port is 444, start `litedag-node` using the following command:
```sh
./litedag-node --slavechains-stratums 127.0.0.1:444 --mining-wallet YOUR_WALLET_ADDRESS
```
The `examplecoin-node` must be running (no special command line flag is required for examplecoin).
You can then start mining directly from `litedag-node` (with the `start_mining` command) or using a compatible mining software and make it connect to `localhost:6312`.

## Technical Implementation

LiteDAG's merge mining implementation is based upon LiteDAG's flexible [Work Commitments](/docs/technical-features/work-commitments) structure.
