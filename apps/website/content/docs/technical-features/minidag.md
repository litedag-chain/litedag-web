---
title: MiniDAG
description: A linearization of the BlockDAG consensus system.
weight: 2
---

The LiteDAG Protocol is world's first MiniDAG, a novel consensus system which reduces the full consensus size
compared to BlockDAG by linearizing the DAG graph to a chain structure.

Compared to a BlockDAG system, MiniDAG **removes unnecessary data** from side blocks and gives an immediate
guarantee of the chain order.

![Comparison of blockchain vs DAG vs MiniDAG](/bc-vs-dag-vs-minidag.png)

## Advantages of MiniDAG
- Increased block throughput over a classic blockchain
- Increased security for a latency-constrained network
- Smaller footprint for side-blocks (blocks that are not in the chain, but litedag contribute to the chain security): **more scalable than BlockDAG**
- Chain order is estabilished as soon as a block is found
- Sub-second block times can be handled with a minimal orphan rate.

## Detailed explaination
Every LiteDAG block stores a reference to the previous `N` block hashes in their chain history.
These references are called MiniDAG ancestors.

Whenever a valid alternative block is detected by the node, it is included as side to the current block template,
as long as the current block and the alternative block share at least one MiniDAG ancestor (one of the last `N` blocks is a common ancestor).