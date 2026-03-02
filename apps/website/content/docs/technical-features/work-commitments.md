---
title: Work Commitments
weight: 7
---

This page explains a key feature in the LiteDAG blockchain: Work Commitments.

Work Commitments are a data structure obtained from a LiteDAG Block.

Each block in the LiteDAG Blockchain can be converted to a Hashing ID, which is a data structure
that contains a hash and the network ID.

Work Commitments are comprised of a nonce, a timestamp, and several Hashing IDs (one for each merge-mined block). The same Work Commitment can be used to secure multiple blockchains via Merge-Mining.

When checking a block PoW, the consensus converts it to a Hashing ID, joins the Hashing ID with block's other merge-mined chains,
executes a PoW hash on the resulting Work Commitment, and validates the hash.

A single block can also include the Work Commitments of previous blocks, to permit the inclusion of [MiniDAG side blocks](/docs/technical-features/minidag) which contribute to the chain cumulative difficulty and security.

The LiteDAG Node has built-in support for Merge-Mining to facilitate the creation of LiteDAG forks that are merge mined with LiteDAG.
Mining pools and solo miners can easily merge-mine LiteDAG and the other chains.

